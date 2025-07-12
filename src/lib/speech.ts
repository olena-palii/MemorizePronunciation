export function textToSpeech(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}

let mediaStream: MediaStream;
let mediaRecorder: MediaRecorder;
let recordedChunks: Blob[] = [];
let recorded: Blob;
let isRecording = false;

export async function startRecordingAudio() {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    mediaRecorder.start();
    isRecording = true;
}

export function stopRecordingAudio(): Promise<Blob> {
    return new Promise((resolve) => {
        if (!mediaRecorder || !isRecording) return;

        mediaRecorder.onstop = () => {
            mediaStream.getTracks().forEach(track => track.stop());
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            recordedChunks = [];
            recorded = blob;
            resolve(blob);
        };
        mediaRecorder.stop();
    });
}

export function playRecordedAudio() {
    const audioURL = URL.createObjectURL(recorded);
    const audio = new Audio(audioURL);
    audio.play();
}