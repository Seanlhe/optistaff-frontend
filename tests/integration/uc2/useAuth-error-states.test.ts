/**
 * UC2: useAuth - error state mapping tests
 * Ensures Supabase auth errors map to the explicit messages from the UC2 sequence diagram
 */

import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../../../src/hooks/useAuth";

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));

// Mock Supabase client
vi.mock("../../../src/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

// Import mocked modules
import { supabase } from "../../../src/integrations/supabase/client";

// Mock utils (not used directly here but consistent with other tests)
vi.mock("../../../src/utils/authentication", () => ({
  validateSignupForm: vi.fn(),
  formatUserData: vi.fn(),
}));

const mockSupabaseAuth = supabase.auth as any;

describe("UC2: useAuth - auth error message mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabaseAuth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("maps 'Invalid login credentials' to 'Invalid credentials' and does not navigate", async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 400 },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.login("user@test.com", "WrongPass1");

    await waitFor(() => {
      expect(result.current.error).toBe("Invalid credentials");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("maps 'Email not confirmed' to 'Please verify your email' and does not navigate", async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Email not confirmed", status: 400 },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.login("user@test.com", "AnyPassword1");

    await waitFor(() => {
      expect(result.current.error).toBe("Please verify your email");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

