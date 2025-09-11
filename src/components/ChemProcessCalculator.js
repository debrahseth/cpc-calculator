import React, { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const cpLookup = {
  air: 1005,
  water_g: 1850,
  water_l: 4182,
  ch4: 2220,
  co2: 844,
};

// Magnust formula for saturation vapor pressure over water (hPa)
function satVaporPressure_hPa(T_C) {
  // T_C: Celsius
  // Magnus-Tetens constants for water
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * T_C) / (b + T_C);
  const es = 6.1078 * Math.exp(alpha); // hPa
  return es;
}

// Humidity ratio (kg water/kg dry air) given RH (%) and T (C) and P (Pa)
function humidityRatioFromRH(RH, T_C, P_Pa = 101325) {
  // RH in [0,1]
  const es_hPa = satVaporPressure_hPa(T_C);
  const e = RH * es_hPa; // hPa
  const e_Pa = e * 100;
  const Mw = 18.01528; // g/mol
  const Ma = 28.9647; // g/mol
  // humidity ratio w = 0.622 * e / (P - e)
  const w = (0.622 * e_Pa) / (P_Pa - e_Pa);
  return w; // kg/kg
}

// Simple mixing mass balance: returns resulting temperature for mixing two streams (neglecting heat loss)
function mixTwoStreams(m1, T1_C, cp1, m2, T2_C, cp2) {
  // masses in kg, cp in J/(kg K)
  const energy = m1 * cp1 * (T1_C + 273.15) + m2 * cp2 * (T2_C + 273.15);
  const mTot = m1 + m2;
  const cpEq = (m1 * cp1 + m2 * cp2) / mTot;
  const Tkelvin = energy / (mTot * cpEq);
  return Tkelvin - 273.15;
}

// Simple steady-flow energy balance for a heater/cooler: Q = m * cp * (Tout - Tin)
function heatingQ(m_dot, cp, Tin_C, Tout_C) {
  // m_dot kg/s, cp J/kgK -> Q in Watts
  const dT = Tout_C - Tin_C;
  return m_dot * cp * dT;
}

// Heats of formation reaction: deltaH = sum(nu_p * hf_p) - sum(nu_r * hf_r)
// species enthalpies in kJ/mol
const hfLookup_kJ = {
  CH4: -74.85,
  O2: 0,
  CO2: -393.5,
  H2O_g: -241.8,
  H2O_l: -285.83,
  CO: -110.53,
  H2: 0,
  N2: 0,
};

function heatOfReaction_kJ(reaction) {
  // reaction: {reactants: [{specie, nu}], products: [{specie, nu}]}
  let sumP = 0;
  let sumR = 0;
  reaction.products.forEach((p) => {
    const hf = hfLookup_kJ[p.specie] ?? 0;
    sumP += p.nu * hf;
  });
  reaction.reactants.forEach((r) => {
    const hf = hfLookup_kJ[r.specie] ?? 0;
    sumR += r.nu * hf;
  });
  return sumP - sumR; // kJ per mole reaction
}

// Simple stoichiometric O2 for hydrocarbon CxHyOz
function stoichO2ForHydrocarbon(C, H, O = 0) {
  // CxHyOz + (x + y/4 - z/2) O2 -> x CO2 + y/2 H2O
  const O2moles = C + H / 4 - O / 2;
  return O2moles; // mol O2 per mol fuel
}

