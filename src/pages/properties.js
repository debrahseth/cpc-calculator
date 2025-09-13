import { useState } from "react";
import { useRouter } from "next/router";
import molarMassDatabase from "../data/molarMasses";
import meltingPoints from "../data/meltingPoints";
import boilingPoints from "../data/boilingPoints";
import criticalPressure from "../data/criticalPressure";
import criticalTemperature from "../data/criticalTemperature";

export default function PropertiesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const compounds = Object.keys(molarMassDatabase)
    .sort((a, b) => a.localeCompare(b))
    .map((compound) => ({
      compound,
      molarMass: molarMassDatabase[compound],
      meltingPoint: meltingPoints[compound] ?? "N/A",
      boilingPoint: boilingPoints[compound] ?? "N/A",
      criticalPressure: criticalPressure[compound] ?? "N/A",
      criticalTemperature: criticalTemperature[compound] ?? "N/A",
    }));

  const filteredCompounds = compounds.filter((item) =>
    item.compound.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-200 p-2 font-sans">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-4xl font-extrabold mt-5 mb-6 text-gray-800 text-center tracking-tight drop-shadow-md">
          Compound Properties
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          Explore molar masses and melting points of common compounds.
        </p>

        <div className="flex flex-row justify-center items-center gap-2 mt-4">
          <button
            onClick={() => router.back()}
            className="md:w-2xl px-15 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            ⬅️ Go Back
          </button>
          <button
            onClick={() => router.push("/cp-calculator")}
            className="md:w-2xl px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Cp Calculator ➡️
          </button>
        </div>

        <div className="flex justify-center mt-5 mb-6">
          <input
            type="text"
            placeholder="🔍 Search for a compound..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-7xl px-5 py-3 text-gray-600 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
          />
        </div>

        <div className="overflow-x-auto bg-white shadow-2xl rounded-2xl border border-gray-200 max-h-[80vh]">
          <table className="w-full border-collapse text-lg text-left text-gray-800">
            <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-base tracking-wider sticky top-0 z-20 shadow-md">
              <tr>
                <th className="px-10 py-5">Compound</th>
                <th className="px-2 py-5">
                  M<sub>w</sub> (g/mol)
                </th>
                <th className="px-8 py-5">
                  T<sub>m</sub> (°C)
                </th>
                <th className="px-8 py-5">
                  T<sub>b</sub> (°C)
                </th>
                <th className="px-8 py-5">
                  T<sub>c</sub> (K)
                </th>
                <th className="px-2 py-5">
                  P<sub>c</sub> (atm)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompounds.length > 0 ? (
                filteredCompounds.map((item, index) => (
                  <tr
                    key={index}
                    className={`transition duration-300 ease-in-out ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-indigo-100 hover:scale-[1.01]`}
                  >
                    <td className="px-8 py-5 font-semibold text-gray-900">
                      {item.compound}
                    </td>
                    <td className="px-8 py-5">{item.molarMass}</td>
                    <td className="px-8 py-5">{item.meltingPoint}</td>
                    <td className="px-8 py-5">{item.boilingPoint}</td>
                    <td className="px-8 py-5">{item.criticalTemperature}</td>
                    <td className="px-8 py-5">{item.criticalPressure}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-8 py-6 text-center text-gray-500 italic"
                  >
                    No compounds found 🔍
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-center text-gray-600 text-md">
          📘 Data sourced from{" "}
          <span className="font-semibold">Rousseau’s Textbook</span>
        </p>
      </div>
    </div>
  );
}
