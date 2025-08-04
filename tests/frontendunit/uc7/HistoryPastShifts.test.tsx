import React from 'react';
import { describe } from "node:test";
import { beforeAll, expect, it, vi, beforeEach} from "vitest";
import HistoryPastShifts from '../../../src/components/HistoryPastShifts';
import { Shift } from '../../../src/types/hooks';
import { fireEvent, render, screen, within } from '@testing-library/react';

const handleClick = vi.fn()
const handleSort = vi.fn()
const mockedShifts: Shift[] = []

vi.mock("../../../src/components/PastShiftCard", () => ({
    default: vi.fn(() => (
      <div data-testid="mock-shift-card">Past Shift Card</div>
    )),
}));
  
describe("HistoryPastShifts test suite", ()=>{
    beforeEach(() => {
        handleClick.mockReset();
      });
    it('Empty Assignments Array', () => {
        render(<HistoryPastShifts pastShifts={mockedShifts} handleSelectShift={handleClick} handleSort={handleSort} selectedShift={null}/>)
        expect(screen.queryAllByTestId("mock-shift-card").length).toBe(0)
    });
    
    it("Shift array with 1 shift", async ()=>{
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
        expect(screen.queryAllByTestId("mock-shift-card").length).toBe(1)
    })


    it("Shift array with multiple shifts", ()=>{
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
        expect(screen.queryAllByTestId("mock-shift-card").length).toBe(2)
    })
})

