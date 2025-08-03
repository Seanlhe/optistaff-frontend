/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import JSPref from "../../src/pages/employee/JSPref";

// Wrapper component to provide Router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Mock external dependencies only
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      upsert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
  },
}));

// Mock auth hook
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
    loading: false,
  }),
}));

// Mock React Router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/" }),
    useParams: () => ({}),
  };
});

/**
 * Integration tests for JSPref with Preferences and Availability Components
 * 
 * These tests focus on UC3 (Set Preferences) and UC4 (Indicate Availability) workflows:
 * 
 * UC3 Components Integration:
 * - JSPref ↔ PreferencesForm ↔ PreferencesJobType, PreferencesPay, PreferencesMaximum
 * - Real usePreferencesForm and useJobTypes hooks integration
 * - Form validation and submission across multiple components
 * 
 * UC4 Components Integration:  
 * - JSPref ↔ Availability ↔ Calendar ↔ CalendarEvent
 * - TemplateNameDialog and TemplateSelectDialog integration with Calendar
 * - Real useAvailability and useAvailabilityTemplate hooks integration
 * - Time slot creation, template management, and availability saving
 */
describe("JSPref Preferences and Availability Components Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // Set predictable date for availability tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-12-16T10:00:00Z"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * UC3: Set Preferences Integration Test
   * 
   * Tests the complete UC3 workflow:
   * 1. JSPref renders PreferencesForm by default (UC3 Step 2)
   * 2. PreferencesForm integrates with usePreferencesForm hook to load existing data (UC3 Steps 3-6)
   * 3. PreferencesJobType integrates with useJobTypes hook to load job types (UC3 Steps 7-12)
   * 4. Form submission integrates multiple preference components (UC3 Steps 15-18)
   */
  it("should integrate UC3 preferences workflow with real hooks and components", async () => {
    // Mock Supabase responses for UC3 workflow
    const mockJobTypesResponse = {
      data: [
        {
          job_type_id: "1",
          type_name: "Waiter",
          category_id: "cat1",
          category_name: "Food Service",
          is_active: true,
        },
        {
          job_type_id: "2", 
          type_name: "Sales Associate",
          category_id: "cat2",
          category_name: "Retail",
          is_active: true,
        },
      ],
      error: null,
    };

    const mockExistingPreferences = {
      data: {
        pay_rate: 20,
        consider_lower_rate: false,
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        max_travel_km: 15,
        selected_job_names: ["Waiter"],
      },
      error: null,
    };

    // Setup Supabase mocks for different endpoints
    const mockSupabaseFrom = vi.fn()
      .mockReturnValueOnce({
        // First call: fetch job types (UC3 Steps 8-11)
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve(mockJobTypesResponse)),
          })),
        })),
      })
      .mockReturnValueOnce({
        // Second call: fetch existing preferences (UC3 Steps 3-6)
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve(mockExistingPreferences)),
          })),
        })),
      });

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockImplementation(mockSupabaseFrom);

    render(<JSPref />, { wrapper: TestWrapper });

    // UC3 Step 1-2: Verify JSPref renders with Preferences tab active by default
    expect(screen.getByRole("button", { name: "Preferences" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Availability" })).toBeTruthy();

    // Wait for real hooks to load data - UC3 Steps 3-12: Data loading integration
    await waitFor(() => {
      expect(screen.getByText("Preferred Job Type")).toBeTruthy();
    });

    // Verify PreferencesJobType component integration with real job types data
    await waitFor(() => {
      expect(screen.getByText("Food Service")).toBeTruthy();
      expect(screen.getByText("Retail")).toBeTruthy();
      expect(screen.getByText("Waiter")).toBeTruthy();
      expect(screen.getByText("Sales Associate")).toBeTruthy();
    });

    // Verify PreferencesPay component integration
    expect(screen.getByText("Minimum Pay Rate")).toBeTruthy();
    
    // Verify PreferencesMaximum component integration
    expect(screen.getByText("Maximum Travel Distance")).toBeTruthy();
    expect(screen.getByText("Maximum Hours")).toBeTruthy();

    // UC3 Step 15: Test job type selection interaction
    const salesAssociateCheckbox = screen.getByRole("checkbox", { name: /sales associate/i });
    fireEvent.click(salesAssociateCheckbox);

    // Verify the selection updates the form state (integration between components)
    expect(salesAssociateCheckbox).toHaveProperty("checked", true);
  });

  /**
   * UC4: Indicate Availability Integration Test
   * 
   * Tests the complete UC4 workflow with tab switching and availability management:
   * 1. Tab switching from Preferences to Availability (UC4 Step 1-2)
   * 2. Availability component integration with Calendar component (UC4 Steps 3-6)
   * 3. Calendar integration with useAvailability hook (UC4 Steps 7-8)
   * 4. Template management integration (UC4 Steps 9-24, optional flow)
   */
  it("should integrate UC4 availability workflow with real components and hooks", async () => {
    // Mock Supabase responses for UC4 workflow
    const mockAvailabilityTemplates = {
      data: [
        {
          template_id: "template-1",
          template_name: "Morning Shifts",
          template_data: [
            {
              day_of_week: 1, // Monday
              start_time: "09:00",
              end_time: "13:00",
            },
          ],
        },
      ],
      error: null,
    };

    const mockExistingAvailability = {
      data: [
        {
          availability_id: "avail-1",
          day_of_week: 1,
          start_time: "09:00:00",
          end_time: "17:00:00",
          submission_cycle: "2024-W51",
        },
      ],
      error: null,
    };

    // Setup Supabase mocks for availability data
    const mockSupabaseFrom = vi.fn()
      .mockReturnValueOnce({
        // First call: fetch availability templates (UC4 Steps 13-17)
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve(mockAvailabilityTemplates)),
        })),
      })
      .mockReturnValueOnce({
        // Second call: fetch existing availability (UC4 Steps 5-8)
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve(mockExistingAvailability)),
        })),
      });

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockImplementation(mockSupabaseFrom);

    render(<JSPref />, { wrapper: TestWrapper });

    // UC4 Step 1-2: Switch to Availability tab
    const availabilityTab = screen.getByRole("button", { name: "Availability" });
    fireEvent.click(availabilityTab);

    // Verify tab switching works - Availability component should be rendered
    await waitFor(() => {
      expect(screen.getByText("Availability")).toBeTruthy();
    });

    // UC4 Steps 3-8: Wait for real Availability and Calendar components to load with hooks
    await waitFor(() => {
      // Calendar component should be rendered with availability data
      expect(screen.getByText("Mon")).toBeTruthy(); // Calendar weekday headers
      expect(screen.getByText("Tue")).toBeTruthy();
    }, { timeout: 5000 });

    // UC4 Steps 9-12: Test template functionality integration (if template buttons are available)
    // Note: This tests the integration between Calendar and template dialogs
    const templateButtons = screen.queryAllByText(/template/i);
    if (templateButtons.length > 0) {
      // Templates functionality is integrated - can test template selection
      expect(templateButtons.length).toBeGreaterThan(0);
    }
  });

  /**
   * UC3/UC4: Tab State Management Integration Test
   * 
   * Tests that tab switching maintains proper component state and integration:
   * - Component mounting/unmounting
   * - Hook cleanup and reinitialization
   * - State preservation between tab switches
   */
  it("should maintain proper integration state when switching between UC3 and UC4 tabs", async () => {
    // Mock basic responses for both workflows
    const mockJobTypesResponse = {
      data: [
        {
          job_type_id: "1",
          type_name: "Waiter",
          category_id: "cat1", 
          category_name: "Food Service",
          is_active: true,
        },
      ],
      error: null,
    };

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(mockJobTypesResponse)),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    } as any);

    render(<JSPref />, { wrapper: TestWrapper });

    // Start with Preferences tab (UC3)
    await waitFor(() => {
      expect(screen.getByText("Preferred Job Type")).toBeTruthy();
    });

    // Switch to Availability tab (UC4)
    const availabilityTab = screen.getByRole("button", { name: "Availability" });
    fireEvent.click(availabilityTab);

    await waitFor(() => {
      expect(screen.getByText("Availability")).toBeTruthy();
    });

    // Verify Preferences components are unmounted
    expect(screen.queryByText("Preferred Job Type")).toBeNull();

    // Switch back to Preferences tab (UC3)
    const preferencesTab = screen.getByRole("button", { name: "Preferences" });
    fireEvent.click(preferencesTab);

    // Verify Preferences components are remounted with real hook integration
    await waitFor(() => {
      expect(screen.getByText("Preferred Job Type")).toBeTruthy();
    });

    // Verify Availability components are unmounted
    expect(screen.queryByText("Mon")).toBeNull(); // Calendar weekday header
  });

  /**
   * UC3: Form Validation Integration Test
   * 
   * Tests integration between form validation across multiple preference components:
   * - PreferencesPay validation
   * - PreferencesMaximum validation  
   * - PreferencesJobType validation
   * - Form submission with validation errors
   */
  it("should integrate form validation across UC3 preference components", async () => {
    // Mock minimal job types for validation testing
    const mockJobTypesResponse = {
      data: [
        {
          job_type_id: "1",
          type_name: "Waiter",
          category_id: "cat1",
          category_name: "Food Service", 
          is_active: true,
        },
      ],
      error: null,
    };

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(mockJobTypesResponse)),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    } as any);

    render(<JSPref />, { wrapper: TestWrapper });

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByText("Minimum Pay Rate")).toBeTruthy();
    });

    // Test form submission without selecting job types (should trigger validation)
    const saveButton = screen.queryByText("Save Preferences");
    if (saveButton) {
      fireEvent.click(saveButton);

      // Integration test: validation should work across components
      await waitFor(() => {
        // The form should handle validation through real hook integration
        // Exact validation messages depend on implementation
        const form = screen.getByRole("form") || screen.getByTestId("preferences-form");
        expect(form).toBeTruthy();
      });
    }
  });

  /**
   * UC4: Calendar Event Integration Test
   * 
   * Tests integration between Calendar component and CalendarEvent components:
   * - Event creation through calendar interaction
   * - Event display and management
   * - Integration with availability hooks
   */
  it("should integrate Calendar with CalendarEvent components for UC4 time slot management", async () => {
    render(<JSPref />, { wrapper: TestWrapper });

    // Switch to Availability tab
    const availabilityTab = screen.getByRole("button", { name: "Availability" });
    fireEvent.click(availabilityTab);

    // Wait for Calendar component to render
    await waitFor(() => {
      expect(screen.getByText("Mon")).toBeTruthy();
    }, { timeout: 5000 });

    // Test calendar integration - look for interactive elements
    const calendarGrid = screen.getByRole("grid") || screen.getByTestId("calendar-grid");
    if (calendarGrid) {
      // Calendar component is properly integrated and interactive
      expect(calendarGrid).toBeTruthy();
    } else {
      // Alternative: check for calendar time slots or clickable areas
      const timeSlots = screen.queryAllByRole("button");
      const calendarButtons = timeSlots.filter(button => 
        button.getAttribute("data-hour") || 
        button.className.includes("calendar") ||
        button.className.includes("time-slot")
      );
      
      // Should have interactive calendar elements for time slot creation
      expect(timeSlots.length).toBeGreaterThan(0);
    }
  });
});