export function playNativeAudio(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}

let mediaStream: MediaStream;
let mediaRecorder: MediaRecorder;
let recordedChunks: Blob[] = [];

export async function startRecordingAudio() {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    mediaRecorder.start();
}

export function stopRecordingAudio(): Promise<Blob> {
    return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
            mediaStream.getTracks().forEach(track => track.stop());
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            recordedChunks = [];
            resolve(blob);
        };
        mediaRecorder.stop();
    });
}

export function playRecordedAudio(blob: Blob) {
    const audioURL = URL.createObjectURL(blob);
    const audio = new Audio(audioURL);
    audio.play();
}