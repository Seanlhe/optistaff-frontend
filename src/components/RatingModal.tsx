import { Assignment, Feedback } from "../types/hooks";
import { useFeedback } from "../hooks/useFeedback";
import { useState } from "react";
import { reviewError, validateReview } from "../utils/review";

export default function RatingModal({
    handleClose,
    assignment,
  }: {
    handleClose: Function;
    assignment: Assignment;
  }) {
    const { submitFeedback } = useFeedback();
    const [error, setError] = useState<reviewError>({
      rating_score: null,
      comment: null,
    });
  
    const [feedbackData, setFeedbackData] = useState<Partial<Feedback>>({
      assignment_id: assignment.assignment_id,
      reviewee_id: assignment.employee_id,
      comment: "",
      rating_score: 0,
    });
    async function handleSubmit() {
      setError({
        rating_score: null,
        comment: null,
      });
      const newError = validateReview(feedbackData);
      setError(newError);
      console.log(newError);
      const isValid = Object.values(newError).every((value) => value === null);
      console.log(feedbackData);
      if (isValid) {
        await submitFeedback(feedbackData);
      }
    }
  
    return (
      <div data-testid="history-rating-modal" className="relative w-100 flex flex-col bg-white rounded-lg gap-6 p-6 shadow">
        <div className="flex flex-row gap-4 items-center">
          <img className="bg-[#D9D9D9] rounded-full w-14 h-14" src="" />
          <p className="font-montserrat-b text-lg text-primary-text">
            {assignment.employee_name}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-montserrat-smb text-secondary-text text-sm">
            Help us improve your working experience by rating this employee.
          </p>
          <div className="hover:cursor-pointer self-center flex flex-row gap-2">
            {feedbackData &&
              feedbackData.rating_score !== undefined &&
              [...Array(5)].map((_, index) => (
                <img
                  key={index}
                  src={
                    feedbackData.rating_score &&
                    feedbackData.rating_score - 1 >= index
                      ? "/icons/activestaricon.svg"
                      : "/icons/ratingstaricon.svg"
                  }
                  alt={`Star ${index + 1}`}
                  onClick={() => {
                    setFeedbackData((prevData) => ({
                      ...prevData,
                      rating_score: index + 1,
                    }));
                  }}
                />
              ))}
          </div>
          {error.rating_score ? (
            <p className="self-center font-montserrat text-pink-500 text-xs">
              {error.rating_score}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-montserrat-smb text-secondary-text text-sm">
            Write up to 50 characters
          </p>
          <textarea
            onChange={(e) => {
              setFeedbackData((prevData) => ({
                ...prevData,
                comment: e.target.value,
              }));
            }}
            name="comment"
            placeholder="Be as descriptive as possible"
            id="feedback_comment"
            className="bg-[#F2F2F2] rounded-lg font-montserrat text-secondary-text h-40 p-3 text-sm"
          />
          {error.comment? (
            <p className="self-center font-montserrat text-pink-500 text-xs">
              {error.comment}
            </p>
          ) : null}
        </div>
        <button
          className="hover:cursor-pointer absolute top-3 right-3"
          onClick={() => handleClose()}
        >
          <img src="/icons/crossicon.svg" />
        </button>
        <button
          onClick={() => handleSubmit()}
          className="hover:cursor-pointer hover:opacity-80 bg-primary-blue rounded-lg py-2 text-white font-montserrat text-sm"
        >
          Rate
        </button>
      </div>
    );
  }
  