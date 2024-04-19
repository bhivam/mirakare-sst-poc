import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { NoteI, ObservationI } from "./types";
import NoteCard from "./components/NoteCard";

function App() {
  let chunks: Blob[] = [];

  const bottomRef = useRef<HTMLDivElement>(null);

  const recorder = useRef<MediaRecorder | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [canRecord, setCanRecord] = useState<boolean>(false);
  const [notes, setNotes] = useState<NoteI[]>([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(scrollToBottom, [notes]);

  function scrollToBottom() {
    if (bottomRef.current !== null) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function BucketText(id: string) {
    axios
      .get(`${BASE_URL}/dictation/bucket/${id}/America-New_York`)
      .then((res) => {
        console.log(res);
        setNotes((notes) => {
          return notes.map((note) => {
            if (note.id === id) {
              note.bucketing = false;
              note.bucketing_error = false;

              const observations: ObservationI[] = res.data;
              note.observations = observations.map((observation) => ({
                category: observation.category,
                date: observation.date,
                note_id: observation.note_id,
                id: observation.id,
                details: observation.details,
              }));
            }
            return note;
          });
        });
      })
      .catch((error: Error) => {
        console.log("Error occured while bucketing note information:");
        console.log(error);
        setNotes((notes) => {
          notes.forEach((note) => {
            if (note.id == id) {
              note.bucketing = false;
              note.bucketing_error = true;
            }
          });
          notes = [...notes];
          return notes;
        });
      });
  }

  function GetText(audio_file: File) {
    const form_data = new FormData();
    form_data.append("file", audio_file);
    axios
      .post(`${BASE_URL}/dictation/upload`, form_data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log(res.data);
        const new_note = res.data;

        setNotes((notes) => {
          notes.push({
            content: new_note["content"],
            date: new_note["date"],
            id: new_note["_id"],
            bucketing: true,
            bucketing_error: false,
            observations: [],
          });
          return [...notes];
        });

        BucketText(new_note["_id"]);
      })
      .catch((error: Error) => {
        console.log("Error occured while getting transcribed audio:");
        console.log(error);
      });
  }

  function SetupAudio() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream: MediaStream) => {
        SetupStream(stream);
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  function SetupStream(stream: MediaStream) {
    recorder.current = new MediaRecorder(stream);
    recorder.current.ondataavailable = (e: BlobEvent) => {
      chunks.push(e.data);
    };

    recorder.current.onstop = (e: Event) => {
      console.log(e);
      const blob: Blob = new Blob(chunks, { type: "audio/mpeg" });
      chunks = [];
      const audio_file: File = new File([blob], "audio_file.mp3", {
        type: "audio/mpeg",
      });
      GetText(audio_file);
    };

    setCanRecord(true);
  }

  function ToggleMic() {
    if (!canRecord) return;

    if (recorder.current === null) return;

    if (isRecording) {
      setIsRecording(false);
      recorder.current.stop();
    } else {
      setIsRecording(true);
      recorder.current.start();
    }
  }

  useEffect(() => {
    SetupAudio();
  }, []);

  return (
    <div className="box-border flex h-[100vh] w-[100vw] justify-center">
      <div className="flex h-full justify-between flex-col px-8 w-full md:w-1/2">
        <div className="flex flex-col h-[80vh]">
          <div className="text-5xl font-bold py-3">Notes</div>
          <div className="flex flex-col overflow-y-auto bg-gray-100 px-1 rounded h-full">
            {notes.length > 0 ? (
              notes.map((note) => {
                const noteProps = { ...note };
                return <NoteCard {...noteProps} key={note.id}></NoteCard>;
              })
            ) : (
              <div className="flex w-full h-full justify-center items-center">
                Record some notes!
              </div>
            )}
            <div ref={bottomRef}></div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between h-[20vh]">
          <div className="flex flex-row">
            <Button
              variant="contained"
              onClick={ToggleMic}
              disabled={isRecording}
            >
              Record
            </Button>
            <div className="w-2" />
            <Button
              variant="contained"
              onClick={ToggleMic}
              disabled={!isRecording}
            >
              Stop
            </Button>
          </div>
          <div
            className={`rounded-full ${isRecording ? "bg-red-500" : "bg-gray-500"} w-5 h-5`}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
