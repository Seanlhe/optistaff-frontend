import { render, screen, fireEvent } from "@testing-library/react";
import Signup from "@/pages/Signup";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import * as useAuthHook from "@/hooks/useAuth";

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Signup Page", () => {
  it("renders first name, email and password inputs", () => {
    renderWithRouter(<Signup />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("does not call signup if passwords mismatch", async () => {
    const mockSignup = vi.fn();
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({
      signup: mockSignup,
      loading: false,
      error: null,
    });

    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "pass1234" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "different1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(mockSignup).not.toHaveBeenCalled();
  });
});
