/**
 * UC2: Sign In - Auth component stays on login when errors occur
 * Verifies that on authentication errors, the Auth page displays the error and does not navigate
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

// Mock Supabase client used by the real useAuth hook
vi.mock("../../../src/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn((cb?: any) => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

import { supabase } from "../../../src/integrations/supabase/client";

const EmployeePreferencesPage = () => <h1>Employee Preferences Page</h1>;
const EmployerDashboardPage = () => <h1>Employer Dashboard Page</h1>;

const AppRoutes = () => (
  <MemoryRouter initialEntries={["/auth?mode=login"]}>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/employee/preferences" element={<EmployeePreferencesPage />} />
      <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
      <Route path="*" element={<Auth />} />
    </Routes>
  </MemoryRouter>
);

describe("UC2: Auth component - stays on login when error occurs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays error and does not navigate on invalid credentials", async () => {
    // Arrange: Supabase returns an auth error (invalid credentials). Current useAuth maps this to a generic message
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 400 } as any,
    });

    render(<AppRoutes />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("john@example.com"), "user@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "WrongPass1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert: The page remains on Auth login view and shows an error
    await waitFor(() => {
      // Still on Auth (header present)
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      // Expect mapped message per UC2
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    // Assert: Did not navigate to either destination page
    expect(screen.queryByText("Employee Preferences Page")).not.toBeInTheDocument();
    expect(screen.queryByText("Employer Dashboard Page")).not.toBeInTheDocument();
  });

  it("displays error and does not navigate on unverified email", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Email not confirmed", status: 400 } as any,
    });

    render(<AppRoutes />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("john@example.com"), "user@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "AnyPassword1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      // Expect mapped message per UC2
      expect(screen.getByText("Please verify your email")).toBeInTheDocument();
    });

    expect(screen.queryByText("Employee Preferences Page")).not.toBeInTheDocument();
    expect(screen.queryByText("Employer Dashboard Page")).not.toBeInTheDocument();
  });
});

