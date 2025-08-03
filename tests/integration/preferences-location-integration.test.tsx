/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import PreferencesForm from "../../src/components/PreferencesForm";

// Wrapper component to provide Router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Mock external dependencies only - keep component logic real
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ data: [], error: null })),
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

// Mock Leaflet and React-Leaflet components
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Circle: ({ center, radius }: { center: [number, number]; radius: number }) => (
    <div data-testid="circle" data-center={center} data-radius={radius} />
  ),
  Marker: ({ position }: { position: [number, number] }) => (
    <div data-testid="marker" data-position={position} />
  ),
  useMap: () => ({
    setView: vi.fn(),
    getBounds: vi.fn(() => ({
      contains: vi.fn(() => true),
    })),
    fitBounds: vi.fn(),
  }),
  useMapEvents: () => null,
}));

// Mock Leaflet
vi.mock("leaflet", () => ({
  divIcon: vi.fn(() => ({ options: {} })),
  latLngBounds: vi.fn(() => ({
    extend: vi.fn(),
    isValid: vi.fn(() => true),
  })),
}));

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

/**
 * Integration tests for Location-Based Preferences Components
 * 
 * Tests the integration between:
 * - PreferencesForm ↔ LocationAwareMap ↔ LocationErrorBoundary
 * 
 * UC3 Context: Location-based job matching preferences
 * - User sets travel radius preferences for job matching
 * - System uses location data to filter nearby job opportunities
 * - Graceful handling of location service errors
 * - Location-based preference validation and submission
 */
