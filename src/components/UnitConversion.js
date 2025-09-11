import { useState } from "react";
import molarMassDatabase from "../data/molarMasses";

const conversionFactors = {
  temperature: {
    Celsius: {
      Kelvin: (c) => c + 273.15,
      Fahrenheit: (c) => (c * 9) / 5 + 32,
      Rankine: (c) => ((c + 273.15) * 9) / 5,
      Celsius: (c) => c,
    },
    Kelvin: {
      Celsius: (k) => k - 273.15,
      Fahrenheit: (k) => ((k - 273.15) * 9) / 5 + 32,
      Rankine: (k) => (k * 9) / 5,
      Kelvin: (k) => k,
    },
    Fahrenheit: {
      Celsius: (f) => ((f - 32) * 5) / 9,
      Kelvin: (f) => ((f - 32) * 5) / 9 + 273.15,
      Rankine: (f) => f + 459.67,
      Fahrenheit: (f) => f,
    },
    Rankine: {
      Celsius: (r) => ((r - 491.67) * 5) / 9,
      Kelvin: (r) => (r * 5) / 9,
      Fahrenheit: (r) => r - 459.67,
      Rankine: (r) => r,
    },
  },
  pressure: {
    atm: {
      kPa: (a) => a * 101.325,
      bar: (a) => a * 1.01325,
      mmHg: (a) => a * 760,
      psi: (a) => a * 14.696,
      atm: (a) => a,
    },
    kPa: {
      atm: (k) => k / 101.325,
      bar: (k) => k / 100,
      mmHg: (k) => (k * 760) / 101.325,
      psi: (k) => (k * 14.696) / 101.325,
      kPa: (k) => k,
    },
    bar: {
      atm: (b) => b / 1.01325,
      kPa: (b) => b * 100,
      mmHg: (b) => (b * 760) / 1.01325,
      psi: (b) => (b * 14.696) / 1.01325,
      bar: (b) => b,
    },
    mmHg: {
      atm: (m) => m / 760,
      kPa: (m) => (m * 101.325) / 760,
      bar: (m) => (m * 1.01325) / 760,
      psi: (m) => (m * 14.696) / 760,
      mmHg: (m) => m,
    },
    psi: {
      atm: (p) => p / 14.696,
      kPa: (p) => (p * 101.325) / 14.696,
      bar: (p) => (p * 1.01325) / 14.696,
      mmHg: (p) => (p * 760) / 14.696,
      psi: (p) => p,
    },
  },
  energy: {
    joule: {
      kilojoule: (j) => j / 1000,
      calorie: (j) => j / 4.184,
      kilocalorie: (j) => j / 4184,
      Btu: (j) => j / 1055.06,
      joule: (j) => j,
    },
    kilojoule: {
      joule: (k) => k * 1000,
      calorie: (k) => (k * 1000) / 4.184,
      kilocalorie: (k) => k / 4.184,
      Btu: (k) => (k * 1000) / 1055.06,
      kilojoule: (k) => k,
    },
    calorie: {
      joule: (c) => c * 4.184,
      kilojoule: (c) => (c * 4.184) / 1000,
      kilocalorie: (c) => c / 1000,
      Btu: (c) => (c * 4.184) / 1055.06,
      calorie: (c) => c,
    },
    kilocalorie: {
      joule: (kc) => kc * 4184,
      kilojoule: (kc) => kc * 4.184,
      calorie: (kc) => kc * 1000,
      Btu: (kc) => (kc * 4184) / 1055.06,
      kilocalorie: (kc) => kc,
    },
    Btu: {
      joule: (b) => b * 1055.06,
      kilojoule: (b) => (b * 1055.06) / 1000,
      calorie: (b) => (b * 1055.06) / 4.184,
      kilocalorie: (b) => (b * 1055.06) / 4184,
      Btu: (b) => b,
    },
  },
  mass: {
    gram: {
      kilogram: (g) => g / 1000,
      pound: (g) => g / 453.592,
      tonne: (g) => g / 1000000,
      gram: (g) => g,
    },
    kilogram: {
      gram: (k) => k * 1000,
      pound: (k) => k * 2.20462,
      tonne: (k) => k / 1000,
      kilogram: (k) => k,
    },
    pound: {
      gram: (p) => p * 453.592,
      kilogram: (p) => p / 2.20462,
      tonne: (p) => p / 2204.62,
      pound: (p) => p,
    },
    tonne: {
      gram: (t) => t * 1000000,
      kilogram: (t) => t * 1000,
      pound: (t) => t * 2204.62,
      tonne: (t) => t,
    },
  },
  length: {
    meter: {
      centimeter: (m) => m * 100,
      millimeter: (m) => m * 1000,
      foot: (m) => m * 3.28084,
      inch: (m) => m * 39.3701,
      meter: (m) => m,
    },
    centimeter: {
      meter: (c) => c / 100,
      millimeter: (c) => c * 10,
      foot: (c) => c / 30.48,
      inch: (c) => c / 2.54,
      centimeter: (c) => c,
    },
    millimeter: {
      meter: (mm) => mm / 1000,
      centimeter: (mm) => mm / 10,
      foot: (mm) => mm / 304.8,
      inch: (mm) => mm / 25.4,
      millimeter: (mm) => mm,
    },
    foot: {
      meter: (f) => f / 3.28084,
      centimeter: (f) => f * 30.48,
      millimeter: (f) => f * 304.8,
      inch: (f) => f * 12,
      foot: (f) => f,
    },
    inch: {
      meter: (i) => i / 39.3701,
      centimeter: (i) => i * 2.54,
      millimeter: (i) => i * 25.4,
      foot: (i) => i / 12,
      inch: (i) => i,
    },
  },
  volume: {
    liter: {
      cubicMeter: (l) => l / 1000,
      cubicCentimeter: (l) => l * 1000,
      gallon: (l) => l / 3.78541,
      cubicFoot: (l) => l / 28.3168,
      liter: (l) => l,
    },
    cubicMeter: {
      liter: (m) => m * 1000,
      cubicCentimeter: (m) => m * 1000000,
      gallon: (m) => m * 264.172,
      cubicFoot: (m) => m * 35.3147,
      cubicMeter: (m) => m,
    },
    cubicCentimeter: {
      liter: (c) => c / 1000,
      cubicMeter: (c) => c / 1000000,
      gallon: (c) => c / 3785.41,
      cubicFoot: (c) => c / 28316.8,
      cubicCentimeter: (c) => c,
    },
    gallon: {
      liter: (g) => g * 3.78541,
      cubicMeter: (g) => g / 264.172,
      cubicCentimeter: (g) => g * 3785.41,
      cubicFoot: (g) => g / 7.48052,
      gallon: (g) => g,
    },
    cubicFoot: {
      liter: (f) => f * 28.3168,
      cubicMeter: (f) => f / 35.3147,
      cubicCentimeter: (f) => f * 28316.8,
      gallon: (f) => f * 7.48052,
      cubicFoot: (f) => f,
    },
  },
  power: {
    watt: {
      kilowatt: (w) => w / 1000,
      horsepower: (w) => w / 745.7,
      watt: (w) => w,
    },
    kilowatt: {
      watt: (kw) => kw * 1000,
      horsepower: (kw) => (kw * 1000) / 745.7,
      kilowatt: (kw) => kw,
    },
    horsepower: {
      watt: (hp) => hp * 745.7,
      kilowatt: (hp) => (hp * 745.7) / 1000,
      horsepower: (hp) => hp,
    },
  },
  flow: {
    "Liters per second (L/s)": {
      "Cubic meters per second (m³/s)": (l) => l / 1000,
      "Gallons per minute (gpm)": (l) => l * 15.8503,
      "Cubic feet per second (ft³/s)": (l) => l / 28.3168,
      "Liters per second (L/s)": (l) => l,
    },
    "Cubic meters per second (m³/s)": {
      "Liters per second (L/s)": (m) => m * 1000,
      "Gallons per minute (gpm)": (m) => m * 15850.3,
      "Cubic feet per second (ft³/s)": (m) => m * 35.3147,
      "Cubic meters per second (m³/s)": (m) => m,
    },
    "Gallons per minute (gpm)": {
      "Liters per second (L/s)": (g) => g / 15.8503,
      "Cubic meters per second (m³/s)": (g) => g / 15850.3,
      "Cubic feet per second (ft³/s)": (g) => g / 448.831,
      "Gallons per minute (gpm)": (g) => g,
    },
    "Cubic feet per second (ft³/s)": {
      "Liters per second (L/s)": (f) => f * 28.3168,
      "Cubic meters per second (m³/s)": (f) => f / 35.3147,
      "Gallons per minute (gpm)": (f) => f * 448.831,
      "Cubic feet per second (ft³/s)": (f) => f,
    },
  },
  mole: {
    mole: {
      gram: (m, mw) => m * mw,
      mole: (m) => m,
    },
    gram: {
      mole: (g, mw) => g / mw,
      gram: (g) => g,
    },
  },
  density: {
    "kg/m³": {
      "g/cm³": (v) => v / 1000,
      "lb/ft³": (v) => v / 16.0185,
      "kg/m³": (v) => v,
    },
    "g/cm³": {
      "kg/m³": (v) => v * 1000,
      "lb/ft³": (v) => v * 62.42796,
      "g/cm³": (v) => v,
    },
    "lb/ft³": {
      "kg/m³": (v) => v * 16.0185,
      "g/cm³": (v) => v / 62.42796,
      "lb/ft³": (v) => v,
    },
  },
  specificHeat: {
    "J/kg·K": {
      "cal/g·K": (v) => v / 4184,
      "Btu/lb·°F": (v) => v / 4186.8,
      "J/kg·K": (v) => v,
    },
    "cal/g·K": {
      "J/kg·K": (v) => v * 4184,
      "Btu/lb·°F": (v) => v * 1.8,
      "cal/g·K": (v) => v,
    },
    "Btu/lb·°F": {
      "J/kg·K": (v) => v * 4186.8,
      "cal/g·K": (v) => v / 1.8,
      "Btu/lb·°F": (v) => v,
    },
  },
};

