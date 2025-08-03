import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { addDays, subDays } from 'date-fns';
import {Shift} from "../../src/types/hooks"
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
 import ClientDbContainer from '../../src/pages/employer/ClientDbContainer';



 let mockedShifts = [
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
      start_time: addDays(new Date(), 12), 
      end_time: addDays(new Date(), 12), 
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
      start_time: addDays(new Date(), 3), 
      end_time: addDays(new Date(), 3),
      break_duration: 1.0, 
      staff_needed: 5,
      staff_assigned: 3,
      submission_cycle: "PRIMARY",
      status: "Open",
      created_at: new Date(),
    }
];

const mockGetAvailability = vi.fn();
const mockSetAvailability = vi.fn();


const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockedUseNavigate,
}));



describe("ClientDbContainer dashboard test suite", ()=>{

    it("Empty Array of shifts", () => {
        mockedShifts = [];
        const mockShiftsHook = {
            shifts: mockedShifts,
        };
        vi.doMock('../../src/hooks/useShifts', () => ({
            useShifts: () => mockShiftsHook,
        }));
        render(<ClientDbContainer/>)
        const shiftCards = screen.queryAllByTestId("shift-card");
        expect(shiftCards.length).toBe(0);
      });
    
      it("Single shift, out of range of this week", () => {
        const mockedShifts: Shift[] = [
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
            start_time: addDays(new Date(), 8),
            end_time: addDays(new Date(), 8.5),
            break_duration: 1,
            staff_needed: 5,
            staff_assigned: 3,
            submission_cycle: 'PRIMARY',
            status: "Open",
            created_at: new Date(),
          },
        ];
        const mockShiftsHook = {
            shifts: mockedShifts,
        };
        vi.doMock('../../src/hooks/useShifts', () => ({
            useShifts: () => mockShiftsHook,
        }));
        render(<ClientDbContainer/>)
        const shiftCards = screen.queryAllByTestId("shift-card");
        expect(shiftCards.length).toBe(0);
      });
    
      it("Single shift, is within the current week, staff assigned less than needed", async () => {
        const mockedShifts: Shift[] = [
          {
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
            start_time: addDays(new Date(), 1), // A date within the current week
            end_time: addDays(new Date(), 2),
            break_duration: 1,
            staff_needed: 4,
            staff_assigned: 2,
            submission_cycle: 'PRIMARY',
            status: "Open",
            created_at: new Date(),
          },
        ];
        const mockShiftsHook = {
            shifts: mockedShifts,
        };
        vi.doMock('../../src/hooks/useShifts', () => ({
            useShifts: () => mockShiftsHook,
        }));
        render(<ClientDbContainer/>)
        const shiftCards = await screen.queryAllByTestId("shift-card");
        expect(shiftCards.length).toBe(1);
        const inProgress = await screen.getByTestId("dashboard-in-progress");
        shiftCards.forEach((shiftCard)=>expect(inProgress).toContainElement(shiftCard));
      });
    
      it("should return an empty array when all shifts are out of the current week", () => {
        const shifts: Shift[] = [
          {
            shift_id: "shift003",
            employer_name: "Company C",
            company_name: "Company C",
            job_title: "UX Designer",
            job_location: "Singapore",
            postal_code: 789012,
            job_description: "Designing user interfaces",
            job_requirements: "3+ years experience",
            job_type: "Full-time",
            pay_rate: 60,
            start_time: new Date('2025-07-20T09:00:00'), // A date out of the current week
            end_time: new Date('2025-07-20T17:00:00'),
            break_duration: 1,
            staff_needed: 6,
            staff_assigned: 6,
            submission_cycle: 'SECONDARY',
            status: "Open",
            created_at: new Date(),
          },
          {
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
          },
        ];
      });
    
      it("should return all shifts within the current week", () => {
        const shifts: Shift[] = [
          {
            shift_id: "shift005",
            employer_name: "Company E",
            company_name: "Company E",
            job_title: "Software Engineer",
            job_location: "Singapore",
            postal_code: 123456,
            job_description: "Developing new features",
            job_requirements: "3+ years experience",
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
          {
            shift_id: "shift006",
            employer_name: "Company F",
            company_name: "Company F",
            job_title: "Project Manager",
            job_location: "Singapore",
            postal_code: 654321,
            job_description: "Managing projects",
            job_requirements: "5+ years experience",
            job_type: "Full-time",
            pay_rate: 60,
            start_time: new Date('2025-08-04T09:00:00'),
            end_time: new Date('2025-08-04T17:00:00'),
            break_duration: 1,
            staff_needed: 4,
            staff_assigned: 2,
            submission_cycle: 'PRIMARY',
            status: "Open",
            created_at: new Date(),
          },
        ];
      });
    
      it("should return only shifts that are within the current week (some shifts in/out)", () => {
        const shifts: Shift[] = [
          {
            shift_id: "shift007",
            employer_name: "Company G",
            company_name: "Company G",
            job_title: "Backend Developer",
            job_location: "Singapore",
            postal_code: 123456,
            job_description: "Developing server-side applications",
            job_requirements: "3+ years experience",
            job_type: "Full-time",
            pay_rate: 50,
            start_time: new Date('2025-08-01T09:00:00'), // Within the current week
            end_time: new Date('2025-08-01T17:00:00'),
            break_duration: 1,
            staff_needed: 5,
            staff_assigned: 3,
            submission_cycle: 'PRIMARY',
            status: "Open",
            created_at: new Date(),
          },
          {
            shift_id: "shift008",
            employer_name: "Company H",
            company_name: "Company H",
            job_title: "Frontend Developer",
            job_location: "Singapore",
            postal_code: 654321,
            job_description: "Creating UI components",
            job_requirements: "3+ years experience",
            job_type: "Full-time",
            pay_rate: 60,
            start_time: new Date('2025-07-25T09:00:00'), // Out of the current week
            end_time: new Date('2025-07-25T17:00:00'),
            break_duration: 1,
            staff_needed: 4,
            staff_assigned: 4,
            submission_cycle: 'PRIMARY',
            status: "Open",
            created_at: new Date(),
          },
        ];
    });


    // it("Upcoming renders shifts from current week", async ()=>{
    //     render(<ClientDbContainer />);
    //     const upcoming = await screen.findByTestId("dashboard-upcoming");
    //     expect(upcoming).toBeTruthy();
    //     const header = await screen.findByText(/Software Engineer/i);
    //     expect(header).toBeTruthy();
    //     expect(upcoming).toContainElement(header);
    // })

    // it ("Upcoming does not render shift outside of current week", async ()=>{
    //     render(<ClientDbContainer />);
    //     const upcoming = await screen.findByTestId("dashboard-upcoming");
    //     expect(upcoming).toBeTruthy();
    //     const title = await screen.queryByText(/Data Analyst/i);
    //     expect(title).toBeNull();
    // }) 

    // it ("In Progress only shows shifts where staff_assigned less than staff_needed", async() =>{
    //     render(<ClientDbContainer />);
    //     const inProgress = await screen.findByTestId("dashboard-in-progress");
    //     expect(inProgress).toBeTruthy();
    //     const lessThan = await screen.queryByText(/Product Manager/i);
    //     expect(lessThan).toBeTruthy();
    //     expect(inProgress).toContainElement(lessThan);
    //     const moreThan = await screen.queryByText(/Software Engineer/i);
    //     expect(moreThan).toBeTruthy();
    //     expect(inProgress).not.toContainElement(moreThan)
    // })

    // it ("Filled count is displayed correctly ", async() =>{
    //     render(<ClientDbContainer />);
    //     const positions = await screen.findByTestId("dashboard-positions");
    //     expect(positions).toBeTruthy();
    //     const filledText = await screen.findByText("8/10");
    //     expect(filledText).toBeTruthy();
    //     const percentText = await screen.findByText("80%");
    //     expect(percentText).toBeTruthy();
    // })

    // it("navigates to the upload jobs page when the Upload Jobs button is clicked", async () => {
    //     render(<ClientDbContainer />);
    //     const uploadButton = await screen.findByRole('button', { name: "Upload Jobs" });
    //     fireEvent.click(uploadButton);
    //     expect(mockedUseNavigate).toHaveBeenCalled(); 
    //     expect(mockedUseNavigate).toHaveBeenCalledWith("/employer/uploadjobs");  
    // });
})

