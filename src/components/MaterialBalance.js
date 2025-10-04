import { useState } from "react";
import compoundsDatabase from "@/data/molarMasses";
import { FaPlus, FaTrash } from "react-icons/fa";

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}
class Fraction {
  constructor(num, den = 1) {
    let g = gcd(Math.abs(num), Math.abs(den));
    this.num = num / g;
    this.den = den / g;
    if (this.den < 0) {
      this.num = -this.num;
      this.den = -this.den;
    }
  }
  add(other) {
    return new Fraction(
      this.num * other.den + other.num * this.den,
      this.den * other.den
    );
  }
  sub(other) {
    return this.add(other.neg());
  }
  mul(other) {
    return new Fraction(this.num * other.num, this.den * other.den);
  }
  div(other) {
    return this.mul(new Fraction(other.den, other.num));
  }
  neg() {
    return new Fraction(-this.num, this.den);
  }
  toNumber() {
    return this.num / this.den;
  }
}

function parseFormula(formula) {
  let map = {};
  let stack = [];
  let i = 0;
  while (i < formula.length) {
    if (formula[i] === "(" || formula[i] === "[" || formula[i] === "{") {
      stack.push(map);
      map = {};
      i++;
    } else if (formula[i] === ")" || formula[i] === "]" || formula[i] === "}") {
      i++;
      let num = 0;
      while (i < formula.length && /\d/.test(formula[i])) {
        num = num * 10 + parseInt(formula[i]);
        i++;
      }
      num = num || 1;
      let top = map;
      map = stack.pop();
      for (let key in top) {
        map[key] = (map[key] || 0) + top[key] * num;
      }
    } else if (/[A-Z]/.test(formula[i])) {
      let elem = formula[i];
      i++;
      if (i < formula.length && /[a-z]/.test(formula[i])) {
        elem += formula[i];
        i++;
      }
      let num = 0;
      while (i < formula.length && /\d/.test(formula[i])) {
        num = num * 10 + parseInt(formula[i]);
        i++;
      }
      num = num || 1;
      map[elem] = (map[elem] || 0) + num;
    } else {
      i++;
    }
  }
  return map;
}

function getFormula(name) {
  return name.split(" - ")[0].trim();
}

function buildMatrix(reactants, products) {
  let compounds = [...reactants, ...products].map(getFormula);
  let allAtoms = new Set();
  for (let c of compounds) {
    let atoms = parseFormula(c);
    for (let key in atoms) {
      allAtoms.add(key);
    }
  }
  let atoms = Array.from(allAtoms);
  let m = atoms.length;
  let n = compounds.length;
  let matrix = Array.from({ length: m }, () =>
    Array.from({ length: n }, () => new Fraction(0))
  );
  for (let j = 0; j < n; j++) {
    let sign = j < reactants.length ? -1 : 1;
    let atomsMap = parseFormula(compounds[j]);
    for (let i = 0; i < m; i++) {
      matrix[i][j] = new Fraction((atomsMap[atoms[i]] || 0) * sign);
    }
  }
  return matrix;
}

function gaussJordan(matrix) {
  let rows = matrix.length;
  let cols = matrix[0].length;
  let h = 0;
  let k = 0;
  let pivotCols = [];
  while (h < rows && k < cols) {
    let pivot = h;
    for (let i = h + 1; i < rows; i++) {
      let currAbs = Math.abs(matrix[i][k].toNumber());
      let pivotAbs = Math.abs(matrix[pivot][k].toNumber());
      if (currAbs > pivotAbs) {
        pivot = i;
      }
    }
    if (Math.abs(matrix[pivot][k].toNumber()) < 1e-10) {
      k++;
      continue;
    }
    [matrix[h], matrix[pivot]] = [matrix[pivot], matrix[h]];
    let piv = matrix[h][k];
    for (let j = k; j < cols; j++) {
      matrix[h][j] = matrix[h][j].div(piv);
    }
    for (let i = 0; i < rows; i++) {
      if (i === h) continue;
      let factor = matrix[i][k];
      for (let j = k; j < cols; j++) {
        matrix[i][j] = matrix[i][j].sub(factor.mul(matrix[h][j]));
      }
    }
    pivotCols.push(k);
    h++;
    k++;
  }
  return { matrix, pivotCols };
}

