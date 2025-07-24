import { Feedback } from "../types/hooks";
export interface reviewError{
    rating_score: string | null;
    comment: string | null;
}

export const validateReview  = (feedback: Partial<Feedback>) : reviewError => {
    const error: reviewError = {
        rating_score: null,
        comment: null
    }
    if (feedback.rating_score == 0){
        error.rating_score = "Please provide a valid rating."
    }
    if (!feedback.comment || feedback.comment && feedback.comment.trim().length == 0){
        console.log(true);
        error.comment = "Please provide a valid comment."
    }
    return error;
}