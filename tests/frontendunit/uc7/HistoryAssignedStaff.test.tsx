import React from 'react';
import { describe } from "node:test";
import {expect, it, vi, beforeEach } from "vitest";
import HistoryAssignedStaff from '../../../src/components/HistoryAssignedStaff';
import { Assignment } from '../../../src/types/hooks';
import { render, screen } from '@testing-library/react';

vi.mock("../../../src/components/EmployeeCard", () => ({
    default: vi.fn(() => (
      <div data-testid="mock-employee-card">Employee Card</div>
    )),
}));

const handleModalClick = vi.fn()
const mockedAssignments: Assignment[] = []

describe("HistoryAssignedStaff test suite", ()=>{
    beforeEach(() => {
        handleModalClick.mockReset();
      });

    it('Empty Assignments Array', () => {
        render(<HistoryAssignedStaff assignments={mockedAssignments} handleModalClick={handleModalClick} />)
        expect(screen.queryAllByTestId("mock-employee-card").length).toBe(0)
    });
    
    it("Assignment array with 1 assignment", async ()=>{
        mockedAssignments.push({
                assignment_id: "asg-123456",
                company_name: "Acme Pte Ltd",
                employee_name: "John Tan",
                employer_name: "Jane Lee",
                employee_id: "emp-987654",
                job_title: "Warehouse Assistant",
                job_location: "12 Jurong West Ave 3",
                postal_code: "648341",
                job_description: "Assist with packing, sorting, and inventory tracking in the warehouse.",
                job_requirements: "Able to lift up to 15kg, basic English proficiency.",
                job_type: "Part-Time",
                pay_rate: 12.5,
                start_time: "2025-08-03T09:00:00+08:00",
                end_time: "2025-08-03T18:00:00+08:00",
                break_hours: 1,
                contact_number: "81234567",
                contact_email: "jane.lee@acmepte.sg",
                check_in_time: null,
                check_out_time: null,
                status: "Pending",
                created_at: "2025-08-01T14:32:00+08:00"
        });
        render(<HistoryAssignedStaff assignments={mockedAssignments} handleModalClick={handleModalClick} />)
        expect(screen.queryAllByTestId("mock-employee-card").length).toBe(1)
    })

    it("Assignment array with multiple assignments", ()=>{
        mockedAssignments.push({
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
          })
            render(<HistoryAssignedStaff assignments={mockedAssignments} handleModalClick={handleModalClick} />)
            const cards = screen.queryAllByTestId("mock-employee-card");
            expect(cards.length).toBe(2);
    })
})

