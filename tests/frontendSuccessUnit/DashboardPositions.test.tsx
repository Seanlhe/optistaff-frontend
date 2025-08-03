import React from 'react';
import { describe } from "node:test";
import { beforeAll, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Shift } from "../../src/types/hooks";
import { DashboardPositions, calculateFilled } from '../../src/pages/employer/ClientDashboard';
import {format, addDays} from "date-fns"

let shifts: Shift[] = [
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
      start_time: addDays(new Date(), 4), 
      end_time: addDays(new Date(), 4), 
      break_duration: 1.0,  // 1 hour break
      staff_needed: 6,
      staff_assigned: 6,
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
      start_time: addDays(new Date(), 5), 
      end_time: addDays(new Date(), 5),
      break_duration: 1.0, 
      staff_needed: 5,
      staff_assigned: 3,
      submission_cycle: "PRIMARY",
      status: "Open",
      created_at: new Date(),
    },
    
];


describe("Dashboard Positions Test Suite", ()=>{
    it("No shifts are found", ()=>{
        render(<DashboardPositions shifts={[]} calculateFilled={calculateFilled}/>)
        const filledText = screen.getByText("0/0");
        expect(filledText).toBeTruthy();
        const pctText = screen.getByText("0%");
        expect(pctText).toBeTruthy();
        const pieChart = screen.getByTestId("dashboard-piechart");
        expect(pieChart).toBeTruthy();
    })

    it("One shift is found and staff_assigned < staff_needed", ()=>{
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
        render(<DashboardPositions shifts={shifts} calculateFilled={calculateFilled}/>)
        const filledText = screen.getByText("3/5");
        expect(filledText).toBeTruthy();
        const pctText = screen.getByText("60%");
        expect(pctText).toBeTruthy();
        const pieChart = screen.getByTestId("dashboard-piechart");
        expect(pieChart).toBeTruthy();
    })

    it("One shift is found and staff_assigned == staff_needed", ()=>{
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
        render(<DashboardPositions shifts={shifts} calculateFilled={calculateFilled}/>)
        const filledText = screen.getByText("5/5");
        expect(filledText).toBeTruthy();
        const pctText = screen.getByText("100%");
        expect(pctText).toBeTruthy();
        const pieChart = screen.getByTestId("dashboard-piechart");
        expect(pieChart).toBeTruthy();
    })

    it("Multiple shifts are found with no staff assigned", ()=>{
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
        render(<DashboardPositions shifts={shifts} calculateFilled={calculateFilled}/>)
        const filledText = screen.getByText("0/9");
        expect(filledText).toBeTruthy();
        const pctText = screen.getByText("0%");
        expect(pctText).toBeTruthy();
        const pieChart = screen.getByTestId("dashboard-piechart");
        expect(pieChart).toBeTruthy();
    })

    it("Multiple shift are found and staff_assigned < staff_needed", ()=>{
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
        render(<DashboardPositions shifts={shifts} calculateFilled={calculateFilled}/>)
        const filledText = screen.getByText("13/15");
        expect(filledText).toBeTruthy();
        const pctText = screen.getByText("86%");
        expect(pctText).toBeTruthy();
        const pieChart = screen.getByTestId("dashboard-piechart");
        expect(pieChart).toBeTruthy();
    })

    it("Multiple shift are found and staff_assigned == staff_needed", ()=>{
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
              staff_assigned: 5,
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
        render(<DashboardPositions shifts={shifts} calculateFilled={calculateFilled}/>)
        const filledText = screen.getByText("15/15");
        expect(filledText).toBeTruthy();
        const pctText = screen.getByText("100%");
        expect(pctText).toBeTruthy();
        const pieChart = screen.getByTestId("dashboard-piechart");
        expect(pieChart).toBeTruthy();
    })
})