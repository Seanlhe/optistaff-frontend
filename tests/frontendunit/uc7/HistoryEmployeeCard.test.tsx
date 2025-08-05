import React from 'react';
import { describe, mock } from "node:test";
import { beforeAll, expect, it, vi, beforeEach } from "vitest";
import EmployeeCard from "../../../src/components/EmployeeCard"
import { Assignment } from '../../../src/types/hooks';
import { fireEvent, render, screen } from '@testing-library/react';

const mockedAssignment: Assignment = {
    assignment_id: "asg-654321",
    company_name: "BrightClean Services",
    employee_name: "Sarah Lim",
    employer_name: "Marcus Koh",
    employee_id: "emp-123789",
    job_title: "Office Cleaner",
    job_location: "1 Raffles Place, Tower 2",
    postal_code: "048616",
    job_description: "Clean office spaces, restock pantry supplies, and empty trash bins.",
    job_requirements: "Able to work independently, punctual, prior cleaning experience preferred.",
    job_type: "Full-Time",
    pay_rate: 15.0,
    start_time: "2025-08-05T07:30:00+08:00",
    end_time: "2025-08-05T16:00:00+08:00",
    break_hours: 0.5,
    contact_number: "88997766",
    contact_email: "marcus.koh@brightclean.sg",
    check_in_time: null,
    check_out_time: null,
    status: "Confirmed",
    created_at: "2025-08-02T10:45:00+08:00"
  }
const mockReviewClick = vi.fn();

describe("EmployeeCard test suite",  ()=>{
    it("Displays information from Employee", async()=>{
        render(<EmployeeCard handleClick={mockReviewClick} assignment={mockedAssignment}/>)
        expect(screen.getAllByText("Sarah Lim")).toBeTruthy();
        const reviewBtn = await screen.findByRole("button", {name: "Review"});
        fireEvent.click(reviewBtn);
        expect(mockReviewClick).toBeCalledWith(mockedAssignment);
    })
})