import React from "react";
import { ObservationI } from "./types";

export default function ObservationCard(observation: ObservationI) {
  return (
    <div>
      <p>{observation.category}</p>
      <p>{observation.details}</p>
      <p>
        {observation.date.toLocaleString("en-US", {
          timeZone: "America/New_York",
        })}
      </p>
    </div>
  );
}
