import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import PreferencesForm from "../../../src/components/PreferencesForm";
import { usePreferencesForm } from "../../../src/hooks/usePreferencesForm";
import { PreferencesFormData } from "../../../src/types/hooks";

// --- Mocks ---

// Mock the custom hook to isolate the component.
vi.mock("../../src/hooks/usePreferencesForm");

// Mock child components to simplify the test.
vi.mock("../../src/components/LocationAwareMap", () => ({
  LocationAwareMap: vi.fn(({ onLocationError, onRadiusChange }) => (
    <div data-testid="mock-map">
      <button onClick={() => onRadiusChange(25)}>Change Radius</button>
      <button
        onClick={() =>
          onLocationError({
            type: "PERMISSION_DENIED",
            message: "User denied location access.",
            canRetry: true,
          })
        }
      >
        Trigger Location Error
      </button>
    </div>
  )),
}));
vi.mock("../../src/components/PreferencesMaximum", () => ({
  default: vi.fn(() => <div data-testid="mock-prefs-max"></div>),
}));
vi.mock("../../src/components/PreferencesPay", () => ({
  default: vi.fn(() => <div data-testid="mock-prefs-pay"></div>),
}));
vi.mock("../../src/components/PreferencesJobType", () => ({
  default: vi.fn(() => <div data-testid="mock-prefs-jobtype"></div>),
}));
vi.mock("../../src/components/LocationErrorBoundary", () => ({
  default: vi.fn(({ children }) => <>{children}</>),
}));

// --- Test Suite ---

describe("PreferencesForm", () => {
  const mockSavePreferences = vi.fn();
  const mockGetFormData = vi.fn();

  const defaultMockData: PreferencesFormData = {
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 15,
    selectedJobNames: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFormData.mockReturnValue(defaultMockData);
    (
      usePreferencesForm as vi.MockedFunction<typeof usePreferencesForm>
    ).mockReturnValue({
      savePreferences: mockSavePreferences,
      getFormData: mockGetFormData,
      loading: false,
      validating: false,
      error: null,
      homeLocation: { lat: 1.3521, lng: 103.8198 },
    });
  });

  it("TC-UC3-U2: renders correctly and displays child components", () => {
    // UC3 Step 2: JSPref renders PreferencesForm component
    render(<PreferencesForm />);

    // UC3 Step 3: PreferencesForm calls usePreferencesForm.fetchPreferences()
    // UC3 Steps 4-6: Database query and response for current preferences
    // UC3 Step 7: PreferencesForm renders PreferencesJobType component
    // UC3 Steps 8-11: PreferencesJobType fetches job types from database
    // UC3 Steps 12-14: Complete form is displayed to jobseeker
    // getBy... queries throw an error if not found.
    // Asserting that the returned element is truthy confirms it was found.
    expect(screen.getByTestId("mock-prefs-max")).toBeTruthy();
    expect(screen.getByTestId("mock-prefs-pay")).toBeTruthy();
    expect(screen.getByTestId("mock-prefs-jobtype")).toBeTruthy();
    expect(screen.getByTestId("mock-map")).toBeTruthy();
    expect(screen.getByRole("button", { name: /save preferences/i })).toBeTruthy();
  });

  it("TC-UC3-U15: handles successful form submission", async () => {
    // UC3 Step 15: Jobseeker updates preferences (min_pay_rate, max_travel_km, desired_roles)
    mockSavePreferences.mockResolvedValue(true);
    render(<PreferencesForm />);

    const submitButton = screen.getByRole("button", { name: /save preferences/i });
    // UC3 Step 16: JSPref validates preferences
    fireEvent.click(submitButton);

    // UC3 Step 17: PreferencesForm calls usePreferencesForm.savePreferences() with preferences_data
    expect(mockSavePreferences).toHaveBeenCalledWith(defaultMockData);

    // UC3 Step 18: usePreferencesForm calls database upsert_user_preferences function
    // UC3 Steps 19-22: Database saves preferences, returns success, and displays success message
    await waitFor(() => {
      // Check for the success message's presence.
      expect(screen.getByText(/preferences saved successfully!/i)).toBeTruthy();
    });
  });

  it("TC-UC3-U18: handles failed form submission", async () => {
    mockSavePreferences.mockResolvedValue(false);
    render(<PreferencesForm />);

    fireEvent.click(screen.getByRole("button", { name: /save preferences/i }));

    await waitFor(() => {
      expect(mockSavePreferences).toHaveBeenCalled();
    });

    // queryBy... returns null if not found. This is how we test for absence.
    expect(screen.queryByText(/preferences saved successfully!/i)).toBeNull();

    const submitButton = screen.getByRole("button", {
      name: /save preferences/i,
    }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  it("TC-UC3-U2: displays a general error message from the hook", () => {
    (
      usePreferencesForm as vi.MockedFunction<typeof usePreferencesForm>
    ).mockReturnValue({
      savePreferences: mockSavePreferences,
      getFormData: mockGetFormData,
      loading: false,
      validating: false,
      error: "Failed to connect to the server.",
      homeLocation: { lat: 1.3521, lng: 103.8198 },
    });

    render(<PreferencesForm />);

    expect(screen.getByText("Error Loading Preferences")).toBeTruthy();
    expect(screen.getByText("Failed to connect to the server.")).toBeTruthy();
  });

  it("TC-UC3-U13: displays and handles a location-specific error", async () => {
    render(<PreferencesForm />);

    fireEvent.click(
      screen.getByRole("button", { name: /trigger location error/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Location Service Issue")).toBeTruthy();
    });

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeTruthy();
    fireEvent.click(retryButton);

    await waitFor(() => {
      // Assert the error message is now gone.
      expect(screen.queryByText("Location Service Issue")).toBeNull();
    });

    // The retry button should clear the error, which is the expected behavior
    expect(screen.queryByText("Location Service Issue")).toBeNull();
  });
});
