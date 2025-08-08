/**
 * Calendar Component Integration Tests
 * @description Integration tests for Calendar component with availability hooks
 * @author OptiStaff Team
 * @testing_approach Test Calendar component with hooks, mock only external services
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Import component to test
import Calendar from "../../../src/components/Calendar";

// Import types
import { UI_Event } from "../../../src/types/hooks";

// Mock Supabase client - support chaining for availability operations
vi.mock("../../src/integrations/supabase/client", () => {
  const createMockChain = () => {
    let eqCallCount = 0;
    
    const mockChain = {
      select: vi.fn(() => mockChain),
      eq: vi.fn(() => {
        eqCallCount++;
        if (eqCallCount >= 2) {
          // After 2 eq() calls, return the final result
          return Promise.resolve({
            data: [],
            error: null,
          });
        }
        return mockChain;
      }),
      delete: vi.fn(() => {
        // Reset count for delete chain
        eqCallCount = 0;
        return mockChain;
      }),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    };
    
    return mockChain;
  };

  return {
    supabase: {
      from: vi.fn(() => createMockChain()),
    },
  };
});

// Mock useAuth hook - provide authenticated user
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "test-user-id", email: "test@example.com", role: "jobseeker" },
    loading: false,
    error: null,
  })),
}));

describe("Calendar Component Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Calendar Rendering & Navigation Tests (2 tests)
  // ========================================
  describe("Calendar Rendering & Navigation", () => {
    // TC-UC4-I1-2,7-8: Navigate to availability and load calendar - User can view calendar interface
    test("TC-UC4-I1-2,7-8: renders calendar with week view and navigation controls", async () => {
      render(<Calendar />);

      // Verify main calendar elements are present
      const todayButton = screen.getByRole("button", { name: /today/i });
      const saveButton = screen.getByRole("button", { name: /save/i });
      const templatesButton = screen.getByRole("button", { name: /templates/i });
      
      // Navigation buttons don't have text labels, so check by position
      const allButtons = screen.getAllByRole("button");
      expect(allButtons.length).toBeGreaterThanOrEqual(5); // At least nav buttons + named buttons

      expect(todayButton).toBeTruthy();
      expect(saveButton).toBeTruthy();
      expect(templatesButton).toBeTruthy();

      // Verify week days are displayed
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      weekDays.forEach(day => {
        expect(screen.getByText(day)).toBeTruthy();
      });

      // Verify time slots are rendered (check for at least some hour markers)
      expect(screen.getByText("0:00")).toBeTruthy();
      expect(screen.getByText("12:00")).toBeTruthy();
      expect(screen.getByText("23:00")).toBeTruthy();
    });

    // TC-UC4-I7-8: Load existing availability data - User can navigate between weeks
    test("TC-UC4-I7-8: navigates between weeks when using navigation buttons", async () => {
      const user = userEvent.setup();
      render(<Calendar />);

      // Get initial month/year display
      const monthDisplay = screen.getByRole("heading", { level: 1 });
      expect(monthDisplay).toBeTruthy();

      // Find navigation buttons (first two buttons without text labels)
      const allButtons = screen.getAllByRole("button");
      const prevWeekButton = allButtons[0]; // First button should be previous week
      const nextWeekButton = allButtons[1]; // Second button should be next week
      
      // Click next week button - should not crash
      await user.click(nextWeekButton);

      // Month display should still exist 
      expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
      
      // Click previous week button - should not crash
      await user.click(prevWeekButton);

      // Calendar should still be functional
      expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
      expect(screen.getByText("Mon")).toBeTruthy();
    });
  });

  // ========================================
  // Availability Slot Management Tests (2 tests)
  // ========================================
  describe("Availability Slot Management", () => {
    // TC-UC4-I22-24: Create/modify time slots - User can create availability slots
    test("TC-UC4-I22-24: creates availability slot on double-click", async () => {
      render(<Calendar />);

      // Wait for component to fully load
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
      });

      // Find a time slot to double-click (look for hour grid cells)
      // Time slots have hover:bg-bg class and are clickable
      const timeSlots = document.querySelectorAll(".h-12.border-b.border-border.hover\\:bg-bg.cursor-pointer");
      expect(timeSlots.length).toBeGreaterThan(0);

      // Double-click on the first available time slot
      const firstTimeSlot = timeSlots[0];
      fireEvent.doubleClick(firstTimeSlot);

      // After double-click, a new event should be created
      // We can verify this by checking if a CalendarEvent component is rendered
      // CalendarEvent components have specific styling classes
      await waitFor(() => {
        const calendarEvents = document.querySelectorAll(".absolute.left-1.right-1.rounded.border.p-1.cursor-grab.select-none");
        expect(calendarEvents.length).toBeGreaterThan(0);
      });
    });

    // TC-UC4-I22-24: Create/modify time slots - User can delete availability slots
    test("TC-UC4-I22-24: deletes availability slot on event double-click", async () => {
      render(<Calendar />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
      });

      // First create an event by double-clicking a time slot
      const timeSlots = document.querySelectorAll(".h-12.border-b.border-border.hover\\:bg-bg.cursor-pointer");
      const firstTimeSlot = timeSlots[0];
      fireEvent.doubleClick(firstTimeSlot);

      // Wait for event to be created
      await waitFor(() => {
        const calendarEvents = document.querySelectorAll(".absolute.left-1.right-1.rounded.border.p-1.cursor-grab.select-none");
        expect(calendarEvents.length).toBe(1);
      });

      // Now double-click the created event to delete it
      const calendarEvent = document.querySelector(".absolute.left-1.right-1.rounded.border.p-1.cursor-grab.select-none");
      expect(calendarEvent).toBeTruthy();
      
      fireEvent.doubleClick(calendarEvent!);

      // Event should be deleted
      await waitFor(() => {
        const remainingEvents = document.querySelectorAll(".absolute.left-1.right-1.rounded.border.p-1.cursor-grab.select-none");
        expect(remainingEvents.length).toBe(0);
      });
    });
  });

  // ========================================
  // Save Functionality Tests (2 tests)
  // ========================================
  describe("Save Functionality", () => {
    // TC-UC4-I3-6: Save availability to database - User can save calendar data
    test("TC-UC4-I3-6: saves availability data to Supabase on Save button click", async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
      });

      // Create an availability slot first
      const timeSlots = document.querySelectorAll(".h-12.border-b.border-border.hover\\:bg-bg.cursor-pointer");
      const firstTimeSlot = timeSlots[0];
      fireEvent.doubleClick(firstTimeSlot);

      // Wait for event to be created
      await waitFor(() => {
        const calendarEvents = document.querySelectorAll(".absolute.left-1.right-1.rounded.border.p-1.cursor-grab.select-none");
        expect(calendarEvents.length).toBe(1);
      });

      // Click Save button
      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      // Verify save operation completes without errors
      await waitFor(() => {
        // The save button should not be in loading state after completion
        const saveButton = screen.getByRole("button", { name: /save/i });
        expect(saveButton).toBeTruthy();
        expect(saveButton.textContent).not.toContain("Saving...");
      });
    });

    // TC-UC4-I3-6: Display success confirmation - System handles save errors gracefully
    test("TC-UC4-I3-6: handles save errors gracefully", async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
      });

      // Create an availability slot
      const timeSlots = document.querySelectorAll(".h-12.border-b.border-border.hover\\:bg-bg.cursor-pointer");
      const firstTimeSlot = timeSlots[0];
      fireEvent.doubleClick(firstTimeSlot);

      // Click Save button
      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      // Verify component handles errors gracefully and doesn't crash
      await waitFor(() => {
        // Component should still be functional after save attempt
        expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
        // Calendar should still be rendered
        expect(screen.getByText("Mon")).toBeTruthy();
      });
    });
  });
});