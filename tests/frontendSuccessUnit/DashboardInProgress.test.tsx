import React from 'react';
import { describe } from "node:test";
import { beforeAll, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Shift } from "../../src/types/hooks";
import { DashboardInProgress } from '../../src/pages/employer/ClientDashboard';
import {format, addDays} from "date-fns"

let shifts: Shift[] = [
    {
      shift_id: "shift001",
      employer_name: "Company A",
      company_name: "Tech Corp",
      job_title: "Software Engineer",
      job_location: "Singapore",
      postal_code: 123456,
      job_description: "Develop software solutions.",
      job_requirements: "Experience in React and Node.js.",
      job_type: "Full-time",
      pay_rate: 45.50,
      start_time: addDays(new Date(), 3),
      end_time: addDays(new Date(), 3),
      break_duration: 1.0, 
      staff_needed: 5,
      staff_assigned: 5,
      submission_cycle: "PRIMARY",
      status: "Open",
      created_at: new Date(),
    },
    {
      shift_id: "shift002",
      employer_name: "Company B",
      company_name: "Tech Corp",
      job_title: "Data Analyst",
      job_location: "Singapore",
      postal_code: 123456,
      job_description: "Develop software solutions.",
      job_requirements: "Experience in React and Node.js.",
      job_type: "Full-time",
      pay_rate: 45.50,
      start_time: addDays(new Date(), 4), 
      end_time: addDays(new Date(), 4), 
      break_duration: 1.0,  // 1 hour break
      staff_needed: 5,
      staff_assigned: 3,
      submission_cycle: "PRIMARY",
      status: "Open",
      created_at: new Date(),
    },
    {
      shift_id: "shift003",
      employer_name: "Company C",
      company_name: "Tech Corp",
      job_title: "Product Manager",
      job_location: "Singapore",
      postal_code: 123456,
      job_description: "Develop software solutions.",
      job_requirements: "Experience in React and Node.js.",
      job_type: "Full-time",
      pay_rate: 45.50,
      start_time: addDays(new Date(), 5), 
      end_time: addDays(new Date(), 5),
      break_duration: 1.0, 
      staff_needed: 5,
      staff_assigned: 3,
      submission_cycle: "PRIMARY",
      status: "Open",
      created_at: new Date(),
    }
];
const handleManageClick = vi.fn()

const mockedDeleteShift = vi.fn();

const mockShiftsHook = {
    deleteShift: mockedDeleteShift
};

vi.mock('../../src/hooks/useShifts', () => ({
  useShifts: () => mockShiftsHook,
}));



describe("DashboardInProgress test suite", ()=>{
    beforeAll(() => {
        // Mock the window.confirm to always return true (i.e., always confirm deletion)
        window.confirm = vi.fn().mockReturnValue(true);
    });

    it("No shifts are present", ()=>{
        render(<DashboardInProgress shifts={[]} handleManageClick={handleManageClick}/>)
        const header = screen.getByText("In Progress");
        expect(header).toBeTruthy();
        const shiftCard = screen.queryByTestId("shift-card");
        expect(shiftCard).toBeFalsy();
        
    })

    it("More than 1 shifts are present", async ()=>{
        render(<DashboardInProgress shifts={shifts} handleManageClick={handleManageClick}/>)
        const header = screen.getByText("In Progress");
        expect(header).toBeTruthy();
        const validShifts = shifts.filter((shift)=>{return shift.staff_assigned < shift.staff_needed})
        const shiftCards = await screen.getAllByTestId("shift-card");
        const manageBtns = await screen.getAllByRole("button", { name: "Manage" })
        const deleteBtns = await screen.getAllByRole("button", {name: "Delete"});
        expect(shiftCards.length).toBe(validShifts.length);
        validShifts.forEach((shift, index)=>{
            const manageBtn = manageBtns[index];
            expect(manageBtn).toBeTruthy(); 
            fireEvent.click(manageBtn);
            expect(handleManageClick).toBeCalledWith(shift);
            const deleteBtn = deleteBtns[index];
            expect(deleteBtn).toBeTruthy();
            fireEvent.click(deleteBtn);
            expect(mockedDeleteShift).toBeCalledWith(shift.shift_id);
        })
    })
})