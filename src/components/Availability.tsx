import Calendar from "./Calendar";

const Availability = () => {
  return (
    <div>
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold mb-10">Select Available Timing</h1>
        </div>

        <Calendar />
        <div className="mt-6">
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