function balanceEquation(reactants, products) {
  let matrix = buildMatrix(reactants, products);
  let { matrix: rref, pivotCols } = gaussJordan(matrix);
  let n = reactants.length + products.length;
  let freeCols = [];
  let colSet = new Set(pivotCols);
  for (let j = 0; j < n; j++) {
    if (!colSet.has(j)) freeCols.push(j);
  }
  if (freeCols.length !== 1) {
    throw new Error("Cannot balance equation uniquely.");
  }
  let free = freeCols[0];
  let coefficients = Array.from({ length: n }, () => new Fraction(0));
  coefficients[free] = new Fraction(1);
  for (let r = pivotCols.length - 1; r >= 0; r--) {
    let col = pivotCols[r];
    let sum = new Fraction(0);
    for (let j = col + 1; j < n; j++) {
      sum = sum.add(rref[r][j].mul(coefficients[j]));
    }
    coefficients[col] = sum.neg();
  }
  let dens = coefficients.map((f) => f.den);
  let l = dens.reduce((a, b) => lcm(a, b), 1);
  let coefs = coefficients.map((f) => Math.round((f.num * l) / f.den));
  let g = coefs.reduce(
    (acc, val) => gcd(acc, Math.abs(val)),
    Math.abs(coefs[0])
  );
  coefs = coefs.map((x) => x / g);
  if (coefs.some((x) => x < 0)) {
    if (coefs.every((x) => x <= 0)) {
      coefs = coefs.map((x) => -x);
    } else {
      throw new Error("Balanced coefficients have mixed signs.");
    }
  }
  return coefs;
}

function classifyReaction(reactants, products) {
  const rFormulas = reactants.map(getFormula);
  const pFormulas = products.map(getFormula);
  if (
    rFormulas.some((f) => /^C\d*H\d*$/.test(f)) &&
    rFormulas.includes("O2") &&
    pFormulas.includes("CO2") &&
    pFormulas.includes("H2O")
  ) {
    return "Combustion Reaction";
  }
  if (
    rFormulas.some((f) => /^H[A-Z]/.test(f)) &&
    rFormulas.some((f) => f.endsWith("OH")) &&
    pFormulas.includes("H2O")
  ) {
    return "Neutralization (Acid-Base)";
  }
  if (rFormulas.includes("O2")) {
    return "Redox Reaction";
  }
  if (reactants.length === 1 && products.length > 1) {
    return "Decomposition Reaction";
  }
  if (reactants.length > 1 && products.length === 1) {
    return "Synthesis (Combination) Reaction";
  }
  return "Other Reaction Type";
}

