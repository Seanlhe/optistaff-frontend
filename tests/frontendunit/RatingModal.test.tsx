import React from 'react';
import { describe } from "node:test";
import { beforeAll, expect, it, vi, beforeEach } from "vitest";
import {RatingModal} from "../../src/pages/employer/ClientHistory"
import { Assignment } from '../../src/types/hooks';
import { validateReview } from '../../src/utils/review';
import { fireEvent, render, screen } from '@testing-library/react';



const mockedSubmitFeedback = vi.fn();

const mockFeedbackHook = {
    submitFeedback: mockedSubmitFeedback
};

vi.mock('../../src/hooks/useFeedback', () => ({
  useFeedback: () => mockFeedbackHook,
}));

const handleClose = vi.fn()
const mockedAssignment: Assignment = {
    assignment_id: "asg-123456",
    company_name: "Acme Pte Ltd",
    employee_name: "John Tan",
    employer_name: "Jane Lee",
    employee_id: "emp-987654",
    job_title: "Warehouse Assistant",
    job_location: "12 Jurong West Ave 3",
    postal_code: "648341",
    job_description: "Assist with packing, sorting, and inventory tracking in the warehouse.",
    job_requirements: "Able to lift up to 15kg, basic English proficiency.",
    job_type: "Part-Time",
    pay_rate: 12.5,
    start_time: "2025-08-03T09:00:00+08:00",
    end_time: "2025-08-03T18:00:00+08:00",
    break_hours: 1,
    contact_number: "81234567",
    contact_email: "jane.lee@acmepte.sg",
    check_in_time: null,
    check_out_time: null,
    status: "Pending",
    created_at: "2025-08-01T14:32:00+08:00"
};

describe("RatingModal test suite", ()=>{
    beforeEach(() => {
        mockedSubmitFeedback.mockReset();
      });
    it('validates valid review', async () => {
        render(<RatingModal assignment={mockedAssignment} handleClose={handleClose}/>)
        const validFeedback = {
            assignment_id: "asg-123456",
            reviewee_id: "emp-987654",
            rating_score: 5,
            comment: 'Great work!',

        };
        expect(screen.getByText("John Tan")).toBeTruthy();
        const rating = screen.getByAltText("Star 5");
        fireEvent.click(rating);
        const comment = screen.getByRole("textbox");
        fireEvent.change(comment, {target: {value: 'Great work!'}})
        const submitBtn = screen.getByRole("button", {name: "Rate"})
        fireEvent.click(submitBtn);
        expect(mockedSubmitFeedback).toHaveBeenCalledWith(validFeedback);
      });
    
      it('rejects zero rating', () => {
            render(<RatingModal assignment={mockedAssignment} handleClose={handleClose}/>)
            expect(screen.getByText("John Tan")).toBeTruthy();
            const comment = screen.getByRole("textbox");
            fireEvent.change(comment, {target: {value: 'Good work!'}})
            const submitBtn = screen.getByRole("button", {name: "Rate"})
            fireEvent.click(submitBtn);
            expect(mockedSubmitFeedback).not.toHaveBeenCalled();
            expect(screen.getByText('Please provide a valid rating.')).toBeTruthy();
      });
    
      it('rejects empty comment', () => {
            // const invalidFeedback = {
            // rating_score: 4,
            // comment: ''
            // };
            render(<RatingModal assignment={mockedAssignment} handleClose={handleClose}/>)
            expect(screen.getByText("John Tan")).toBeTruthy();
            const rating = screen.getByAltText("Star 4");
            fireEvent.click(rating);
            const comment = screen.getByRole("textbox");
            fireEvent.change(comment, {target: {value: ''}})
            const submitBtn = screen.getByRole("button", {name: "Rate"})
            fireEvent.click(submitBtn);
            expect(mockedSubmitFeedback).not.toHaveBeenCalled();
            expect(screen.getByText('Please provide a valid comment.')).toBeTruthy();
      });
    
      it('rejects whitespace-only comment', () => {
            // const invalidFeedback = {
            // rating_score: 3,
            // comment: '   '
            // };
            render(<RatingModal assignment={mockedAssignment} handleClose={handleClose}/>)
            expect(screen.getByText("John Tan")).toBeTruthy();
            const rating = screen.getByAltText("Star 4");
            fireEvent.click(rating);
            const comment = screen.getByRole("textbox");
            fireEvent.change(comment, {target: {value: ' '}})
            const submitBtn = screen.getByRole("button", {name: "Rate"})
            fireEvent.click(submitBtn);
            expect(mockedSubmitFeedback).not.toHaveBeenCalled();
            expect(screen.getByText('Please provide a valid comment.')).toBeTruthy();
      });
    
      it('handles multiple validation errors', () => {
        const invalidFeedback = {
          rating_score: 0,
          comment: ''
        }
        render(<RatingModal assignment={mockedAssignment} handleClose={handleClose}/>)
        expect(screen.getByText("John Tan")).toBeTruthy();
        const comment = screen.getByRole("textbox");
        fireEvent.change(comment, {target: {value: ''}})
        const submitBtn = screen.getByRole("button", {name: "Rate"})
        fireEvent.click(submitBtn);
        expect(mockedSubmitFeedback).not.toHaveBeenCalled();
        expect(screen.getByText('Please provide a valid comment.')).toBeTruthy();
        expect(screen.getByText('Please provide a valid rating.')).toBeTruthy();
      });
})

