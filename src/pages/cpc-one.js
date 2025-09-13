import { useState } from "react";
import { useRouter } from "next/router";
import UnitConversion from "@/components/UnitConversion";
import MoleFraction from "@/components/MoleFraction";
import Stoichiometry from "@/components/Stoichiometry";
// import MaterialBalance from "@/components/MaterialBalance";

export default function CPCOne() {
  const [selectedCalc, setSelectedCalc] = useState("unit");
  const router = useRouter();

  const renderCalculator = () => {
    switch (selectedCalc) {
      case "unit":
        return <UnitConversion />;
      case "mole":
        return <MoleFraction />;
      case "stoich":
        return <Stoichiometry />;
      //   case "balance":
      //     return <MaterialBalance />;
      default:
        return <UnitConversion />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex flex-col">
      <header className="sticky top-0 z-20 bg-white shadow-md border-b">
        <div className="max-w-8xl mx-auto flex flex-col items-center py-6 px-4">
          <h1 className="text-center text-3xl md:text-6xl font-extrabold text-blue-700 tracking-tight mb-2">
            Chemical Process Calculations One
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-4 text-center max-w-6xl">
            Explore the core tools for Chemical Process Calculations. Select a
            calculator from the menu below to get started.
          </p>

          <select
            value={selectedCalc}
            onChange={(e) => setSelectedCalc(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 font-medium text-[18px] uppercase text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="unit">⚖️ Unit Conversion</option>
            <option value="mole">⚗️ Mole & Mass Fractions</option>
            <option value="stoich">📊 Stoichiometry</option>
            {/* <option value="balance">🔄 Material Balance (No Reaction)</option> */}
          </select>

          <div className="grid grid-flow-col auto-cols-auto gap-4">
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              🏠 Go to Home
            </button>
            <button
              onClick={() => router.push("/cp-calculator")}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              🔢 Cp Calculator
            </button>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 overflow-y-auto">
        <div className="w-full bg-white rounded-none shadow-xl p-2 transition-all duration-300">
          {renderCalculator()}
        </div>
      </main>
    </div>
  );
}
