/**
 * Frontend Unit Tests for usePreferences Hooks
 * @description Tests the React hooks that use database functions for preferences management
 * @author OptiStaff Team
 * @testing_approach Frontend hook testing with mocked database functions
 */

import { describe, test, expect, beforeEach, vi, Mock } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePreferences } from '../../src/hooks/usePreferences'
import { usePreferencesForm } from '../../src/hooks/usePreferencesForm'
import { usePreferencesLocation } from '../../src/hooks/usePreferencesLocation'

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
}

// Mock the auth hook
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'jobseeker'
}

const mockUseAuth = vi.fn(() => ({
  user: mockUser,
  loading: false,
  error: null
}))

// Mock the location geocoding hook
const mockUseLocationGeocoding = vi.fn(() => ({
  geocodeAddress: vi.fn(),
  reverseGeocode: vi.fn(),
  loading: false,
  error: null
}))

// Mock modules
vi.mock('../../src/integrations/supabase/client', () => ({
  supabase: mockSupabase
}))

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: mockUseAuth
}))

vi.mock('../../src/hooks/useLocationGeocoding', () => ({
  useLocationGeocoding: mockUseLocationGeocoding
}))

describe('usePreferences Hook - Frontend Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========================================
  // usePreferences Core Hook Tests
  // ========================================
  describe('usePreferences Hook', () => {
    describe('fetchPreferences function', () => {
      test('successfully fetches existing preferences', async () => {
        // Arrange
        const mockPreferences = {
          preference_id: 'pref-123',
          user_id: 'test-user-id',
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['Waiter', 'Chef'],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPreferences,
                error: null
              })
            })
          })
        })

        // Act
        const { result } = renderHook(() => usePreferences())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Assert
        expect(result.current.preferences).toEqual(mockPreferences)
        expect(result.current.error).toBeNull()
        expect(mockSupabase.from).toHaveBeenCalledWith('preferences')
      })

      test('creates default preferences when none exist', async () => {
        // Arrange
        const mockDefaultPreferences = {
          preference_id: 'pref-456',
          user_id: 'test-user-id',
          min_pay_rate: 15,
          max_travel_km: 15,
          desired_roles: [],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }

        // Mock preferences not found
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'No rows found' }
              })
            })
          })
        })

        // Mock create_default_preferences RPC
        mockSupabase.rpc.mockResolvedValue({
          data: [mockDefaultPreferences],
          error: null
        })

        // Act
        const { result } = renderHook(() => usePreferences())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Assert
        expect(result.current.preferences).toEqual(mockDefaultPreferences)
        expect(mockSupabase.rpc).toHaveBeenCalledWith('create_default_preferences', {
          p_user_id: 'test-user-id'
        })
      })

      test('handles authentication error', async () => {
        // Arrange
        mockUseAuth.mockReturnValue({
          user: null,
          loading: false,
          error: null
        })

        // Act
        const { result } = renderHook(() => usePreferences())

        // Assert
        expect(result.current.error).toBe('User not authenticated')
        expect(result.current.preferences).toBeNull()
      })
    })

    describe('savePreferences function', () => {
      test('successfully saves preferences using upsert function', async () => {
        // Arrange
        const mockSavedPreferences = {
          preference_id: 'pref-789',
          user_id: 'test-user-id',
          min_pay_rate: 25,
          max_travel_km: 20,
          desired_roles: ['Manager'],
          max_hours_per_week: 35,
          max_hours_per_shift: 7,
          consider_lower_rate: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          validation_errors: []
        }

        mockSupabase.rpc.mockResolvedValue({
          data: [mockSavedPreferences],
          error: null
        })

        const { result } = renderHook(() => usePreferences())

        const preferencesData = {
          min_pay_rate: 25,
          max_travel_km: 20,
          desired_roles: ['Manager'],
          max_hours_per_week: 35,
          max_hours_per_shift: 7,
          consider_lower_rate: true
        }

        // Act
        let saveResult: boolean = false
        await act(async () => {
          saveResult = await result.current.savePreferences(preferencesData)
        })

        // Assert
        expect(saveResult).toBe(true)
        expect(mockSupabase.rpc).toHaveBeenCalledWith('upsert_user_preferences', {
          p_target_user_id: 'test-user-id',
          p_min_pay_rate: 25,
          p_max_travel_km: 20,
          p_desired_roles: ['Manager'],
          p_max_hours_per_week: 35,
          p_max_hours_per_shift: 7,
          p_consider_lower_rate: true
        })
        expect(result.current.preferences).toEqual(mockSavedPreferences)
      })

      test('handles validation errors from upsert function', async () => {
        // Arrange
        const mockValidationError = {
          preference_id: null,
          user_id: null,
          min_pay_rate: null,
          max_travel_km: null,
          desired_roles: null,
          max_hours_per_week: null,
          max_hours_per_shift: null,
          consider_lower_rate: null,
          created_at: null,
          updated_at: null,
          validation_errors: ['One or more selected job types are invalid or inactive']
        }

        mockSupabase.rpc.mockResolvedValue({
          data: [mockValidationError],
          error: null
        })

        const { result } = renderHook(() => usePreferences())

        const preferencesData = {
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['InvalidJob'],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        }

        // Act
        let saveResult: boolean = true
        await act(async () => {
          saveResult = await result.current.savePreferences(preferencesData)
        })

        // Assert
        expect(saveResult).toBe(false)
        expect(result.current.error).toBe('One or more selected job types are invalid or inactive')
      })
    })

    describe('updatePreferences function', () => {
      test('successfully updates partial preferences', async () => {
        // Arrange
        const initialPreferences = {
          preference_id: 'pref-123',
          user_id: 'test-user-id',
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['Waiter'],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        }

        const updatedPreferences = {
          ...initialPreferences,
          max_travel_km: 25
        }

        // Mock initial state
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: initialPreferences,
                error: null
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedPreferences,
                  error: null
                })
              })
            })
          })
        })

        const { result } = renderHook(() => usePreferences())

        await waitFor(() => {
          expect(result.current.preferences).toEqual(initialPreferences)
        })

        // Act
        let updateResult: boolean = false
        await act(async () => {
          updateResult = await result.current.updatePreferences({ max_travel_km: 25 })
        })

        // Assert
        expect(updateResult).toBe(true)
        expect(result.current.preferences?.max_travel_km).toBe(25)
      })
    })

    describe('resetPreferences function', () => {
      test('successfully resets preferences to defaults', async () => {
        // Arrange
        const mockDefaultPreferences = {
          preference_id: 'pref-reset',
          user_id: 'test-user-id',
          min_pay_rate: 15,
          max_travel_km: 15,
          desired_roles: [],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }

        // Mock delete operation
        mockSupabase.from.mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        })

        // Mock create_default_preferences RPC
        mockSupabase.rpc.mockResolvedValue({
          data: [mockDefaultPreferences],
          error: null
        })

        const { result } = renderHook(() => usePreferences())

        // Act
        let resetResult: boolean = false
        await act(async () => {
          resetResult = await result.current.resetPreferences()
        })

        // Assert
        expect(resetResult).toBe(true)
        expect(result.current.preferences).toEqual(mockDefaultPreferences)
        expect(mockSupabase.rpc).toHaveBeenCalledWith('create_default_preferences', {
          p_user_id: 'test-user-id'
        })
      })
    })

    describe('helper functions', () => {
      test('hasJobPreference returns correct boolean', async () => {
        // Arrange
        const mockPreferences = {
          preference_id: 'pref-123',
          user_id: 'test-user-id',
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['Waiter', 'Chef'],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        }

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPreferences,
                error: null
              })
            })
          })
        })

        const { result } = renderHook(() => usePreferences())

        await waitFor(() => {
          expect(result.current.preferences).toEqual(mockPreferences)
        })

        // Act & Assert
        expect(result.current.hasJobPreference('Waiter')).toBe(true)
        expect(result.current.hasJobPreference('Manager')).toBe(false)
      })

      test('getPreferredJobTypes returns correct array', async () => {
        // Arrange
        const mockPreferences = {
          preference_id: 'pref-123',
          user_id: 'test-user-id',
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['Waiter', 'Chef', 'Bartender'],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        }

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPreferences,
                error: null
              })
            })
          })
        })

        const { result } = renderHook(() => usePreferences())

        await waitFor(() => {
          expect(result.current.preferences).toEqual(mockPreferences)
        })

        // Act & Assert
        expect(result.current.getPreferredJobTypes()).toEqual(['Waiter', 'Chef', 'Bartender'])
      })
    })
  })

  // ========================================
  // usePreferencesLocation Hook Tests
  // ========================================
  describe('usePreferencesLocation Hook', () => {
    describe('loadLocationData function', () => {
      test('successfully loads location data using database function', async () => {
        // Arrange
        const mockLocationData = {
          user_id: 'test-user-id',
          address_coordinates: '1.3521,103.8198',
          postal_code: '123456',
          address: '123 Marina Bay, Singapore',
          coordinates_lat: 1.3521,
          coordinates_lng: 103.8198,
          formatted_address: '123 Marina Bay, Singapore, Singapore 123456'
        }

        mockSupabase.rpc.mockResolvedValue({
          data: [mockLocationData],
          error: null
        })

        // Act
        const { result } = renderHook(() => usePreferencesLocation())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Assert
        expect(result.current.homeLocation).toEqual([1.3521, 103.8198])
        expect(result.current.homeAddress).toBe('123 Marina Bay, Singapore, Singapore 123456')
        expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_location', {
          p_user_id: 'test-user-id'
        })
      })

      test('handles empty location data gracefully', async () => {
        // Arrange
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null
        })

        // Act
        const { result } = renderHook(() => usePreferencesLocation())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Assert
        expect(result.current.homeLocation).toBeNull()
        expect(result.current.homeAddress).toBeNull()
        expect(result.current.locationData).toBeNull()
      })

      test('handles location data with missing coordinates', async () => {
        // Arrange
        const mockLocationData = {
          user_id: 'test-user-id',
          address_coordinates: null,
          postal_code: '654321',
          address: null,
          coordinates_lat: null,
          coordinates_lng: null,
          formatted_address: 'Singapore 654321'
        }

        mockSupabase.rpc.mockResolvedValue({
          data: [mockLocationData],
          error: null
        })

        // Act
        const { result } = renderHook(() => usePreferencesLocation())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Assert
        expect(result.current.homeLocation).toBeNull()
        expect(result.current.homeAddress).toBe('Singapore 654321')
        expect(result.current.locationData?.postal_code).toBe('654321')
      })
    })

    describe('geocodeHomeLocation function', () => {
      test('returns existing coordinates if available', async () => {
        // Arrange
        const mockLocationData = {
          user_id: 'test-user-id',
          address_coordinates: '1.3521,103.8198',
          postal_code: '123456',
          address: '123 Marina Bay, Singapore',
          coordinates_lat: 1.3521,
          coordinates_lng: 103.8198,
          formatted_address: '123 Marina Bay, Singapore, Singapore 123456'
        }

        mockSupabase.rpc.mockResolvedValue({
          data: [mockLocationData],
          error: null
        })

        const { result } = renderHook(() => usePreferencesLocation())

        await waitFor(() => {
          expect(result.current.homeLocation).toEqual([1.3521, 103.8198])
        })

        // Act
        let coordinates: [number, number] | null = null
        await act(async () => {
          coordinates = await result.current.geocodeHomeLocation()
        })

        // Assert
        expect(coordinates).toEqual([1.3521, 103.8198])
      })

      test('geocodes from postal code when coordinates missing', async () => {
        // Arrange
        const mockLocationData = {
          user_id: 'test-user-id',
          address_coordinates: null,
          postal_code: '123456',
          address: null,
          coordinates_lat: null,
          coordinates_lng: null,
          formatted_address: 'Singapore 123456'
        }

        mockSupabase.rpc.mockResolvedValue({
          data: [mockLocationData],
          error: null
        })

        const mockGeocodeAddress = vi.fn().mockResolvedValue([1.3521, 103.8198])
        const mockReverseGeocode = vi.fn().mockResolvedValue('123 Marina Bay, Singapore')

        mockUseLocationGeocoding.mockReturnValue({
          geocodeAddress: mockGeocodeAddress,
          reverseGeocode: mockReverseGeocode,
          loading: false,
          error: null
        })

        const { result } = renderHook(() => usePreferencesLocation())

        await waitFor(() => {
          expect(result.current.locationData?.postal_code).toBe('123456')
        })

        // Act
        let coordinates: [number, number] | null = null
        await act(async () => {
          coordinates = await result.current.geocodeHomeLocation()
        })

        // Assert
        expect(coordinates).toEqual([1.3521, 103.8198])
        expect(mockGeocodeAddress).toHaveBeenCalledWith('123456')
        expect(result.current.homeLocation).toEqual([1.3521, 103.8198])
      })
    })
  })

  // ========================================
  // usePreferencesForm Hook Tests
  // ========================================
  describe('usePreferencesForm Hook', () => {
    describe('validateJobNames function', () => {
      test('successfully validates job names using database function', async () => {
        // Arrange
        mockSupabase.rpc.mockResolvedValue({
          data: true,
          error: null
        })

        const { result } = renderHook(() => usePreferencesForm())

        // Act
        let validationResult: { isValid: boolean; error?: string } = { isValid: false }
        await act(async () => {
          validationResult = await result.current.validateJobNames(['Waiter', 'Chef'])
        })

        // Assert
        expect(validationResult.isValid).toBe(true)
        expect(mockSupabase.rpc).toHaveBeenCalledWith('validate_job_names', {
          job_names: ['Waiter', 'Chef']
        })
      })

      test('handles validation failure', async () => {
        // Arrange
        mockSupabase.rpc.mockResolvedValue({
          data: false,
          error: null
        })

        const { result } = renderHook(() => usePreferencesForm())

        // Act
        let validationResult: { isValid: boolean; error?: string } = { isValid: true }
        await act(async () => {
          validationResult = await result.current.validateJobNames(['InvalidJob'])
        })

        // Assert
        expect(validationResult.isValid).toBe(false)
      })

      test('handles empty job names array', async () => {
        // Arrange
        const { result } = renderHook(() => usePreferencesForm())

        // Act
        let validationResult: { isValid: boolean; error?: string } = { isValid: false }
        await act(async () => {
          validationResult = await result.current.validateJobNames([])
        })

        // Assert
        expect(validationResult.isValid).toBe(true)
        expect(mockSupabase.rpc).not.toHaveBeenCalled() // Should not call RPC for empty array
      })
    })

    describe('savePreferences with optimistic updates', () => {
      test('applies optimistic update and reverts on validation failure', async () => {
        // Arrange
        const initialPreferences = {
          preference_id: 'pref-123',
          user_id: 'test-user-id',
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['Waiter'],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        }

        // Mock initial preferences fetch
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: initialPreferences,
                error: null
              })
            })
          })
        })

        // Mock validation failure
        mockSupabase.rpc
          .mockResolvedValueOnce({ data: false, error: null }) // validate_job_names fails
          .mockResolvedValueOnce({ data: initialPreferences, error: null }) // fetchPreferences for revert

        const { result } = renderHook(() => usePreferencesForm())

        await waitFor(() => {
          expect(result.current.preferences).toEqual(initialPreferences)
        })

        const formData = {
          payRate: 25,
          considerLowerRate: true,
          maxHoursPerWeek: 35,
          maxHoursPerShift: 7,
          maxTravelKm: 20,
          selectedJobNames: ['InvalidJob']
        }

        // Act
        let saveResult: boolean = true
        await act(async () => {
          saveResult = await result.current.savePreferences(formData)
        })

        // Assert
        expect(saveResult).toBe(false)
        expect(result.current.error).toContain('invalid or inactive')
        // Should revert to original preferences
        expect(result.current.preferences).toEqual(initialPreferences)
      })
    })

    describe('getFormData function', () => {
      test('converts preferences to form data format', async () => {
        // Arrange
        const mockPreferences = {
          preference_id: 'pref-123',
          user_id: 'test-user-id',
          min_pay_rate: 22,
          max_travel_km: 18,
          desired_roles: ['Server', 'Bartender'],
          max_hours_per_week: 35,
          max_hours_per_shift: 7,
          consider_lower_rate: true
        }

        const mockLocationData = [1.3521, 103.8198] as [number, number]
        const mockAddress = '123 Marina Bay, Singapore'

        // Mock preferences fetch
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPreferences,
                error: null
              })
            })
          })
        })

        // Mock location data
        mockSupabase.rpc.mockResolvedValue({
          data: [{
            user_id: 'test-user-id',
            address_coordinates: '1.3521,103.8198',
            postal_code: '123456',
            address: '123 Marina Bay, Singapore',
            coordinates_lat: 1.3521,
            coordinates_lng: 103.8198,
            formatted_address: '123 Marina Bay, Singapore, Singapore 123456'
          }],
          error: null
        })

        const { result } = renderHook(() => usePreferencesForm())

        await waitFor(() => {
          expect(result.current.preferences).toEqual(mockPreferences)
        })

        // Act
        const formData = result.current.getFormData()

        // Assert
        expect(formData).toEqual({
          payRate: 22,
          considerLowerRate: true,
          maxHoursPerWeek: 35,
          maxHoursPerShift: 7,
          maxTravelKm: 18,
          selectedJobNames: ['Server', 'Bartender'],
          homeLocation: [1.3521, 103.8198],
          homeAddress: '123 Marina Bay, Singapore, Singapore 123456'
        })
      })
    })
  })
})