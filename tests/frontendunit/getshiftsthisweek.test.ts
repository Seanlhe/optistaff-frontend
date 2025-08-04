import { getShiftsThisWeek } from '../../src/pages/employer/ClientDbContainer'; // Adjust the import path
import { Shift } from '../../src/types/hooks'; // Adjust the import path
import { vi, describe, it, expect } from 'vitest';

// Mock the current date to ensure consistent testing
const currentDateMock = new Date(2025, 7, 4); // Let's assume it's Monday, 4th August 2025 for testing purposes

describe("getShiftsThisWeek function", () => {

  it("should return an empty array when the shifts array is empty", () => {
    const shifts: Shift[] = [];
    const result = getShiftsThisWeek(shifts);
    expect(result).toEqual([]);
  });

  it("should return an empty array when the shift is outside the current week", () => {
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
        start_time: new Date('2025-07-25T09:00:00'),
        end_time: new Date('2025-07-25T17:00:00'),
        break_duration: 1,
        staff_needed: 5,
        staff_assigned: 3,
        submission_cycle: 'PRIMARY',
        status: "Open",
        created_at: new Date(),
      },
    ];
    const result = getShiftsThisWeek(shifts);
    expect(result).toEqual([]);
  });

  it("should return the shift when the shift is within the current week", () => {
    const shifts: Shift[] = [
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
        start_time: new Date('2025-08-03T09:00:00'), // A date within the current week
        end_time: new Date('2025-08-03T17:00:00'),
        break_duration: 1,
        staff_needed: 4,
        staff_assigned: 2,
        submission_cycle: 'PRIMARY',
        status: "Open",
        created_at: new Date(),
      },
    ];
    const result = getShiftsThisWeek(shifts);
    expect(result).toEqual(shifts); // The shift should be returned as it falls within the current week
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
    const result = getShiftsThisWeek(shifts);
    expect(result).toEqual([]); // No shifts should be returned as all are out of the current week
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
    const result = getShiftsThisWeek(shifts);
    expect(result).toEqual(shifts);
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
    const result = getShiftsThisWeek(shifts);
    expect(result).toEqual([shifts[0]]); // Only the shift within the current week should be returned
  });
});
