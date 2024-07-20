import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { CircularProgress, Fab, Icon } from "@mui/material";
import { NoteI, ObservationI } from "../types";
import NoteCard from "../components/NoteCard";
import { toast, ToastContainer } from "react-toastify";

export default function NotesPage({ user_id }: { user_id: string | null }) {
    let chunks: Blob[] = [];

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const bottomRef = useRef<HTMLDivElement>(null);

    const recorder = useRef<MediaRecorder | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [canRecord, setCanRecord] = useState(false);
    const [notes, setNotes] = useState<NoteI[]>([]);
    const [isLoadingNote, setIsLoadingNote] = useState(false);

    useEffect(scrollToBottom, [notes]);
    useEffect(consume_notes, [user_id]);

    function consume_notes() {
        if (user_id === null) {
            // indicate to user where select user button is
            return;
        }
        axios
            .get(`${BASE_URL}/data/notes/${user_id}/-1`)
            .then((res) => {
                const new_notes: NoteI[] = [];
                // TODO get rid of this
                // eslint-disable-next-line
                res.data.notes.forEach((new_note: any) => {
                    new_notes.push({
                        content: new_note["content"],
                        date: new Date(new_note["date"]),
                        _id: new_note["_id"],
                        user_id: user_id,
                        bucketing: false,
                        bucketing_error: false,
                        observations: [],
                    });
                });

                // Make this efficient
                new_notes.forEach((new_note) => {
                    new_note.observations = [];
                    // TODO get rid of this
                    // eslint-disable-next-line
                    res.data.observations.forEach((observation: any) => {
                        if (observation.note_id === new_note._id)
                            new_note.observations.push({
                                category: observation.category,
                                date: new Date(observation.date),
                                note_id: observation.note_id,
                                user_id: user_id,
                                _id: observation._id,
                                details: observation.details,
                            });
                    });
                });

                setNotes(new_notes);
            })
            .catch((error) => console.log(error));
    }

    function scrollToBottom() {
        if (bottomRef.current !== null) {
            bottomRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }

    function BucketText(note_id: string) {
        if (user_id === null || user_id.length === 0) {
            toast.error("Please select a user.", { position: "bottom-left" });
            return;
        }

        axios
            .get(
                `${BASE_URL}/dictation/bucket/${note_id}/America-New_York/${user_id}`,
            )
            .then((res) => {
                console.log(res);
                setNotes((notes) => {
                    return notes.map((note) => {
                        if (note._id === note_id) {
                            note.bucketing = false;
                            note.bucketing_error = false;

                            const observations: ObservationI[] = res.data;
                            note.observations = observations.map((observation) => ({
                                category: observation.category,
                                date: new Date(observation.date),
                                note_id: observation.note_id,
                                user_id: user_id,
                                _id: observation._id,
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
                    return notes.map((note) => {
                        if (note._id == note_id) {
                            note.bucketing = false;
                            note.bucketing_error = true;
                        }
                        return note;
                    });
                });
            });
    }

    function GetText(audio_file: File) {
        
        if (user_id === null || user_id.length === 0) {
            toast.error("Please select a user.", { position: "bottom-left" });
            return;
        }

        const form_data = new FormData();
        form_data.append("file", audio_file);

        setIsLoadingNote(true);
        axios
            .post(`${BASE_URL}/dictation/upload/${user_id}`, form_data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                const new_note = res.data;

                setNotes((notes) => {
                    // if we find that this note already exists in the list, ignore the call to setstate
                    if (notes.find((note) => new_note["_id"] === note._id)) {
                        return notes;
                    }

                    return [
                        ...notes,
                        {
                            content: new_note["content"],
                            date: new Date(new_note["date"]),
                            _id: new_note["_id"],
                            user_id: user_id,
                            bucketing: true,
                            bucketing_error: false,
                            observations: [],
                        },
                    ];
                });

                BucketText(new_note["_id"]);
                setIsLoadingNote(false);
            })
            .catch((error: Error) => {
                console.log("Error occured while getting transcribed audio:");
                console.log(error);
                setIsLoadingNote(false);
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
            console.log(e.data);
        };

        recorder.current.onstop = (e: Event) => {
            console.log(e);
            const blob: Blob = new Blob(chunks, { type: "audio/mp4" });

            chunks = [];
            const audio_file: File = new File([blob], "audio_file.mp4", {
                type: "audio/mp4",
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
            recorder.current.start(1000);
        }
    }

    useEffect(SetupAudio, []);
    return (
        <div className="h-[90vh]">
            <div
                className="flex flex-col overflow-y-auto bg-gray-100 
                      px-1 rounded h-[85%]"
            >
                {notes.length > 0 ? (
                    notes.map((note) => {
                        const noteProps = { ...note };
                        return <NoteCard {...noteProps} key={note._id}></NoteCard>;
                    })
                ) : (
                    <div className="flex w-full h-full justify-center items-center text-lg">
                        Record some notes!
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>
            <div className="flex flex-row items-center justify-center h-[15%] relative">
                <Fab
                    onClick={ToggleMic}
                    className="h-[10vh] w-[10vh] bg-gray-100 shadow-md z-40"
                >
                    <Icon className={`${isRecording ? "text-red-500" : "text-gray-500"}`}>
                        mic
                    </Icon>
                </Fab>
                {isLoadingNote && (
                    <CircularProgress
                        size="10vh"
                        className="absolute z-50 left-100"
                    ></CircularProgress>
                )}
            </div>
            <ToastContainer />
        </div>
    );
}
