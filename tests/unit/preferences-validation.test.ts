import { describe, test, expect } from 'vitest'
import { validatePreferences } from '../../src/utils/preferencesValidator'
import { UserPreferences } from '../../src/types/hooks'

describe('Preferences Validation - Unit Tests', () => {
  const baseValidPreferences: UserPreferences = {
    user_id: 'test-user-id',
    min_pay_rate: 20,
    max_travel_km: 15,
    desired_roles: ['Server'],
    max_hours_per_week: 40,
    max_hours_per_shift: 8,
    consider_lower_rate: false
  }

  describe('Boundary Value Testing for numeric fields', () => {
    test('validates minimum pay rate boundary (positive)', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: 5 // Minimum reasonable rate
      })

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('warns about very low pay rate', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: 3 // Below reasonable minimum
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Minimum pay rate seems too low (Singapore minimum wage considerations)')
    })

    test('rejects negative pay rate', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: -5
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Minimum pay rate cannot be negative')
    })

    test('validates minimum travel distance (0 km)', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_travel_km: 0
      })

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('rejects negative travel distance', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_travel_km: -1
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Maximum travel distance cannot be negative')
    })

    test('warns about unreasonably high travel distance', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_travel_km: 150 // Too high for Singapore
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Maximum travel distance seems unreasonably high for Singapore')
    })

    test('validates maximum hours per week (44 hours)', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_week: 44
      })

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('rejects hours per week over limit (45 hours)', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_week: 45
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Maximum hours per week cannot exceed 44 (Singapore labor law)')
    })

    test('validates minimum hours per week (1 hour) but fails logical consistency', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_week: 1,
        max_hours_per_shift: 8 // This will fail logical consistency check
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Maximum hours per shift cannot exceed maximum hours per week')
    })

    test('rejects zero hours per week', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_week: 0
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Maximum hours per week must be greater than 0')
    })

    test('validates maximum hours per shift (12 hours)', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_shift: 12
      })

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('rejects hours per shift over limit (13 hours)', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_shift: 13
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Maximum hours per shift cannot exceed 12 (Singapore labor law)')
    })
  })

  describe('Logical consistency validation', () => {
    test('rejects when shift hours exceed weekly hours', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_week: 20,
        max_hours_per_shift: 25 // More than weekly
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Maximum hours per shift cannot exceed maximum hours per week')
    })

    test('validates when shift hours are reasonable compared to weekly', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_week: 40,
        max_hours_per_shift: 8 // Reasonable
      })

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Singapore-specific validation', () => {
    test('warns about unreasonably high pay rate', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: 150 // Very high for Singapore
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Minimum pay rate seems unreasonably high')
    })

    test('accepts reasonable Singapore pay rates', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: 25 // Reasonable for Singapore
      })

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Complex validation scenarios', () => {
    test('accumulates multiple validation errors', () => {
      // Act
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: -5, // Invalid - negative
        max_travel_km: -10, // Invalid - negative
        max_hours_per_week: 50, // Invalid - over limit
        max_hours_per_shift: 15, // Invalid - over limit
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(3)
      expect(result.errors).toContain('Minimum pay rate cannot be negative')
      expect(result.errors).toContain('Maximum travel distance cannot be negative')
      expect(result.errors).toContain('Maximum hours per week cannot exceed 44 (Singapore labor law)')
      expect(result.errors).toContain('Maximum hours per shift cannot exceed 12 (Singapore labor law)')
    })

    test('validates all fields when all are valid', () => {
      // Act
      const result = validatePreferences({
        user_id: 'test-user',
        min_pay_rate: 25.50,
        max_travel_km: 20,
        desired_roles: ['Senior Server', 'Team Leader'],
        max_hours_per_week: 42,
        max_hours_per_shift: 10,
        consider_lower_rate: true
      })

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('handles edge case with maximum valid values (some will fail validation)', () => {
      // Act
      const result = validatePreferences({
        user_id: 'test-user',
        min_pay_rate: 999.99, // This will fail - too high
        max_travel_km: 1000, // This will fail - too high for Singapore
        desired_roles: Array.from({ length: 50 }, (_, i) => `Job${i}`), // Many jobs
        max_hours_per_week: 44, // Maximum allowed
        max_hours_per_shift: 12, // Maximum allowed
        consider_lower_rate: false
      })

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Minimum pay rate seems unreasonably high')
      expect(result.errors).toContain('Maximum travel distance seems unreasonably high for Singapore')
    })
  })
})