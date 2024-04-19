import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { NoteI } from "../types";
import ObservationCard from "../ObservationCard";

export default function NoteCard(note: NoteI) {
  // TODO get local timezone
  const dt_pieces = note.date
    .toLocaleString("en-US", { timeZone: "America/New_York" })
    .split("T");

  const timeString = dt_pieces[1].slice(0, 5);
  const dateString = dt_pieces[0];

  return (
    <div className="flex flex-col">
      <div className="w-full rounded shadow-sm bg-gray-200 my-1">
        <div className="flex flex-row justify-between p-2">
          <div className="w-1/2">{note.content}</div>
          {note.bucketing ? (
            <div className="w-1/8">
              <CircularProgress></CircularProgress>
            </div>
          ) : note.bucketing_error ? (
            <p>error</p>
          ) : null}
          <div className="w-3/8 flex flex-col justify-start items-end text-right">
            <div>{dateString}</div>
            <div>{timeString}</div>
          </div>
        </div>
      </div>
      {note.observations.map((observation) => (
        <ObservationCard key={observation.id} {...observation} />
      ))}
    </div>
  );
}
