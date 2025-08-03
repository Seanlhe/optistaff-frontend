import React from 'react';
import { describe, mock } from "node:test";
import { beforeAll, expect, it, vi, beforeEach } from "vitest";
import {PastShiftCard} from "../../src/pages/employer/ClientHistory"
import { Shift } from '../../src/types/hooks';
import { fireEvent, render, screen } from '@testing-library/react';




const mockedShift: Shift = {
    shift_id: "shift004",
    employer_name: "Company D",
    company_name: "Company D",
    job_title: "Data Scientist",
    job_location: "Singapore",
    postal_code: 987654,
    job_description: "Analyzing data",
    job_requirements: "3+ years experience",
    job_type: "Full-time",
    pay_rate: 80,
    start_time: new Date('2025-07-10T09:00:00'), // A date out of the current week
    end_time: new Date('2025-07-10T17:00:00'),
    break_duration: 1,
    staff_needed: 4,
    staff_assigned: 3,
    submission_cycle: 'SECONDARY',
    status: "Open",
    created_at: new Date(),
}

const mockedSelectShift = vi.fn();

describe("PastShiftCard test suite", ()=>{
    it("Displays all information from shift", ()=>{
        const selectedShift = mockedShift;
        render(<PastShiftCard shift={mockedShift} selectedShift={null} handleSelectShift={mockedSelectShift}/>)
        expect(screen.getByText("Data Scientist")).toBeTruthy();
        expect(screen.getByText("3")).toBeTruthy();
        expect(screen.getByText("09:00 AM - 05:00 PM")).toBeTruthy();
        expect(screen.getByText("Thursday, 10/07/2025")).toBeTruthy();
        const container = screen.getByTestId("past-shift-card");
        expect(container.className).toContain("border-[#B3B3B3]");
        fireEvent.click(container);
        expect(mockedSelectShift).toBeCalledWith(mockedShift);
    })
    it("shift is the selected Shift", ()=>{
        const selectedShift = mockedShift;
        render(<PastShiftCard shift={mockedShift} selectedShift={mockedShift} handleSelectShift={mockedSelectShift}/>)
        expect(screen.getByText("Data Scientist")).toBeTruthy();
        expect(screen.getByText("3")).toBeTruthy();
        expect(screen.getByText("09:00 AM - 05:00 PM")).toBeTruthy();
        expect(screen.getByText("Thursday, 10/07/2025")).toBeTruthy();
        const container = screen.getByTestId("past-shift-card");
        expect(container.className).toContain("border-primary-blue");
        fireEvent.click(container);
        expect(mockedSelectShift).toBeCalledWith(mockedShift);
    })
})