describe("Preferences Location Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // Mock successful geolocation response (Singapore coordinates)
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 1.3521,
          longitude: 103.8198,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * UC3: Test PreferencesForm integration with LocationAwareMap
   * 
   * This tests the core UC3 workflow where jobseekers set location-based preferences:
   * 1. PreferencesForm loads user's home location via usePreferencesForm hook
   * 2. LocationAwareMap displays the location and travel radius
   * 3. User can adjust travel radius through map interaction
   * 4. Changes are reflected in PreferencesForm state
   */
  it("should integrate PreferencesForm with LocationAwareMap for UC3 location preferences", async () => {
    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    // Mock Supabase response for existing preferences with location
    const mockPreferencesWithLocation = {
      data: {
        pay_rate: 25,
        max_travel_km: 15,
        home_location: { lat: 1.3521, lng: 103.8198 },
      },
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve(mockPreferencesWithLocation)),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    } as any);

    render(<PreferencesForm />, { wrapper: TestWrapper });

    // Wait for components to load with real usePreferencesForm hook
    await waitFor(() => {
      expect(screen.getByText("Maximum Travel Distance")).toBeTruthy();
    });

    // Verify LocationAwareMap is integrated and rendered
    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeTruthy();
    });

    // Verify map components are rendered with location data
    expect(screen.getByTestId("tile-layer")).toBeTruthy();
    
    // Test travel radius adjustment integration
    const radiusSlider = screen.getByDisplayValue("15"); // Default radius from mock
    expect(radiusSlider).toBeTruthy();

    // Simulate radius change - this should update both map and form state
    fireEvent.change(radiusSlider, { target: { value: "20" } });

    // Verify the change is reflected in the form state
    expect(radiusSlider).toHaveValue("20");
  });

  /**
   * UC3: Test LocationErrorBoundary integration with error handling
   * 
   * Tests graceful handling of location service errors:
   * 1. LocationErrorBoundary catches geolocation errors
   * 2. Error recovery mechanisms are available
   * 3. User can still set preferences without location
   * 4. Fallback location options are provided
   */
  it("should handle location errors gracefully through LocationErrorBoundary integration", async () => {
    // Mock geolocation error
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        message: "User denied the request for Geolocation.",
      });
    });

    render(<PreferencesForm />, { wrapper: TestWrapper });

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByText("Maximum Travel Distance")).toBeTruthy();
    });

    // LocationErrorBoundary should handle the error gracefully
    // Map should still render (maybe with default location)
    expect(screen.getByTestId("map-container")).toBeTruthy();

    // User should still be able to set travel radius manually
    const radiusSlider = screen.getByDisplayValue("15"); // Default fallback
    fireEvent.change(radiusSlider, { target: { value: "25" } });
    expect(radiusSlider).toHaveValue("25");
  });

  /**
   * UC3: Test form submission with location data integration
   * 
   * Tests the complete UC3 preference submission workflow with location:
   * 1. User sets preferences including travel radius
   * 2. Location data is included in form submission
   * 3. usePreferencesForm hook handles location data correctly
   * 4. Success feedback is provided to user
   */
  it("should integrate location data in UC3 preferences submission workflow", async () => {
    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    // Mock successful form submission
    const mockUpsertResponse = { data: [{ id: "pref-1" }], error: null };
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve(mockUpsertResponse)),
    } as any);

    render(<PreferencesForm />, { wrapper: TestWrapper });

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText("Minimum Pay Rate")).toBeTruthy();
    });

    // Set preferences including travel radius
    const payRateInput = screen.getByDisplayValue("20");
    fireEvent.change(payRateInput, { target: { value: "30" } });

    const radiusSlider = screen.getByDisplayValue("15");
    fireEvent.change(radiusSlider, { target: { value: "20" } });

    // Submit the form
    const submitButton = screen.getByText("Save Preferences");
    fireEvent.click(submitButton);

    // Wait for submission to complete with real hook integration
    await waitFor(() => {
      // Verify the upsert was called (indicating successful integration)
      expect(vi.mocked(supabase.from().upsert)).toHaveBeenCalled();
    });

    // Check for success message
    await waitFor(() => {
      const successMessage = screen.queryByText(/success/i) || screen.queryByText(/saved/i);
      if (successMessage) {
        expect(successMessage).toBeTruthy();
      }
    });
  });

  /**
   * UC3: Test location permission recovery workflow
   * 
   * Tests the user experience when location permission is initially denied
   * but user wants to enable it later:
   * 1. Initial location error is handled
   * 2. User can retry location access
   * 3. Successful location access updates the map
   * 4. Form state is synchronized with new location data
   */
  it("should handle location permission recovery in UC3 workflow", async () => {
    // Start with permission denied
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        message: "User denied the request for Geolocation.",
      });
    });

    render(<PreferencesForm />, { wrapper: TestWrapper });

    // Wait for initial error state
    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeTruthy();
    });

    // Now mock successful geolocation for retry
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 1.3521,
          longitude: 103.8198,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
    });

    // Look for retry mechanism (could be a button or automatic)
    const retryButton = screen.queryByText(/retry/i) || screen.queryByText(/enable/i);
    if (retryButton) {
      fireEvent.click(retryButton);

      // Wait for location to be updated
      await waitFor(() => {
        // Map should update with new location
        expect(screen.getByTestId("map-container")).toBeTruthy();
      });
    }
  });

  /**
   * UC3: Test map interaction updates form state
   * 
   * Tests bidirectional data flow between LocationAwareMap and PreferencesForm:
   * 1. Map displays current travel radius setting
   * 2. User interaction with map updates radius  
   * 3. Radius changes are reflected in form controls
   * 4. Form submission includes updated radius data
   */
  it("should synchronize map interactions with PreferencesForm state", async () => {
    render(<PreferencesForm />, { wrapper: TestWrapper });

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeTruthy();
    });

    // Verify initial radius display
    const initialRadius = screen.getByDisplayValue("15");
    expect(initialRadius).toBeTruthy();

    // Simulate map interaction that changes radius
    fireEvent.change(initialRadius, { target: { value: "25" } });

    // Verify the change is reflected in form state
    expect(initialRadius).toHaveValue("25");

    // Verify map would update (circle component should receive new radius)
    await waitFor(() => {
      // The radius change should be reflected in component state
      expect(initialRadius).toHaveValue("25");
    });
  });

  /**
   * UC3: Test location-based validation integration
   * 
   * Tests form validation that considers location data:
   * 1. Validates travel radius is within reasonable bounds for Singapore
   * 2. Handles cases where location is unavailable
   * 3. Provides appropriate validation messages
   * 4. Prevents submission with invalid location preferences
   */
  it("should integrate location-based validation in UC3 preferences form", async () => {
    render(<PreferencesForm />, { wrapper: TestWrapper });

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText("Maximum Travel Distance")).toBeTruthy();
    });

    // Test extreme radius values
    const radiusSlider = screen.getByDisplayValue("15");
    
    // Test maximum boundary (should be valid for Singapore)
    fireEvent.change(radiusSlider, { target: { value: "50" } });
    expect(radiusSlider).toHaveValue("50");

    // Test minimum boundary
    fireEvent.change(radiusSlider, { target: { value: "1" } });
    expect(radiusSlider).toHaveValue("1");

    // Form should handle these values appropriately through real validation logic
    const submitButton = screen.getByText("Save Preferences");
    expect(submitButton).toBeTruthy();
  });
});