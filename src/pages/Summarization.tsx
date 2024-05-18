import { Button, Chip, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import React, { useState } from "react";

export default function ObservationPage() {
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [observationTypes, setObservationTypes] = useState<string[]>([])
    const [lookback, setLookback] = useState(7)

    const categories = [
        "Food/Drink",
        "Heart Rate",
        "Blood Pressure",
        "Sleep",
        "Oxygen Level",
        "Breathing Rate",
        "Temperature",
        "Glucose",
        "Weight",
        "Entertainment",
        "Exercise",
        "Food",
        "Medication",
        "Therapy",
        "Toileting",
        "Other"
    ];

    async function GetSummary() {
        setSummary("");
        setLoading(true);

        const res = await fetch(
            `${BASE_URL}/dictation/summary/`,
            {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "lookback": lookback,
                    "observation_types": observationTypes
                })
            },
        );

        if (!res.ok || !res.body) {
            console.log("Error while streaming summary from server.");
            console.log(res.statusText);
            setLoading(false);
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

        setLoading(false);
    }

    function handleChipClick(category: string) {
        if (observationTypes.includes(category)) {
            setObservationTypes((observationTypes) => {
                let newObservationTypes = [...observationTypes];
                newObservationTypes = newObservationTypes.filter((type) => type != category)
                return newObservationTypes;
            })
        } else {
            setObservationTypes((observationTypes) => {
                const newObservationTypes = [...observationTypes, category];
                return newObservationTypes;
            })
        }
    }
    function handleRadioClick(newLb: React.ChangeEvent<HTMLInputElement>) {
        setLookback(parseInt(newLb.target.value));
    }
    return (
        <div className="h-[90vh] w-full flex flex-col">
            <div
                className="w-full h-[75%] bg-gray-100 rounded 
                      p-4 text-lg overflow-auto"
            >
                {summary !== "" ? (
                    summary
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        Generate a summary!
                    </div>
                )}
            </div>
            <div className="w-full h-[25%] flex flex-row items-center gap-4">
                <div className="h-full w-2/3 flex flex-col justify-between gap-2 pt-2">
                    <div>
                        <FormLabel>categories</FormLabel>
                        <div className="flex flex-row bg-gray-100 rounded p-1 gap-2 flex-wrap overflow-y-scroll">
                            {categories.map((category, i) =>
                                <Chip
                                    key={i}
                                    variant={observationTypes.includes(category) ? "filled" : "outlined"}
                                    onClick={() => handleChipClick(category)}
                                    label={category}
                                />
                            )}
                        </div>

                    </div>
                    <div>
                        <Button variant="contained" onClick={
                            () => GetSummary()
                        }>
                            {loading ? "Generating..." : "Generate Summary"}
                        </Button>

                    </div>
                </div>
                <div className="h-full flex flex-col w-1/3 pt-2">
                    <FormLabel>lookback period</FormLabel>
                    <RadioGroup
                        value={lookback}
                        onChange={(e) => handleRadioClick(e)}
                    >
                        <FormControlLabel value={7} control={<Radio />} label="1 wk" />
                        <FormControlLabel value={30} control={<Radio />} label="1 mo" />
                        <FormControlLabel value={90} control={<Radio />} label="3 mo" />
                        <FormControlLabel value={365} control={<Radio />} label="1 yr" />
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
}
