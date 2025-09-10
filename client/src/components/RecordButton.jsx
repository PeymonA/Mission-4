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
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then((stream) => {
					setAudioStream(stream);
					const mediaRecorder = new MediaRecorder(stream);
					setMediaRecorder(mediaRecorder);
					let audio;

					mediaRecorder.ondataavailable = (event) => {
						if (event.data.size > 0) {
							audio = [event.data];
						}
					};

					mediaRecorder.onstop = (event) => {
						const b = new Blob(audio, { type: "audio/wav" });
						setAudioBlob(b);
						console.log("audioBlob", b);
					};
				})
				.catch((error) => {
					console.error("Error accessing microphone:", error);
				});
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
            body: formData
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
						<source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
					</audio>
					<button onClick={handleClick}>Submit</button>
				</>
			)}
		</div>
	);
}

export default SimpleRecordButton;