import React, { useEffect, useRef, useState } from "react"
import axios from "axios";
import { Button } from "@mui/material";

function App() {
    let chunks: Blob[] = [];

    const recorder = useRef<MediaRecorder | null>(null);

    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [canRecord, setCanRecord] = useState<boolean>(false);
    const [text, setText] = useState<string>('Your transcription will show here');

    async function GetText(audio_file: File) {
        const form_data = new FormData();
        form_data.append("file", audio_file);
        const res = await axios.post("https://mirakare-sst-poc-wrapper.onrender.com/stt", form_data, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });

        return res.data;
    }

    function SetupAudio() {


        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream: MediaStream) => {
            SetupStream(stream);
        }).catch((e: Error) => {
            console.log(e);
        })
    }

    function SetupStream(stream: MediaStream) {
        recorder.current = new MediaRecorder(stream);
        recorder.current.ondataavailable = (e: BlobEvent) => {
            chunks.push(e.data);
        }

        recorder.current.onstop = (e: Event) => {
            console.log(e)
            const blob: Blob = new Blob(chunks, { type: "audio/mpeg" });
            chunks = [];
            const audio_file: File = new File([blob], "audio_file.mp3", { type: "audio/mpeg" });
            GetText(audio_file).then((transcription) => setText(transcription.choices[0].message.content));

        }

        setCanRecord(true);
    }

    function ToggleMic() {
        if (!canRecord) return;

        if (recorder.current === null) return;

        if (isRecording) {
            setIsRecording(false);
            recorder.current.stop()
        } else {
            setIsRecording(true);
            recorder.current.start();
        }
    }

    useEffect(() => {
        SetupAudio()
    }, [])

    return (
        <div className="flex justify-center">
            <div className="flex justify-center flex-col px-8 w-full md:w-1/3">
                <div className="flex flex-row py-2 items-center justify-between">
                    <div className="flex flex-row">
                        <Button variant="contained" onClick={ToggleMic} disabled={isRecording}>
                            Record
                        </Button>
                        <div className="w-2" />
                        <Button variant="contained" onClick={ToggleMic} disabled={!isRecording}>
                            Stop
                        </Button>
                    </div>
                    <div className={`rounded-full ${isRecording ? "bg-red-500" : "bg-gray-500"} w-5 h-5`}>
                    </div>
                </div>
                <p>
                    {text}
                </p>

            </div>

        </div>
    );
}

export default App;
