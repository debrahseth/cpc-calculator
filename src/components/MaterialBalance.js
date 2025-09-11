import { useState } from "react";

export default function MaterialBalance() {
  const [celsius, setCelsius] = useState("");
  const [kelvin, setKelvin] = useState(null);

  const handleConvert = () => {
    if (celsius !== "") {
      setKelvin(parseFloat(celsius) + 273.15);
    }
  };

  return (
    <div>
      <h2>Unit Conversion</h2>
      <p>Convert Celsius to Kelvin</p>
      <input
        type="number"
        placeholder="Enter °C"
        value={celsius}
        onChange={(e) => setCelsius(e.target.value)}
        style={{ padding: "5px", marginRight: "10px" }}
      />
      <button onClick={handleConvert} style={{ padding: "5px 15px" }}>
        Convert
      </button>
      {kelvin !== null && (
        <p style={{ marginTop: "10px" }}>
          {celsius} °C = <b>{kelvin} K</b>
        </p>
      )}
    </div>
  );
}
