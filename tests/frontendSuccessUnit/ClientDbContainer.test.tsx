import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { addDays, subDays } from 'date-fns';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
 import ClientDbContainer from '../../src/pages/employer/ClientDbContainer';



 const mockedShifts = [
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
const mockShiftsHook = {
    shifts: mockedShifts,
    loading: false,
    error: null,
    createShift: vi.fn(),
    updateShift: vi.fn(),
    deleteShift: vi.fn(),
};

vi.mock('../../src/hooks/useShifts', () => ({
  useShifts: () => mockShiftsHook,
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));


describe("ClientDbContainer dashboard test suite", ()=>{
    it("Upcoming renders shifts from current week", async ()=>{
        render(<ClientDbContainer />);
        const upcoming = await screen.findByTestId("dashboard-upcoming");
        expect(upcoming).toBeTruthy();
        const header = await screen.findByText(/Software Engineer/i);
        expect(header).toBeTruthy();
        expect(upcoming).toContainElement(header);
    })

    it ("Upcoming does not render shift outside of current week", async ()=>{
        render(<ClientDbContainer />);
        const upcoming = await screen.findByTestId("dashboard-upcoming");
        expect(upcoming).toBeTruthy();
        const title = await screen.queryByText(/Data Analyst/i);
        expect(title).toBeNull();
    }) 

    it ("In Progress only shows shifts where staff_assigned less than staff_needed", async() =>{
        render(<ClientDbContainer />);
        const inProgress = await screen.findByTestId("dashboard-in-progress");
        expect(inProgress).toBeTruthy();
        const lessThan = await screen.queryByText(/Product Manager/i);
        expect(lessThan).toBeTruthy();
        expect(inProgress).toContainElement(lessThan);
        const moreThan = await screen.queryByText(/Software Engineer/i);
        expect(moreThan).toBeTruthy();
        expect(inProgress).not.toContainElement(moreThan)
    })

    it ("Filled count is displayed correctly ", async() =>{
        render(<ClientDbContainer />);
        const positions = await screen.findByTestId("dashboard-positions");
        expect(positions).toBeTruthy();
        const filledText = await screen.findByText("8/10");
        expect(filledText).toBeTruthy();
        const percentText = await screen.findByText("80%");
        expect(percentText).toBeTruthy();
    })

    it("navigates to the upload jobs page when the Upload Jobs button is clicked", async () => {
        const navigate = vi.fn();  // Create a mock function for navigate
        // Make sure useNavigate returns the mocked navigate function
        const { useNavigate } = require('react-router-dom');
        useNavigate.mockReturnValue(navigate);
        // Render the component
        render(<ClientDbContainer />);
    
        // Find the "Upload Jobs" button
        const uploadButton = await screen.findByRole('button', { name: "Upload Jobs" });
    
        // Simulate a click on the "Upload Jobs" button
        fireEvent.click(uploadButton);
    
        // Assert that the navigate function was called
        expect(navigate).toHaveBeenCalled();  // Check if navigate was called
    
        // Optionally, check if navigate was called with the correct URL
        expect(navigate).toHaveBeenCalledWith("/employer/uploadjobs");  // Check if navigate was called with the correct URL
    });
})


describe("ShiftCard Test Suite", async() =>{
    it ("Jobs with no staff assigned can have an edit button", async()=>{
        //TODO
    })

    it ("jobs with staff assigned can not have an edit button", async()=>{
        //TODO
    })
})