export default function MaterialBalance() {
  const [reactants, setReactants] = useState([{ name: "" }]);
  const [products, setProducts] = useState([{ name: "" }]);
  const [balancedEquation, setBalancedEquation] = useState("");
  const [reactionType, setReactionType] = useState("");
  const [error, setError] = useState("");

  const handleReactantChange = (index, value) => {
    const updated = [...reactants];
    updated[index].name = value;
    setReactants(updated);
    setBalancedEquation("");
    setError("");
  };

  const handleProductChange = (index, value) => {
    const updated = [...products];
    updated[index].name = value;
    setProducts(updated);
    setBalancedEquation("");
    setError("");
  };

  const addReactant = () => {
    setReactants([...reactants, { name: "" }]);
    setBalancedEquation("");
    setError("");
  };

  const addProduct = () => {
    setProducts([...products, { name: "" }]);
    setBalancedEquation("");
    setError("");
  };

  const removeReactant = (index) => {
    if (reactants.length === 1) {
      setReactants([{ name: "" }]);
    } else {
      setReactants(reactants.filter((_, i) => i !== index));
    }
    setBalancedEquation("");
    setError("");
  };

  const removeProduct = (index) => {
    if (products.length === 1) {
      setProducts([{ name: "" }]);
    } else {
      setProducts(products.filter((_, i) => i !== index));
    }
    setBalancedEquation("");
    setError("");
  };

  const handleBalance = () => {
    const reactantNames = reactants.map((r) => r.name).filter(Boolean);
    const productNames = products.map((p) => p.name).filter(Boolean);

    if (reactantNames.length === 0 || productNames.length === 0) {
      setError("⚠️ Please select at least one reactant and one product.");
      setBalancedEquation("");
      return;
    }

    try {
      const coeffs = balanceEquation(reactantNames, productNames);
      const rCoeffs = coeffs.slice(0, reactantNames.length);
      const pCoeffs = coeffs.slice(reactantNames.length);

      const lhs = reactantNames
        .map((name, i) => {
          const f = getFormula(name);
          return rCoeffs[i] === 1 ? f : `${rCoeffs[i]}${f}`;
        })
        .join(" + ");
      const rhs = productNames
        .map((name, i) => {
          const f = getFormula(name);
          return pCoeffs[i] === 1
            ? f
            : `${pCoeffs[i]}${pCoeffs[i] > 1 ? " " : ""}${f}`;
        })
        .join(" + ");
      const type = classifyReaction(reactantNames, productNames);
      setBalancedEquation(`${lhs} → ${rhs}`);
      setReactionType(type);
      setError("");
    } catch (err) {
      setError("❌ Could not balance this reaction.");
      setBalancedEquation("");
    }
  };

  return (
    <div className="max-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-y-auto rounded-3xl">
      <div className="max-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-2 overflow-y-auto rounded-3xl shadow-2xl border-2 border-indigo-200">
        <h2 className="text-2xl md:text-5xl font-extrabold text-indigo-900 text-center mb-6 tracking-wide">
          ⚖️ Chemical Equation Balancer
        </h2>

        <div className="grid gap-6 md:grid-cols-2 w-full">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl shadow-lg border-2 border-red-300">
            <h3 className="text-lg md:text-xl font-semibold text-red-700 mb-3">
              Reactants
            </h3>
            {reactants.map((r, i) => (
              <div key={i} className="flex items-center mb-3 space-x-2">
                <select
                  value={r.name}
                  onChange={(e) => handleReactantChange(i, e.target.value)}
                  className="w-full p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base"
                >
                  <option value="">Select compound</option>
                  {Object.keys(compoundsDatabase).map((compound) => (
                    <option key={compound} value={compound}>
                      {compound}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeReactant(i)}
                  className="flex-shrink-0 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 flex items-center justify-center"
                  disabled={reactants.length === 1 && !r.name}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              onClick={addReactant}
              className="w-full mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm md:text-base flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Reactant
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl shadow-lg border-2 border-green-300">
            <h3 className="text-lg md:text-xl font-semibold text-green-700 mb-3">
              Products
            </h3>
            {products.map((p, i) => (
              <div key={i} className="flex items-center mb-3 space-x-2">
                <select
                  value={p.name}
                  onChange={(e) => handleProductChange(i, e.target.value)}
                  className="w-full p-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                >
                  <option value="">Select compound</option>
                  {Object.keys(compoundsDatabase).map((compound) => (
                    <option key={compound} value={compound}>
                      {compound}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeProduct(i)}
                  className="flex-shrink-0 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 flex items-center justify-center"
                  disabled={products.length === 1 && !p.name}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              onClick={addProduct}
              className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm md:text-base flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Product
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handleBalance}
            className="w-full px-6 py-3 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition"
          >
            ⚖️ Balance Equation
          </button>
        </div>

        {(balancedEquation || error) && (
          <div className="mt-4 p-4 bg-white border-2 border-indigo-200 rounded-xl text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold text-indigo-800 mb-6">
              {error ? "Error" : "Balanced Equation"}
            </h3>

            <div className="overflow-x-auto">
              <p
                className="whitespace-nowrap text-gray-800 font-mono text-2xl md:text-4xl px-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {error || balancedEquation}
              </p>
              {!error && (
                <p className="whitespace-nowrap mt-2 text-lg md:text-xl font-semibold text-purple-700">
                  🔎 Reaction Type: {reactionType}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
