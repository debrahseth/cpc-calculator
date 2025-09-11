import { useState } from "react";
import { useRouter } from "next/router";
import MaterialBalanceReaction from "@/components/MaterialBalanceReaction";
import EnergyBalance from "@/components/EnergyBalance";
import PhaseEquilibria from "@/components/PhaseEquilibria";
import ProcessIntegration from "@/components/ProcessIntegration";

export default function CPCTwo() {
  const [selectedCalc, setSelectedCalc] = useState("materialReaction");
  const router = useRouter();

  const renderCalculator = () => {
    switch (selectedCalc) {
      case "materialReaction":
        return <MaterialBalanceReaction />;
      case "energy":
        return <EnergyBalance />;
      case "phase":
        return <PhaseEquilibria />;
      case "integration":
        return <ProcessIntegration />;
      default:
        return <MaterialBalanceReaction />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex flex-col">
      <header className="sticky top-0 z-20 bg-white shadow-md border-b">
        <div className="max-w-8xl mx-auto flex flex-col items-center py-6 px-4">
          <h1 className="text-center text-3xl md:text-6xl font-extrabold text-blue-700 tracking-tight mb-2">
            Chemical Process Calculations Two
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-4 text-center max-w-6xl">
            Explore advanced chemical process calculation tools. Select a
            calculator from the menu below to get started.
          </p>

          <select
            value={selectedCalc}
            onChange={(e) => setSelectedCalc(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 font-medium text-[18px] uppercase text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="materialReaction">
              🔄 Material Balance (With Reaction)
            </option>
            <option value="energy">🔥 Energy Balance</option>
            <option value="phase">💧 Phase Equilibria</option>
            <option value="integration">⚙️ Process Integration</option>
          </select>

          <button
            onClick={() => router.push("/")}
            className="mt-4 md:w-2xl px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            🏠 Go to Home
          </button>
        </div>
      </header>

      <main className="w-full flex-1 overflow-y-auto">
        <div className="w-full bg-white rounded-none shadow-xl p-8 transition-all duration-300">
          {renderCalculator()}
        </div>
      </main>
    </div>
  );
}
