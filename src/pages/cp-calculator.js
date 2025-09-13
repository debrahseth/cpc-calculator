import { useState } from "react";
import { useRouter } from "next/router";
import cpRelations from "../data/cpRelations";
import { getCp, getDeltaH } from "../utils/cpCalculator";
import { getCpKopp } from "../utils/KoppCalculator";

export default function CpCalculatorPage() {
  const router = useRouter();
  const [compound, setCompound] = useState("");
  const [state, setState] = useState("");
  const [form, setForm] = useState("");
  const [mode, setMode] = useState("cp");
  const [temperature, setTemperature] = useState("");
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCalculate = (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      if (mode === "kopp") {
        if (!compound) {
          setError("⚠️ Please enter a chemical formula for Kopp’s Rule.");
          return;
        }
        const Cp_est = getCpKopp(compound, state || "solid");
        setResult(
          `Estimated Cp ≈ ${Cp_est.toFixed(2)} J/g-atom·°C (Kopp's Rule)`
        );
        return;
      }

      if (!compound || !state) {
        setError("⚠️ Please select a compound and state.");
        return;
      }

      const relation = Array.isArray(cpRelations[compound]?.[state])
        ? cpRelations[compound][state][parseInt(form)]
        : cpRelations[compound]?.[state];

      if (!relation) {
        setError("⚠️ Please select a temperature unit.");
        return;
      }

      const unit = relation.tempUnit === "°C" ? "J/mol·°C" : "J/mol·K";

      if (mode === "cp") {
        if (!temperature) {
          setError("⚠️ Please enter a temperature.");
          return;
        }
        const Cp = getCp(relation, parseFloat(temperature));
        setResult(`Cp = ${Cp.toFixed(4)} ${unit}`);
      } else if (mode === "deltaH") {
        if (!t1 || !t2) {
          setError("⚠️ Please enter both T1 and T2.");
          return;
        }
        const dH = getDeltaH(relation, parseFloat(t1), parseFloat(t2));
        setResult(`ΔH = ${dH.toFixed(4)} J/mol`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setCompound("");
    setState("");
    setForm("");
    setMode("cp");
    setTemperature("");
    setT1("");
    setT2("");
    setResult(null);
    setError("");
  };

  const selectedRelation =
    (mode === "cp" || mode === "deltaH") &&
    compound &&
    state &&
    cpRelations[compound]
      ? Array.isArray(cpRelations[compound][state])
        ? cpRelations[compound][state][parseInt(form)] || null
        : cpRelations[compound][state]
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-3 font-sans">
      <div className="w-full h-full">
        <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-4 text-center text-gray-900 tracking-tight drop-shadow-lg">
          Enthalpy & CP Calculator
        </h1>
        <p className="text-lg text-gray-700 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
          Effortlessly calculate{" "}
          <span className="font-semibold text-indigo-600">
            heat capacity (Cp)
          </span>{" "}
          at a given temperature, or find the{" "}
          <span className="font-semibold text-indigo-600">
            enthalpy change (ΔH)
          </span>{" "}
          across a temperature range. 🚀
        </p>

        <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8 border border-gray-200">
          <form onSubmit={handleCalculate} className="space-y-8">
            <div>
              <label className="block text-gray-800 font-bold mb-3 text-lg">
                ⚡ Calculation Mode
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setMode("cp")}
                  className={`w-full py-3 rounded-xl font-semibold transition-all text-lg ${
                    mode === "cp"
                      ? "bg-indigo-600 text-white shadow-lg scale-102"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cp at T
                </button>

                <button
                  type="button"
                  onClick={() => setMode("deltaH")}
                  className={`w-full py-3 rounded-xl font-semibold transition-all text-lg ${
                    mode === "deltaH"
                      ? "bg-indigo-600 text-white shadow-lg scale-102"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ΔH (T₁ → T₂)
                </button>

                <button
                  type="button"
                  onClick={() => setMode("kopp")}
                  className={`w-full py-3 rounded-xl font-semibold transition-all text-lg ${
                    mode === "kopp"
                      ? "bg-indigo-600 text-white shadow-lg scale-102"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Kopp&apos;s Rule
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-800 font-bold mb-3 text-lg">
                🔬{" "}
                {mode === "kopp" ? "Enter Compound Formula" : "Select Compound"}
              </label>
              {mode === "kopp" ? (
                <>
                  <input
                    type="text"
                    value={compound}
                    onChange={(e) => {
                      setCompound(e.target.value);
                      setState("");
                    }}
                    placeholder="Enter formula (e.g., NaCl, C6H6)..."
                    className="w-full p-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    ⚠️ Make sure the formula is typed correctly and that element
                    symbols are properly capitalized.
                  </p>
                </>
              ) : (
                <select
                  value={compound}
                  onChange={(e) => {
                    setCompound(e.target.value);
                    setState("");
                    setForm("");
                  }}
                  className="w-full p-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                >
                  <option value="">-- Choose a compound --</option>
                  {Object.keys(cpRelations).map((cmp) => (
                    <option key={cmp} value={cmp}>
                      {cmp}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {mode !== "kopp" && compound && (
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-lg">
                  🌡️ Select State
                </label>
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setForm("");
                  }}
                  className="w-full p-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                >
                  <option value="">-- Choose a state --</option>
                  {compound &&
                    Object.keys(cpRelations[compound] || {}).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {mode !== "kopp" && compound && state && (
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-lg">
                  📏 Select Temperature Unit
                </label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  className="w-full p-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                >
                  <option value="">-- Choose unit --</option>
                  {Array.isArray(cpRelations[compound][state]) ? (
                    cpRelations[compound][state].map((opt, idx) => (
                      <option key={idx} value={idx}>
                        {opt.tempUnit} (Range: {opt.range[0]} – {opt.range[1]})
                      </option>
                    ))
                  ) : (
                    <option value="0">
                      {cpRelations[compound][state]?.tempUnit} (Range:{" "}
                      {cpRelations[compound][state]?.range[0]} –{" "}
                      {cpRelations[compound][state]?.range[1]})
                    </option>
                  )}
                </select>
              </div>
            )}

            {mode === "cp" && (
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-lg">
                  🌡️ Temperature ({selectedRelation?.tempUnit || "—"})
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="Enter temperature"
                  className="w-full p-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                />
              </div>
            )}

            {mode === "deltaH" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-800 font-bold mb-3 text-lg">
                    🔽 T₁ ({selectedRelation?.tempUnit || "—"})
                  </label>
                  <input
                    type="number"
                    value={t1}
                    onChange={(e) => setT1(e.target.value)}
                    placeholder="Enter starting temperature"
                    className="w-full p-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-bold mb-3 text-lg">
                    🔼 T₂ ({selectedRelation?.tempUnit || "—"})
                  </label>
                  <input
                    type="number"
                    value={t2}
                    onChange={(e) => setT2(e.target.value)}
                    placeholder="Enter final temperature"
                    className="w-full p-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {mode === "kopp" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-800 font-bold mb-3 text-lg">
                    🌡️ State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                  >
                    <option value="solid">Solid</option>
                    <option value="liquid">Liquid</option>
                    <option value="gas">Gas</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-6">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 text-lg font-bold rounded-xl shadow hover:shadow-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
              >
                🔄 Reset
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-lg font-bold rounded-xl shadow hover:shadow-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300"
              >
                {mode === "cp"
                  ? "⚙️ Calculate Cp"
                  : mode === "deltaH"
                  ? "⚙️ Calculate ΔH"
                  : "⚙️ Estimate Cp (Kopp's Rule)"}
              </button>
            </div>
          </form>
        </div>

        {result && (
          <div className="mt-10 p-6 bg-green-100 border border-green-300 text-green-900 rounded-xl shadow-md text-center text-2xl font-extrabold">
            ✅ {result}
          </div>
        )}
        {error && (
          <div className="mt-10 p-6 bg-red-100 border border-red-300 text-red-900 rounded-xl shadow-md text-center text-lg font-bold">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-12">
          <button
            onClick={() => router.back()}
            className="w-full px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 text-lg font-bold rounded-xl shadow hover:shadow-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
          >
            ⬅️ Back
          </button>
          <button
            onClick={() => router.push("/cp-relations")}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-bold rounded-xl shadow hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
          >
            View Cp Table ➡️
          </button>
        </div>
      </div>
    </div>
  );
}
