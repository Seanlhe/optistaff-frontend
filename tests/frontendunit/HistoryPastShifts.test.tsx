import React from 'react';
import { describe } from "node:test";
import { beforeAll, expect, it, vi, beforeEach } from "vitest";
import {HistoryPastShifts} from "../../src/pages/employer/ClientHistory"
import { Shift } from '../../src/types/hooks';
import { fireEvent, render, screen, within } from '@testing-library/react';

const handleClick = vi.fn()
const handleSort = vi.fn()
const mockedShifts: Shift[] = []

describe("HistoryPastShifts test suite", ()=>{
    beforeEach(() => {
        handleClick.mockReset();
      });
    it('Empty Assignments Array', () => {
        render(<HistoryPastShifts pastShifts={mockedShifts} handleSelectShift={handleClick} handleSort={handleSort} selectedShift={null}/>)
        expect(screen.queryAllByTestId("past-shift-card").length).toBe(0)
    });
    it("Shift array with 1 shift, not selected", async ()=>{
        mockedShifts.push({
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
          });
        render(<HistoryPastShifts pastShifts={mockedShifts} handleSelectShift={handleClick} handleSort={handleSort} selectedShift={null}/>)
        expect(screen.queryAllByTestId("past-shift-card").length).toBe(1)
        expect(screen.getByText("Data Scientist")).toBeTruthy();
        expect(screen.getByText("3")).toBeTruthy();
        expect(screen.getByText("09:00 AM - 05:00 PM")).toBeTruthy();
        expect(screen.getByText("Thursday, 10/07/2025")).toBeTruthy();
        const container = screen.getByTestId("past-shift-card");
        expect(container.className).toContain("border-[#B3B3B3]");
        fireEvent.click(container);
        expect(handleClick).toBeCalledWith(mockedShifts[0]);
    })

    it("Shift array with 1 shift, selected", async ()=>{
        render(<HistoryPastShifts pastShifts={mockedShifts} handleSelectShift={handleClick} handleSort={handleSort} selectedShift={mockedShifts[0]}/>)
        expect(screen.queryAllByTestId("past-shift-card").length).toBe(1)
        expect(screen.getByText("Data Scientist")).toBeTruthy();
        expect(screen.getByText("3")).toBeTruthy();
        expect(screen.getByText("09:00 AM - 05:00 PM")).toBeTruthy();
        expect(screen.getByText("Thursday, 10/07/2025")).toBeTruthy();
        const container = screen.getByTestId("past-shift-card");
        expect(container.className).toContain("border-primary-blue");
        fireEvent.click(container);
        expect(handleClick).toBeCalledWith(mockedShifts[0]);
    })

    it("Shift array with multiple shifts, none selected", ()=>{
        mockedShifts.push({
            shift_id: "shift001",
            employer_name: "GreenTech Solutions",
            company_name: "GreenTech Solutions",
            job_title: "Logistics Assistant",
            job_location: "10 Ubi Crescent",
            postal_code: 408564,
            job_description: "Assist with packing, moving, and inventory tracking in the warehouse.",
            job_requirements: "Physically fit, basic English, able to use barcode scanner.",
            job_type: "Part-Time",
            pay_rate: 13.5,
            start_time: new Date("2025-08-06T08:30:00"),
            end_time: new Date("2025-08-06T17:00:00"),
            break_duration: 1,
            staff_needed: 5,
            staff_assigned: 4,
            submission_cycle: "PRIMARY",
            status: "Confirmed",
            created_at: new Date("2025-08-01T10:15:00"),
          });
        render(<HistoryPastShifts pastShifts={mockedShifts} handleSelectShift={handleClick} handleSort={handleSort} selectedShift={null}/>)
        const shiftCards = screen.queryAllByTestId("past-shift-card");
        expect(shiftCards.length).toBe(2);
        const firstCard = within(shiftCards[0]);
        expect(shiftCards[0].className).toContain("border-[#B3B3B3]")
        expect(firstCard.getByText("Data Scientist")).toBeTruthy();
        expect(firstCard.getByText("3")).toBeTruthy();
        expect(firstCard.getByText("09:00 AM - 05:00 PM")).toBeTruthy();
        expect(firstCard.getByText("Thursday, 10/07/2025")).toBeTruthy();
        fireEvent.click(shiftCards[0]);
        expect(handleClick).toBeCalledWith(mockedShifts[0]);

        const secondCard = within(shiftCards[1]);
        expect(shiftCards[1].className).toContain("border-[#B3B3B3]")
        expect(secondCard.getByText("Logistics Assistant")).toBeTruthy();
        expect(secondCard.getByText("4")).toBeTruthy();
        expect(secondCard.getByText("08:30 AM - 05:00 PM")).toBeTruthy();
        expect(secondCard.getByText("Wednesday, 06/08/2025")).toBeTruthy();
        fireEvent.click(shiftCards[1]);
        expect(handleClick).toBeCalledWith(mockedShifts[1]);
    })

    it("Shift array with multiple shifts, one selected", ()=>{
        render(<HistoryPastShifts pastShifts={mockedShifts} handleSelectShift={handleClick} handleSort={handleSort} selectedShift={mockedShifts[0]}/>)
        const shiftCards = screen.queryAllByTestId("past-shift-card");
        expect(shiftCards.length).toBe(2);
        const firstCard = within(shiftCards[0]);
        expect(shiftCards[0].className).toContain("border-primary-blue")
        expect(firstCard.getByText("Data Scientist")).toBeTruthy();
        expect(firstCard.getByText("3")).toBeTruthy();
        expect(firstCard.getByText("09:00 AM - 05:00 PM")).toBeTruthy();
        expect(firstCard.getByText("Thursday, 10/07/2025")).toBeTruthy();
        fireEvent.click(shiftCards[0]);
        expect(handleClick).toBeCalledWith(mockedShifts[0]);

        const secondCard = within(shiftCards[1]);
        expect(shiftCards[1].className).toContain("border-[#B3B3B3]")
        expect(secondCard.getByText("Logistics Assistant")).toBeTruthy();
        expect(secondCard.getByText("4")).toBeTruthy();
        expect(secondCard.getByText("08:30 AM - 05:00 PM")).toBeTruthy();
        expect(secondCard.getByText("Wednesday, 06/08/2025")).toBeTruthy();
        fireEvent.click(shiftCards[1]);
        expect(handleClick).toBeCalledWith(mockedShifts[1]);
    })
})

