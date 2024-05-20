import React, { useEffect, useState } from "react";
import { CircularProgress, IconButton, Icon } from "@mui/material";
import { NoteI } from "../types";
import ObservationCard from "./ObservationCard";

export default function NoteCard(note: NoteI) {
    const [expanded, setExpanded] = useState(true);

    useEffect(
        () =>
            note.observations.length === 0 ? setExpanded(false) : setExpanded(true),
        [],
    );

    function toggleExpansion() {
        setExpanded((expanded) => !expanded);
    }

    const timeString =
        note.date.toLocaleTimeString("en-US").slice(0, 5) +
        note.date.toLocaleTimeString("en-US").slice(8);
    const dateString = note.date.toLocaleDateString("en-US");

    return (
        <div className="flex flex-col">
            <div
                className={`w-full rounded-t bg-gray-200 my-1
                      ${expanded ? "" : "rounded-b"}`}
            >
                <div className="flex flex-row justify-between p-2">
                    <div className="w-1/2">{note.content}</div>
                    <div className="w-3/8 flex flex-col justify-start items-end text-right">
                        <div>{dateString}</div>
                        <div>{timeString}</div>
                    </div>
                    {note.bucketing ? (
                        <div className="w-1/8">
                            <CircularProgress></CircularProgress>
                        </div>
                    ) : note.bucketing_error ? (
                        <p>error</p>
                    ) : (
                        <IconButton onClick={toggleExpansion}>
                            <Icon>{expanded ? "expand_more" : "expand_less"}</Icon>
                        </IconButton>
                    )}
                </div>
            </div>
            <div
                className={`flex flex-col bg-gray-200 rounded-b-lg px-2 
                    ${expanded
                        ? "overflow-scroll max-h-[20vh] py-2"
                        : "max-h-0 overflow-hidden"
                    }
                    transition-[max-height] duration-1000 ease-linear
                    transition-[padding] duration-200 ease-out`}
            >
                {note.observations.map((observation, idx) => (
                    <ObservationCard key={observation._id} {...observation} idx={idx} />
                ))}
            </div>
        </div>
    );
}
