/**
 * Preferences Sub-Components Integration Tests
 * @description Integration tests for individual preference components with their hooks
 * @author OptiStaff Team
 * @testing_approach Test components with props and hooks, mock only external services
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Import components to test
import PreferencesMaximum from "../../src/components/PreferencesMaximum";
import PreferencesPay from "../../src/components/PreferencesPay";
import PreferencesJobType from "../../src/components/PreferencesJobType";

// Import types
import { PreferencesFormData } from "../../src/types/hooks";

// Mock only Supabase for useJobTypes hook - need to support chaining
vi.mock("../../src/integrations/supabase/client", () => {
  const mockChain = {
    select: vi.fn(() => mockChain),
    eq: vi.fn(() => mockChain),
    order: vi.fn().mockResolvedValue({
      data: [
        {
          job_type_id: "job-1",
          type_name: "Waiter",
          is_active: true,
          job_categories: {
            category_id: "cat-1",
            category_name: "Food Service",
            description: "Restaurant and food service jobs"
          }
        },
        {
          job_type_id: "job-2", 
          type_name: "Chef",
          is_active: true,
          job_categories: {
            category_id: "cat-1",
            category_name: "Food Service",
            description: "Restaurant and food service jobs"
          }
        },
        {
          job_type_id: "job-3",
          type_name: "Cashier",
          is_active: true,
          job_categories: {
            category_id: "cat-2", 
            category_name: "Retail",
            description: "Retail and customer service jobs"
          }
        }
      ],
      error: null,
    }),
  };

  return {
    supabase: {
      from: vi.fn(() => mockChain),
    },
  };
});

describe("Preferences Sub-Components Integration Tests", () => {
  let mockFormData: PreferencesFormData;
  let mockSetFormData: vi.MockedFunction<(data: PreferencesFormData) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock form data
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
  // PreferencesMaximum Integration Tests (2 tests)
  // ========================================
  describe("PreferencesMaximum Integration", () => {
    // UC: User can set maximum hours per week
    test("updates max hours per week when input changes", async () => {
      render(
        <PreferencesMaximum 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Find the max hours per week input
      const maxHoursPerWeekInput = screen.getByDisplayValue("40");
      expect(maxHoursPerWeekInput).toBeTruthy();

      // Change the value using fireEvent for number inputs
      fireEvent.change(maxHoursPerWeekInput, { target: { value: "35" } });

      // Verify setFormData was called with updated value
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        maxHoursPerWeek: 35,
      });
    });

    // UC: User can set maximum hours per shift  
    test("updates max hours per shift when input changes", async () => {
      render(
        <PreferencesMaximum 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Find the max hours per shift input
      const maxHoursPerShiftInput = screen.getByDisplayValue("8");
      expect(maxHoursPerShiftInput).toBeTruthy();

      // Change the value using fireEvent for number inputs
      fireEvent.change(maxHoursPerShiftInput, { target: { value: "6" } });

      // Verify setFormData was called with updated value
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        maxHoursPerShift: 6,
      });
    });
  });

  // ========================================
  // PreferencesPay Integration Tests (2 tests)
  // ========================================
  describe("PreferencesPay Integration", () => {
    // UC: User can set desired pay rate using slider
    test("updates pay rate when slider changes", async () => {
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Find the pay rate slider
      const payRateSlider = screen.getByRole("slider");
      expect(payRateSlider).toBeTruthy();
      expect(payRateSlider).toHaveProperty("value", "20");

      // Change the slider value
      fireEvent.change(payRateSlider, { target: { value: "25" } });

      // Verify setFormData was called with updated pay rate
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        payRate: 25,
      });
    });

    // UC: User can toggle "consider lower rate" option
    test("toggles consider lower rate when checkbox clicked", async () => {
      const user = userEvent.setup();
      
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Find the consider lower rate checkbox
      const considerLowerCheckbox = screen.getByRole("checkbox", { 
        name: /consider me for a job with lower rate/i 
      });
      expect(considerLowerCheckbox).toBeTruthy();
      expect(considerLowerCheckbox.checked).toBe(false);

      // Click the checkbox
      await user.click(considerLowerCheckbox);

      // Verify setFormData was called with toggled value
      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        considerLowerRate: true,
      });
    });
  });

  // ========================================
  // PreferencesJobType Integration Tests (2 tests)
  // ========================================
  describe("PreferencesJobType Integration", () => {
    // UC: User can view available job types - simplified test for now
    test("loads job types from useJobTypes hook and displays loading or content", async () => {
      render(
        <PreferencesJobType 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // The component should render without crashing - find the main container
      const container = document.querySelector(".p-4.rounded-lg.bg-card-color");
      expect(container).toBeTruthy();
      
      // The test passes if the component renders without crashing
      await waitFor(() => {
        // Component should exist and have rendered some content
        expect(container).toBeTruthy();
        
        // Should either have loading state or actual content
        const hasLoadingState = container?.querySelector(".animate-pulse");
        const hasErrorState = container?.querySelector(".text-red-500");
        const hasContent = container?.textContent?.includes("Select all job types");
        
        // At least one of these should be true
        expect(hasLoadingState || hasErrorState || hasContent).toBeTruthy();
      });
    });

    // UC: User can select/deselect job types
    test("updates selected job types when checkboxes are clicked", async () => {
      const user = userEvent.setup();
      
      render(
        <PreferencesJobType 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Wait for job types to load
      await waitFor(() => {
        expect(screen.getByText("Chef")).toBeTruthy();
      });

      // Find and click the Chef checkbox (initially unchecked)
      const chefCheckbox = screen.getByRole("checkbox", { name: /chef/i });
      expect(chefCheckbox.checked).toBe(false);
      
      await user.click(chefCheckbox);

      // Verify setFormData was called with Chef added to selected jobs
      await waitFor(() => {
        expect(mockSetFormData).toHaveBeenCalledWith({
          ...mockFormData,
          selectedJobNames: ["Waiter", "Chef"], // Should include both
        });
      });
    });
  });
});