/**
 * UC2: Sign In - Component-level navigation completion tests
 * Verifies that after a successful login the user is navigated to the correct route
 */

/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Ensure we use the real react-router-dom (override test setup mock)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return { ...actual };
});

import { MemoryRouter, Routes, Route } from "react-router-dom";
import Auth from "../../../src/pages/Auth";

import "@testing-library/jest-dom";

// Mock Supabase client used by useAuth
vi.mock("../../../src/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn((cb?: any) => {
        // Simulate the Supabase API shape
        return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
      }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Import the mocked client to control behavior in tests
import { supabase } from "../../../src/integrations/supabase/client";

// Simple pages to assert navigation results
const EmployeePreferencesPage = () => <h1>Employee Preferences Page</h1>;
const EmployerDashboardPage = () => <h1>Employer Dashboard Page</h1>;

const AppRoutes = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={["/auth?mode=login"]}>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/employee/preferences" element={<EmployeePreferencesPage />} />
      <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
      {/* Fallback to render Auth for unknown routes during test */}
      <Route path="*" element={<Auth />} />
    </Routes>
    {children}
  </MemoryRouter>
);

describe("UC2: Auth component - navigation completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates jobseeker to /employee/preferences after successful login", async () => {
    // Arrange: mock successful sign-in with jobseeker metadata
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: {
          id: "jobseeker-user-id",
          email: "user@test.com",
          created_at: new Date().toISOString(),
          user_metadata: { user_type: "job-seeker" },
          app_metadata: {},
          aud: "authenticated",
        },
        session: null,
      },
      error: null,
    } as any);

    render(<AppRoutes>{null}</AppRoutes>);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("john@example.com"), "user@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "Password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Employee Preferences Page")).toBeInTheDocument();
    });
  });

  it("navigates employer to /employer/dashboard after successful login", async () => {
    // Arrange: mock successful sign-in with employer metadata
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: {
          id: "employer-user-id",
          email: "employer@test.com",
          created_at: new Date().toISOString(),
          user_metadata: { user_type: "client" },
          app_metadata: {},
          aud: "authenticated",
        },
        session: null,
      },
      error: null,
    } as any);

    render(<AppRoutes>{null}</AppRoutes>);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("john@example.com"), "employer@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "Password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Employer Dashboard Page")).toBeInTheDocument();
    });
  });
});

