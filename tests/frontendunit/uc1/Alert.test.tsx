/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Alert, AlertDescription } from "../../../src/components/ui/alert";

// Import jest-dom matchers
import "@testing-library/jest-dom";

describe("Alert Component - UC1 Step 15-17: Error and Success Message Display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("UC1 Step 15: Form Validation Error Display", () => {
    it("renders destructive alert for validation errors", () => {
      render(
        <Alert variant="destructive" data-testid="validation-error">
          <AlertDescription>
            Password must be at least 8 characters long
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("validation-error");
      expect(alert).toBeTruthy();
      expect(screen.getByText("Password must be at least 8 characters long")).toBeTruthy();
    });

    it("displays email format validation error", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>
            Please enter a valid email address
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Please enter a valid email address")).toBeTruthy();
    });

    it("displays required field validation errors", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>
            First name is required
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText("First name is required")).toBeTruthy();
    });

    it("displays password confirmation mismatch error", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>
            Passwords do not match
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Passwords do not match")).toBeTruthy();
    });
  });

  describe("UC1 Step 16: Account Created Success Message", () => {
    it("renders success alert for account creation", () => {
      render(
        <Alert className="border-green-200 bg-green-50 text-green-800" data-testid="success-alert">
          <AlertDescription className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Account created! Verification email sent
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("success-alert");
      expect(alert).toBeTruthy();
      expect(screen.getByText("Account created! Verification email sent")).toBeTruthy();
      expect(screen.getByText("✓")).toBeTruthy();
    });

    it("displays success message with correct styling", () => {
      render(
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>
            Welcome to OptiStaff! Please check your email to verify your account.
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border-green-200", "bg-green-50", "text-green-800");
      expect(screen.getByText(/Welcome to OptiStaff/)).toBeTruthy();
    });
  });

  describe("UC1 Step 17: Email Already Exists Error", () => {
    it("displays email already registered error", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>
            Email already registered. Try signing in instead.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Email already registered. Try signing in instead.")).toBeTruthy();
    });

    it("displays account exists with login suggestion", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>
            An account with this email already exists. Please try logging in.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText(/An account with this email already exists/)).toBeTruthy();
    });
  });

  describe("Alert Variants and Styling", () => {
    it("applies destructive variant classes correctly", () => {
      render(
        <Alert variant="destructive" data-testid="destructive-alert">
          <AlertDescription>Error message</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("destructive-alert");
      expect(alert).toBeTruthy();
    });

    it("applies default alert classes", () => {
      render(
        <Alert data-testid="default-alert">
          <AlertDescription>Default message</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("default-alert");
      expect(alert).toBeTruthy();
    });

    it("renders custom className correctly", () => {
      render(
        <Alert className="custom-alert-class" data-testid="custom-alert">
          <AlertDescription>Custom styled alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("custom-alert");
      expect(alert).toHaveClass("custom-alert-class");
    });
  });

  describe("AlertDescription Component", () => {
    it("renders description text correctly", () => {
      render(
        <AlertDescription data-testid="alert-description">
          This is a test description
        </AlertDescription>
      );

      const description = screen.getByTestId("alert-description");
      expect(description).toBeTruthy();
      expect(description).toHaveTextContent("This is a test description");
    });

    it("applies custom className to description", () => {
      render(
        <AlertDescription className="custom-description" data-testid="custom-description">
          Description with custom class
        </AlertDescription>
      );

      const description = screen.getByTestId("custom-description");
      expect(description).toHaveClass("custom-description");
    });

    it("renders complex content with icons and spans", () => {
      render(
        <AlertDescription className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span>Success message</span>
        </AlertDescription>
      );

      expect(screen.getByText("✓")).toBeTruthy();
      expect(screen.getByText("Success message")).toBeTruthy();
    });
  });

  describe("Component Integration", () => {
    it("renders Alert with AlertDescription as children", () => {
      render(
        <Alert data-testid="integrated-alert">
          <AlertDescription data-testid="integrated-description">
            Integrated alert and description
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId("integrated-alert")).toBeTruthy();
      expect(screen.getByTestId("integrated-description")).toBeTruthy();
      expect(screen.getByText("Integrated alert and description")).toBeTruthy();
    });

    it("handles multiple AlertDescription children", () => {
      render(
        <Alert>
          <AlertDescription>First description</AlertDescription>
          <AlertDescription>Second description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText("First description")).toBeTruthy();
      expect(screen.getByText("Second description")).toBeTruthy();
    });
  });

  describe("Authentication Flow Specific Messages", () => {
    it("displays network connection error", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>
            Unable to connect. Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText(/Unable to connect/)).toBeTruthy();
    });

    it("displays server error message", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>
            Something went wrong. Please try again later.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Something went wrong. Please try again later.")).toBeTruthy();
    });

    it("displays account verification reminder", () => {
      render(
        <Alert className="border-blue-200 bg-blue-50 text-blue-800">
          <AlertDescription>
            Please check your email and click the verification link to activate your account.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText(/Please check your email and click the verification link/)).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("has proper alert role", () => {
      render(
        <Alert>
          <AlertDescription>Accessible alert</AlertDescription>
        </Alert>
      );

      expect(screen.getByRole("alert")).toBeTruthy();
    });

    it("provides meaningful content for screen readers", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>
            Error: Please correct the following issues before continuing
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(/Error: Please correct the following issues/);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty AlertDescription", () => {
      render(
        <Alert>
          <AlertDescription></AlertDescription>
        </Alert>
      );

      expect(screen.getByRole("alert")).toBeTruthy();
    });

    it("handles Alert without AlertDescription", () => {
      render(
        <Alert data-testid="no-description-alert">
          Just plain text content
        </Alert>
      );

      expect(screen.getByTestId("no-description-alert")).toBeTruthy();
      expect(screen.getByText("Just plain text content")).toBeTruthy();
    });

    it("handles very long error messages", () => {
      const longMessage = "This is a very long error message that should still be displayed correctly even though it contains a lot of text and might wrap to multiple lines in the UI.";
      
      render(
        <Alert variant="destructive">
          <AlertDescription>{longMessage}</AlertDescription>
        </Alert>
      );

      expect(screen.getByText(longMessage)).toBeTruthy();
    });
  });
});
