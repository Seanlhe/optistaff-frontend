import React from 'react';
import { describe } from "node:test";
import { beforeAll, expect, it, vi, beforeEach } from "vitest";
import ClientHistory from '../../../src/pages/employer/ClientHistory';
import { Assignment, Shift } from '../../../src/types/hooks';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { addDays } from 'date-fns';


const mockedShifts: Shift[] = [
  {
    shift_id: "shift101",
    employer_name: "Alpha Corp",
    company_name: "Alpha Corp",
    job_title: "Warehouse Assistant",
    job_location: "1 Kaki Bukit Ave",
    postal_code: 416123,
    job_description: "Handle goods and restocking",
    job_requirements: "Physically fit, safety shoes",
    job_type: "Part-Time",
    pay_rate: 15.0,
    start_time: new Date("2025-07-10T08:00:00"), // July 10 (Thu)
    end_time: new Date("2025-07-10T17:00:00"),
    break_duration: 1,
    staff_needed: 3,
    staff_assigned: 2,
    submission_cycle: "PRIMARY",
    status: "Completed",
    created_at: new Date("2025-07-05T10:00:00"),
  },
  {
    shift_id: "shift102",
    employer_name: "Beta Logistics",
    company_name: "Beta Logistics",
    job_title: "Delivery Rider",
    job_location: "20 Jurong West St 65",
    postal_code: 648123,
    job_description: "Deliver packages in west region",
    job_requirements: "Own vehicle preferred",
    job_type: "Contract",
    pay_rate: 18.0,
    start_time: new Date("2025-07-15T10:00:00"), // July 15 (Tue)
    end_time: new Date("2025-07-15T19:00:00"),
    break_duration: 1,
    staff_needed: 5,
    staff_assigned: 5,
    submission_cycle: "SECONDARY",
    status: "Completed",
    created_at: new Date("2025-07-10T09:00:00"),
  },
  {
    shift_id: "shift103",
    employer_name: "Gamma Foods",
    company_name: "Gamma Foods",
    job_title: "Kitchen Crew",
    job_location: "123 Clementi Rd",
    postal_code: 129456,
    job_description: "Prep food and clean kitchen",
    job_requirements: "Food hygiene cert preferred",
    job_type: "Full-Time",
    pay_rate: 12.5,
    start_time: addDays(new Date(),8), // July 1 (Tue)
    end_time: addDays(new Date(),8),
    break_duration: 1,
    staff_needed: 4,
    staff_assigned: 3,
    submission_cycle: "PRIMARY",
    status: "Completed",
    created_at: new Date("2025-06-25T14:00:00"),
  },
];

const mockedAssignments: Assignment[] = [
  {
    assignment_id: "assign001",
    company_name: "Alpha Corp",
    employee_name: "John Tan",
    employer_name: "Alice Lim",
    employee_id: "emp001",
    job_title: "Warehouse Assistant",
    job_location: "1 Kaki Bukit Ave",
    postal_code: "416123",
    job_description: "Handle goods and restocking",
    job_requirements: "Physically fit, safety shoes",
    job_type: "Part-Time",
    pay_rate: 15.0,
    start_time: "2025-07-10T08:00:00",
    end_time: "2025-07-10T17:00:00",
    break_hours: 1,
    contact_number: "91234567",
    contact_email: "john.tan@example.com",
    check_in_time: "2025-07-10T08:05:00",
    check_out_time: "2025-07-10T17:00:00",
    status: "Completed",
    created_at: "2025-07-01T09:00:00"
  },
  {
    assignment_id: "assign002",
    company_name: "Beta Logistics",
    employee_name: "Sara Lee",
    employer_name: "Ben Koh",
    employee_id: "emp002",
    job_title: "Delivery Rider",
    job_location: "20 Jurong West St 65",
    postal_code: "648123",
    job_description: "Deliver packages in west region",
    job_requirements: "Own vehicle preferred",
    job_type: "Contract",
    pay_rate: 18.0,
    start_time: "2025-07-15T10:00:00",
    end_time: "2025-07-15T19:00:00",
    break_hours: 1,
    contact_number: "98765432",
    contact_email: "sara.lee@example.com",
    check_in_time: "2025-07-15T10:01:00",
    check_out_time: "2025-07-15T19:00:00",
    status: "Completed",
    created_at: "2025-07-05T10:30:00"
  },
  {
    assignment_id: "assign003",
    company_name: "Gamma Foods",
    employee_name: "Marcus Ng",
    employer_name: "Cheryl Wong",
    employee_id: "emp003",
    job_title: "Kitchen Crew",
    job_location: "123 Clementi Rd",
    postal_code: "129456",
    job_description: "Prep food and clean kitchen",
    job_requirements: "Food hygiene cert preferred",
    job_type: "Full-Time",
    pay_rate: 12.5,
    start_time: "2025-07-01T09:00:00",
    end_time: "2025-07-01T17:00:00",
    break_hours: 1,
    contact_number: "90001111",
    contact_email: "marcus.ng@example.com",
    check_in_time: "2025-07-01T09:02:00",
    check_out_time: "2025-07-01T17:00:00",
    status: "Completed",
    created_at: "2025-06-28T14:00:00"
  }
];

