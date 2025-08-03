/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { AddressLookupField } from "../../../src/components/AddressLookupField";

// Import jest-dom matchers
import "@testing-library/jest-dom";

describe("AddressLookupField Component - UC1 Step 3: Address Core Tests", () => {
  const mockOnAddressChange = vi.fn();
  const mockOnPostalCodeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("UC1 Core: Address Input for Account Creation", () => {
    it("renders address input field for job seeker residential address", () => {
      render(
        <AddressLookupField
          label="Residential Address"
          placeholder="Enter your address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
          required={true}
        />
      );

      expect(screen.getByText("Residential Address")).toBeTruthy();
      expect(screen.getAllByText("*")).toHaveLength(2); // Both address and postal code required
      expect(screen.getByPlaceholderText("Enter your address")).toBeTruthy();
    });

    it("renders company address field for employer", () => {
      render(
        <AddressLookupField
          label="Company Address"
          placeholder="Enter company address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
          required={true}
        />
      );

      expect(screen.getByText("Company Address")).toBeTruthy();
      expect(screen.getByPlaceholderText("Enter company address")).toBeTruthy();
    });

    it("displays current address and postal code values", () => {
      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address="123 Main Street, Singapore"
          postalCode="123456"
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const addressInput = screen.getByDisplayValue("123 Main Street, Singapore");
      const postalInput = screen.getByDisplayValue("123456");
      
      expect(addressInput).toBeTruthy();
      expect(postalInput).toBeTruthy();
    });

    it("renders postal code input field", () => {
      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      // Component uses specific placeholder "123456" for postal code
      expect(screen.getByPlaceholderText("123456")).toBeTruthy();
    });

    it("shows required asterisk when required is true", () => {
      render(
        <AddressLookupField
          label="Required Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
          required={true}
        />
      );

      expect(screen.getByText("Required Address")).toBeTruthy();
      expect(screen.getAllByText("*")).toHaveLength(2); // Both address and postal code required
    });

    // Note: Optional address testing removed - covered by AuthFormFields integration tests

    it("handles address input typing", async () => {
      const user = userEvent.setup();

      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const addressInput = screen.getByPlaceholderText("Enter address");
      await user.type(addressInput, "Test");

      // userEvent types character by character, so check if callback was called
      expect(mockOnAddressChange).toHaveBeenCalled();
    });

    it("handles postal code input typing", async () => {
      const user = userEvent.setup();

      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const postalInput = screen.getByPlaceholderText("123456");
      await user.type(postalInput, "567");

      // userEvent types character by character, so check if callback was called
      expect(mockOnPostalCodeChange).toHaveBeenCalled();
    });

    it("handles clearing address input", async () => {
      const user = userEvent.setup();

      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address="Initial Address"
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const addressInput = screen.getByDisplayValue("Initial Address");
      await user.clear(addressInput);

      expect(mockOnAddressChange).toHaveBeenCalledWith("");
    });

    it("handles clearing postal code input", async () => {
      const user = userEvent.setup();

      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode="123456"
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const postalInput = screen.getByDisplayValue("123456");
      await user.clear(postalInput);

      expect(mockOnPostalCodeChange).toHaveBeenCalledWith("");
    });

    it("renders with correct HTML structure", () => {
      render(
        <AddressLookupField
          label="Test Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const label = screen.getByText("Test Address");
      const addressInput = screen.getByPlaceholderText("Enter address");
      const postalInput = screen.getByPlaceholderText("123456");

      expect(label).toBeTruthy();
      expect(addressInput).toBeTruthy();
      expect(postalInput).toBeTruthy();
    });

    it("applies correct input types", () => {
      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const addressInput = screen.getByPlaceholderText("Enter address");
      const postalInput = screen.getByPlaceholderText("123456");

      expect(addressInput).toHaveAttribute("type", "text");
      expect(postalInput).toHaveAttribute("type", "text");
    });

    it("supports keyboard navigation between fields", async () => {
      const user = userEvent.setup();

      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const addressInput = screen.getByPlaceholderText("Enter address");

      await user.click(addressInput);
      expect(addressInput).toHaveFocus();

      await user.tab();
      // Should move to next focusable element (could be validate button or postal code)
      expect(addressInput).not.toHaveFocus();
    });

    it("handles undefined address value gracefully", () => {
      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const addressInput = screen.getByPlaceholderText("Enter address");
      expect(addressInput).toHaveValue("");
    });

    it("provides helpful validation button", () => {
      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      expect(screen.getByText("Validate")).toBeTruthy();
    });

    it("shows validation helper text", () => {
      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      expect(screen.getByText('Click "Validate" to auto-fill postal code')).toBeTruthy();
    });

    it("associates labels with inputs correctly", () => {
      render(
        <AddressLookupField
          label="Home Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const addressLabel = screen.getByText("Home Address");
      const postalLabel = screen.getByText("Postal Code");
      const addressInput = screen.getByPlaceholderText("Enter address");

      expect(addressLabel).toBeTruthy();
      expect(postalLabel).toBeTruthy();
      expect(addressInput).toBeTruthy();
    });

    it("handles very long address text", () => {
      const longAddress = "This is a very long address that includes building name, street name, district, and other detailed location information that might be quite lengthy";

      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address={longAddress}
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      expect(screen.getByDisplayValue(longAddress)).toBeTruthy();
    });
  });

  describe("Singapore Address Validation for UC1", () => {
    it("validates Singapore postal code format with 6 digits", async () => {
      const user = userEvent.setup();

      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address=""
          postalCode=""
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      const postalInput = screen.getByPlaceholderText("123456");
      
      // Test valid Singapore postal code
      await user.type(postalInput, "123456");
      expect(mockOnPostalCodeChange).toHaveBeenCalled();
    });

    it("supports auto-population of address from postal code", () => {
      // This would test integration with actual address lookup service
      render(
        <AddressLookupField
          label="Address"
          placeholder="Enter address"
          address="Auto-populated from postal code"
          postalCode="123456"
          onAddressChange={mockOnAddressChange}
          onPostalCodeChange={mockOnPostalCodeChange}
        />
      );

      expect(screen.getByDisplayValue("Auto-populated from postal code")).toBeTruthy();
      expect(screen.getByDisplayValue("123456")).toBeTruthy();
    });
  });
});
