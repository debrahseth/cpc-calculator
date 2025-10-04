import { useState, useEffect } from "react";
import molarMassDatabase from "../data/molarMasses";
import { FaCalculator, FaUndo } from "react-icons/fa";

export default function StoichiometryDropdown() {
  const [numReactants, setNumReactants] = useState(1);
  const [numProducts, setNumProducts] = useState(1);
  const [conversionInput, setConversionInput] = useState("");
  const [reactants, setReactants] = useState(
    Array.from({ length: 1 }, () => ({
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
      molarMass: "",
    }))
  );
  const [inputType, setInputType] = useState("mole");
  const [results, setResults] = useState(null);
  const [limitingReactant, setLimitingReactant] = useState(null);
  const [excessReactants, setExcessReactants] = useState([]);
  const [extentOfReaction, setExtentOfReaction] = useState(0);
  const [conversion, setConversion] = useState(0);
  const [conversionReactant, setConversionReactant] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSuggestion, setModalSuggestion] = useState(null);
  const [summary, setSummary] = useState([]);
  const [autoRecalculate, setAutoRecalculate] = useState(false);

  useEffect(() => {
    if (autoRecalculate) {
      handleCalculate();
      setAutoRecalculate(false);
    }
  }, [reactants, products]);

  function parseFormula(formula) {
    const elementRegex = /([A-Z][a-z]*)(\d*)|(\()|(\))(\d*)/g;
    const stack = [{}];

    let match;
    while ((match = elementRegex.exec(formula))) {
      if (match[1]) {
        const elem = match[1];
        const count = parseInt(match[2] || "1");
        const top = stack[stack.length - 1];
        top[elem] = (top[elem] || 0) + count;
      } else if (match[3]) {
        stack.push({});
      } else if (match[4]) {
        const group = stack.pop();
        const mult = parseInt(match[5] || "1");
        const top = stack[stack.length - 1];
        for (const [elem, count] of Object.entries(group)) {
          top[elem] = (top[elem] || 0) + count * mult;
        }
      }
    }
    return stack[0];
  }

  function getElementCounts(compounds) {
    const totals = {};
    compounds.forEach((c) => {
      if (!c.formula) return;
      const parsed = parseFormula(c.formula);
      for (const [elem, count] of Object.entries(parsed)) {
        totals[elem] = (totals[elem] || 0) + count * (c.coefficient || 1);
      }
    });
    return totals;
  }

  function isBalanced(reactants, products) {
    const reactantCounts = getElementCounts(reactants);
    const productCounts = getElementCounts(products);

    const elements = new Set([
      ...Object.keys(reactantCounts),
      ...Object.keys(productCounts),
    ]);

    for (const e of elements) {
      if ((reactantCounts[e] || 0) !== (productCounts[e] || 0)) {
        return false;
      }
    }
    return true;
  }
  function gcd(a, b) {
    return b === 0 ? Math.abs(a) : gcd(b, a % b);
  }
  function lcm(a, b) {
    return (a * b) / gcd(a, b);
  }
  function lcmArray(arr) {
    return arr.reduce((a, b) => lcm(a, b), 1);
  }
  function solveMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    let A = matrix.map((row) => row.map((v) => v));

    let r = 0;
    for (let c = 0; c < cols && r < rows; c++) {
      let pivot = r;
      for (let i = r + 1; i < rows; i++) {
        if (Math.abs(A[i][c]) > Math.abs(A[pivot][c])) pivot = i;
      }
      if (A[pivot][c] === 0) continue;

      [A[r], A[pivot]] = [A[pivot], A[r]];

      let div = A[r][c];
      for (let j = c; j < cols; j++) A[r][j] /= div;

      for (let i = 0; i < rows; i++) {
        if (i !== r && A[i][c] !== 0) {
          let factor = A[i][c];
          for (let j = c; j < cols; j++) {
            A[i][j] -= factor * A[r][j];
          }
        }
      }
      r++;
    }

    const solution = new Array(cols).fill(0);
    solution[cols - 1] = 1;

    for (let i = rows - 1; i >= 0; i--) {
      let pivotCol = A[i].findIndex((v) => Math.abs(v) > 1e-10);
      if (pivotCol === -1) continue;
      let sum = 0;
      for (let j = pivotCol + 1; j < cols; j++) sum += A[i][j] * solution[j];
      solution[pivotCol] = -sum / A[i][pivotCol];
    }

    const denominators = solution.map((v) => {
      const frac = v.toString().split(".");
      if (frac.length === 1) return 1;
      return Math.pow(10, frac[1].length);
    });

    const multiple = lcmArray(denominators);
    const intSolution = solution.map((v) => Math.round(v * multiple));

    const common = intSolution.reduce((a, b) => gcd(a, b));
    return intSolution.map((v) => v / common);
  }

  function suggestBalancing(reactants, products) {
    try {
      const allCompounds = [...reactants, ...products];
      const elements = new Set();
      allCompounds.forEach((c) => {
        if (!c.formula) return;
        const parsed = parseFormula(c.formula);
        Object.keys(parsed).forEach((el) => elements.add(el));
      });

      const elementList = Array.from(elements);
      const matrix = elementList.map((el) => {
        return [
          ...reactants.map((r) => parseFormula(r.formula || {})[el] || 0),
          ...products.map((p) => -(parseFormula(p.formula || {})[el] || 0)),
        ];
      });

      const coefficients = solveMatrix(matrix);

      return { success: true, coefficients };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  const handleCompoundChange = (index, field, value, type) => {
    const arr = type === "reactant" ? [...reactants] : [...products];
    arr[index][field] = value;
    if (field === "compound") {
      arr[index].molarMass = molarMassDatabase[value] || "";
      arr[index].formula = value.split(" - ")[0];
    }
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
          molarMass: "",
        }))
      );
    }
    setResults(null);
  };

  const handleCalculate = () => {
    if (!isBalanced(reactants, products)) {
      const suggestion = suggestBalancing(reactants, products);

      if (suggestion.success) {
        const suggestedEquation =
          reactants
            .map(
              (r, idx) =>
                `${
                  suggestion.coefficients[idx] > 1
                    ? suggestion.coefficients[idx]
                    : ""
                }${r.formula}`
            )
            .join(" + ") +
          " → " +
          products
            .map(
              (p, idx) =>
                `${
                  suggestion.coefficients[reactants.length + idx] > 1
                    ? suggestion.coefficients[reactants.length + idx]
                    : ""
                }${p.formula}`
            )
            .join(" + ");

        setModalMessage(
          `⚠️ The equation is not balanced.\n\nSuggested balanced equation:\n${suggestedEquation}`
        );
        setModalSuggestion(suggestion);
      } else {
        setModalMessage(
          "⚠️ The equation is not balanced. No suggestion available."
        );
        setModalSuggestion(null);
      }

      setShowModal(true);
      return;
    }
    if (
      !reactants.every(
        (r) => r.compound && r.coefficient > 0 && r.molarMass && r.value
      )
    ) {
      alert(
        "Please fill in all reactant fields (compound, coefficient, and amount)."
      );
      return;
    }
    if (
      !products.every((p) => p.compound && p.coefficient > 0 && p.molarMass)
    ) {
      alert("Please fill in all product fields (compound and coefficient).");
      return;
    }

    const reactantMoles = reactants.map((r) => {
      const inputValue = parseFloat(r.value) || 0;
      return inputType === "mole"
        ? inputValue
        : inputValue / (r.molarMass || 1);
    });

    if (!reactantMoles.some((m) => m > 0)) {
      alert("Enter a valid amount for at least one reactant.");
      return;
    }

    const ratios = reactantMoles.map(
      (m, idx) => m / (reactants[idx].coefficient || 1)
    );
    const minRatio = Math.min(...ratios.filter((r) => r > 0));
    const limitingIndex = ratios.indexOf(minRatio);
    const limiting = reactants[limitingIndex];
    setLimitingReactant(limiting.compound);

    const conversionIndex =
      conversionReactant === ""
        ? limitingIndex
        : reactants.findIndex((r) => r.compound === conversionReactant);

    const userConversion = parseFloat(conversionInput);
    const conversionFactor =
      isNaN(userConversion) || userConversion >= 100 ? 1 : userConversion / 100;
    setConversion(conversionFactor);

    const extent =
      conversionFactor *
      (reactantMoles[conversionIndex] / reactants[conversionIndex].coefficient);
    setExtentOfReaction(extent);

    const computedReactants = reactants.map((r, idx) => {
      const initialMoles = reactantMoles[idx];
      const reactedMoles = extent * r.coefficient;
      const remainingMoles = initialMoles - reactedMoles;
      return {
        ...r,
        initialMoles,
        reactedMoles,
        remainingMoles,
        reactedMass: reactedMoles * r.molarMass,
        remainingMass: remainingMoles * r.molarMass,
      };
    });

    const computedProducts = products.map((p) => {
      const theoreticalMoles = extent * p.coefficient;
      const actualMoles = theoreticalMoles;
      return {
        ...p,
        theoreticalMoles,
        actualMoles,
        theoreticalMass: theoreticalMoles * p.molarMass,
        actualMass: actualMoles * p.molarMass,
        yield: theoreticalMoles > 0 ? 100 : 0,
      };
    });

    const excess = computedReactants
      .filter((r, idx) => idx !== limitingIndex)
      .map((r) => {
        const excessMoles = r.remainingMoles;
        const excessMass = excessMoles * r.molarMass;
        const percentExcess =
          r.reactedMoles > 0 ? (excessMoles / r.reactedMoles) * 100 : 0;
        return {
          compound: r.compound,
          remainingMoles: excessMoles,
          remainingMass: excessMass,
          percentExcess,
        };
      });
    setExcessReactants(excess);

    const summaryData = [
      ...computedReactants.map((r) => ({
        compound: r.compound,
        initialMoles: r.initialMoles,
        reactedMoles: r.reactedMoles,
        remainingMoles: r.remainingMoles,
        mass: r.reactedMass,
        percentReacted:
          r.initialMoles > 0 ? (r.reactedMoles / r.initialMoles) * 100 : 0,
        percentExcess:
          excess.find((e) => e.compound === r.compound)?.percentExcess || 0,
      })),
      ...computedProducts.map((p) => ({
        compound: p.compound,
        initialMoles: 0,
        reactedMoles: p.actualMoles,
        remainingMoles: p.actualMoles,
        mass: p.actualMass,
        percentReacted: 100,
        percentExcess: 0,
        theoreticalMoles: p.theoreticalMoles,
        theoreticalMass: p.theoreticalMass,
      })),
    ];

    setSummary(summaryData);
    setResults([...computedReactants, ...computedProducts]);
  };

  const handleReset = () => {
    setNumReactants(1);
    setNumProducts(1);
    setReactants(
      Array.from({ length: 1 }, () => ({
        compound: "",
        coefficient: 1,
        value: "",
        molarMass: "",
      }))
    );
    setProducts(
      Array.from({ length: 1 }, () => ({
        compound: "",
        coefficient: 1,
        molarMass: "",
      }))
    );
    setInputType("mole");
    setConversionInput("");
    setResults(null);
    setLimitingReactant(null);
    setExcessReactants([]);
    setExtentOfReaction(0);
    setConversion(0);
    setSummary([]);
  };

  const renderEquation = () => {
    if (!reactants.length || !products.length) return "";
    const lhs = reactants
      .map(
        (r) =>
          `${r.coefficient > 1 ? r.coefficient : ""}${r.formula || r.compound}`
      )
      .join(" + ");
    const rhs = products
      .map(
        (p) =>
          `${p.coefficient > 1 ? p.coefficient : ""}${p.formula || p.compound}`
      )
      .join(" + ");
    const equation = `${lhs} → ${rhs}`;
    if (reactants.every((r) => r.formula) && products.every((p) => p.formula)) {
      if (isBalanced(reactants, products)) {
        return equation + "   ✅ (Balanced)";
      } else {
        return equation + "   ⚠️ (Not balanced)";
      }
    }
    return equation;
  };

  return (
    <div className="w-full mx-auto p-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl border-2 border-indigo-200">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center text-indigo-900 mb-10 tracking-wide">
        ⚗️ Stoichiometry Calculator
      </h2>

      <div className="w-full mb-6 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-2xl shadow-lg border-2 border-yellow-300 w-64 mx-auto animate-fadeIn">
        <label className="block text-yellow-800 font-bold mb-2 text-[35px] text-center">
          Basis
        </label>
        <div className="mb-5 flex flex-col">
          <label className="text-yellow-700 font-medium mb-1">Basis</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            className="w-full text-[20px] p-2 rounded-lg border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-sm transition-all duration-300"
          >
            <option value="mole">Moles</option>
            <option value="mass">Mass</option>
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-2xl shadow-lg border-2 border-indigo-300 animate-fadeIn">
          <h4 className="text-indigo-800 font-bold text-2xl md:text-3xl mb-4 text-center">
            Reactants
          </h4>

          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label className="font-medium text-lg sm:text-xl text-indigo-700">
              Number of Reactants:
            </label>
            <input
              type="number"
              value={numReactants}
              onChange={(e) => handleNumChange("reactant", e.target.value)}
              className="border rounded-lg p-2 w-full sm:w-32 mt-2 sm:mt-0"
            />
          </div>

          {reactants.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 bg-white p-3 rounded-xl shadow-md border-l-4 border-indigo-500"
            >
              <div className="flex flex-col">
                <label className="text-indigo-700 font-medium text-sm mb-1">
                  Compound
                </label>
                <select
                  value={r.compound}
                  onChange={(e) =>
                    handleCompoundChange(
                      i,
                      "compound",
                      e.target.value,
                      "reactant"
                    )
                  }
                  className="border rounded p-2 w-full"
                >
                  <option value="">Select</option>
                  {Object.keys(molarMassDatabase).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-indigo-700 font-medium text-sm mb-1">
                  Stoic Coefficient
                </label>
                <input
                  type="number"
                  value={r.coefficient}
                  onChange={(e) =>
                    handleCompoundChange(
                      i,
                      "coefficient",
                      e.target.value,
                      "reactant"
                    )
                  }
                  placeholder="Coeff"
                  className="border rounded p-2 w-full"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-indigo-700 font-medium text-sm mb-1">
                  {inputType === "mole" ? "Moles" : "Mass"}
                </label>
                <input
                  type="number"
                  value={r.value}
                  onChange={(e) =>
                    handleCompoundChange(i, "value", e.target.value, "reactant")
                  }
                  placeholder={inputType === "mole" ? "Moles" : "Mass"}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-indigo-700 font-medium text-sm mb-1">
                  Molar Mass
                </label>
                <input
                  type="number"
                  value={r.molarMass}
                  readOnly
                  className="border rounded p-2 w-full bg-gray-100"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-2xl shadow-lg border-2 border-pink-300 animate-fadeIn">
          <h4 className="text-pink-800 font-bold text-2xl md:text-3xl mb-4 text-center">
            Products
          </h4>

          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label className="font-medium text-lg sm:text-xl text-pink-700">
              Number of Products:
            </label>
            <input
              type="number"
              value={numProducts}
              onChange={(e) => handleNumChange("product", e.target.value)}
              className="border rounded-lg p-2 w-full sm:w-32 mt-2 sm:mt-0"
            />
          </div>

          {products.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 bg-white p-3 rounded-xl shadow-md border-l-4 border-pink-500"
            >
              <div className="flex flex-col">
                <label className="text-pink-700 font-medium text-sm mb-1">
                  Compound
                </label>
                <select
                  value={p.compound}
                  onChange={(e) =>
                    handleCompoundChange(
                      i,
                      "compound",
                      e.target.value,
                      "product"
                    )
                  }
                  className="border rounded p-2 w-full"
                >
                  <option value="">Select</option>
                  {Object.keys(molarMassDatabase).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-pink-700 font-medium text-sm mb-1">
                  Stoic. Coefficient
                </label>
                <input
                  type="number"
                  value={p.coefficient}
                  min="1"
                  onChange={(e) =>
                    handleCompoundChange(
                      i,
                      "coefficient",
                      e.target.value,
                      "product"
                    )
                  }
                  placeholder="Coeff"
                  className="border rounded p-2 w-full"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-pink-700 font-medium text-sm mb-1">
                  Molar Mass
                </label>
                <input
                  type="number"
                  value={p.molarMass}
                  readOnly
                  className="border rounded p-2 w-full bg-gray-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mb-6 bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl shadow-lg border-2 border-green-300 w-64 mx-auto animate-fadeIn">
        <label className="block text-green-800 font-bold mb-2 text-[35px] text-center">
          Conversion
        </label>
        <div className="mt-5 flex flex-col">
          <label className="text-green-700 font-medium mb-1">
            Conversion (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={conversionInput || ""}
            onChange={(e) => setConversionInput(e.target.value)}
            placeholder="Default 100%"
            className="w-full p-2 rounded-lg border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 shadow-sm transition-all duration-300"
          />
          <p className="text-green-600 text-sm mt-1">
            Enter desired conversion, leave blank for 100%.
          </p>
        </div>
        <div className="mt-5 flex flex-col">
          <label className="text-green-700 font-medium mb-1">
            Conversion affects reactant:
          </label>
          <select
            value={conversionReactant}
            onChange={(e) => setConversionReactant(e.target.value)}
            className="w-full text-[20px] p-2 rounded-lg border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 shadow-sm transition-all duration-300"
          >
            <option value="">All reactants (default)</option>
            {reactants.map((r, idx) => (
              <option key={idx} value={r.compound}>
                {r.compound}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-lg mx-auto">
        <button
          onClick={handleCalculate}
          className="flex-1 sm:flex-[0_0_50%] p-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          <FaCalculator className="w-5 h-5" />
          Calculate
        </button>
        <button
          onClick={handleReset}
          className="flex-1 sm:flex-[0_0_50%] p-3 bg-gray-300 rounded-xl font-semibold shadow-lg hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          <FaUndo className="w-5 h-5" />
          Reset
        </button>
      </div>

      {results && (
        <div className="mb-6 p-2 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl shadow-xl border-2 border-indigo-300 transform transition-all duration-500 animate-fadeIn">
          <div
            className="overflow-x-auto mt-2 mb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <h3 className="font-extrabold text-indigo-800 text-2xl mb-4 tracking-wide whitespace-nowrap">
              ⚛️ Reaction:{" "}
              <span className="text-purple-700">{renderEquation()}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-indigo-500">
              <p className="font-semibold text-indigo-700 mb-2">
                Limiting Reactant:
              </p>
              <p className="text-indigo-900 font-medium">{limitingReactant}</p>
            </div>

            {excessReactants.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-400">
                <p className="font-semibold text-green-700 mb-2">
                  Excess Reactants:
                </p>
                <p className="text-green-900 font-medium">
                  {excessReactants.map((e) => e.compound).join(", ")}
                </p>
              </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-purple-400">
              <p className="font-semibold text-purple-700 mb-2">
                Extent of Reaction:
              </p>
              <p className="text-purple-900 font-medium">
                {extentOfReaction.toFixed(3)} mol
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-pink-400">
              <p className="font-semibold text-pink-700 mb-2">Conversion:</p>
              <p className="text-pink-900 font-medium">
                {(conversion * 100).toFixed(2)}%
              </p>
            </div>

            <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-400">
              <p className="font-semibold text-yellow-700 mb-4 text-lg">
                ⚡ Product Yields
              </p>
              <ul className="space-y-4">
                {results
                  .filter((r) =>
                    products.some((p) => p.compound === r.compound)
                  )
                  .map((p) => (
                    <li
                      key={p.compound}
                      className="bg-yellow-50 p-3 rounded-lg shadow-sm border border-yellow-200"
                    >
                      <p className="font-bold text-yellow-800 text-md mb-2">
                        {p.compound}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-yellow-900 text-sm">
                        <div className="bg-yellow-100 p-2 rounded">
                          <p className="font-medium">Theoretical</p>
                          <p>
                            {p.theoreticalMoles.toFixed(3)} mol /{" "}
                            {p.theoreticalMass.toFixed(3)} g
                          </p>
                        </div>
                        <div className="bg-yellow-200 p-2 rounded">
                          <p className="font-medium">Actual</p>
                          <p>
                            {p.actualMoles.toFixed(3)} mol /{" "}
                            {p.actualMass.toFixed(3)} g
                          </p>
                        </div>
                        <div className="bg-yellow-300 p-2 rounded flex items-center justify-center font-semibold text-yellow-800">
                          Yield: {p.yield.toFixed(2)}%
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            {excessReactants.length > 0 && (
              <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-xl shadow-md border-l-4 border-green-400">
                <p className="font-semibold text-green-700 mb-2">
                  Excess Reactants (Amount remaining):
                </p>
                <ul className="list-disc list-inside text-green-900 font-medium space-y-1">
                  {excessReactants.map((e) => (
                    <li key={e.compound}>
                      <span className="font-semibold">{e.compound}:</span>{" "}
                      {`${e.remainingMoles.toFixed(
                        3
                      )} mol (${e.remainingMass.toFixed(
                        3
                      )} g), ${e.percentExcess.toFixed(2)}% excess`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.length > 0 && (
              <div className="mt-6 col-span-1 md:col-span-2 w-full overflow-x-auto">
                <h3 className="font-extrabold text-indigo-800 text-2xl mb-4 tracking-wide">
                  📊 Summary Table
                </h3>
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <thead className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 border text-left text-sm sm:text-base font-bold text-indigo-900">
                          Compound
                        </th>
                        <th className="px-4 py-3 border text-left text-sm sm:text-base font-bold text-indigo-900">
                          Initial Moles Fed (mol)
                        </th>
                        <th className="px-4 py-3 border text-left text-sm sm:text-base font-bold text-indigo-900">
                          Reacted Moles (mol)
                        </th>
                        <th className="px-4 py-3 border text-left text-sm sm:text-base font-bold text-indigo-900">
                          Remaining Moles Out (mol)
                        </th>
                        <th className="px-4 py-3 border text-left text-sm sm:text-base font-bold text-indigo-900">
                          Mass (g)
                        </th>
                        <th className="px-4 py-3 border text-left text-sm sm:text-base font-bold text-indigo-900">
                          % Reacted
                        </th>
                        <th className="px-4 py-3 border text-left text-sm sm:text-base font-bold text-indigo-900">
                          % Excess
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.map((s, idx) => (
                        <tr
                          key={s.compound}
                          className={`${
                            idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-indigo-50 transition`}
                        >
                          <td className="px-4 py-2 border font-semibold text-sm sm:text-base text-gray-900">
                            {s.compound}
                          </td>
                          <td className="px-4 py-2 border text-sm sm:text-base text-gray-800">
                            {s.initialMoles.toFixed(3)}
                          </td>
                          <td className="px-4 py-2 border text-sm sm:text-base text-gray-800">
                            {s.reactedMoles.toFixed(3)}
                          </td>
                          <td className="px-4 py-2 border text-sm sm:text-base text-gray-800">
                            {s.remainingMoles.toFixed(3)}
                          </td>
                          <td className="px-4 py-2 border text-sm sm:text-base text-gray-800">
                            {s.mass.toFixed(3)}
                          </td>
                          <td className="px-4 py-2 border text-sm sm:text-base font-medium text-green-700">
                            {s.percentReacted.toFixed(2)}%
                          </td>
                          <td className="px-4 py-2 border text-sm sm:text-base font-medium text-pink-700">
                            {s.percentExcess.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex p-3 items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div className="bg-white/90 p-6 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200">
            <h3 className="text-2xl font-extrabold text-red-600 mb-4 text-center">
              ⚠️ Equation Not Balanced
            </h3>

            <p className="whitespace-pre-line text-gray-800 text-lg leading-relaxed">
              {modalMessage}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg shadow hover:bg-gray-400 transition"
              >
                Close
              </button>

              {modalSuggestion && (
                <button
                  onClick={() => {
                    const updatedReactants = reactants.map((r, idx) => ({
                      ...r,
                      coefficient: modalSuggestion.coefficients[idx],
                    }));
                    const updatedProducts = products.map((p, idx) => ({
                      ...p,
                      coefficient:
                        modalSuggestion.coefficients[reactants.length + idx],
                    }));
                    setReactants(updatedReactants);
                    setProducts(updatedProducts);
                    setShowModal(false);
                    setAutoRecalculate(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                >
                  ✅ Apply Suggestion
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
