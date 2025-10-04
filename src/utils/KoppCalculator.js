import atomicCp from "@/data/atomicCp";

function parseFormula(formula) {
  const regex = /([A-Z][a-z]*)(\d*)/g;
  let elements = {};
  let match;
  while ((match = regex.exec(formula)) !== null) {
    const el = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;
    elements[el] = (elements[el] || 0) + count;
  }
  return elements;
}
/**
 * Kopp's Rule: Cp(compound) ≈ Σ (atomic Cp × atom count)
 * @param {string} formula - Chemical formula (e.g. NaCl, C6H6)
 * @param {string} state - "solid" | "liquid" | "gas"
 * @returns {number} estimated Cp in J/mol·K
 */
export function getCpKopp(formula, state = "solid") {
  if (!formula) throw new Error("No formula provided.");

  const elements = parseFormula(formula);
  let Cp_est = 0;

  for (const [el, count] of Object.entries(elements)) {
    const elData = atomicCp[el]?.[state] ?? atomicCp["All Others"][state];
    if (elData === undefined) {
      throw new Error(
        `No Cp data available for element ${el} or fallback in ${state} state.`
      );
    }
    Cp_est += count * elData;
  }

  return Cp_est;
}
