/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { PasswordField } from "../../../src/components/PasswordField";

// Import jest-dom matchers
import "@testing-library/jest-dom";

describe("PasswordField Component - UC1 Step 3: Core Password Features", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Password Input - UC1 Step 3", () => {
    it("renders password field with label and input", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          required
        />
      );

      // Check for separate elements - component renders label text and asterisk separately
      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });

    it("displays current password value (masked)", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value="mypassword"
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByDisplayValue("mypassword");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("calls onChange when typing", async () => {
      const user = userEvent.setup();

      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByPlaceholderText("••••••••");
      await user.type(passwordInput, "test");

      // userEvent.type() calls onChange for each character typed
      expect(mockOnChange).toHaveBeenCalledTimes(4);
      expect(mockOnChange).toHaveBeenLastCalledWith("t");
    });
  });

  describe("Password Visibility Toggle - UC1 Step 3", () => {
    it("renders show/hide password toggle button", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
        />
      );

      const toggleButton = screen.getByRole("button");
      expect(toggleButton).toBeInTheDocument();
    });

    it("toggles password visibility when button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <PasswordField
          id="password"
          label="Password"
          value="secret123"
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByDisplayValue("secret123");
      const toggleButton = screen.getByRole("button");

      // Initially password type
      expect(passwordInput).toHaveAttribute("type", "password");

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      // Click to hide password again
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Password Requirements - UC1 Step 3", () => {
    it("shows required asterisk when required", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          required
        />
      );

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    // Note: Optional password testing removed - covered by AuthFormFields integration tests

    it("shows minimum length requirement", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          minLength={6}
        />
      );

      expect(screen.getByText("Minimum 6 characters")).toBeInTheDocument();
    });

    it("applies required attribute to input", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          required
        />
      );

      const passwordInput = screen.getByPlaceholderText("••••••••");
      expect(passwordInput).toBeRequired();
    });
  });

  describe("Error Display - UC1 Step 3", () => {
    it("shows error message when provided", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          error="Password is too weak"
        />
      );

      expect(screen.getByText("Password is too weak")).toBeInTheDocument();
    });

    it("applies error styling to input", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          error="Password is too weak"
        />
      );

      const passwordInput = screen.getByPlaceholderText("••••••••");
      expect(passwordInput).toHaveClass("border-red");
    });
  });

  describe("Disabled State - UC1 Step 3", () => {
    it("disables input when disabled prop is true", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          disabled
        />
      );

      const passwordInput = screen.getByPlaceholderText("••••••••");
      const toggleButton = screen.getByRole("button");

      expect(passwordInput).toBeDisabled();
      expect(toggleButton).toBeDisabled();
    });
  });

  describe("Form Integration - UC1 Step 3", () => {
    it("has correct id for form association", () => {
      render(
        <PasswordField
          id="signup-password"
          label="Password"
          value=""
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByPlaceholderText("••••••••");
      expect(passwordInput).toHaveAttribute("id", "signup-password");
    });

    it("associates label with input correctly", () => {
      render(
        <PasswordField
          id="signup-password"
          label="Password"
          value=""
          onChange={mockOnChange}
        />
      );

      const label = screen.getByText("Password");
      const passwordInput = screen.getByPlaceholderText("••••••••");

      expect(label).toHaveAttribute("for", "signup-password");
      expect(passwordInput).toHaveAttribute("id", "signup-password");
    });

    it("integrates properly with form submission", () => {
      render(
        <form>
          <PasswordField
            id="password"
            label="Password"
            value="password123"
            onChange={mockOnChange}
          />
        </form>
      );

      const passwordInput = screen.getByDisplayValue("password123");
      expect(passwordInput.closest("form")).toBeInTheDocument();
    });
  });

  describe("UC1 Password Security", () => {
    it("masks password by default", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value="secretpassword"
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByDisplayValue("secretpassword");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("accepts custom placeholder text", () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          placeholder="Enter secure password"
        />
      );

      expect(screen.getByPlaceholderText("Enter secure password")).toBeInTheDocument();
    });
  });
});