const mockedSubmitFeedback = vi.fn();

const mockFeedbackHook = {
    submitFeedback: mockedSubmitFeedback
};

const mockedFetchAssignments = vi.fn(async (shift_id: string) => {
  return mockedAssignments;
});

vi.mock("../../src/hooks/useShifts", () => ({
  useShifts: () => ({
    shifts: mockedShifts
  })
}));

vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: () => ({
    fetchAssignmentsByShift: mockedFetchAssignments
  })
}));

vi.mock('../../src/hooks/useFeedback', () => ({
  useFeedback: () => mockFeedbackHook,
}));



describe("CreateFeedback test suite", ()=>{
    beforeEach(() => {
      mockedSubmitFeedback.mockReset();
    });
    it("Renders HistoryAssignedStaff and HistoryPastShifts, UC 7 Steps 1-2", ()=>{
      render(<ClientHistory/>)
      expect(screen.getByTestId("history-past-shifts")).toBeTruthy();
      expect(screen.getByTestId("history-assigned-staff")).toBeTruthy();
    })

    it("Renders shifts from useShifts, UC 7 Steps 3-8", async ()=>{
      render(<ClientHistory/>)
      const HistoryPastShifts = screen.getByTestId("history-past-shifts");
      const shiftCards = await within(HistoryPastShifts).findAllByTestId("past-shift-card");
      expect(shiftCards.length).toBe(2); //2 out of 3 mocked shifts are before the current date
      expect(within(shiftCards[0]).findByText("Warehouse Assistant")).toBeTruthy();
      expect(within(shiftCards[0]).findByText("1 Kaki Bukit Ave, Singapore 416123")).toBeTruthy();
      expect(within(shiftCards[0]).findByText("Wednesday, 10/07/2025")).toBeTruthy();
      expect(within(shiftCards[0]).findByText("08:00 AM - 05:00 PM")).toBeTruthy();

      // Check contents of the second shift (Beta Logistics)
      expect(within(shiftCards[1]).getByText("Delivery Rider")).toBeTruthy();
      expect(within(shiftCards[1]).getByText("20 Jurong West St 65, Singapore 648123")).toBeTruthy();
      expect(within(shiftCards[1]).getByText("Tuesday, 15/07/2025")).toBeTruthy();
      expect(within(shiftCards[1]).getByText("10:00 AM - 07:00 PM")).toBeTruthy();
    })

    it("Select a shift, UC 7 Steps 9", async ()=>{
      render(<ClientHistory/>)
      const HistoryPastShifts = screen.getByTestId("history-past-shifts");
      const shiftCards = within(HistoryPastShifts).getAllByTestId("past-shift-card");
      fireEvent.click(shiftCards[0]);
      expect(mockedFetchAssignments).toHaveBeenCalledWith(mockedShifts[0].shift_id);
      expect(shiftCards[0].className).toContain("border-primary-blue")
      expect(shiftCards[1].className).toContain("border-[#B3B3B3]")
    })

    it("Display selected shift assigned staff, UC 7 Steps 10-14", async ()=>{
      render(<ClientHistory/>)
      const HistoryPastShifts = screen.getByTestId("history-past-shifts");
      const shiftCards = within(HistoryPastShifts).getAllByTestId("past-shift-card");
      fireEvent.click(shiftCards[0]);
      const HistoryAssignedStaff = screen.getByTestId("history-assigned-staff");
      const empCards = await within(HistoryAssignedStaff).findAllByTestId("history-employee-card");
      expect(empCards.length).toBe(3);
      // Check that each employee card contains the correct name and a "Review" button
      const expectedNames = ["John Tan", "Sara Lee", "Marcus Ng"];
      empCards.forEach((card, index) => {
        const utils = within(card);
        expect(utils.getByText(expectedNames[index])).toBeTruthy();
        expect(utils.getByRole("button", { name: "Review" })).toBeTruthy();
      });
    })

    it("Select an assignment, display rating modal, UC7 Steps 15-16", async()=>{
      render(<ClientHistory/>)
      const HistoryPastShifts = screen.getByTestId("history-past-shifts");
      const shiftCards = within(HistoryPastShifts).getAllByTestId("past-shift-card");
      fireEvent.click(shiftCards[0]);
      const HistoryAssignedStaff = screen.getByTestId("history-assigned-staff");
      const empCards = await within(HistoryAssignedStaff).findAllByTestId("history-employee-card");
      const reviewBtn0 = within(empCards[0]).getByRole("button", { name: "Review" });
      fireEvent.click(reviewBtn0);
      const ratingModal = screen.getByTestId("history-rating-modal");
      expect(ratingModal).toBeTruthy();
      expect(within(ratingModal).getByText("John Tan")).toBeTruthy();
    })

    it("Write and submit valid feedback, UC7 Steps 17-24", async()=>{
      render(<ClientHistory/>)
      const validFeedback = {
        assignment_id: "assign001",
        reviewee_id: "emp001",
        rating_score: 5,
        comment: 'Great work!',

    };
      const HistoryPastShifts = screen.getByTestId("history-past-shifts");
      const shiftCards = within(HistoryPastShifts).getAllByTestId("past-shift-card");
      fireEvent.click(shiftCards[0]);
      const HistoryAssignedStaff = screen.getByTestId("history-assigned-staff");
      const empCards = await within(HistoryAssignedStaff).findAllByTestId("history-employee-card");
      const reviewBtn0 = within(empCards[0]).getByRole("button", { name: "Review" });
      fireEvent.click(reviewBtn0);
      const ratingModal = screen.getByTestId("history-rating-modal");
      const rating = screen.getByAltText("Star 5");
      fireEvent.click(rating);
      const comment = screen.getByRole("textbox");
      fireEvent.change(comment, {target: {value: 'Great work!'}})
      const submitBtn = screen.getByRole("button", {name: "Rate"})
      fireEvent.click(submitBtn);
      expect(mockedSubmitFeedback).toHaveBeenCalledWith(validFeedback);
    })

    it("Write and submit invalid feedback (No valid rating), UC7 Steps 17-18, 25-26", async () => {
      render(<ClientHistory />);
      const HistoryPastShifts = screen.getByTestId("history-past-shifts");
      const shiftCards = within(HistoryPastShifts).getAllByTestId("past-shift-card");
      fireEvent.click(shiftCards[0]);
    
      const HistoryAssignedStaff = screen.getByTestId("history-assigned-staff");
      const empCards = await within(HistoryAssignedStaff).findAllByTestId("history-employee-card");
      const reviewBtn0 = within(empCards[0]).getByRole("button", { name: "Review" });
      fireEvent.click(reviewBtn0);
    
      const ratingModal = screen.getByTestId("history-rating-modal");
      const comment = screen.getByRole("textbox");
      fireEvent.change(comment, { target: { value: "Good effort" } });
    
      const submitBtn = screen.getByRole("button", { name: "Rate" });
      fireEvent.click(submitBtn);
    
      expect(mockedSubmitFeedback).not.toHaveBeenCalled();
      expect(screen.getByText("Please provide a valid rating.")).toBeTruthy();
    });
    
    it("Write and submit invalid feedback (No valid comment), UC7 Steps 17-18, 25-26", async () => {
      render(<ClientHistory />);
      const HistoryPastShifts = screen.getByTestId("history-past-shifts");
      const shiftCards = within(HistoryPastShifts).getAllByTestId("past-shift-card");
      fireEvent.click(shiftCards[0]);
    
      const HistoryAssignedStaff = screen.getByTestId("history-assigned-staff");
      const empCards = await within(HistoryAssignedStaff).findAllByTestId("history-employee-card");
      const reviewBtn0 = within(empCards[0]).getByRole("button", { name: "Review" });
      fireEvent.click(reviewBtn0);
    
      const ratingModal = screen.getByTestId("history-rating-modal");
      const rating = screen.getByAltText("Star 4");
      fireEvent.click(rating);
    
      const comment = screen.getByRole("textbox");
      fireEvent.change(comment, { target: { value: " " } });
    
      const submitBtn = screen.getByRole("button", { name: "Rate" });
      fireEvent.click(submitBtn);
    
      expect(mockedSubmitFeedback).not.toHaveBeenCalled();
      expect(screen.getByText("Please provide a valid comment.")).toBeTruthy();
    });
    
    it("Write and submit invalid feedback (No valid rating and comment), UC7 Steps 17-18, 25-26", async () => {
      render(<ClientHistory />);
      const HistoryPastShifts = screen.getByTestId("history-past-shifts");
      const shiftCards = within(HistoryPastShifts).getAllByTestId("past-shift-card");
      fireEvent.click(shiftCards[0]);
    
      const HistoryAssignedStaff = screen.getByTestId("history-assigned-staff");
      const empCards = await within(HistoryAssignedStaff).findAllByTestId("history-employee-card");
      const reviewBtn0 = within(empCards[0]).getByRole("button", { name: "Review" });
      fireEvent.click(reviewBtn0);
    
      const comment = screen.getByRole("textbox");
      fireEvent.change(comment, { target: { value: "" } });
    
      const submitBtn = screen.getByRole("button", { name: "Rate" });
      fireEvent.click(submitBtn);
    
      expect(mockedSubmitFeedback).not.toHaveBeenCalled();
      expect(screen.getByText("Please provide a valid comment.")).toBeTruthy();
      expect(screen.getByText("Please provide a valid rating.")).toBeTruthy();
    });
})

