import React from "react";
import { ObservationI } from "./types";

export default function ObservationCard(
  observation: ObservationI & { idx: number },
) {
  const timeString =
    observation.date.toLocaleTimeString("en-US").slice(0, 5) +
    observation.date.toLocaleTimeString("en-US").slice(8);
  const dateString = observation.date.toLocaleDateString("en-US");

  return (
    <div>
      {observation.idx !== 0 ? <hr /> : null}
      <div className="flex flex-row justify-between">
        <div>{observation.category}</div>
        <div>{observation.details}</div>
        <div className="flex flex-col">
          <div>{dateString}</div>
          <div>{timeString}</div>
        </div>
      </div>
    </div>
  );
}
