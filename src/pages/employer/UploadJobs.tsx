import CustomInputField from "../../components/CustomInputField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShifts } from "../../hooks/useShifts";
import { Shift } from "../../types/hooks";
import {
  getDateForm,
  ShiftError,
  validateShift,
  createEmptyShiftError,
  jobRoleOptions,
} from "../../utils/uploadjobs";
import { format } from "date-fns";
import CustomSelect from "../../components/CustomSelect";
import CustomTextArea from "../../components/CustomTextArea";
import { DateInput } from "../../components/DateInput";
export default function UploadJobs() {
  const navigate = useNavigate();
  const { createShift } = useShifts();
  const [formData, setFormData] = useState<
    Omit<
      Shift,
      | "shift_id"
      | "created_at"
      | "status"
      | "staff_assigned"
      | "employer_name"
      | "submission_cycle"
      | "company_name"
    >
  >({
    job_title: "",
    job_description: "",
    job_requirements: "",
    job_type: "",
    pay_rate: 0,
    job_location: "",
    postal_code: 0,
    start_time: new Date(),
    end_time: new Date(),
    break_duration: 0,
    staff_needed: 0,
  });
  const [valid, setValid] = useState<boolean>(true);
  const [shiftError, setShiftError] = useState<ShiftError>(
    createEmptyShiftError()
  );
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const handleDataChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const name = e.target.name;
    let value = e.target.value;
    switch (name) {
      case "start_time": {
        const baseDate = format(formData.start_time, "yyyy-MM-dd");
        const new_start = getDateForm(baseDate, value);
        setFormData((prev) => ({ ...prev, start_time: new_start }));
        break;
      }
      case "end_time": {
        const baseDate = format(formData.start_time, "yyyy-MM-dd");
        const new_end = getDateForm(baseDate, value);
        setFormData((prev) => ({ ...prev, end_time: new_end }));
        break;
      }
      default:
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleDateChange = (dateValue: string) => {
    if (dateValue) {
      const new_sd = getDateForm(
        dateValue,
        format(formData.start_time, "HH:mm")
      );
      const new_ed = getDateForm(dateValue, format(formData.end_time, "HH:mm"));
      if (!isNaN(new_sd.getTime())) {
        setFormData((prev) => ({
          ...prev,
          start_time: new_sd,
          end_time: new_ed,
        }));
      }
    }
  };

  function handleCancel() {
    navigate("/employer/dashboard");
  }

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setValid(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    console.log(formData);
    const newErrors = validateShift(formData);
    setShiftError(newErrors);
    console.log(newErrors);
    const isValid = Object.values(newErrors).every((value) => value === null);

    if (isValid) {
      try {
        await createShift(formData);
        setValid(true);
        setSubmitSuccess(true);
        console.log("✅ Submitted shift:", formData);
        // Hide success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (error) {
        setSubmitError("Failed to create job listing. Please try again.");
        console.error("❌ Failed to submit shift:", error);
      }
    } else {
      setValid(false);
      setSubmitError("Please fix the validation errors before submitting.");
    }
  }

  return (
    <div id="upload-jobs-content" className="min-h-screen bg-bg p-8">
      <div id="upload-jobs-header" className="flex flex-col gap-3 mb-6">
        <h1 className="text-black font-montserrat-b text-2xl">
          Create Listing
        </h1>
        <h2 className="text-secondary-text font-montserrat-smb text-base">
          Fill out the required information and click "Post Job" to submit.
        </h2>
      </div>
      <div
        id="upload-jobs-form"
        className="bg-card-color rounded-xl p-8 w-full max-w-7xl"
      >
        <form className="grid grid-cols-12 gap-x-4 gap-y-12 items-center">
          <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">
            Title and Description
          </p>
          <CustomInputField
            className="col-span-6"
            name="job_title"
            title="Job Title"
            valid={valid}
            error={shiftError.job_title}
            placeholder="Eg. Banquet Server"
            type="text"
            onChange={handleDataChange}
          />
          <CustomSelect
            options={jobRoleOptions}
            className="col-span-6"
            name="job_type"
            title="Job Category"
            valid={valid}
            error={shiftError.job_type}
            placeholder="Eg. Banquet Server"
            type="text"
            onInput={handleDataChange}
          />
          <CustomTextArea
            className="col-span-12 h-[8rem]"
            name="job_description"
            title="Description"
            valid={valid}
            error={shiftError.job_description}
            placeholder="Format into sections to improve readability. Give clear responsibilities and roles"
            onChange={handleDataChange}
          />
          <CustomTextArea
            className="col-span-12 h-[8rem]"
            name="job_requirements"
            title="Requirements"
            valid={valid}
            error={shiftError.job_requirements}
            placeholder="Clearly state any preparation required by staff. For example, attire or tools required."
            onChange={handleDataChange}
          />
          <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">
            Time and Venue
          </p>
          <div className="col-span-3">
            <DateInput
              label="Date"
              value={format(formData.start_time, "yyyy-MM-dd")}
              onChange={handleDateChange}
              required={false}
              error={shiftError.date || undefined}
              placeholder="Select shift date..."
            />
          </div>
          <CustomInputField
            className="col-span-3"
            name="start_time"
            title="Start Time"
            type="time"
            valid={valid}
            error={shiftError.start_time}
            onChange={handleDataChange}
          />
          <CustomInputField
            className="col-span-3"
            name="end_time"
            title="End Time"
            type="time"
            valid={valid}
            error={shiftError.end_time}
            onChange={handleDataChange}
          />
          <CustomInputField
            className="col-span-3"
            name="break_duration"
            title="Break Duration (hrs)"
            type="number"
            valid={valid}
            error={shiftError.break_duration}
            onChange={handleDataChange}
          />
          <CustomInputField
            className="col-span-6"
            name="job_location"
            title="Address"
            type="text"
            valid={valid}
            error={shiftError.job_location}
            onChange={handleDataChange}
          />
          <CustomInputField
            className="col-span-6"
            name="postal_code"
            title="Postal Code"
            type="text"
            valid={valid}
            error={shiftError.postal_code}
            onChange={handleDataChange}
          />
          <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">
            Staffing Requirements
          </p>
          <CustomInputField
            className="col-span-6"
            placeholder="Eg. 7000"
            name="pay_rate"
            title="Pay Rate (/hr)"
            type="number"
            valid={valid}
            error={shiftError.pay_rate}
            onChange={handleDataChange}
          />
          <CustomInputField
            className="col-span-6"
            placeholder="Eg. 10"
            name="staff_needed"
            title="No. Pax"
            type="number"
            valid={valid}
            error={shiftError.staff_needed}
            onChange={handleDataChange}
          />
          <div
            id="upload-btns"
            className="col-span-12 flex flex-row gap-4 justify-end"
          >
            <button
              type="button"
              className="hover:cursor-pointer hover:opacity-80 w-full p-3 bg-primary-blue font-montserrat-smb text-white text-base rounded-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleSubmit(e)
              }
            >
              Post Job
            </button>
            <button
              type="button"
              className="hover:cursor-pointer hover:bg-gray-100 w-full p-3 border-2 bg-white border-secondary-text font-montserrat-smb text-secondary-text text-base rounded-lg"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>

          {/* Success Alert */}
          {submitSuccess && (
            <div className="col-span-12 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-400 mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Job listing created successfully!
                </span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {submitError && (
            <div className="col-span-12 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error Creating Job Listing
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
