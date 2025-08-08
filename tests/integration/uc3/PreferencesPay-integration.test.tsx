/**
 * PreferencesPay Integration Test
 * @description Integration test for PreferencesPay component with form state management
 * @author OptiStaff Team  
 * @testing_approach Component + Props Integration: PreferencesPay with form state
 * - Mock: None needed (props-based component)
 * - Real: Component logic, slider interactions, checkbox logic
 * - Tests: Pay rate slider changes, checkbox toggle, form state updates
 * - UC: User adjusts pay settings, real component updates real form state
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Import component to test
import PreferencesPay from "../../../src/components/PreferencesPay";

// Import types
import { PreferencesFormData } from "../../../src/types/hooks";

describe("PreferencesPay Integration Tests", () => {
  let mockFormData: PreferencesFormData;
  let mockSetFormData: ReturnType<typeof vi.fn<(data: PreferencesFormData) => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock form data with realistic pay preferences
    mockFormData = {
      payRate: 20,
      considerLowerRate: false,
      maxHoursPerWeek: 40,
      maxHoursPerShift: 8,
      maxTravelKm: 15,
      selectedJobNames: ["Waiter"],
    };

    // Setup mock setFormData function
    mockSetFormData = vi.fn();
  });

  // ========================================
  // Component Rendering & Initialization Tests (1 test)
  // ========================================
  describe("Component Rendering & Initialization", () => {
    // TC-UC3-I6,13: Component displays current pay settings from form data
    test("TC-UC3-I6,13: renders with correct initial values from form data", () => {
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Verify main heading is displayed
      expect(screen.getByText("Desired Hourly Pay Rate ($):")).toBeTruthy();

      // Verify pay rate display shows current value
      expect(screen.getByText("$20")).toBeTruthy();

      // Verify slider has correct value
      const payRateSlider = screen.getByRole("slider") as HTMLInputElement;
      expect(payRateSlider.value).toBe("20");
      expect(payRateSlider.min).toBe("5");
      expect(payRateSlider.max).toBe("30");

      // Verify checkbox reflects initial state
      const considerLowerCheckbox = screen.getByRole("checkbox", { 
        name: /consider me for a job with lower rate/i 
      }) as HTMLInputElement;
      expect(considerLowerCheckbox.checked).toBe(false);

      // Verify checkbox label is present
      expect(screen.getByText("Consider me for a job with lower rate")).toBeTruthy();
    });
  });

  // ========================================
  // Pay Rate Slider Interaction Tests (2 tests)
  // ========================================
  describe("Pay Rate Slider Interaction", () => {
    // TC-UC3-I15: User adjusts pay rate using slider and form data is updated
    test("TC-UC3-I15: updates pay rate when slider value changes", () => {
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Find the pay rate slider
      const payRateSlider = screen.getByRole("slider") as HTMLInputElement;
      expect(payRateSlider.value).toBe("20");

      // Change the slider value to $25
      fireEvent.change(payRateSlider, { target: { value: "25" } });

      // Verify setFormData was called with updated pay rate
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        payRate: 25,
      });

      // Verify it was called exactly once
      expect(mockSetFormData).toHaveBeenCalledTimes(1);
    });

    // TC-UC3-I15: User sets minimum pay rate boundary value
    test("TC-UC3-I15: handles minimum and maximum pay rate values correctly", () => {
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      const payRateSlider = screen.getByRole("slider") as HTMLInputElement;

      // Test minimum value (5)
      fireEvent.change(payRateSlider, { target: { value: "5" } });
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        payRate: 5,
      });

      // Clear mock to test next call independently
      mockSetFormData.mockClear();

      // Test maximum value (30)
      fireEvent.change(payRateSlider, { target: { value: "30" } });
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        payRate: 30,
      });
    });
  });

  // ========================================
  // Consider Lower Rate Checkbox Tests (2 tests)
  // ========================================
  describe("Consider Lower Rate Checkbox", () => {
    // TC-UC3-I15: User toggles "consider lower rate" checkbox and form data is updated
    test("TC-UC3-I15: updates consider lower rate when checkbox is clicked", async () => {
      const user = userEvent.setup();
      
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Find the consider lower rate checkbox (initially unchecked)
      const considerLowerCheckbox = screen.getByRole("checkbox", { 
        name: /consider me for a job with lower rate/i 
      }) as HTMLInputElement;
      expect(considerLowerCheckbox.checked).toBe(false);

      // Click the checkbox to enable consider lower rate
      await user.click(considerLowerCheckbox);

      // Verify setFormData was called with toggled value
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        considerLowerRate: true,
      });

      expect(mockSetFormData).toHaveBeenCalledTimes(1);
    });

    // TC-UC3-I15: User can uncheck "consider lower rate" if it was previously enabled
    test("TC-UC3-I15: can toggle consider lower rate off when initially checked", async () => {
      const user = userEvent.setup();
      
      // Setup form data with consider lower rate already enabled
      const formDataWithLowerRate: PreferencesFormData = {
        ...mockFormData,
        considerLowerRate: true,
      };

      render(
        <PreferencesPay 
          formData={formDataWithLowerRate} 
          setFormData={mockSetFormData} 
        />
      );

      // Find the checkbox (should be checked)
      const considerLowerCheckbox = screen.getByRole("checkbox", { 
        name: /consider me for a job with lower rate/i 
      }) as HTMLInputElement;
      expect(considerLowerCheckbox.checked).toBe(true);

      // Click to uncheck
      await user.click(considerLowerCheckbox);

      // Verify setFormData was called with toggled off value
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...formDataWithLowerRate,
        considerLowerRate: false,
      });
    });
  });

  // ========================================
  // Integration State Management Tests (1 test)
  // ========================================
  describe("Integration State Management", () => {
    // TC-UC3-I15: User makes multiple changes and each updates form data correctly
    test("TC-UC3-I15: handles multiple sequential changes correctly", async () => {
      const user = userEvent.setup();
      
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // First change: Update pay rate
      const payRateSlider = screen.getByRole("slider") as HTMLInputElement;
      fireEvent.change(payRateSlider, { target: { value: "28" } });

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        payRate: 28,
      });

      // Clear mock to test next interaction independently
      mockSetFormData.mockClear();

      // Second change: Toggle consider lower rate
      const considerLowerCheckbox = screen.getByRole("checkbox", { 
        name: /consider me for a job with lower rate/i 
      }) as HTMLInputElement;
      await user.click(considerLowerCheckbox);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        considerLowerRate: true,
      });

      // Clear mock for third interaction
      mockSetFormData.mockClear();

      // Third change: Change pay rate again
      fireEvent.change(payRateSlider, { target: { value: "15" } });

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        payRate: 15,
      });

      // Verify each call was made independently
      expect(mockSetFormData).toHaveBeenCalledTimes(1);
    });
  });
});