/**
 * JSPref Tab Navigation Test
 * @description Simple integration test focused on tab switching logic only
 * @author OptiStaff Team  
 * @testing_approach Test only tab navigation (useState), mock child components
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Import component to test
import JSPref from "../../src/pages/employee/JSPref";

// Mock child components to avoid complex dependencies
vi.mock("../../src/components/PreferencesForm", () => ({
  default: () => <div data-testid="preferences-page">Preferences Form Component</div>,
}));

vi.mock("../../src/components/Availability", () => ({
  default: () => <div data-testid="availability-page">Availability Component</div>,
}));

describe("JSPref Tab Navigation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Tab Navigation Tests (3 tests)
  // ========================================
  describe("Tab Navigation", () => {
    // UC: User sees PreferencesForm tab active by default
    test("renders with PreferencesForm tab active by default", () => {
      render(<JSPref />);

      // Verify both tab buttons are present
      const preferencesTab = screen.getByRole("button", { name: /preferences/i });
      const availabilityTab = screen.getByRole("button", { name: /availability/i });
      
      expect(preferencesTab).toBeTruthy();
      expect(availabilityTab).toBeTruthy();

      // Verify PreferencesForm tab is active (has bg-white class without /60)
      expect(preferencesTab.className).toContain("bg-white");
      expect(preferencesTab.className).not.toContain("hover:bg-white/60");
      expect(availabilityTab.className).toContain("hover:bg-white/60");
      expect(availabilityTab.className).not.toContain("bg-white ");

      // Verify PreferencesPage component is rendered by default
      expect(screen.getByTestId("preferences-page")).toBeTruthy();
      expect(screen.queryByTestId("availability-page")).toBeNull();
    });

    // UC: User can switch to Availability tab
    test("switches to Availability tab when clicked", async () => {
      const user = userEvent.setup();
      render(<JSPref />);

      // Click Availability tab
      const availabilityTab = screen.getByRole("button", { name: /availability/i });
      await user.click(availabilityTab);

      // Verify Availability tab is now active
      const preferencesTab = screen.getByRole("button", { name: /preferences/i });
      expect(availabilityTab.className).toContain("bg-white");
      expect(availabilityTab.className).not.toContain("hover:bg-white/60");
      expect(preferencesTab.className).toContain("hover:bg-white/60");
      expect(preferencesTab.className).not.toContain("bg-white ");

      // Verify AvailabilityPage component is now rendered
      expect(screen.getByTestId("availability-page")).toBeTruthy();
      expect(screen.queryByTestId("preferences-page")).toBeNull();
    });

    // UC: User can switch back to PreferencesForm tab
    test("switches back to PreferencesForm tab when clicked", async () => {
      const user = userEvent.setup();
      render(<JSPref />);

      // First switch to Availability tab
      const availabilityTab = screen.getByRole("button", { name: /availability/i });
      await user.click(availabilityTab);
      
      // Verify we're on Availability tab
      expect(screen.getByTestId("availability-page")).toBeTruthy();

      // Now switch back to Preferences tab
      const preferencesTab = screen.getByRole("button", { name: /preferences/i });
      await user.click(preferencesTab);

      // Verify PreferencesForm tab is active again
      expect(preferencesTab.className).toContain("bg-white");
      expect(preferencesTab.className).not.toContain("hover:bg-white/60");
      expect(availabilityTab.className).toContain("hover:bg-white/60");
      expect(availabilityTab.className).not.toContain("bg-white ");

      // Verify PreferencesPage component is rendered again
      expect(screen.getByTestId("preferences-page")).toBeTruthy();
      expect(screen.queryByTestId("availability-page")).toBeNull();
    });
  });

  // ========================================
  // Error Handling Test (1 test)
  // ========================================
  describe("Error Handling", () => {
    // UC: System handles tab switching errors gracefully
    test("handles tab switching errors gracefully", () => {
      render(<JSPref />);

      // Verify component renders without crashing
      expect(screen.getByRole("button", { name: /preferences/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /availability/i })).toBeTruthy();

      // Test that clicking tabs doesn't crash the component
      const preferencesTab = screen.getByRole("button", { name: /preferences/i });
      const availabilityTab = screen.getByRole("button", { name: /availability/i });

      // These should not throw errors (testing the try-catch in handleTabChange)
      fireEvent.click(availabilityTab);
      expect(screen.getByTestId("availability-page")).toBeTruthy();

      fireEvent.click(preferencesTab);
      expect(screen.getByTestId("preferences-page")).toBeTruthy();

      // Component should still be functional after multiple clicks
      fireEvent.click(availabilityTab);
      fireEvent.click(preferencesTab);
      fireEvent.click(availabilityTab);
      
      expect(screen.getByTestId("availability-page")).toBeTruthy();
    });
  });
});