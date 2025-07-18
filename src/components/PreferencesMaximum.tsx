import { PreferencesMaximumProps } from '../types/components';

const PreferencesMaximum: React.FC<PreferencesMaximumProps> = ({ formData, setFormData }) => {
  const handleMaxHoursPerWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData({
      ...formData,
      maxHoursPerWeek: value
    });
  };

  const handleMaxHoursPerShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData({
      ...formData,
      maxHoursPerShift: value
    });
  };

  return (
    <div className="flex gap-8 mb-5 items-end">
      <div className="flex flex-col">
        <label className="block text-base font-semibold mb-2 text-main">Maximum Hours per Week</label>
        <input
          type="number"
          className="p-2 border border-border bg-card-color text-main rounded-lg w-24"
          min="1"
          max="44"
          placeholder="20"
          value={formData.maxHoursPerWeek || ''}
          onChange={handleMaxHoursPerWeekChange}
        />
      </div>
      <div className="flex flex-col">
        <label className="block text-base font-semibold mb-2 text-main">Maximum Hours per Shift</label>
        <input
          type="number"
          className="p-2 border border-border bg-card-color text-main rounded-lg w-24"
          min="1"
          max="12"
          placeholder="8"
          value={formData.maxHoursPerShift || ''}
          onChange={handleMaxHoursPerShiftChange}
        />
      </div>
    </div>
  );
};

export default PreferencesMaximum;
