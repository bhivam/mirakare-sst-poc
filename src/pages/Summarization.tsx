import { Button } from "@mui/material";
import React, { useState } from "react";

export default function ObservationPage() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [summary, setSummary] = useState("");

  async function GetSummary(lookback: number) {
    setSummary("");

    const res = await fetch(
      `${BASE_URL}/dictation/summary/${lookback.toString()}`,
      {
        method: "get",
      },
    );

    if (!res.ok || !res.body) {
      console.log("Error while streaming summary from server.");
      console.log(res.statusText);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let finished = false;

    while (!finished) {
      const { value, done } = await reader.read();
      if (done) {
        finished = true;
        continue;
      }

      const decoded_chunk = decoder.decode(value, { stream: true });
      setSummary((summary) => summary + decoded_chunk);
    }
  }

  return (
    <div className="h-[90vh] w-full flex flex-col">
      <div
        className="w-full h-[85%] bg-gray-100 rounded 
                      p-4 text-lg overflow-auto"
      >
        {summary !== "" && summary}
      </div>
      <div className="w-full h-[15%] flex flex-row items-center justify-center">
        <Button variant="contained" onClick={() => GetSummary(100)}>
          Generate Summary
        </Button>
      </div>
    </div>
  );
}
