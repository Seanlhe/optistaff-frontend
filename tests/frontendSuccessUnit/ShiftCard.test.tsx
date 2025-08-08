import React from 'react';
import { describe } from "node:test";
import { beforeAll, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Shift } from "../../src/types/hooks";
import ShiftCard from "../../src/components/ShiftCard";
import {format} from "date-fns"
import { useState } from "react";



const mockedDeleteShift = vi.fn();

const mockShiftsHook = {
    deleteShift: mockedDeleteShift
};

vi.mock('../../src/hooks/useShifts', () => ({
  useShifts: () => mockShiftsHook,
}));

let shift: Shift = {
    shift_id: "shift001",
    employer_name: "Company A",
    company_name: "Company A",
    job_title: "Software Engineer",
    job_location: "Singapore",
    postal_code: 123456,
    job_description: "Developing new features",
    job_requirements: "3+ years experience in JavaScript",
    job_type: "Full-time",
    pay_rate: 50,
    start_time: new Date('2025-08-01T09:00:00'),
    end_time: new Date('2025-08-01T17:00:00'),
    break_duration: 1, // 1 hour
    staff_needed: 5,
    staff_assigned: 3,
    submission_cycle: 'PRIMARY',
    status: "Open",
    created_at: new Date(),
};

const handleManageClick = vi.fn();


describe("ShiftCard test suite", ()=>{
    beforeAll(() => {
        // Mock the window.confirm to always return true (i.e., always confirm deletion)
        window.confirm = vi.fn().mockReturnValue(true);
    });


    it("No staff assigned", ()=>{
        shift = {...shift, staff_assigned: 0};
        render(<ShiftCard shift={shift} handleManageClick={handleManageClick}/>)
        const titleText = screen.getByText(shift.job_title);
        expect(titleText).toBeTruthy();
        const dateText = screen.getByText(format(shift.start_time, "EEEE, dd/MM/yyyy"));
        expect(dateText).toBeTruthy();
        const timeText = screen.getByText(`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`);
        expect(timeText).toBeTruthy();
        const filledText = screen.getByText(`${shift.staff_assigned} / ${shift.staff_needed}`);
        expect(filledText).toBeTruthy();
        const manageBtn = screen.getByRole("button", {name: "Manage"});
        expect(manageBtn).toBeTruthy();
        fireEvent.click(manageBtn);
        expect(handleManageClick).toBeCalledWith(shift);
        const deleteBtn = screen.getByRole("button", {name: "Delete"});
        fireEvent.click(deleteBtn);
        expect(mockedDeleteShift).toBeCalledWith(shift.shift_id);
    })


    it("1 staff assigned", ()=>{
        shift = {...shift, staff_assigned: 1};
        render(<ShiftCard shift={shift} handleManageClick={handleManageClick}/>)
        const titleText = screen.getByText(shift.job_title);
        expect(titleText).toBeTruthy();
        const dateText = screen.getByText(format(shift.start_time, "EEEE, dd/MM/yyyy"));
        expect(dateText).toBeTruthy();
        const timeText = screen.getByText(`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`);
        expect(timeText).toBeTruthy();
        const filledText = screen.getByText(`${shift.staff_assigned} / ${shift.staff_needed}`);
        expect(filledText).toBeTruthy();
        const manageBtn = screen.getByRole("button", {name: "Manage"});
        expect(manageBtn).toBeTruthy();
        fireEvent.click(manageBtn);
        expect(handleManageClick).toBeCalledWith(shift);
        const deleteBtn = screen.getByRole("button", {name: "Delete"});
        fireEvent.click(deleteBtn);
        expect(mockedDeleteShift).toBeCalledWith(shift.shift_id);
    })


    it("staff assigned < staff needed and staff_assigned > 0", ()=>{
        render(<ShiftCard shift={shift} handleManageClick={handleManageClick}/>)
        const titleText = screen.getByText(shift.job_title);
        expect(titleText).toBeTruthy();
        const dateText = screen.getByText(format(shift.start_time, "EEEE, dd/MM/yyyy"));
        expect(dateText).toBeTruthy();
        const timeText = screen.getByText(`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`);
        expect(timeText).toBeTruthy();

        const filledText = screen.getByText(`${shift.staff_assigned} / ${shift.staff_needed}`);
        expect(filledText).toBeTruthy();
        const manageBtn = screen.getByRole("button", {name: "Manage"});
        expect(manageBtn).toBeTruthy();
        fireEvent.click(manageBtn);
        expect(handleManageClick).toBeCalledWith(shift);
        const deleteBtn = screen.getByRole("button", {name: "Delete"});
        fireEvent.click(deleteBtn);
        expect(mockedDeleteShift).toBeCalledWith(shift.shift_id);
    })

    it("1 less than max available slots are filled", ()=>{
        shift = {...shift, staff_assigned: shift.staff_needed - 1};
        render(<ShiftCard shift={shift} handleManageClick={handleManageClick}/>)
        const titleText = screen.getByText(shift.job_title);
        expect(titleText).toBeTruthy();
        const dateText = screen.getByText(format(shift.start_time, "EEEE, dd/MM/yyyy"));
        expect(dateText).toBeTruthy();
        const timeText = screen.getByText(`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`);
        expect(timeText).toBeTruthy();
        const filledText = screen.getByText(`${shift.staff_assigned} / ${shift.staff_needed}`);
        expect(filledText).toBeTruthy();
        const manageBtn = screen.getByRole("button", {name: "Manage"});
        expect(manageBtn).toBeTruthy();
        fireEvent.click(manageBtn);
        expect(handleManageClick).toBeCalledWith(shift);
        const deleteBtn = screen.getByRole("button", {name: "Delete"});
        fireEvent.click(deleteBtn);
        expect(mockedDeleteShift).toBeCalledWith(shift.shift_id);
    })

    it("All available slots are filled", ()=>{
        shift = {...shift, staff_assigned: 5};
        render(<ShiftCard shift={shift} handleManageClick={handleManageClick}/>)
        const titleText = screen.getByText(shift.job_title);
        expect(titleText).toBeTruthy();
        const dateText = screen.getByText(format(shift.start_time, "EEEE, dd/MM/yyyy"));
        expect(dateText).toBeTruthy();
        const timeText = screen.getByText(`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`);
        expect(timeText).toBeTruthy();
        const filledText = screen.getByText("5");
        expect(filledText).toBeTruthy();
        const manageBtn = screen.getByRole("button", {name: "Manage"});
        expect(manageBtn).toBeTruthy();
        fireEvent.click(manageBtn);
        expect(handleManageClick).toBeCalledWith(shift);
        const deleteBtn = screen.getByRole("button", {name: "Delete"});
        fireEvent.click(deleteBtn);
        expect(mockedDeleteShift).toBeCalledWith(shift.shift_id);
    })


})