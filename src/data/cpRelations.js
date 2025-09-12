const cpRelations = {
  Acetone: {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [-30, 60],
      coefficients: { a: 123.0, b: 18.6, c: 0, d: 0 },
    },
  },
  Acetylene: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 71.96, b: 20.1, c: -12.78, d: 34.76 },
    },
  },
  Air: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 42.43, b: 6.053, c: -5.033, d: 18.32 },
    },
  },
  Ammonia: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [273, 1800],
      coefficients: { a: 35.15, b: 2.954, c: 0.4421, d: -6.686 },
    },
  },
  Acetone: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 71.96, b: 20.1, c: 0 - 12.78, d: 34.76 },
    },
  },
  Isobutane: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 89.46, b: 30.13, c: -18.91, d: 49.87 },
    },
  },
  Benzene: {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [6, 67],
      coefficients: { a: 126.5, b: 23.4, c: 0, d: 0 },
    },
  },
  "Ammonium sulfate": {
    solid: {
      form: 1,
      tempUnit: "K",
      range: [275, 328],
      coefficients: { a: 215.9, b: 0, c: 0, d: 0 },
    },
  },
  Benzene: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 74.06, b: 32.95, c: -25.2, d: 77.57 },
    },
  },
  "n-Butane": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 92.3, b: 27.88, c: -15.47, d: 34.98 },
    },
  },
  "Calcium carbide": {
    solid: {
      form: 2,
      tempUnit: "K",
      range: [298, 720],
      coefficients: { a: 68.62, b: 1.19, c: -8.66e10, d: 0 },
    },
  },
  "Calcium carbonate": {
    solid: {
      form: 2,
      tempUnit: "K",
      range: [273, 1033],
      coefficients: { a: 82.34, b: 4.975, c: -12.87e10, d: 0 },
    },
  },
  "Calcium hydroxide": {
    solid: {
      form: 2,
      tempUnit: "K",
      range: [276, 373],
      coefficients: { a: 89.5, b: 0, c: 0, d: 0 },
    },
  },
  "Calcium oxide": {
    solid: {
      form: 2,
      tempUnit: "K",
      range: [273, 1173],
      coefficients: { a: 41.84, b: 2.03, c: -4.52e10, d: 0 },
    },
  },
  Carbon: {
    solid: {
      form: 2,
      tempUnit: "K",
      range: [273, 1373],
      coefficients: { a: 11.18, b: 1.095, c: -4.891e10, d: 0 },
    },
  },
  "Carbon dioxide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1500],
      coefficients: { a: 36.11, b: 4.233, c: -2.887, d: 7.464 },
    },
  },
  "Carbon monoxide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1500],
      coefficients: { a: 28.95, b: 0.411, c: 0.3548, d: -2.22 },
    },
  },
  "Carbon tetrachloride": {
    liquid: {
      form: 1,
      tempUnit: "K",
      range: [273, 343],
      coefficients: { a: 93.39, b: 12.98, c: 0, d: 0 },
    },
  },
  Chlorine: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 33.6, b: 1.367, c: -1.607, d: 6.473 },
    },
  },
  Copper: {
    solid: {
      form: 1,
      tempUnit: "K",
      range: [273, 1357],
      coefficients: { a: 22.76, b: 0.6117, c: 0, d: 0 },
    },
  },
  Cumene: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 139.2, b: 53.76, c: -39.79, d: 120.5 },
    },
  },
  Cyclohexane: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 94.14, b: 49.62, c: -31.9, d: 80.63 },
    },
  },
  Cyclopentane: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 73.39, b: 39.28, c: -25.54, d: 68.66 },
    },
  },
  Ethane: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 49.37, b: 13.92, c: -5.816, d: 7.28 },
    },
  },
  Ethanol: {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [0, 0],
      coefficients: { a: 103.1, b: 0, c: 0, d: 0 },
    },
  },
  Ethanol: {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [100, 0],
      coefficients: { a: 158.8, b: 0, c: 0, d: 0 },
    },
  },
  Ethanol: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 61.34, b: 15.72, c: -8.749, d: 19.83 },
    },
  },
  Ethylene: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 40.75, b: 11.47, c: -6.891, d: 17.66 },
    },
  },
  "Ferric oxide": {
    solid: {
      form: 2,
      tempUnit: "K",
      range: [273, 1097],
      coefficients: { a: 103.4, b: 6.711, c: -17.72e10, d: 0 },
    },
  },
  Formaldehyde: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 34.28, b: 4.268, c: 0, d: -8.694 },
    },
  },
  Helium: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 20.8, b: 0, c: 0, d: 0 },
    },
  },
  "n-Hexane": {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [20, 100],
      coefficients: { a: 216.3, b: 0, c: 0, d: 0 },
    },
  },
  "n-Hexane": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 137.44, b: 40.85, c: -23.92, d: 57.66 },
    },
  },
  Hydrogen: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1500],
      coefficients: { a: 28.84, b: 0.00765, c: 0.3288, d: -0.8698 },
    },
  },
  "Hydrogen bromide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 29.1, b: -0.0227, c: 0.9887, d: -4.858 },
    },
  },
  "Hydrogen chloride": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 29.13, b: -0.1341, c: 0.9715, d: -4.335 },
    },
  },
  "Hydrogen cyanide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 35.3, b: 2.908, c: 1.092, d: 0 },
    },
  },
  "Hydrogen sulfide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1500],
      coefficients: { a: 33.51, b: 1.547, c: 0.3012, d: -3.292 },
    },
  },
  "Magnesium chloride": {
    solid: {
      form: 1,
      tempUnit: "K",
      range: [273, 991],
      coefficients: { a: 72.4, b: 1.58, c: 0, d: 0 },
    },
  },
  "Magnesium oxide": {
    solid: {
      form: 2,
      tempUnit: "K",
      range: [273, 2073],
      coefficients: { a: 45.44, b: 0.5008, c: -8.732e10, d: 0 },
    },
  },
  Methane: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 34.31, b: 5.469, c: 0.3661, d: -11.0 },
    },
  },
  Methane: {
    gas: {
      form: 1,
      tempUnit: "K",
      range: [273, 1500],
      coefficients: { a: 19.87, b: 5.021, c: 1.268, d: -11.0 },
    },
  },
  Methanol: {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [0, 65],
      coefficients: { a: 75.86, b: 16.83, c: 0, d: 0 },
    },
  },
  "Methyl cyclohexane": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 121.3, b: 56.53, c: -37.72, d: 100.8 },
    },
  },
  Methanol: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 700],
      coefficients: { a: 42.93, b: 8.301, c: -1.87, d: -8.03 },
    },
  },
  "Methyl cyclopentane": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 98.83, b: 45.3857, c: -30.44, d: 83.81 },
    },
  },
  "Nitric acid": {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [25, 0],
      coefficients: { a: 110.0, b: 0, c: 0, d: 0 },
    },
  },
  "Nitric oxide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 3500],
      coefficients: { a: 29.5, b: 0.8188, c: -0.2925, d: 0.3652 },
    },
  },
  Nitrogen: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1500],
      coefficients: { a: 29.0, b: 0.2199, c: 0.5723, d: -2.871 },
    },
  },
  "Nitrogen dioxide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 36.07, b: 3.97, c: -2.88, d: 7.87 },
    },
  },
  "Nitrogen tetraoxide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 300],
      coefficients: { a: 75.7, b: 12.5, c: -11.3, d: 0 },
    },
  },
  "Nitrous oxide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 37.66, b: 4.151, c: -2.694, d: 10.57 },
    },
  },
  Oxygen: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1500],
      coefficients: { a: 29.1, b: 1.158, c: -0.6076, d: 1.311 },
    },
  },
  "n-Pentane": {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [0, 36],
      coefficients: { a: 155.4, b: 43.68, c: 0, d: 0 },
    },
  },
  "n-Pentane": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 114.8, b: 34.09, c: -18.99, d: 42.26 },
    },
  },
  Propane: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 68.032, b: 22.59, c: -13.11, d: 31.71 },
    },
  },
  Propylene: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 59.58, b: 17.71, c: -10.17, d: 24.6 },
    },
  },
  "Sodium carbonate": {
    solid: {
      form: 1,
      tempUnit: "K",
      range: [288, 371],
      coefficients: { a: 121, b: 0, c: 0, d: 0 },
    },
  },
  "Sodium carbonate": {
    solid: {
      form: 1,
      tempUnit: "K",
      range: [298, 0],
      coefficients: { a: 535.6, b: 0, c: 0, d: 0 },
    },
  },
  "Sulfuric acid": {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [10, 45],
      coefficients: { a: 139.1, b: 15.59, c: 0, d: 0 },
    },
  },
  "Sulfur dioxide": {
    gas: {
      form: 1,
      tempUnit: "K",
      range: [0, 1500],
      coefficients: { a: 38.91, b: 3.904, c: -3.104, d: 8.606 },
    },
  },
  "Sulfur trioxide": {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1000],
      coefficients: { a: 48.5, b: 9.188, c: -8.54, d: 32.4 },
    },
  },
  Toluene: {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [0, 110],
      coefficients: { a: 148.8, b: 32.4, c: 0, d: 0 },
    },
  },
  Toluene: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 94.18, b: 38.0, c: -27.86, d: 80.33 },
    },
  },
  Water: {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [0, 100],
      coefficients: { a: 75.4, b: 0, c: 0, d: 0 },
    },
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1500],
      coefficients: { a: 33.46, b: 0.688, c: 0.7604, d: -3.593 },
    },
  },
  Acetone: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 71.96, b: 20.1, c: -12.78, d: 34.76 },
    },
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [-30, 60],
      coefficients: { a: 123.0, b: 18.6, c: 0, d: 0 },
    },
  },
  Acetylene: {
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 71.96, b: 20.1, c: -12.78, d: 34.76 },
    },
  },
  Air: {
    gas: [
      {
        form: 1,
        tempUnit: "°C",
        range: [0, 1500],
        coefficients: { a: 28.94, b: 0.4147, c: 0.3191, d: -1.965 },
      },
      {
        form: 1,
        tempUnit: "K",
        range: [273, 1800],
        coefficients: { a: 28.09, b: 0.1965, c: 0.4799, d: 1.965 },
      },
    ],
  },
  Benzene: {
    liquid: {
      form: 1,
      tempUnit: "°C",
      range: [6, 67],
      coefficients: { a: 126.5, b: 23.4, c: 0, d: 0 },
    },
    gas: {
      form: 1,
      tempUnit: "°C",
      range: [0, 1200],
      coefficients: { a: 74.06, b: 32.95, c: -25.2, d: 77.57 },
    },
  },
};
export default cpRelations;
