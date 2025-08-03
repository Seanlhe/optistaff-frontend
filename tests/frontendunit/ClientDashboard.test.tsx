import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientDashboard from '../../src/pages/employer/ClientDashboard';
import { Shift } from '../../src/types/hooks'; 
import { vi, describe, expect, it, beforeAll } from 'vitest';


// Mock the useNavigate function for navigation tests

const mockedHandleClick = vi.fn();
const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockedUseNavigate,
}));

const shifts: Shift[] = [
    {
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
        break_duration: 1,
        staff_needed: 5,
        staff_assigned: 3,
        submission_cycle: 'PRIMARY',
        status: "Open",
        created_at: new Date(),
    },
];

describe("ClientDashboard", () => {

    it("No shifts are present", () => {
        render(<ClientDashboard shifts={[]} handleManageClick={mockedHandleClick} />);
        expect(screen.getByText("Positions")).toBeTruthy();
        expect(screen.getByText("0/0")).toBeTruthy();
        expect(screen.getByText("0%")).toBeTruthy();
    });

    it("One shift with staff assigned < staff needed", () => {
        render(<ClientDashboard shifts={shifts} handleManageClick={mockedHandleClick} />);
        expect(screen.getByText("Positions")).toBeTruthy();
        expect(screen.getByText("3/5")).toBeTruthy();
        expect(screen.getByText("60%")).toBeTruthy();
    });

    it("One shift with staff assigned == staff needed", () => {
        shifts[0].staff_assigned = shifts[0].staff_needed = 5;
        render(<ClientDashboard shifts={shifts} handleManageClick={mockedHandleClick} />);
        expect(screen.getByText("Positions")).toBeTruthy();
        expect(screen.getByText("5/5")).toBeTruthy();
        expect(screen.getByText("100%")).toBeTruthy();
    });

    it("Multiple shifts with different staff assigned", () => {
        shifts.push({
            shift_id: "shift002",
            employer_name: "Company B",
            company_name: "Company B",
            job_title: "Product Manager",
            job_location: "Singapore",
            postal_code: 654321,
            job_description: "Managing product",
            job_requirements: "5+ years experience",
            job_type: "Full-time",
            pay_rate: 70,
            start_time: new Date('2025-08-02T09:00:00'),
            end_time: new Date('2025-08-02T17:00:00'),
            break_duration: 1,
            staff_needed: 4,
            staff_assigned: 2,
            submission_cycle: 'PRIMARY',
            status: "Open",
            created_at: new Date(),
        });
        render(<ClientDashboard shifts={shifts} handleManageClick={mockedHandleClick} />);
        expect(screen.getByText("Positions")).toBeTruthy();
        expect(screen.getByText("7/9")).toBeTruthy();
        expect(screen.getByText("77%")).toBeTruthy();
    });

    it("Multiple shifts with all staff assigned", () => {
        shifts[1].staff_assigned = 4
        render(<ClientDashboard shifts={shifts} handleManageClick={mockedHandleClick} />);
        expect(screen.getByText("Positions")).toBeTruthy();
        expect(screen.getByText("9/9")).toBeTruthy();
        expect(screen.getByText("100%")).toBeTruthy();
    });

    it("Multiple shifts with no staff assigned", () => {
        shifts.forEach((shift)=>shift.staff_assigned = 0);
        render(<ClientDashboard shifts={shifts} handleManageClick={mockedHandleClick} />);
        expect(screen.getByText("Positions")).toBeTruthy();
        expect(screen.getByText("0/9")).toBeTruthy();
        expect(screen.getByText("0%")).toBeTruthy();
    });

    it("Should navigate to upload jobs when 'Upload Jobs' is clicked", () => {
    render(<ClientDashboard shifts={shifts} handleManageClick={mockedHandleClick} />);
    fireEvent.click(screen.getByText("Upload Jobs"));
    expect(mockedUseNavigate).toHaveBeenCalledWith("/employer/uploadjobs");
    });
});
