const PreferencesMaximum = () => {
  return (
    <div className="flex gap-8 mb-5 items-end">
      <div className="flex flex-col">
        <label className="block text-sm mb-2 text-main">Maximum Hours per Week</label>
        <input
          type="number"
          className="p-2 border-card-color bg-card-color text-main rounded-lg w-24"
          min="1"
          max="44"
          placeholder="20"
        />
      </div>
      <div className="flex flex-col">
        <label className="block text-sm mb-2 text-main">Maximum Hours per Shift</label>
        <input
          type="number"
          className="p-2 border-card-color bg-card-color text-main rounded-lg w-24"
          min="1"
          max="12"
          placeholder="8"
        />
      </div>
    </div>
  );
};

export default PreferencesMaximum;
