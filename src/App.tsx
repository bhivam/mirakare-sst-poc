import React, { useState } from "react";
import NotesPage from "./pages/Notes";
import SummarizationPage from "./pages/Summarization";

function App() {
  const [tab, setTab] = useState(0);

  const tabs = [
    { title: "Notes", component: <NotesPage /> },
    { title: "Summarization", component: <SummarizationPage /> },
  ];

  return (
    <div className="flex h-[100vh] w-[100vw] justify-center">
      <div className="flex flex-col px-8 w-full md:w-3/4">
        <div className="flex flex-row">
          <div
            className={`text-xl xs:text-2xl md:text-5xl sm:text-3xl font-bold py-3 pr-4 text-black 
                        ${tab === 0 ? "border-solid border-0 border-b-2 border-black" : "text-opacity-25"}`}
            onClick={() => setTab(0)}
          >
            Notes
          </div>
          <div
            className={`text-xl xs:text-2xl md:text-5xl sm:text-3xl font-bold py-3 pr-4 text-black 
                        ${tab === 1 ? "border-solid border-0 border-b-2 border-black" : "text-opacity-25"}`}
            onClick={() => setTab(1)}
          >
            Summarization
          </div>
        </div>
        {tabs[tab].component}
      </div>
    </div>
  );
}

export default App;
