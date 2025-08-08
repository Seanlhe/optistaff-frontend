import {describe, it, test, expect } from 'vitest'
import { calculateFilled } from '../../src/pages/employer/ClientDashboard'
import { Shift } from '../../src/types/hooks'; 

describe("calculateFilled test suite", () => {
    it("Empty shifts array", () => {
      const result = calculateFilled([]);
      expect(result).toEqual([0, 0]);
    });

    it("Single shift with less staff assigned than needed", () => {
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
      const result = calculateFilled(shifts);
      expect(result).toEqual([3, 5]); // 3 assigned, 5 needed
    });

    it("Single shift with equal staff assigned and needed", () => {
      const shifts: Shift[] = [
        {
          shift_id: "shift002",
          employer_name: "Company B",
          company_name: "Company B",
          job_title: "Product Manager",
          job_location: "Singapore",
          postal_code: 654321,
          job_description: "Manage the product",
          job_requirements: "5+ years experience",
          job_type: "Full-time",
          pay_rate: 70,
          start_time: new Date('2025-08-02T09:00:00'),
          end_time: new Date('2025-08-02T17:00:00'),
          break_duration: 1,
          staff_needed: 5,
          staff_assigned: 5,
          submission_cycle: 'PRIMARY',
          status: "Open",
          created_at: new Date(),
        },
      ];
      const result = calculateFilled(shifts);
      expect(result).toEqual([5, 5]); // 5 assigned, 5 needed
    });

    it("Single shift with more staff assigned than needed", () => {
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
          start_time: new Date('2025-08-03T09:00:00'),
          end_time: new Date('2025-08-03T17:00:00'),
          break_duration: 1,
          staff_needed: 5,
          staff_assigned: 6,
          submission_cycle: 'SECONDARY',
          status: "Open",
          created_at: new Date(),
        },
      ];
      const result = calculateFilled(shifts);
      expect(result).toEqual([6, 5]); // 6 assigned, 5 needed
    });

    it("Multiple shifts with different staff assigned and needed", () => {
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
          start_time: new Date('2025-08-02T09:00:00'),
          end_time: new Date('2025-08-02T17:00:00'),
          break_duration: 1,
          staff_needed: 4,
          staff_assigned: 4,
          submission_cycle: 'PRIMARY',
          status: "Open",
          created_at: new Date(),
        },
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
          start_time: new Date('2025-08-03T09:00:00'),
          end_time: new Date('2025-08-03T17:00:00'),
          break_duration: 1,
          staff_needed: 6,
          staff_assigned: 6,
          submission_cycle: 'SECONDARY',
          status: "Open",
          created_at: new Date(),
        },
      ];
      const result = calculateFilled(shifts);
      expect(result).toEqual([13, 15]); // 13 assigned, 15 needed (3 + 4 + 6 assigned; 5 + 4 + 6 needed)
    });

    it("All shifts have 0 staff assigned", () => {
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
          staff_assigned: 0,
          submission_cycle: 'PRIMARY',
          status: "Open",
          created_at: new Date(),
        },
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
          start_time: new Date('2025-08-02T09:00:00'),
          end_time: new Date('2025-08-02T17:00:00'),
          break_duration: 1,
          staff_needed: 4,
          staff_assigned: 0,
          submission_cycle: 'PRIMARY',
          status: "Open",
          created_at: new Date(),
        },
      ];
      const result = calculateFilled(shifts);
      expect(result).toEqual([0, 9]); // 0 assigned, 9 needed (5 + 4)
    });
});