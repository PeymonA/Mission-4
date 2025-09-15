import { useState, useEffect, useRef } from "react";
import '../App.css'

function SimpleRecordButton() {
	const [isRecording, setIsRecording] = useState(false);
	const [audioStream, setAudioStream] = useState(null);
	const [mediaRecorder, setMediaRecorder] = useState(null);
	const [audioBlob, setAudioBlob] = useState(null);
	const [recordingTime, setRecordingTime] = useState(0);
	const timerRef = useRef(null);
	const RECORDING_MAX_DURATION = 240; // 4 minutes in seconds

	useEffect(() => {
		if (!audioStream) {		
			async function getAudio() {
				const constraints = { audio: true, video: false };
				try {
					inputAudioContext.resume();
					const stream = await navigator.mediaDevices.getUserMedia(constraints);
					setAudioStream(stream);
					const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
					setMediaRecorder(mediaRecorder);
					const data = [];
					mediaRecorder.ondataavailable = e => e.data.size && data.push(e.data);
					mediaRecorder.onstop = () => {
						// For 16-bit audio
						const b = new Blob(data, { type: "audio/webm" });
						setAudioBlob(b);
					};
				} catch (err) {
					console.error(err);
				}	
			}
			
			getAudio();
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [audioStream]);

	const handleToggleRecording = (event) => {
		event.preventDefault();
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	const startRecording = () => {
		mediaRecorder.start();
		setIsRecording(true);
		setRecordingTime(0);
		setAudioBlob(null);
		timerRef.current = setInterval(() => {
			setRecordingTime((prevTime) => {
				if (prevTime >= RECORDING_MAX_DURATION - 1) {
					stopRecording();
					return RECORDING_MAX_DURATION;
				}
				return prevTime + 1;
			});
		}, 1000);
	};

	const stopRecording = () => {
		mediaRecorder.stop();
		setIsRecording(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
	};

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

    const handleClick = () => {
        const formData = new FormData();
        formData.append('audio', audioBlob);

        const fetchData = async () => {
        const response = await fetch("http://localhost:3000/live", {
            method: 'POST',
            body: formData,
        });

        const data = await response
        console.log(data);
        }
        fetchData();
    };

	return (
		<div className='chat-parent'> 
			<button
				onClick={handleToggleRecording}
			>
				{isRecording ? (
					<>
						<span className={`mr-3 ${isRecording && "animate-pulse"}`}>●</span>{" "}
						Stop Recording
					</>
				) : audioBlob ? (
					"Redo recording"
				) : (
					"Start Recording"
				)}
			</button>
			<div>
				{isRecording && (
					<div>
						<p>Recording...</p>
						<p>Time: {formatTime(recordingTime)}</p>
					</div>
				)}
			</div>
			{audioBlob && (
				<>
					<div>Preview recording before submitting:</div>
					<audio controls>
						<source src={URL.createObjectURL(audioBlob)} />
					</audio>
					<button onClick={handleClick}>Submit</button>
				</>
			)}
		</div>
	);
}

export default SimpleRecordButton;