export default function UnitConversion() {
  const [category, setCategory] = useState("temperature");
  const [inputUnit, setInputUnit] = useState("");
  const [outputUnit, setOutputUnit] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [molarMass, setMolarMass] = useState("");
  const [result, setResult] = useState(null);

  const units = {
    temperature: ["Celsius", "Kelvin", "Fahrenheit", "Rankine"],
    pressure: ["atm", "kPa", "bar", "mmHg", "psi"],
    mass: ["gram", "kilogram", "pound", "tonne"],
    length: ["meter", "centimeter", "millimeter", "foot", "inch"],
    volume: ["liter", "cubicMeter", "cubicCentimeter", "gallon", "cubicFoot"],
    flow: [
      "Liters per second (L/s)",
      "Cubic meters per second (m³/s)",
      "Gallons per minute (gpm)",
      "Cubic feet per second (ft³/s)",
    ],
    mole: ["mole", "gram"],
    energy: ["joule", "kilojoule", "calorie", "kilocalorie", "Btu"],
    power: ["watt", "kilowatt", "horsepower"],
    density: ["kg/m³", "g/cm³", "lb/ft³"],
    specificHeat: ["J/kg·K", "cal/g·K", "Btu/lb·°F"],
  };

  const handleConvert = () => {
    if (!inputUnit || !outputUnit || inputValue === "") return;

    let output;
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult({ error: "⚠️ Please enter a valid number" });
      return;
    }

    if (category === "mole" && (!molarMass || isNaN(parseFloat(molarMass)))) {
      setResult({
        error: "⚠️ Please enter a valid molar mass for mole conversions",
      });
      return;
    }

    try {
      if (category === "mole") {
        const mw = parseFloat(molarMass);
        output = conversionFactors[category][inputUnit][outputUnit](value, mw);
      } else {
        output = conversionFactors[category][inputUnit][outputUnit](value);
      }
      setResult({ [outputUnit]: output.toFixed(4) });
    } catch (error) {
      setResult({ error: "⚠️ Conversion error. Please check your inputs." });
    }
  };

  const handleReset = () => {
    setCategory("temperature");
    setInputUnit("");
    setOutputUnit("");
    setInputValue("");
    setMolarMass("");
    setResult(null);
  };

  return (
    <div className="max-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-y-auto">
      <div className="max-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 overflow-y-auto">
        <h2 className="text-3xl font-extrabold mb-4 text-center text-indigo-900">
          🔄 Universal Unit Converter
        </h2>
        <p className="text-center text-[18px] text-gray-600">
          Convert{" "}
          <span className="font-semibold">
            Temperature, Pressure, Mass, Length, Volume, Flow Rates, and Moles
          </span>{" "}
          with a simple click.
        </p>
        <p className="text-center text-[18px] text-gray-600 mb-8">
          Perfect for{" "}
          <span className="text-indigo-700 font-medium">
            Chemical Process Calculations!
          </span>
        </p>

        <div className="mb-6">
          <label className="block text-[18px] font-semibold text-gray-700 mb-2">
            Select Category
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setInputUnit("");
              setOutputUnit("");
              setResult(null);
            }}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="temperature">🌡️ Temperature</option>
            <option value="pressure">⏱️ Pressure</option>
            <option value="mass">⚖️ Mass</option>
            <option value="length">📏 Length</option>
            <option value="volume">🧪 Volume</option>
            <option value="flow">💨 Flow Rates</option>
            <option value="mole">⚛️ Moles ↔ Mass</option>
            <option value="energy">🔋 Energy</option>
            <option value="power">⚡ Power</option>
            <option value="density">🏋️ Density</option>
            <option value="specificHeat">🔥 Specific Heat Capacity</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[18px] font-semibold text-gray-700 mb-2">
              From
            </label>
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">Select unit</option>
              {units[category].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[18px] font-semibold text-gray-700 mb-2">
              To
            </label>
            <select
              value={outputUnit}
              onChange={(e) => setOutputUnit(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">Select unit</option>
              {units[category].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[18px] font-semibold text-gray-700 mb-2">
            Value
          </label>
          <input
            type="number"
            placeholder="Enter value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {category === "mole" && (
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-gray-700 mb-2">
              Select Compound (or enter custom molar mass)
            </label>
            <select
              onChange={(e) => {
                const compound = e.target.value;
                if (compound && molarMassDatabase[compound]) {
                  setMolarMass(molarMassDatabase[compound]);
                } else {
                  setMolarMass("");
                }
              }}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium mb-3"
            >
              <option value="">-- Select a compound --</option>
              {Object.keys(molarMassDatabase).map((compound) => (
                <option key={compound} value={compound}>
                  {compound} ({molarMassDatabase[compound]} g/mol)
                </option>
              ))}
              <option value="custom">Custom (enter manually)</option>
            </select>

            <input
              type="number"
              placeholder="Enter molar mass (g/mol)"
              value={molarMass}
              onChange={(e) => setMolarMass(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              disabled={Object.values(molarMassDatabase).includes(
                Number(molarMass)
              )}
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleConvert}
            className="flex-1 md:text-[20px] bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
          >
            🚀 Convert
          </button>

          <button
            onClick={handleReset}
            className="flex-1 md:text-[20px] bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition shadow-md"
          >
            ♻️ Reset
          </button>
        </div>

        {result && (
          <div className="mt-8 bg-indigo-50 p-6 rounded-xl shadow-inner">
            <h3 className="font-bold mb-2 text-indigo-900 text-lg">Result:</h3>
            {result.error ? (
              <p className="text-red-600 font-medium">{result.error}</p>
            ) : (
              <p className="text-gray-800 text-lg">
                <span className="font-semibold">
                  {inputValue} {inputUnit}
                </span>{" "}
                ={" "}
                <span className="text-indigo-700 font-bold">
                  {result[outputUnit]} {outputUnit}
                </span>
              </p>
            )}
            <p className="mt-3 text-[18px] text-gray-600">
              💡 Remember: Always check unit consistency when solving{" "}
              <span className="font-medium">Material & Energy Balances</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
