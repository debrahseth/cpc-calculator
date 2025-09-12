import { useState } from "react";
import { useRouter } from "next/router";
import cpRelations from "@/data/cpRelations";
import atomicCp from "@/data/atomicCp";

export default function CpRelationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("cp");

  const cpCompounds = Object.entries(cpRelations).flatMap(
    ([compound, states]) =>
      Object.entries(states).flatMap(([state, data]) =>
        Array.isArray(data)
          ? data.map((rel, idx) => ({
              compound,
              state: `${state} (#${idx + 1})`,
              ...rel,
            }))
          : [
              {
                compound,
                state: `${state}`,
                ...data,
              },
            ]
      )
  );

  const koppCompounds = Object.entries(atomicCp).map(([el, states]) => ({
    compound: el,
    state: "solid / liquid / gas",
    Cp_solid: states.solid,
    Cp_liquid: states.liquid,
    Cp_gas: states.gas,
  }));

  const filteredCp = cpCompounds.filter(
    (item) =>
      item.compound.toLowerCase().includes(search.toLowerCase()) ||
      item.state.toLowerCase().includes(search.toLowerCase())
  );

  const filteredKopp = koppCompounds.filter((item) =>
    item.compound.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-2 sm:p-10 font-sans">
      <div className="w-full h-full">
        <h1 className="text-5xl md:text-6xl font-extrabold mt-6 mb-6 text-center text-gray-900 tracking-tight drop-shadow-lg">
          📊 {viewMode === "cp" ? "Cp Relations Table" : "Kopp's Rule Table"}
        </h1>
        <p className="text-lg md:text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto leading-relaxed">
          {viewMode === "cp" ? (
            <>
              Explore{" "}
              <span className="font-semibold text-indigo-600">
                heat capacity correlation parameters
              </span>{" "}
              (a, b, c, d) for different compounds and states. 🔬
            </>
          ) : (
            <>
              Estimated heat capacities{" "}
              <span className="font-semibold text-indigo-600">
                using Kopp's Rule
              </span>{" "}
              for individual elements. 🧪
            </>
          )}
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setViewMode("cp")}
            className={`px-6 py-3 rounded-xl font-semibold text-lg ${
              viewMode === "cp"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Cp Relations
          </button>
          <button
            onClick={() => setViewMode("kopp")}
            className={`px-6 py-3 rounded-xl font-semibold text-lg ${
              viewMode === "kopp"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Kopp's Rule
          </button>
        </div>

        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="🔍 Search compound or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-full px-5 py-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300"
          />
        </div>

        <div className="overflow-x-auto bg-white shadow-2xl rounded-2xl border border-gray-200 max-h-[80vh]">
          {viewMode === "cp" ? (
            <table className="w-full border-collapse text-base md:text-lg text-left text-gray-800">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-sm md:text-base tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Compound</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4">Form</th>
                  <th className="px-6 py-4">Temperature Range</th>
                  <th className="px-6 py-4">Temp Unit</th>
                  <th className="px-6 py-4">
                    a × 10<sup>2</sup>
                  </th>
                  <th className="px-6 py-4">
                    b × 10<sup>5</sup>
                  </th>
                  <th className="px-6 py-4">
                    c × 10<sup>8</sup>
                  </th>
                  <th className="px-6 py-4">
                    d × 10<sup>12</sup>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCp.map((item, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.compound}
                    </td>
                    <td className="px-6 py-4 capitalize">{item.state}</td>
                    <td className="px-6 py-4">{item.form}</td>
                    <td className="px-6 py-4">
                      {item.range[0]} – {item.range[1]}
                    </td>
                    <td className="px-6 py-4">{item.tempUnit}</td>
                    <td className="px-6 py-4">{item.coefficients.a}</td>
                    <td className="px-6 py-4">{item.coefficients.b}</td>
                    <td className="px-6 py-4">{item.coefficients.c}</td>
                    <td className="px-6 py-4">{item.coefficients.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse text-base md:text-lg text-left text-gray-800">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-sm md:text-base tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Element</th>
                  <th className="px-6 py-4">Cp (solid)</th>
                  <th className="px-6 py-4">Cp (liquid)</th>
                  <th className="px-6 py-4">Cp (gas)</th>
                </tr>
              </thead>
              <tbody>
                {filteredKopp.map((item, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.compound}
                    </td>
                    <td className="px-6 py-4">{item.Cp_solid}</td>
                    <td className="px-6 py-4">{item.Cp_liquid}</td>
                    <td className="px-6 py-4">{item.Cp_gas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-6 text-center text-sm md:text-base text-gray-600">
          ℹ️{" "}
          {viewMode === "cp"
            ? "Values are raw coefficients (multiply by their respective exponents during calculations)."
            : "Cp values are estimated using Kopp's Rule."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-12">
          <button
            onClick={() => router.back()}
            className="w-full px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 text-lg font-bold rounded-xl shadow hover:shadow-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
          >
            ⬅️ Go Back
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-bold rounded-xl shadow hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
          >
            🏠 Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
