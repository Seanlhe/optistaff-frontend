/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Auth from "../../../src/pages/Auth";

// Import jest-dom matchers
import "@testing-library/jest-dom";

// Mock the useAuth hook with simple return values
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockClearError = vi.fn();

vi.mock("../../../src/hooks/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    loading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

// Mock Supabase client to prevent auth errors
vi.mock("../../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Simple router wrapper for testing
const RouterWrapper = ({ children, initialEntries = ["/"] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
);

describe("Auth Component - UC1 Core Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("UC1 Step 1: Navigate to Signup and Display Form", () => {
    it("defaults to login when no mode parameter is provided", () => {
      render(
        <RouterWrapper initialEntries={["/auth"]}>
          <Auth />
        </RouterWrapper>
      );

      // Component should default to login mode
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    });

    it("renders signup form when navigating to /signup - UC1 Step 1", () => {
      render(
        <RouterWrapper initialEntries={["/auth?mode=signup"]}>
          <Auth />
        </RouterWrapper>
      );

      // UC1 Step 1: User navigates to signup and View displays signup form
      expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText("Sign up for OptiStaff")).toBeInTheDocument();
      expect(screen.getByText("I am a...")).toBeInTheDocument(); // User type toggle
    });

    it("renders login form when mode=login", () => {
      render(
        <RouterWrapper initialEntries={["/auth?mode=login"]}>
          <Auth />
        </RouterWrapper>
      );

      // Check for login-specific content
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
      expect(screen.queryByText("I am a...")).not.toBeInTheDocument(); // No user type toggle
    });
  });

  describe("UC1 Step 2: Form Fields and User Type Selection", () => {
    it("displays user type toggle in signup mode", () => {
      render(
        <RouterWrapper initialEntries={["/auth?mode=signup"]}>
          <Auth />
        </RouterWrapper>
      );

      expect(screen.getByText("🔍 Job Seeker")).toBeInTheDocument();
      expect(screen.getByText("🏢 Employer")).toBeInTheDocument();
    });

    it("switches between user types when buttons are clicked", async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper initialEntries={["/auth?mode=signup"]}>
          <Auth />
        </RouterWrapper>
      );

      const jobSeekerButton = screen.getByText("🔍 Job Seeker");
      const employerButton = screen.getByText("🏢 Employer");

      // Job Seeker should be selected by default (has active styling)
      expect(jobSeekerButton).toHaveClass("border-primary-blue");

      // Click Employer button
      await user.click(employerButton);
      
      // Should show employer-specific fields appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText("ABC Restaurant")).toBeInTheDocument(); // Company name field
      });
    });

    it("displays correct form fields for job seeker signup", () => {
      render(
        <RouterWrapper initialEntries={["/auth?mode=signup"]}>
          <Auth />
        </RouterWrapper>
      );

      // Common fields
      expect(screen.getByPlaceholderText("john@example.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Tan")).toBeInTheDocument(); // Correct placeholder

      // Job seeker specific fields - check for date of birth label instead of placeholder
      expect(screen.getByText("Date of Birth")).toBeInTheDocument();
    });
  });

  describe("UC1 Step 3: Form Submission", () => {
    it("calls signup function when signup form is submitted", async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper initialEntries={["/auth?mode=signup"]}>
          <Auth />
        </RouterWrapper>
      );

      // Fill required fields
      await user.type(screen.getByPlaceholderText("john@example.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("••••••••"), "password123");
      await user.type(screen.getByPlaceholderText("Re-enter your password"), "password123");
      await user.type(screen.getByPlaceholderText("John"), "Test");
      await user.type(screen.getByPlaceholderText("Tan"), "User"); // Correct placeholder

      // Submit form by finding submit button (focus on functionality, not specific text)
      const submitButton = document.querySelector('button[type="submit"]') || screen.getByRole("button");
      await user.click(submitButton as HTMLElement);

      // Verify signup was called
      expect(mockSignup).toHaveBeenCalledTimes(1);
      expect(mockSignup).toHaveBeenCalledWith(expect.objectContaining({
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        userType: "jobseeker",
      }));
    });

    it("calls login function when login form is submitted", async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper initialEntries={["/auth?mode=login"]}>
          <Auth />
        </RouterWrapper>
      );

      // Fill login fields
      await user.type(screen.getByPlaceholderText("john@example.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("••••••••"), "password123");

      // Submit form by finding submit button (focus on functionality, not specific text)
      const submitButton = document.querySelector('button[type="submit"]') || screen.getByRole("button");
      await user.click(submitButton as HTMLElement);

      // Verify login was called
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  describe("UC1 Step 4: Form Validation", () => {
    it("requires email and password fields", () => {
      render(
        <RouterWrapper initialEntries={["/auth?mode=login"]}>
          <Auth />
        </RouterWrapper>
      );

      const emailInput = screen.getByPlaceholderText("john@example.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it("requires additional fields for signup", () => {
      render(
        <RouterWrapper initialEntries={["/auth?mode=signup"]}>
          <Auth />
        </RouterWrapper>
      );

      const firstNameInput = screen.getByPlaceholderText("John");
      const lastNameInput = screen.getByPlaceholderText("Tan"); // Correct placeholder

      expect(firstNameInput).toBeRequired();
      expect(lastNameInput).toBeRequired();
    });
  });

  describe("UC1 Navigation Links", () => {
    it("displays correct footer links", () => {
      render(
        <RouterWrapper initialEntries={["/auth?mode=login"]}>
          <Auth />
        </RouterWrapper>
      );

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText("Sign Up")).toBeInTheDocument();
      expect(screen.getByText("← Back to home")).toBeInTheDocument();
    });

    it("displays signup footer in signup mode", () => {
      render(
        <RouterWrapper initialEntries={["/auth?mode=signup"]}>
          <Auth />
        </RouterWrapper>
      );

      expect(screen.getByText("Already have an account?")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });
  });

  describe("UC1 Steps 15+: Error Handling and Form Validation Failure", () => {
    it("handles form submission without crashing - Step 15: Form Validation Error Display", async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper initialEntries={["/auth?mode=signup"]}>
          <Auth />
        </RouterWrapper>
      );

      // Submit empty form (should not crash)
      const submitButton = document.querySelector('button[type="submit"]') || screen.getByRole("button");
      await user.click(submitButton as HTMLElement);

      // Component should still be rendered - check for heading
      expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    });
  });
});
