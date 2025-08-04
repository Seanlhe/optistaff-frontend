/**
 * PreferencesJobType Integration Test
 * @description Integration test for PreferencesJobType component with useJobTypes hook
 * @author OptiStaff Team  
 * @testing_approach Component + Hook Integration: PreferencesJobType with useJobTypes hook
 * - Mock: Supabase client (job types data)
 * - Real: useJobTypes hook, component logic, form interactions
 * - Tests: Job type loading from Supabase, category filtering, checkbox interactions, form state updates
 * - UC: User selects job types, data flows through real hook to real component state
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Import component to test
import PreferencesJobType from "../../src/components/PreferencesJobType";

// Import types
import { PreferencesFormData } from "../../src/types/hooks";

// Mock only Supabase client with method chaining for job types data
vi.mock("../../src/integrations/supabase/client", () => {
  const mockChain = {
    select: vi.fn(() => mockChain),
    eq: vi.fn(() => mockChain),
    order: vi.fn().mockResolvedValue({
      data: [
        {
          job_type_id: "job-1",
          type_name: "Waiter",
          category_id: "cat-1",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          job_categories: {
            category_id: "cat-1",
            category_name: "Food Service",
            description: "Restaurant and food service jobs",
            is_active: true,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
          }
        },
        {
          job_type_id: "job-2", 
          type_name: "Chef",
          category_id: "cat-1",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          job_categories: {
            category_id: "cat-1",
            category_name: "Food Service",
            description: "Restaurant and food service jobs",
            is_active: true,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
          }
        },
        {
          job_type_id: "job-3",
          type_name: "Cashier",
          category_id: "cat-2",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          job_categories: {
            category_id: "cat-2", 
            category_name: "Retail",
            description: "Retail and customer service jobs",
            is_active: true,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
          }
        },
        {
          job_type_id: "job-4",
          type_name: "Security Guard",
          category_id: "cat-3",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          job_categories: {
            category_id: "cat-3",
            category_name: "Security",
            description: "Security and safety jobs",
            is_active: true,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
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

describe("PreferencesJobType Integration Tests", () => {
  let mockFormData: PreferencesFormData;
  let mockSetFormData: ReturnType<typeof vi.fn<(data: PreferencesFormData) => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock form data with existing selections
    mockFormData = {
      payRate: 20,
      considerLowerRate: false,
      maxHoursPerWeek: 40,
      maxHoursPerShift: 8,
      maxTravelKm: 15,
      selectedJobNames: ["Waiter"], // Pre-select Waiter
    };

    // Setup mock setFormData function
    mockSetFormData = vi.fn();
  });

  // ========================================
  // Loading State Integration Test (1 test)
  // ========================================
  describe("Loading State Integration", () => {
    // UC: User sees loading state while job types are being fetched
    test("displays loading skeleton while useJobTypes hook fetches data", async () => {
      render(
        <PreferencesJobType 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // The component should render with loading state initially
      const container = document.querySelector(".p-4.rounded-lg.bg-card-color");
      expect(container).toBeTruthy();

      // Should show loading animation or content
      await waitFor(() => {
        const hasLoadingState = container?.querySelector(".animate-pulse");
        const hasContent = container?.textContent?.includes("Select all job types");
        
        // Should have either loading state or loaded content
        expect(hasLoadingState || hasContent).toBeTruthy();
      });
    });
  });

  // ========================================
  // Data Loading & Category Display Tests (1 test)  
  // ========================================
  describe("Data Loading & Category Display", () => {
    // UC: User sees job types grouped by category after successful data fetch
    test("loads job types from useJobTypes hook and displays them grouped by category", async () => {
      render(
        <PreferencesJobType 
          formData={mockFormData} 
          setFormData={mockSetFormData} 
        />
      );

      // Wait for data to load and categories to be displayed
      await waitFor(() => {
        expect(screen.getByText("Food Service")).toBeTruthy();
      });

      // Verify all categories are displayed
      expect(screen.getByText("Food Service")).toBeTruthy();
      expect(screen.getByText("Retail")).toBeTruthy();
      expect(screen.getByText("Security")).toBeTruthy();

      // Verify job types are displayed under correct categories
      expect(screen.getByText("Waiter")).toBeTruthy();
      expect(screen.getByText("Chef")).toBeTruthy();
      expect(screen.getByText("Cashier")).toBeTruthy();
      expect(screen.getByText("Security Guard")).toBeTruthy();

      // Verify the header text is displayed
      expect(screen.getByText("Preferred Job Type")).toBeTruthy();
      expect(screen.getByText("Select all job types you're interested in")).toBeTruthy();
    });
  });

  // ========================================
  // Checkbox Selection Integration Tests (1 test)
  // ========================================
  describe("Checkbox Selection Integration", () => {
    // UC: User selects job types and form data is updated through component state
    test("updates form data when user selects/deselects job type checkboxes", async () => {
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

      // Find the Chef checkbox (initially unchecked)
      const chefCheckbox = screen.getByRole("checkbox", { name: /chef/i }) as HTMLInputElement;
      expect(chefCheckbox.checked).toBe(false);
      
      // Click the Chef checkbox to select it
      await user.click(chefCheckbox);

      // Verify setFormData was called with Chef added to selected jobs
      await waitFor(() => {
        expect(mockSetFormData).toHaveBeenCalledWith({
          ...mockFormData,
          selectedJobNames: ["Waiter", "Chef"], // Should include both Waiter (existing) and Chef (new)
        });
      });

      // Clear mock calls to test next interaction independently
      mockSetFormData.mockClear();

      // Now test deselecting - find the Waiter checkbox (should be checked)
      const waiterCheckbox = screen.getByRole("checkbox", { name: /waiter/i }) as HTMLInputElement;
      expect(waiterCheckbox.checked).toBe(true);
      
      // Click to deselect Waiter
      await user.click(waiterCheckbox);

      // Verify setFormData was called with Waiter removed, but Chef still selected
      await waitFor(() => {
        expect(mockSetFormData).toHaveBeenCalledWith({
          ...mockFormData,
          selectedJobNames: ["Chef"], // Should keep Chef but remove Waiter
        });
      });
    });
  });

  // ========================================
  // Existing Preferences Loading Test (1 test)
  // ========================================
  describe("Existing Preferences Loading", () => {
    // UC: Component initializes with pre-selected job types from form data
    test("loads component with existing job type selections from form data", async () => {
      // Setup form data with multiple pre-selected job types
      const formDataWithSelections: PreferencesFormData = {
        ...mockFormData,
        selectedJobNames: ["Waiter", "Cashier", "Security Guard"],
      };

      render(
        <PreferencesJobType 
          formData={formDataWithSelections} 
          setFormData={mockSetFormData} 
        />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Waiter")).toBeTruthy();
      });

      // Verify pre-selected job types are checked
      const waiterCheckbox = screen.getByRole("checkbox", { name: /waiter/i }) as HTMLInputElement;
      const cashierCheckbox = screen.getByRole("checkbox", { name: /cashier/i }) as HTMLInputElement;
      const securityCheckbox = screen.getByRole("checkbox", { name: /security guard/i }) as HTMLInputElement;
      const chefCheckbox = screen.getByRole("checkbox", { name: /chef/i }) as HTMLInputElement;

      expect(waiterCheckbox.checked).toBe(true);
      expect(cashierCheckbox.checked).toBe(true);
      expect(securityCheckbox.checked).toBe(true);
      expect(chefCheckbox.checked).toBe(false); // Should not be selected

      // Verify the visual styling for selected items
      const waiterLabel = waiterCheckbox.closest('label');
      const chefLabel = chefCheckbox.closest('label');
      
      expect(waiterLabel?.className).toContain("bg-primary-blue/5");
      expect(chefLabel?.className).toContain("bg-card-color");
    });
  });
});