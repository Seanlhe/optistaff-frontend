/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthHeader } from "../../src/components/auth/AuthHeader";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: ({ children, to, className, ...props }: any) => (
      <a href={to} className={className} data-testid="mock-link" {...props}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
  };
});

// Wrapper component for routing context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("AuthHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering Tests", () => {
    it("renders component without crashing", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("OptiStaff")).toBeTruthy();
    });

    it("displays OptiStaff brand name as link", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const brandLink = screen.getByText("OptiStaff");
      expect(brandLink).toBeTruthy();
      expect(brandLink.closest("a")?.getAttribute("href")).toBe("/");
    });

    it("displays welcome back title for login mode", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("Welcome Back")).toBeTruthy();
      expect(screen.getByText("Sign in to your account")).toBeTruthy();
    });

    it("displays create account title for signup mode", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={true} />
        </RouterWrapper>
      );

      expect(screen.getByText("Create Account")).toBeTruthy();
      expect(screen.getByText("Sign up for OptiStaff")).toBeTruthy();
    });
  });

  describe("Link Navigation Tests", () => {
    it("has correct home link URL for brand name", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const brandLink = screen.getByText("OptiStaff").closest("a");
      expect(brandLink?.getAttribute("href")).toBe("/");
    });

    it("brand link is clickable", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const brandLink = screen.getByText("OptiStaff");
      fireEvent.click(brandLink);

      // Test passes if no errors are thrown
      expect(brandLink).toBeTruthy();
    });
  });

  describe("CSS Classes and Styling Tests", () => {
    it("applies correct CSS classes to brand link", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const brandLink = screen.getByText("OptiStaff").closest("a");
      expect(brandLink?.className).toContain("text-4xl");
      expect(brandLink?.className).toContain("font-montserrat-b");
      expect(brandLink?.className).toContain("text-primary-text");
      expect(brandLink?.className).toContain("hover:text-secondary-text");
      expect(brandLink?.className).toContain("transition-colors");
    });

    it("applies correct CSS classes to main title", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const title = screen.getByText("Welcome Back");
      expect(title.className).toContain("text-3xl");
      expect(title.className).toContain("font-montserrat-smb");
      expect(title.className).toContain("text-primary-text");
    });

    it("applies correct CSS classes to subtitle", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const subtitle = screen.getByText("Sign in to your account");
      expect(subtitle.className).toContain("text-secondary-text");
      expect(subtitle.className).toContain("font-montserrat");
    });

    it("applies correct container classes", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const container = screen.getByText("OptiStaff").closest("div");
      expect(container?.className).toContain("text-center");
      expect(container?.className).toContain("space-y-4");
      expect(container?.className).toContain("mb-8");
    });
  });

  describe("Content Variation Tests", () => {
    it("displays correct content for login mode", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("Welcome Back")).toBeTruthy();
      expect(screen.getByText("Sign in to your account")).toBeTruthy();
      expect(screen.queryByText("Create Account")).toBeNull();
      expect(screen.queryByText("Sign up for OptiStaff")).toBeNull();
    });

    it("displays correct content for signup mode", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={true} />
        </RouterWrapper>
      );

      expect(screen.getByText("Create Account")).toBeTruthy();
      expect(screen.getByText("Sign up for OptiStaff")).toBeTruthy();
      expect(screen.queryByText("Welcome Back")).toBeNull();
      expect(screen.queryByText("Sign in to your account")).toBeNull();
    });
  });

  describe("Prop Changes Tests", () => {
    it("handles isSignup prop changes correctly", () => {
      const { rerender } = render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("Welcome Back")).toBeTruthy();
      expect(screen.getByText("Sign in to your account")).toBeTruthy();

      rerender(
        <RouterWrapper>
          <AuthHeader isSignup={true} />
        </RouterWrapper>
      );

      expect(screen.getByText("Create Account")).toBeTruthy();
      expect(screen.getByText("Sign up for OptiStaff")).toBeTruthy();
    });

    it("maintains brand link across prop changes", () => {
      const { rerender } = render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const brandLink = screen.getByText("OptiStaff");
      expect(brandLink).toBeTruthy();

      rerender(
        <RouterWrapper>
          <AuthHeader isSignup={true} />
        </RouterWrapper>
      );

      const brandLinkAfter = screen.getByText("OptiStaff");
      expect(brandLinkAfter).toBeTruthy();
      expect(brandLinkAfter.closest("a")?.getAttribute("href")).toBe("/");
    });
  });

  describe("Accessibility Tests", () => {
    it("has proper heading hierarchy", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("Welcome Back");
    });

    it("has accessible link for brand name", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const brandLink = screen.getByRole("link");
      expect(brandLink).toBeTruthy();
      expect(brandLink.textContent).toBe("OptiStaff");
      expect(brandLink.getAttribute("href")).toBe("/");
    });

    it("provides meaningful text content", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("OptiStaff")).toBeTruthy();
      expect(screen.getByText("Welcome Back")).toBeTruthy();
      expect(screen.getByText("Sign in to your account")).toBeTruthy();
    });
  });

  describe("Component Structure Tests", () => {
    it("renders with correct HTML structure", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const mainContainer = screen.getByText("OptiStaff").closest("div");
      expect(mainContainer?.className).toContain("text-center");
      expect(mainContainer?.className).toContain("space-y-4");
      expect(mainContainer?.className).toContain("mb-8");

      const textContainer = screen.getByText("Welcome Back").closest("div");
      expect(textContainer?.className).toContain("space-y-2");
    });

    it("contains exactly one link", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(1);
    });

    it("contains exactly one heading", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(1);
    });
  });

  describe("Text Content Tests", () => {
    it("displays brand name consistently", () => {
      const { rerender } = render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("OptiStaff")).toBeTruthy();

      rerender(
        <RouterWrapper>
          <AuthHeader isSignup={true} />
        </RouterWrapper>
      );

      expect(screen.getByText("OptiStaff")).toBeTruthy();
    });

    it("shows contextual welcome messages", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText(/Welcome Back/)).toBeTruthy();
      expect(screen.getByText(/Sign in to your account/)).toBeTruthy();
    });

    it("shows contextual signup messages", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={true} />
        </RouterWrapper>
      );

      expect(screen.getByText(/Create Account/)).toBeTruthy();
      expect(screen.getByText(/Sign up for OptiStaff/)).toBeTruthy();
    });
  });

  describe("Interaction Tests", () => {
    it("handles brand link clicks without errors", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const brandLink = screen.getByText("OptiStaff");
      
      expect(() => {
        fireEvent.click(brandLink);
      }).not.toThrow();
    });

    it("brand link hover behavior works", () => {
      render(
        <RouterWrapper>
          <AuthHeader isSignup={false} />
        </RouterWrapper>
      );

      const brandLink = screen.getByText("OptiStaff");
      
      fireEvent.mouseOver(brandLink);
      fireEvent.mouseOut(brandLink);

      // Test passes if no errors are thrown
      expect(brandLink).toBeTruthy();
    });
  });
});