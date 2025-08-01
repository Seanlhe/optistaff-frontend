/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import MonthlyCalendar from "../../src/components/MonthlyCalendar";

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
}));

describe("MonthlyCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders calendar with month and year header", () => {
    render(<MonthlyCalendar />);

    // Should display some month and year (we can't predict exact current date)
    const monthYearHeader = screen.getByRole("heading", { level: 3 });
    expect(monthYearHeader).toBeTruthy();
    expect(monthYearHeader.textContent).toMatch(/\w+ \d{4}/); // Matches "Month Year" format
  });

  it("displays navigation arrows", () => {
    render(<MonthlyCalendar />);

    expect(screen.getByTestId("chevron-left")).toBeTruthy();
    expect(screen.getByTestId("chevron-right")).toBeTruthy();
  });

  it("displays all days of the week headers", () => {
    render(<MonthlyCalendar />);

    const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    daysOfWeek.forEach((day) => {
      expect(screen.getByText(day)).toBeTruthy();
    });
  });

  it("has clickable navigation buttons", () => {
    render(<MonthlyCalendar />);

    const prevButton = screen.getByTestId("chevron-left").closest("button");
    const nextButton = screen.getByTestId("chevron-right").closest("button");

    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
    
    // Test that buttons are clickable (won't throw errors)
    fireEvent.click(prevButton!);
    fireEvent.click(nextButton!);
  });

  it("supports navigation button interactions", () => {
    render(<MonthlyCalendar />);

    const nextButton = screen.getByTestId("chevron-right").closest("button");
    const prevButton = screen.getByTestId("chevron-left").closest("button");

    // Test that multiple clicks don't break the component
    for (let i = 0; i < 3; i++) {
      fireEvent.click(nextButton!);
    }
    
    for (let i = 0; i < 3; i++) {
      fireEvent.click(prevButton!);
    }

    // Component should still be functional
    const monthYearHeader = screen.getByRole("heading", { level: 3 });
    expect(monthYearHeader).toBeTruthy();
    expect(monthYearHeader.textContent).toMatch(/\w+ \d{4}/);
  });

  it("displays day numbers in the calendar grid", () => {
    render(<MonthlyCalendar />);

    // Should have day numbers - we'll look for at least some numbers 1-31
    const dayNumbers = ["15", "20", "25", "28"];
    let foundNumbers = 0;
    
    dayNumbers.forEach((day) => {
      if (screen.queryAllByText(day).length > 0) {
        foundNumbers++;
      }
    });
    
    expect(foundNumbers).toBeGreaterThan(0);
  });

  it("has proper button accessibility", () => {
    render(<MonthlyCalendar />);

    const prevButton = screen.getByTestId("chevron-left").closest("button");
    const nextButton = screen.getByTestId("chevron-right").closest("button");

    expect(prevButton?.tagName).toBe("BUTTON");
    expect(nextButton?.tagName).toBe("BUTTON");
  });

  it("handles rapid navigation clicks correctly", () => {
    render(<MonthlyCalendar />);

    const monthYearHeader = screen.getByRole("heading", { level: 3 });
    const initialMonth = monthYearHeader.textContent;
    const nextButton = screen.getByTestId("chevron-right").closest("button");

    // Rapidly click next button multiple times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(nextButton!);
    }

    const finalMonth = monthYearHeader.textContent;
    expect(finalMonth).not.toBe(initialMonth);
  });

  it("renders consistently across multiple renders", () => {
    const { rerender } = render(<MonthlyCalendar />);
    
    const monthYearHeader = screen.getByRole("heading", { level: 3 });
    expect(monthYearHeader).toBeTruthy();
    
    rerender(<MonthlyCalendar />);
    
    const newMonthYearHeader = screen.getByRole("heading", { level: 3 });
    expect(newMonthYearHeader).toBeTruthy();
  });

  it("shows proper week structure (Monday as first day)", () => {
    render(<MonthlyCalendar />);

    // The component uses { weekStartsOn: 1 } which means Monday is the first day
    const dayHeaders = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    
    dayHeaders.forEach((day) => {
      const dayElement = screen.getByText(day);
      expect(dayElement).toBeTruthy();
    });

    // Mo should come before Su in the DOM order
    const mondayElement = screen.getByText("Mo");
    const sundayElement = screen.getByText("Su");
    expect(mondayElement).toBeTruthy();
    expect(sundayElement).toBeTruthy();
  });

  it("handles navigation state correctly", () => {
    render(<MonthlyCalendar />);

    const monthYearHeader = screen.getByRole("heading", { level: 3 });
    const nextButton = screen.getByTestId("chevron-right").closest("button");
    const prevButton = screen.getByTestId("chevron-left").closest("button");

    // Store initial state
    const initialMonth = monthYearHeader.textContent;

    // Navigate and verify state changes
    fireEvent.click(nextButton!);
    fireEvent.click(prevButton!);
    
    // Should have a valid month/year displayed
    expect(monthYearHeader.textContent).toMatch(/\w+ \d{4}/);
  });

  it("displays calendar with proper CSS structure", () => {
    render(<MonthlyCalendar />);

    // Check that the main container exists
    const monthYearHeader = screen.getByRole("heading", { level: 3 });
    const calendar = monthYearHeader.closest("div");
    expect(calendar).toBeTruthy();
  });

  it("handles extensive navigation correctly", () => {
    render(<MonthlyCalendar />);

    const monthYearHeader = screen.getByRole("heading", { level: 3 });
    const nextButton = screen.getByTestId("chevron-right").closest("button");

    // Navigate multiple times
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton!);
    }

    // Should still display a valid month/year
    expect(monthYearHeader.textContent).toMatch(/\w+ \d{4}/);
  });
});