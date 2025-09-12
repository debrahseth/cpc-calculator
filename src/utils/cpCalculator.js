function scaleCoefficients({ a = 0, b = 0, c = 0, d = 0 }) {
  return {
    a: a * 1e-3,
    b: b * 1e-5,
    c: c * 1e-8,
    d: d * 1e-12,
  };
}

export function getCp(relation, T) {
  if (!relation) throw new Error("No Cp relation provided.");

  const { form, coefficients, range } = relation;
  const { a, b, c, d } = scaleCoefficients(coefficients);

  if (T < range[0] || T > range[1]) {
    alert(
      `⚠️ Temperature ${T} is outside valid range ${range[0]}–${range[1]} (${relation.tempUnit}). Values given are not that reliable.`
    );
  }

  if (form === 1) {
    return (a + b * T + c * T ** 2 + d * T ** 3) * 1000;
  } else if (form === 2) {
    return (a + b * T + c * T ** -2) * 1000;
  } else {
    throw new Error(`Unknown Cp form ${form}`);
  }
}

export function getDeltaH(relation, T1, T2) {
  if (!relation) throw new Error("No Cp relation provided.");

  const { form, coefficients } = relation;
  const { a, b, c, d } = scaleCoefficients(coefficients);

  if (form === 1) {
    const H = (T) =>
      (a * T + (b / 2) * T ** 2 + (c / 3) * T ** 3 + (d / 4) * T ** 4) * 1000;
    return H(T2) - H(T1);
  } else if (form === 2) {
    const H = (T) => (a * T + (b / 2) * T ** 2 - c / T) * 1000;
    return H(T2) - H(T1);
  } else {
    throw new Error(`Unknown Cp form ${form}`);
  }
}