// ---------- React component ----------
export default function ChemProcessCalculator() {
  const [tab, setTab] = useState("energy");

  // Energy balance inputs
  const [mDot, setMDot] = useState(1); // kg/s
  const [Tin, setTin] = useState(25);
  const [Tout, setTout] = useState(100);
  const [selectedCp, setSelectedCp] = useState("water_l");

  // Combustion inputs
  const [C, setC] = useState(1);
  const [H, setH] = useState(4);
  const [O, setO] = useState(0);

  // Heat of reaction example (CH4 + 2 O2 -> CO2 + 2 H2O)
  const reactionExample = useMemo(
    () => ({
      reactants: [
        { specie: "CH4", nu: 1 },
        { specie: "O2", nu: 2 },
      ],
      products: [
        { specie: "CO2", nu: 1 },
        { specie: "H2O_g", nu: 2 },
      ],
    }),
    []
  );

  // Mixing example
  const [m1, setM1] = useState(1);
  const [T1, setT1] = useState(90);
  const [m2, setM2] = useState(2);
  const [T2, setT2] = useState(20);

  // Humidity inputs
  const [chartPressure, setChartPressure] = useState(101325);
  const [rhA, setRhA] = useState(0.6);
  const [tempChartRange, setTempChartRange] = useState([0, 40]);

  // Derived calculations
  const Q = useMemo(() => {
    const cp = cpLookup[selectedCp] ?? 1000;
    return heatingQ(mDot, cp, Tin, Tout);
  }, [mDot, selectedCp, Tin, Tout]);

  const stoichO2 = useMemo(
    () => stoichO2ForHydrocarbon(Number(C), Number(H), Number(O)),
    [C, H, O]
  );

  const deltaH_rxn = useMemo(
    () => heatOfReaction_kJ(reactionExample),
    [reactionExample]
  );

  const mixedT = useMemo(
    () =>
      mixTwoStreams(
        Number(m1),
        Number(T1),
        cpLookup["water_l"],
        Number(m2),
        Number(T2),
        cpLookup["water_l"]
      ),
    [m1, T1, m2, T2]
  );

  // Humidity chart data
  const humidityChart = useMemo(() => {
    const [tMin, tMax] = tempChartRange;
    const labels = [];
    const wAtRh = [];
    const wSat = [];
    for (let t = tMin; t <= tMax; t += 1) {
      labels.push(`${t}°C`);
      const ws = humidityRatioFromRH(1, t, chartPressure);
      wSat.push(Number((ws * 1000).toFixed(3))); // g/kg
      const w = humidityRatioFromRH(rhA, t, chartPressure);
      wAtRh.push(Number((w * 1000).toFixed(3)));
    }

    return {
      labels,
      datasets: [
        {
          label: `Saturation (g water/kg dry air)`,
          data: wSat,
          tension: 0.3,
          fill: false,
        },
        {
          label: `RH ${Math.round(rhA * 100)}% (g/kg)`,
          data: wAtRh,
          tension: 0.3,
          fill: false,
        },
      ],
    };
  }, [tempChartRange, chartPressure, rhA]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">
            Chemical Process Calculations — Demo
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Next.js + Tailwind + Chart.js starter. Educational purposes —
            validate before use.
          </p>
        </header>

        <nav className="flex gap-2 mb-4">
          {[
            { id: "energy", label: "Energy Balance" },
            { id: "combustion", label: "Combustion" },
            { id: "heats", label: "Heats of Reaction" },
            { id: "mixing", label: "Mixing" },
            { id: "humidity", label: "Humidity" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1 rounded-md ${
                tab === t.id ? "bg-slate-800 text-white" : "bg-white border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <section className="bg-white rounded-lg shadow p-6">
          {tab === "energy" && (
            <div>
              <h2 className="text-xl font-medium mb-3">
                Energy Balance (steady flow heater/cooler)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <label className="block">
                  <div className="text-sm text-slate-600">
                    Mass flow ṁ (kg/s)
                  </div>
                  <input
                    type="number"
                    value={mDot}
                    onChange={(e) => setMDot(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">Tin (°C)</div>
                  <input
                    type="number"
                    value={Tin}
                    onChange={(e) => setTin(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">Tout (°C)</div>
                  <input
                    type="number"
                    value={Tout}
                    onChange={(e) => setTout(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
              </div>

              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-1">
                  Select cp (approx)
                </div>
                <select
                  value={selectedCp}
                  onChange={(e) => setSelectedCp(e.target.value)}
                  className="input"
                >
                  {Object.keys(cpLookup).map((k) => (
                    <option key={k} value={k}>
                      {k} — {cpLookup[k]} J/kgK
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-md bg-slate-50 p-4">
                <div className="text-sm text-slate-600">
                  Calculated heat transfer rate Q (W)
                </div>
                <div className="text-2xl font-mono mt-1">
                  {Q.toLocaleString(undefined, { maximumFractionDigits: 2 })} W
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  (Q = ṁ·cp·(Tout - Tin))
                </div>
              </div>
            </div>
          )}

          {tab === "combustion" && (
            <div>
              <h2 className="text-xl font-medium mb-3">
                Combustion (stoichiometry)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <label>
                  <div className="text-sm text-slate-600">C (atoms)</div>
                  <input
                    type="number"
                    value={C}
                    onChange={(e) => setC(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">H (atoms)</div>
                  <input
                    type="number"
                    value={H}
                    onChange={(e) => setH(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">O (atoms)</div>
                  <input
                    type="number"
                    value={O}
                    onChange={(e) => setO(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <div className="p-2">
                  <div className="text-sm text-slate-600">
                    Stoichiometric O₂ (mol per mol fuel)
                  </div>
                  <div className="text-xl font-mono">
                    {stoichO2.toFixed(3)} mol O₂
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                Example: For methane CH₄ (C=1,H=4) stoich O₂ = 2
              </div>
            </div>
          )}

          {tab === "heats" && (
            <div>
              <h2 className="text-xl font-medium mb-3">
                Heats of Reaction / Hess's Law
              </h2>
              <div className="mb-4">
                <div className="text-sm text-slate-600">
                  Example reaction: CH₄ + 2 O₂ → CO₂ + 2 H₂O (g)
                </div>
                <div className="rounded-md bg-slate-50 p-4 mt-3">
                  <div className="text-sm text-slate-600">
                    ΔH° (kJ per mol reaction)
                  </div>
                  <div className="text-2xl font-mono mt-1">
                    {deltaH_rxn.toFixed(2)} kJ/mol
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                You can extend hfLookup_kJ map to include more species or fetch
                from a thermochemical database for higher accuracy.
              </div>
            </div>
          )}

          {tab === "mixing" && (
            <div>
              <h2 className="text-xl font-medium mb-3">
                Mixing balances (mass + energy)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <label>
                  <div className="text-sm text-slate-600">m1 (kg)</div>
                  <input
                    type="number"
                    value={m1}
                    onChange={(e) => setM1(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">T1 (°C)</div>
                  <input
                    type="number"
                    value={T1}
                    onChange={(e) => setT1(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">m2 (kg)</div>
                  <input
                    type="number"
                    value={m2}
                    onChange={(e) => setM2(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">T2 (°C)</div>
                  <input
                    type="number"
                    value={T2}
                    onChange={(e) => setT2(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
              </div>

              <div className="rounded-md bg-slate-50 p-4">
                <div className="text-sm text-slate-600">
                  Resulting mixed temperature (°C)
                </div>
                <div className="text-2xl font-mono mt-1">
                  {mixedT.toFixed(2)} °C
                </div>
              </div>
            </div>
          )}

          {tab === "humidity" && (
            <div>
              <h2 className="text-xl font-medium mb-3">
                Humidity & Charts (simple psychrometric lines)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <label>
                  <div className="text-sm text-slate-600">
                    Chart Pressure (Pa)
                  </div>
                  <input
                    type="number"
                    value={chartPressure}
                    onChange={(e) => setChartPressure(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">
                    Selected RH (0–1)
                  </div>
                  <input
                    step="0.01"
                    type="number"
                    value={rhA}
                    onChange={(e) => setRhA(Number(e.target.value))}
                    className="mt-1 input"
                  />
                </label>
                <label>
                  <div className="text-sm text-slate-600">
                    Temp range min,max (°C)
                  </div>
                  <input
                    type="text"
                    value={tempChartRange.join(",")}
                    onChange={(e) => {
                      const parts = e.target.value
                        .split(",")
                        .map((p) => Number(p.trim()));
                      if (
                        parts.length === 2 &&
                        !isNaN(parts[0]) &&
                        !isNaN(parts[1])
                      )
                        setTempChartRange(parts);
                    }}
                    className="mt-1 input"
                  />
                </label>
              </div>

              <div className="mb-4">
                <Line
                  data={humidityChart}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                  }}
                />
              </div>

              <div className="rounded-md bg-slate-50 p-4">
                <div className="text-sm text-slate-600">
                  Example single point humidity ratio at current RH and 25°C
                </div>
                <div className="text-xl font-mono mt-1">
                  {(humidityRatioFromRH(rhA, 25, chartPressure) * 1000).toFixed(
                    3
                  )}{" "}
                  g/kg
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-6 text-sm text-slate-600">
          <p>
            Next steps: add unit selection, richer property libraries
            (CoolProp), API endpoints for heavy calculations, validation
            test-suite, and downloadable reports.
          </p>
        </footer>
      </div>
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}
