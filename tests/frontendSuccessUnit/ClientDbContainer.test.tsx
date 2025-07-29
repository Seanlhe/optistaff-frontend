import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, test } from '@testing-library/react';
 import ClientDbContainer from '../../src/pages/employer/ClientDbContainer';

const mockedShifts = vi.hoisted(()=>{
        return[{
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
        start_time: new Date(2025, 6, 31, 9, 0),  // Start on 31st July, 9:00 AM
        end_time: new Date(2025, 6, 31, 17, 0),  // End on 31st July, 5:00 PM
        break_duration: 1.0,  // 1 hour break
        staff_needed: 5,
        staff_assigned: 3,
        submission_cycle: "PRIMARY",
        status: "Open",
        created_at: new Date(),
      }];
})

vi.mock('../../src/hooks/useShifts', async (importOriginal)=>{
    const actual = await importOriginal();
    return {
        ...actual,
        shifts: mockedShifts
    }
})

describe("ClientDbContainer test suite", ()=>{
    it("ShiftCard renders 1 object", async ()=>{
        render(<ClientDbContainer/>)
        const inProgress = await screen.findByTestId("dashboard-upcoming");
        expect(inProgress).toBeInTheDocument();
    })
})