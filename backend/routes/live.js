var express = require('express');
var router = express.Router();
var genai = require('@google/genai');
var fs = require('fs');
var pkg = require('wavefile')
const { WaveFile } = pkg;
const multer  = require('multer');
const path = require("path");

const ai = new genai.GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash-preview-native-audio-dialog"

const config = {
  responseModalities: [genai.Modality.AUDIO], 
  systemInstruction: "You are a helpful assistant and answer in a friendly tone."
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/* POST  */
router.post('/', upload.single('audio'), async (req, res) =>  {
    
    const file = req.file;

    console.log('Received file:', file.originalname);
    console.log('Mimetype:', file.mimetype);
    console.log('Size:', file.size);
    
    if (!file) {
        return res.status(400).send("No file uploaded.");
    } 

    fs.writeFileSync('./uploads/sample.wav', file.buffer);

    const responseQueue = [];

    
    async function waitMessage() {
        let done = false;
        let message = undefined;
        while (!done) {
            message = responseQueue.shift();
            if (message) {
                done = true;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        return message;
    }

    async function handleTurn() {
        const turns = [];
        let done = false;
        while (!done) {
            const message = await waitMessage();
            turns.push(message);
            if (message.serverContent && message.serverContent.turnComplete) {
                done = true;
            }
        }
        return turns;
    }

    const session = await ai.live.connect({
        model: model,
        callbacks: {
            onopen: function () {
                console.debug('Opened');
            },
            onmessage: function (message) {
                responseQueue.push(message);
            },
            onerror: function (e) {
                console.debug('Error:', e.message);
            },
            onclose: function (e) {
                console.debug('Close:', e.reason);
            },
        },
        config: config,
    });

    // Ensure audio conforms to API requirements (16-bit PCM, 16kHz, mono)
    var base64Audio;

    try {
        // Work with file.buffer directly
        const wav = new pkg.WaveFile();
        wav.fromBuffer(file.buffer);

        // Convert to required format
        wav.toSampleRate(16000);
        wav.toBitDepth("16");

        base64Audio = wav.toBase64();
    } catch (err) {
        console.error("Error processing wav:", err);
        return res.status(500).send("Invalid or corrupted wav file.");
    }

    // If already in correct format, you can use this:
    // const fileBuffer = fs.readFileSync("sample.pcm");
    // const base64Audio = Buffer.from(fileBuffer).toString('base64');

    session.sendRealtimeInput(
        {
            audio: {
                data: base64Audio,
                mimeType: "audio/pcm;rate=16000"
            }
        }

    );

    const turns = await handleTurn();

    // Combine audio data strings and save as wave file
    const combinedAudio = turns.reduce((acc, turn) => {
        if (turn.data) {
            const buffer = Buffer.from(turn.data, 'base64');
            const intArray = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Int16Array.BYTES_PER_ELEMENT);
            return acc.concat(Array.from(intArray));
        }
        return acc;
    }, []);

    const audioBuffer = new Int16Array(combinedAudio);

    const wf = new WaveFile();
    wf.fromScratch(1, 24000, '16', audioBuffer);  // output is 24kHz
    fs.writeFileSync('audio.wav', wf.toBuffer());

    session.close();
    
    
});

module.exports = router;