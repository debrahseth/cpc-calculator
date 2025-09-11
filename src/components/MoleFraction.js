import { useState } from "react";
import { Pie } from "react-chartjs-2";
import molarMassDatabase from "../data/molarMasses";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default function MultiComponentFractions() {
  const [numComponents, setNumComponents] = useState(2);
  const [inputType, setInputType] = useState("mole");
  const [inputMode, setInputMode] = useState("values");
  const [totalValue, setTotalValue] = useState("");
  const [fractionSumWarning, setFractionSumWarning] = useState("");
  const [averageMolarMass, setAverageMolarMass] = useState(null);
  const [totalMassValue, setTotalMassValue] = useState(0);
  const [components, setComponents] = useState(
    Array.from({ length: 2 }, () => ({ name: "", value: "", molarMass: "" }))
  );
  const [results, setResults] = useState(null);

  const handleNumChange = (e) => {
    const count = parseInt(e.target.value);
    if (!isNaN(count) && count > 0) {
      setNumComponents(count);
      setComponents(
        Array.from({ length: count }, () => ({
          name: "",
          value: "",
          molarMass: "",
        }))
      );
      setResults(null);
    }
  };

  const handleComponentChange = (index, field, value) => {
    const updated = [...components];

    if (field === "name") {
      updated[index].name = value;
      updated[index].molarMass = molarMassDatabase[value] || "";
    } else {
      updated[index][field] = value;
    }

    setComponents(updated);

    if (inputMode === "fractions") {
      const sumFractions = updated.reduce(
        (sum, c) => sum + (parseFloat(c.value) || 0),
        0
      );
      if (Math.abs(sumFractions - 1) > 0.001) {
        setFractionSumWarning(
          `⚠️ Fractions must sum to 1. Current sum is ${sumFractions.toFixed(
            3
          )}`
        );
      } else {
        setFractionSumWarning("");
      }
    }
  };

  // Calculate fractions
  const handleCalculate = () => {
    let totalMoles = 0;
    let totalMass = 0;

    let computed;

    if (inputMode === "values") {
      computed = components.map((c) => {
        const val = parseFloat(c.value) || 0;
        const molarMass = parseFloat(c.molarMass) || 0;

        let moles = 0;
        let mass = 0;

        if (inputType === "mole") {
          moles = val;
          mass = moles * molarMass;
        } else {
          mass = val;
          moles = molarMass > 0 ? mass / molarMass : 0;
        }

        totalMoles += moles;
        totalMass += mass;

        return { ...c, moles, mass };
      });
    } else {
      const total = parseFloat(totalValue) || 0;
      const sumFractions = components.reduce(
        (sum, c) => sum + (parseFloat(c.value) || 0),
        0
      );

      if (Math.abs(sumFractions - 1) > 0.001) {
        alert(
          `The sum of fractions must equal 1. Current sum: ${sumFractions.toFixed(
            3
          )}`
        );
        return;
      }

      computed = components.map((c) => {
        const fraction = parseFloat(c.value) || 0;
        const molarMass = parseFloat(c.molarMass) || 0;

        let moles = 0;
        let mass = 0;

        if (inputType === "mole") {
          moles = fraction * total;
          mass = moles * molarMass;
        } else {
          mass = fraction * total;
          moles = molarMass > 0 ? mass / molarMass : 0;
        }

        totalMoles += moles;
        totalMass += mass;

        return { ...c, moles, mass, fraction };
      });
    }

    const withFractions = computed.map((c) => ({
      ...c,
      moleFraction: totalMoles > 0 ? c.moles / totalMoles : 0,
      massFraction: totalMass > 0 ? c.mass / totalMass : 0,
    }));

    let averageMolarMassMoles = 0;
    withFractions.forEach((c) => {
      averageMolarMassMoles += c.moleFraction * c.molarMass;
    });

    let sumMassOverM = 0;
    withFractions.forEach((c) => {
      if (c.molarMass > 0) sumMassOverM += c.massFraction / c.molarMass;
    });
    let averageMolarMassMass = sumMassOverM > 0 ? 1 / sumMassOverM : 0;

    setAverageMolarMass({
      byMoles: averageMolarMassMoles,
      byMass: averageMolarMassMass,
    });
    setResults(withFractions);
    setTotalMassValue(totalMass);
  };

  const handleReset = () => {
    setNumComponents(2);
    setInputType("mole");
    setInputMode("values");
    setTotalValue("");
    setComponents(
      Array.from({ length: 2 }, () => ({ name: "", value: "", molarMass: "" }))
    );
    setResults(null);
  };

  return (
    <div>
      <div className="w-full mb-10 p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-900 mb-6 tracking-wide drop-shadow-sm">
          Multi-Component Fractions
        </h2>
        <div className="mb-6">
          <label className="block text-[20px] font-semibold text-gray-700 mb-2">
            Number of Components
          </label>
          <input
            type="number"
            min="2"
            value={numComponents}
            onChange={handleNumChange}
            className="w-full p-3 text-center font-medium border-2 border-indigo-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:scale-101 hover:shadow-lg"
          />
          <p className="mt-1 text-sm text-gray-500 italic">
            Tip: Use the arrow keys to quickly increase or decrease the number
          </p>
        </div>
      </div>

      <div className="w-full mb-10 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-1/2">
          <label className="text-[20px] font-semibold text-gray-700 mb-1 md:mb-0 md:mr-3">
            Basis:
          </label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            className="w-full p-3 border-2 border-indigo-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:scale-102 hover:shadow-lg text-gray-800 font-medium"
          >
            <option value="mole">Moles (mol) / Molar flow (mol/s)</option>
            <option value="mass">Mass (g) / Mass flow (g/s)</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-1/2">
          <label className="text-[20px] font-semibold text-gray-700 mb-1 md:mb-0 md:mr-3">
            Mode:
          </label>
          <select
            value={inputMode}
            onChange={(e) => setInputMode(e.target.value)}
            className="w-full p-3 border-2 border-indigo-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:scale-102 hover:shadow-lg text-gray-800 font-medium"
          >
            <option value="values">Direct values</option>
            <option value="fractions">Fractions + Total</option>
          </select>
        </div>
      </div>

      {inputMode === "fractions" && (
        <div className="mb-6 w-full max-w-5xl mx-auto">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Total{" "}
            {inputType === "mole" ? "Moles / Molar Flow" : "Mass / Mass Flow"}:
          </label>
          <input
            type="number"
            value={totalValue}
            onChange={(e) => setTotalValue(e.target.value)}
            className="w-full p-3 border-2 border-indigo-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:scale-102 hover:shadow-lg text-gray-800 font-medium"
            placeholder={`Enter total ${
              inputType === "mole" ? "moles" : "mass"
            }`}
          />
          <p className="mt-1 text-sm text-gray-500 italic">
            Tip: Use arrow keys to quickly adjust the total
          </p>
        </div>
      )}
      {fractionSumWarning && (
        <p className="text-red-600 font-medium mb-2">{fractionSumWarning}</p>
      )}

      <div className="space-y-4 mb-6">
        <div className="hidden md:grid md:grid-cols-12 gap-3 mb-2 text-gray-700">
          <div className="md:col-span-4 text-center">
            <div className="font-semibold text-lg">Compound</div>
            <div className="text-sm text-gray-500 mt-1">
              Select from dropdown
            </div>
          </div>
          <div className="md:col-span-4 text-center">
            <div className="font-semibold text-lg">
              {inputMode === "fractions"
                ? inputType === "mole"
                  ? "Mole Fraction"
                  : "Mass Fraction"
                : inputType === "mole"
                ? "Moles / Molar Flow"
                : "Mass / Mass Flow"}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Enter value in selected basis
            </div>
          </div>
          <div className="md:col-span-4 text-center">
            <div className="font-semibold text-lg">Molar Mass (g/mol)</div>
            <div className="text-sm text-gray-500 mt-1">
              Auto-filled from database
            </div>
          </div>
        </div>

        {components.map((c, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full"
          >
            <select
              value={c.name}
              onChange={(e) => handleComponentChange(i, "name", e.target.value)}
              className="w-full md:w-1/3 p-3 border-2 border-indigo-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:scale-102 hover:shadow-lg text-gray-800 font-medium"
            >
              <option value="">Select compound</option>
              {Object.keys(molarMassDatabase).map((compound) => (
                <option key={compound} value={compound}>
                  {compound}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder={
                inputMode === "fractions"
                  ? `${
                      inputType === "mole" ? "Mole fraction" : "Mass fraction"
                    }`
                  : `${
                      inputType === "mole"
                        ? "Moles / Molar flow"
                        : "Mass / Mass flow"
                    }`
              }
              value={c.value}
              onChange={(e) =>
                handleComponentChange(i, "value", e.target.value)
              }
              className="w-full md:w-1/3 p-3 border-2 border-indigo-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:scale-102 hover:shadow-lg text-gray-800 font-medium"
            />

            <input
              type="number"
              value={c.molarMass}
              readOnly
              className="w-full md:w-1/4 p-3 border-2 border-gray-300 rounded-xl bg-gray-100 shadow-inner text-gray-600 font-medium"
            />
          </div>
        ))}

        <p className="text-sm text-gray-500 italic mt-1">
          Tip: Use arrow keys to adjust values quickly
        </p>
      </div>

      {/* Calculate button */}
      <div className="flex gap-4 mt-10">
        <button
          onClick={handleCalculate}
          className="flex-1 text-[20px] bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
        >
          🚀 Calculate
        </button>
        <button
          onClick={handleReset}
          className="flex-1 text-[20px] bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition shadow-md"
        >
          ♻️ Reset
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-10 w-full">
          <h3 className="text-4xl font-extrabold text-indigo-900 mb-4 text-center">
            🧪 Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {results.map((c, i) => (
              <div
                key={i}
                className="p-4 rounded-xl shadow-md border border-indigo-100 bg-white transition-transform transform hover:scale-102 hover:shadow-lg"
              >
                <h4 className="text-lg font-semibold text-indigo-700 mb-2">
                  {c.name || `Component ${i + 1}`}
                </h4>
                <p className="text-gray-800 mb-1">
                  <span className="font-medium text-[18px]">Moles:</span>{" "}
                  {c.moles.toFixed(2)} mol
                </p>
                <p className="text-gray-800 mb-1">
                  <span className="font-medium text-[18px]">Mass:</span>{" "}
                  {c.mass.toFixed(2)} g
                </p>
                <p className="text-gray-800 mb-1">
                  <span className="font-medium text-[18px]">
                    Mole Fraction:
                  </span>{" "}
                  {(c.moleFraction * 100).toFixed(2)}%
                </p>
                <p className="text-gray-800">
                  <span className="font-medium text-[18px]">
                    Mass Fraction:
                  </span>{" "}
                  {(c.massFraction * 100).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>

          {averageMolarMass && (
            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-100 via-indigo-50 to-purple-100 rounded-2xl shadow-lg border-2 border-indigo-300 text-center transform transition-all duration-300 hover:scale-102">
              <h3 className="text-2xl md:text-3xl font-extrabold text-indigo-900 mb-4 drop-shadow-sm">
                📊 Average Molar Mass & Total Mass
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800 font-medium text-lg">
                <div className="p-4 bg-white rounded-xl shadow-md border border-indigo-200 hover:shadow-lg transition">
                  <h4 className="text-indigo-700 font-semibold mb-2">
                    By Mole Fractions
                  </h4>
                  <p>{averageMolarMass.byMoles.toFixed(3)} g/mol</p>
                </div>

                <div className="p-4 bg-white rounded-xl shadow-md border border-indigo-200 hover:shadow-lg transition">
                  <h4 className="text-indigo-700 font-semibold mb-2">
                    By Mass Fractions
                  </h4>
                  <p>{averageMolarMass.byMass.toFixed(3)} g/mol</p>
                </div>

                <div className="p-4 bg-white rounded-xl shadow-md border border-indigo-200 hover:shadow-lg transition">
                  <h4 className="text-indigo-700 font-semibold mb-2">
                    Total Mass
                  </h4>
                  <p>{totalMassValue.toFixed(2)} g</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500 italic">
                This shows the weighted average molar mass based on the
                fractions you entered.
              </p>
            </div>
          )}

          {/* Pie Charts */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full md:w-100 mx-auto p-4 bg-white rounded-xl shadow-inner border border-indigo-100">
              <h4 className="text-center text-[20px] font-semibold text-indigo-700 mb-2">
                Mole Fractions
              </h4>
              <Pie
                data={{
                  labels: results.map((c, i) => c.name || `Component ${i + 1}`),
                  datasets: [
                    {
                      data: results.map((c) => c.moleFraction),
                      backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#06b6d4",
                      ],
                    },
                  ],
                }}
              />
            </div>

            <div className="w-full md:w-100 mx-auto p-4 bg-white rounded-xl shadow-inner border border-indigo-100">
              <h4 className="text-center text-[20px] font-semibold text-indigo-700 mb-2">
                Mass Fractions
              </h4>
              <Pie
                data={{
                  labels: results.map((c, i) => c.name || `Component ${i + 1}`),
                  datasets: [
                    {
                      data: results.map((c) => c.massFraction),
                      backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#06b6d4",
                      ],
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
