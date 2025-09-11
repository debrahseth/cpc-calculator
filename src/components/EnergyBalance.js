export default function EnergyBalance() {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Energy Balance</h2>
      <p className="mb-6 text-gray-600 text-center">
        Input process streams, temperatures, and enthalpies to calculate energy
        requirements.
      </p>

      <form className="w-full max-w-md flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter flow rate (kg/s)"
          className="p-3 border rounded-md"
        />
        <input
          type="text"
          placeholder="Enter inlet temperature (°C)"
          className="p-3 border rounded-md"
        />
        <input
          type="text"
          placeholder="Enter outlet temperature (°C)"
          className="p-3 border rounded-md"
        />
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Calculate
        </button>
      </form>

      <div className="mt-6 p-4 w-full max-w-md bg-gray-100 rounded-md text-gray-800">
        Results will appear here.
      </div>
    </div>
  );
}
