/**
 * usePayouts Hook - Pure Unit Tests
 * @description Unit tests for usePayouts hook without external dependencies
 * @testing-strategy Isolated unit testing with mocked dependencies
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { usePayouts } from '../../src/hooks/usePayouts';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/integrations/supabase/client';

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock Supabase client
vi.mock('../../src/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn()
  }
}));

describe('usePayouts Hook Unit Tests', () => {
  const mockUseAuth = vi.mocked(useAuth);
  const mockSupabaseRpc = vi.mocked(supabase.rpc);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    test('initializes with correct default values', () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user-id' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 0, error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      expect(result.current.totalEarnings).toBe(0);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.fetchTotalEarnings).toBe('function');
    });
  });

  describe('Authentication Handling', () => {
    test('handles missing user gracefully', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: null } as any);

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('User not authenticated');
        expect(result.current.totalEarnings).toBe(0);
      });
    });

    test('handles undefined user gracefully', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: undefined } as any);

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('User not authenticated');
        expect(result.current.totalEarnings).toBe(0);
      });
    });

    test('handles user without id property', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: {} } as any);

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('User not authenticated');
        expect(result.current.totalEarnings).toBe(0);
      });
    });

    test('works with valid authenticated user', async () => {
      // Arrange
      const testUserId = 'valid-user-123';
      mockUseAuth.mockReturnValue({ user: { id: testUserId } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 150.50, error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.totalEarnings).toBe(150.50);
      });

      expect(mockSupabaseRpc).toHaveBeenCalledWith(
        'get_user_total_earnings',
        { target_user_id: testUserId }
      );
    });
  });

  describe('API Call Handling', () => {
    test('calls correct RPC function with user ID', async () => {
      // Arrange
      const testUserId = 'test-user-456';
      mockUseAuth.mockReturnValue({ user: { id: testUserId } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 100, error: null });

      // Act
      renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledTimes(1);
        expect(mockSupabaseRpc).toHaveBeenCalledWith(
          'get_user_total_earnings',
          { target_user_id: testUserId }
        );
      });
    });

    test('handles successful API response with number data', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 250.75, error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.totalEarnings).toBe(250.75);
      });
    });

    test('handles successful API response with string data', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: '300.25', error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.totalEarnings).toBe(300.25);
      });
    });

    test('handles null/undefined data gracefully', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: null, error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.totalEarnings).toBe(0);
      });
    });

    test('handles API error response', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: null, error: { message: errorMessage } });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.totalEarnings).toBe(0);
      });
    });

    test('handles network/promise rejection', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockRejectedValue(networkError);

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Network timeout');
        expect(result.current.totalEarnings).toBe(0);
      });
    });
  });

  describe('Loading State Management', () => {
    test('sets loading to true during API call', () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      // Keep promise pending to test loading state
      mockSupabaseRpc.mockReturnValue(new Promise(() => {}));

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      expect(result.current.loading).toBe(true);
    });

    test('sets loading to false after successful API call', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 100, error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test('sets loading to false after API error', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: null, error: { message: 'Error' } });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Error State Management', () => {
    test('clears previous error on new successful fetch', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      
      // First call with error
      mockSupabaseRpc.mockResolvedValueOnce({ data: null, error: { message: 'First error' } });
      const { result } = renderHook(() => usePayouts());

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // Second call successful
      mockSupabaseRpc.mockResolvedValueOnce({ data: 200, error: null });

      // Act - manually trigger fetch
      await result.current.fetchTotalEarnings();

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe(null);
        expect(result.current.totalEarnings).toBe(200);
      });
    });

    test('preserves totalEarnings on API error', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      
      // First successful call
      mockSupabaseRpc.mockResolvedValueOnce({ data: 150, error: null });
      const { result } = renderHook(() => usePayouts());

      await waitFor(() => {
        expect(result.current.totalEarnings).toBe(150);
      });

      // Second call with error
      mockSupabaseRpc.mockResolvedValueOnce({ data: null, error: { message: 'Error' } });

      // Act
      await result.current.fetchTotalEarnings();

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Error');
        expect(result.current.totalEarnings).toBe(150); // Should remain unchanged
      });
    });
  });

  describe('fetchTotalEarnings Function', () => {
    test('can be called manually', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 500, error: null });

      const { result } = renderHook(() => usePayouts());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear the mock to test manual call
      vi.clearAllMocks();
      mockSupabaseRpc.mockResolvedValue({ data: 600, error: null });

      // Act
      await result.current.fetchTotalEarnings();

      // Assert
      expect(mockSupabaseRpc).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(result.current.totalEarnings).toBe(600);
      });
    });

    test('manual call respects authentication state', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 100, error: null });

      const { result, rerender } = renderHook(() => usePayouts());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Change auth state to no user
      mockUseAuth.mockReturnValue({ user: null } as any);
      rerender();

      // Act - manual call with no user
      await result.current.fetchTotalEarnings();

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('User not authenticated');
      });
    });
  });

  describe('Data Type Conversion', () => {
    test('converts string numbers to numeric values', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: '123.45', error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.totalEarnings).toBe(123.45);
        expect(typeof result.current.totalEarnings).toBe('number');
      });
    });

    test('handles zero values correctly', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 0, error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.totalEarnings).toBe(0);
      });
    });

    test('handles invalid numeric strings', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({ user: { id: 'test-user' } } as any);
      mockSupabaseRpc.mockResolvedValue({ data: 'invalid-number', error: null });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      await waitFor(() => {
        expect(result.current.totalEarnings).toBe(0); // Falls back to 0 due to Number(NaN) || 0
      });
    });
  });
});