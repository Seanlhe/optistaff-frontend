import React from 'react';
import { describe, mock } from "node:test";
import { beforeAll, expect, it, vi, beforeEach } from "vitest";
import ClientHistory from "../../src/pages/employer/ClientHistory"
import { Shift, Assignment} from '../../src/types/hooks';
import { fireEvent, render, screen, within } from '@testing-library/react';

vi.mock("../../src/components/HistoryAssignedStaff", () => ({
  default: vi.fn(({ assignments }: { assignments: Assignment[] }) => (
    <div data-testid="history-assigned-staff">
      {assignments.map((a) => (
        <div data-testid="mocked-employee-card" key={a.employee_name}>{a.employee_name}</div>
      ))}
    </div>
  )),
}));

vi.mock("../../src/components/HistoryPastShifts", () => ({
  default: vi.fn(({ pastShifts, handleSelectShift }: { pastShifts: Shift[], handleSelectShift: Function }) => (
    <div data-testid="history-past-shifts">
      {pastShifts.map((shift) => (
        <div data-testid="mocked-shift-card" key={shift.shift_id} onClick={()=>handleSelectShift(shift)}>{shift.job_title}</div>
      ))}
    </div>
  )),
}));

const mockedShifts: Shift[] = [
  {
    shift_id: "shift101",
    employer_name: "Alpha Corp",
    company_name: "Alpha Corp",
    job_title: "Warehouse Assistant",
    job_location: "1 Kaki Bukit Ave",
    postal_code: 416123,
    job_description: "Handle goods and restocking",
    job_requirements: "Physically fit, safety shoes",
    job_type: "Part-Time",
    pay_rate: 15.0,
    start_time: new Date("2025-07-10T08:00:00"), // July 10 (Thu)
    end_time: new Date("2025-07-10T17:00:00"),
    break_duration: 1,
    staff_needed: 3,
    staff_assigned: 2,
    submission_cycle: "PRIMARY",
    status: "Completed",
    created_at: new Date("2025-07-05T10:00:00"),
  },
  {
    shift_id: "shift102",
    employer_name: "Beta Logistics",
    company_name: "Beta Logistics",
    job_title: "Delivery Rider",
    job_location: "20 Jurong West St 65",
    postal_code: 648123,
    job_description: "Deliver packages in west region",
    job_requirements: "Own vehicle preferred",
    job_type: "Contract",
    pay_rate: 18.0,
    start_time: new Date("2025-07-15T10:00:00"), // July 15 (Tue)
    end_time: new Date("2025-07-15T19:00:00"),
    break_duration: 1,
    staff_needed: 5,
    staff_assigned: 5,
    submission_cycle: "SECONDARY",
    status: "Completed",
    created_at: new Date("2025-07-10T09:00:00"),
  },
  {
    shift_id: "shift103",
    employer_name: "Gamma Foods",
    company_name: "Gamma Foods",
    job_title: "Kitchen Crew",
    job_location: "123 Clementi Rd",
    postal_code: 129456,
    job_description: "Prep food and clean kitchen",
    job_requirements: "Food hygiene cert preferred",
    job_type: "Full-Time",
    pay_rate: 12.5,
    start_time: new Date("2025-07-01T09:00:00"), // July 1 (Tue)
    end_time: new Date("2025-07-01T17:00:00"),
    break_duration: 1,
    staff_needed: 4,
    staff_assigned: 3,
    submission_cycle: "PRIMARY",
    status: "Completed",
    created_at: new Date("2025-06-25T14:00:00"),
  },
];

const mockedAssignments: Assignment[] = [
  {
    assignment_id: "assign001",
    company_name: "Alpha Corp",
    employee_name: "John Tan",
    employer_name: "Alice Lim",
    employee_id: "emp001",
    job_title: "Warehouse Assistant",
    job_location: "1 Kaki Bukit Ave",
    postal_code: "416123",
    job_description: "Handle goods and restocking",
    job_requirements: "Physically fit, safety shoes",
    job_type: "Part-Time",
    pay_rate: 15.0,
    start_time: "2025-07-10T08:00:00",
    end_time: "2025-07-10T17:00:00",
    break_hours: 1,
    contact_number: "91234567",
    contact_email: "john.tan@example.com",
    check_in_time: "2025-07-10T08:05:00",
    check_out_time: "2025-07-10T17:00:00",
    status: "Completed",
    created_at: "2025-07-01T09:00:00"
  },
  {
    assignment_id: "assign002",
    company_name: "Beta Logistics",
    employee_name: "Sara Lee",
    employer_name: "Ben Koh",
    employee_id: "emp002",
    job_title: "Delivery Rider",
    job_location: "20 Jurong West St 65",
    postal_code: "648123",
    job_description: "Deliver packages in west region",
    job_requirements: "Own vehicle preferred",
    job_type: "Contract",
    pay_rate: 18.0,
    start_time: "2025-07-15T10:00:00",
    end_time: "2025-07-15T19:00:00",
    break_hours: 1,
    contact_number: "98765432",
    contact_email: "sara.lee@example.com",
    check_in_time: "2025-07-15T10:01:00",
    check_out_time: "2025-07-15T19:00:00",
    status: "Completed",
    created_at: "2025-07-05T10:30:00"
  },
  {
    assignment_id: "assign003",
    company_name: "Gamma Foods",
    employee_name: "Marcus Ng",
    employer_name: "Cheryl Wong",
    employee_id: "emp003",
    job_title: "Kitchen Crew",
    job_location: "123 Clementi Rd",
    postal_code: "129456",
    job_description: "Prep food and clean kitchen",
    job_requirements: "Food hygiene cert preferred",
    job_type: "Full-Time",
    pay_rate: 12.5,
    start_time: "2025-07-01T09:00:00",
    end_time: "2025-07-01T17:00:00",
    break_hours: 1,
    contact_number: "90001111",
    contact_email: "marcus.ng@example.com",
    check_in_time: "2025-07-01T09:02:00",
    check_out_time: "2025-07-01T17:00:00",
    status: "Completed",
    created_at: "2025-06-28T14:00:00"
  }
];

const mockedFetchAssignments = vi.fn(async (shift_id: string) => {
  return mockedAssignments;
});

vi.mock("../../src/hooks/useShifts", () => ({
  useShifts: () => ({
    shifts: mockedShifts
  })
}));

vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: () => ({
    fetchAssignmentsByShift: mockedFetchAssignments
  })
}));

describe("ClientHistory unit test suite", ()=>{
    it('Renders HistoryAssignedStaff and HistoryPastShifts', async () => {
        render(<ClientHistory/>)
        const historyAssignedCard = screen.getByTestId("history-assigned-staff");
        expect(historyAssignedCard).toBeTruthy();
        const shiftCards = screen.queryAllByTestId("mocked-shift-card")
        expect(shiftCards.length).toBe(3);
        expect(screen.queryAllByTestId("history-past-shifts")).toBeTruthy();
        fireEvent.click(shiftCards[0]);
        expect(mockedFetchAssignments).toBeCalledWith(mockedShifts[0].shift_id);
        const employeeCards = await screen.findAllByTestId("mocked-employee-card");
        expect(employeeCards.length).toBe(3);
    });
})

