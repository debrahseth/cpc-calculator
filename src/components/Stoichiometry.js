import { useState } from "react";
import molarMassDatabase from "../data/molarMasses";

export default function StoichiometryDropdown() {
  const [numReactants, setNumReactants] = useState(2);
  const [numProducts, setNumProducts] = useState(1);
  const [reactants, setReactants] = useState(
    Array.from({ length: 2 }, () => ({
      compound: "",
      coefficient: 1,
      value: "",
      molarMass: "",
    }))
  );
  const [products, setProducts] = useState(
    Array.from({ length: 1 }, () => ({
      compound: "",
      coefficient: 1,
      value: "",
      molarMass: "",
    }))
  );
  const [inputType, setInputType] = useState("mole");
  const [results, setResults] = useState(null);
  const [limitingReactant, setLimitingReactant] = useState(null);
  const [excessReactants, setExcessReactants] = useState([]);
  const [extentOfReaction, setExtentOfReaction] = useState(0);
  const [conversion, setConversion] = useState(0);
  const [yields, setYields] = useState([]);

  const handleCompoundChange = (index, field, value, type) => {
    const arr = type === "reactant" ? [...reactants] : [...products];
    arr[index][field] = value;
    if (field === "compound")
      arr[index].molarMass = molarMassDatabase[value] || "";
    type === "reactant" ? setReactants(arr) : setProducts(arr);
  };

  const handleNumChange = (type, count) => {
    count = parseInt(count);
    if (isNaN(count) || count < 1) return;
    if (type === "reactant") {
      setNumReactants(count);
      setReactants(
        Array.from({ length: count }, () => ({
          compound: "",
          coefficient: 1,
          value: "",
          molarMass: "",
        }))
      );
    } else {
      setNumProducts(count);
      setProducts(
        Array.from({ length: count }, () => ({
          compound: "",
          coefficient: 1,
          value: "",
          molarMass: "",
        }))
      );
    }
    setResults(null);
  };

  const handleCalculate = () => {
    const allCompounds = [...reactants, ...products];
    const known = allCompounds.find((c) => parseFloat(c.value) > 0);
    if (!known) return alert("Enter mass or moles of at least one compound.");

    const knownMoles =
      inputType === "mole"
        ? parseFloat(known.value)
        : parseFloat(known.value) / known.molarMass;

    // --- Determine Limiting Reactant ---
    const ratios = reactants.map((r) => {
      if (!r.compound) return Infinity;
      const moles =
        r.compound === known.compound
          ? knownMoles
          : inputType === "mole"
          ? parseFloat(r.value || 0)
          : parseFloat(r.value || 0) / r.molarMass || 0;
      return moles / r.coefficient;
    });

    const positiveRatios = ratios.filter((r) => r > 0);
    if (positiveRatios.length === 0) {
      return alert(
        "Cannot determine limiting reactant. Enter at least one reactant with amount."
      );
    }
    const minRatio = Math.min(...positiveRatios);
    const limiting = reactants[ratios.indexOf(minRatio)];

    setLimitingReactant(limiting.compound);
    setExtentOfReaction(minRatio);

    const computed = allCompounds.map((c) => {
      const moles = minRatio * c.coefficient;
      const mass = moles * c.molarMass;
      return { ...c, moles, mass };
    });

    // --- Fractions ---
    const totalMoles = computed.reduce((sum, c) => sum + c.moles, 0);
    const totalMass = computed.reduce((sum, c) => sum + c.mass, 0);
    const withFractions = computed.map((c) => ({
      ...c,
      moleFraction: totalMoles ? c.moles / totalMoles : 0,
      massFraction: totalMass ? c.mass / totalMass : 0,
    }));

    // --- Excess Reactants ---
    const excess = reactants
      .filter((r) => r.compound !== limiting.compound)
      .map((r, idx) => {
        const initialMoles =
          inputType === "mole"
            ? parseFloat(r.value || 0)
            : parseFloat(r.value || 0) / r.molarMass || 0;
        const remaining = initialMoles - minRatio * r.coefficient;
        return {
          compound: r.compound,
          remaining: remaining > 0 ? remaining : 0,
        };
      });
    setExcessReactants(excess);

    // --- Conversion and yield ---
    const conversionVal =
      (minRatio * limiting.coefficient) /
      (inputType === "mole"
        ? parseFloat(limiting.value || 0)
        : parseFloat(limiting.value || 0) / limiting.molarMass);
    setConversion(conversionVal);

    const yieldValues = products.map((p) => {
      const productAmount = p.moles; // moles formed
      const theoreticalMoles = minRatio * p.coefficient;
      return {
        compound: p.compound,
        yield: (productAmount / theoreticalMoles) * 100,
      };
    });
    setYields(yieldValues);

    setResults(withFractions);
  };

  const handleReset = () => {
    setResults(null);
    setLimitingReactant(null);
    setExcessReactants([]);
    setExtentOfReaction(0);
    setConversion(0);
    setYields([]);
  };

  const renderEquation = () => {
    if (!reactants.length || !products.length) return "";
    const lhs = reactants
      .map((r) => `${r.coefficient > 1 ? r.coefficient : ""}${r.compound}`)
      .join(" + ");
    const rhs = products
      .map((p) => `${p.coefficient > 1 ? p.coefficient : ""}${p.compound}`)
      .join(" + ");
    return `${lhs} → ${rhs}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-extrabold text-center text-indigo-900 mb-8">
        ⚗️ Stoichiometry Calculator
      </h2>

      {/* Reactants & Products Input */}
      <div className="mb-6">
        <label>Number of Reactants:</label>
        <input
          type="number"
          value={numReactants}
          onChange={(e) => handleNumChange("reactant", e.target.value)}
          className="border rounded p-2 w-24"
        />
      </div>
      {reactants.map((r, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
          <select
            value={r.compound}
            onChange={(e) =>
              handleCompoundChange(i, "compound", e.target.value, "reactant")
            }
            className="border rounded p-2"
          >
            <option value="">Select</option>
            {Object.keys(molarMassDatabase).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={r.coefficient}
            onChange={(e) =>
              handleCompoundChange(i, "coefficient", e.target.value, "reactant")
            }
            placeholder="Coeff"
            className="border rounded p-2"
          />
          <input
            type="number"
            value={r.value}
            onChange={(e) =>
              handleCompoundChange(i, "value", e.target.value, "reactant")
            }
            placeholder={inputType === "mole" ? "Moles" : "Mass"}
            className="border rounded p-2"
          />
          <input
            type="number"
            value={r.molarMass}
            readOnly
            className="border rounded p-2 bg-gray-100"
          />
        </div>
      ))}
      <div className="mb-6">
        <label>Number of Products:</label>
        <input
          type="number"
          value={numProducts}
          onChange={(e) => handleNumChange("product", e.target.value)}
          className="border rounded p-2 w-24"
        />
      </div>
      {products.map((p, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
          <select
            value={p.compound}
            onChange={(e) =>
              handleCompoundChange(i, "compound", e.target.value, "product")
            }
            className="border rounded p-2"
          >
            <option value="">Select</option>
            {Object.keys(molarMassDatabase).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={p.coefficient}
            min="1"
            onChange={(e) =>
              handleCompoundChange(i, "coefficient", e.target.value, "product")
            }
            placeholder="Coeff"
            className="border rounded p-2"
          />
          <input
            type="number"
            value={p.value}
            min="1"
            onChange={(e) =>
              handleCompoundChange(i, "value", e.target.value, "product")
            }
            placeholder={inputType === "mole" ? "Moles" : "Mass"}
            className="border rounded p-2"
          />
          <input
            type="number"
            value={p.molarMass}
            readOnly
            className="border rounded p-2 bg-gray-100"
          />
        </div>
      ))}

      {/* Basis */}
      <div className="mb-4">
        <label>Basis:</label>
        <select
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
          className="border rounded p-2"
        >
          <option value="mole">Moles</option>
          <option value="mass">Mass</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleCalculate}
          className="flex-1 p-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
        >
          Calculate
        </button>
        <button
          onClick={handleReset}
          className="flex-1 p-3 bg-gray-300 rounded-xl font-semibold hover:bg-gray-400"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl shadow text-center">
          <h3 className="font-bold text-indigo-700 text-xl mb-2">
            Reaction: {renderEquation()}
          </h3>
          <p>Limiting Reactant: {limitingReactant}</p>
          {excessReactants.length > 0 && (
            <p>
              Excess Reactants:{" "}
              {excessReactants.map((e) => e.compound).join(", ")}
            </p>
          )}
          <p>Extent of Reaction: {extentOfReaction.toFixed(3)} mol</p>
          <p>Conversion: {(conversion * 100).toFixed(2)}%</p>
          <p>Yields:</p>
          <ul className="list-disc ml-6">
            {yields.map((y) => (
              <li key={y.compound}>
                {y.compound}: {y.yield.toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
