/**
 * JSPref Preferences Flow Integration Test (UC3)
 * @description Integration test for JSPref page with PreferencesForm and mocked hooks
 * @testing_approach: Mock hooks (usePreferencesForm) and lightweight child components for stable UI tests
 * - Consistent with uc5/uc7 patterns that mock hooks directly
 * - Do not modify existing UC3 integration tests; add complementary coverage from the page level
 */

import React from "react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import JSPref from "../../../src/pages/employee/JSPref";

// Mock usePreferencesForm hook behavior
const mockSavePreferences = vi.fn();
const mockGetFormData = vi.fn();

vi.mock("../../src/hooks/usePreferencesForm", () => ({
  usePreferencesForm: () => ({
    savePreferences: mockSavePreferences,
    loading: false,
    validating: false,
    error: null,
    getFormData: mockGetFormData,
    homeLocation: { lat: 1.3521, lng: 103.8198 },
  }),
}));

// Mock child components minimally to keep rendering simple and deterministic
vi.mock("../../src/components/PreferencesMaximum", () => ({
  default: ({ formData, setFormData }: any) => (
    <div data-testid="preferences-maximum">
      <input
        type="number"
        value={formData.maxHoursPerWeek}
        onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })}
        data-testid="max-hours-week"
      />
      <input
        type="number"
        value={formData.maxHoursPerShift}
        onChange={(e) => setFormData({ ...formData, maxHoursPerShift: Number(e.target.value) })}
        data-testid="max-hours-shift"
      />
    </div>
  ),
}));

vi.mock("../../src/components/PreferencesPay", () => ({
  default: ({ formData, setFormData }: any) => (
    <div data-testid="preferences-pay">
      <span>${formData.payRate}</span>
      <input
        type="range"
        min="5"
        max="30"
        value={formData.payRate}
        onChange={(e) => setFormData({ ...formData, payRate: Number(e.target.value) })}
        data-testid="pay-rate-slider"
      />
      <input
        type="checkbox"
        checked={formData.considerLowerRate}
        onChange={(e) => setFormData({ ...formData, considerLowerRate: e.target.checked })}
        data-testid="consider-lower-checkbox"
      />
    </div>
  ),
}));

vi.mock("../../src/components/PreferencesJobType", () => ({
  default: ({ formData, setFormData }: any) => (
    <div data-testid="preferences-job-type">
      <input
        type="checkbox"
        checked={formData.selectedJobNames.includes("Waiter")}
        onChange={(e) => {
          const newSelectedJobs = e.target.checked
            ? [...formData.selectedJobNames, "Waiter"]
            : formData.selectedJobNames.filter((job: string) => job !== "Waiter");
          setFormData({ ...formData, selectedJobNames: newSelectedJobs });
        }}
        data-testid="waiter-checkbox"
      />
      <label>Waiter</label>
    </div>
  ),
}));

vi.mock("../../src/components/LocationAwareMap", () => ({
  LocationAwareMap: ({ onRadiusChange, travelRadius }: any) => (
    <div data-testid="location-aware-map">
      <span>Travel Radius: {travelRadius}km</span>
      <button onClick={() => onRadiusChange(25)} data-testid="change-radius-btn">Change Radius</button>
    </div>
  ),
}));

vi.mock("../../src/components/LocationErrorBoundary", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("UC3 - JSPref Preferences Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFormData.mockReturnValue({
      payRate: 20,
      considerLowerRate: false,
      maxHoursPerWeek: 40,
      maxHoursPerShift: 8,
      maxTravelKm: 15,
      selectedJobNames: ["Waiter"],
    });
    mockSavePreferences.mockResolvedValue(true);
  });

  test("UC3 flow: navigate → load → display job types → save success", async () => {
    const user = userEvent.setup();
    render(<JSPref />);

    // Preferences tab is default and components render
    await waitFor(() => {
      expect(screen.getByTestId("preferences-pay")).toBeTruthy();
      expect(screen.getByTestId("preferences-maximum")).toBeTruthy();
      expect(screen.getByTestId("preferences-job-type")).toBeTruthy();
      expect(screen.getByTestId("location-aware-map")).toBeTruthy();
    });

    // Display initial values
    expect(screen.getByText("$20")).toBeTruthy();
    expect(screen.getByText("Travel Radius: 15km")).toBeTruthy();

    // Toggle a job type and adjust some fields
    const waiterCheckbox = screen.getByTestId("waiter-checkbox");
    await user.click(waiterCheckbox); // uncheck removes Waiter

    const changeRadiusBtn = screen.getByTestId("change-radius-btn");
    await user.click(changeRadiusBtn); // sets to 25

    const payRateSlider = screen.getByTestId("pay-rate-slider");
    fireEvent.change(payRateSlider, { target: { value: "26" } });

    const considerLower = screen.getByTestId("consider-lower-checkbox");
    await user.click(considerLower);

    // Save
    const saveButton = screen.getByRole("button", { name: /save preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSavePreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          payRate: 26,
          maxTravelKm: 25,
          considerLowerRate: true,
          selectedJobNames: [], // Waiter removed
        })
      );
      expect(screen.getByText(/preferences saved successfully/i)).toBeTruthy();
    });
  });

  test("UC3 error path: save failure shows no success message", async () => {
    const user = userEvent.setup();
    mockSavePreferences.mockResolvedValue(false);

    render(<JSPref />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save preferences/i })).toBeTruthy();
    });

    const saveButton = screen.getByRole("button", { name: /save preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSavePreferences).toHaveBeenCalled();
    });

    expect(screen.queryByText(/preferences saved successfully/i)).toBeFalsy();
  });
});

