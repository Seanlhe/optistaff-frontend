import Calendar from "./Calendar";

const Availability = () => {
  return (
    <div>
      <div className="bg-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold mb-8">
            Select Available Timing
          </h1>
        </div>
        <div>
          <label className="block mb-2">Maximum Hours per Week</label>
          <input
            type="number"
            className="p-2 border border-gray-400 rounded-lg mb-5"
            min="1"
            max="44"
            placeholder="44"
          />
        </div>
        <Calendar />
        <div className="mt-4">
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
