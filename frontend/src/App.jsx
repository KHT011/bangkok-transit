import "./App.css";
import { Routes, Route } from "react-router-dom";
import Planner from "./pages/Planner";

function App() {
  return (
    <>
      <div
        className="min-h-screen flex flex-col text-[var(--text-primary)]"
        style={{
          background:
            "radial-gradient(90% 70% at 80% 0%, rgba(241, 120, 209, 0.12), transparent), radial-gradient(80% 60% at 15% 15%, rgba(120, 196, 255, 0.18), transparent), linear-gradient(180deg, rgba(8, 15, 31, 0.9), rgba(5, 9, 20, 0.92))",
        }}
      >
        {/* Main content area */}
        <main className="flex-1 p-4">
          <Planner />
        </main>
      </div>

      {/* footer */}
      <div className="px-4 sm:px-6 text-sm lg:px-8 py-4 bg-[#050914]/90 text-[var(--text-primary)] border-t border-[rgba(255,255,255,0.06)] flex flex-row justify-between">
        <p className="text-[var(--text-secondary)]">Ac 2025 Bangkok Transit</p>
        <p className="text-[var(--accent-2)]">Help</p>
      </div>
    </>
  );
}

export default App;
