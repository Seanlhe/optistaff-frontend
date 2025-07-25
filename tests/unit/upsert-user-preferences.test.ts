/**
 * Unit Tests for upsert_user_preferences Database Function
 * @description Tests the upsert_user_preferences function using Decision Table Testing
 * @author OptiStaff Team
 * @testing_approach Decision Table Testing - Complex business logic with multiple conditions
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { testSupabase, createTestJobSeeker, cleanupTestData } from '../../src/test-setup'

describe('upsert_user_preferences - Database Function Unit Tests', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  // ========================================
  // Decision Table Testing
  // ========================================
  describe('Decision Table Rules for upsert_user_preferences', () => {
    // Decision Table Rules for upsert_user_preferences
    const decisionTableRules = [
      {
        ruleId: 'R1',
        description: 'Valid new preferences - minimum boundary values',
        conditions: {
          existingPreferences: false,
          validUserId: true,
          validPayRate: true, // min boundary
          validTravelKm: true, // min boundary
          validDesiredRoles: true, // empty array
          validHoursPerWeek: true, // min boundary
          validHoursPerShift: true, // min boundary
          validConsiderLowerRate: true
        },
        input: {
          min_pay_rate: 0, // Minimum boundary
          max_travel_km: 0, // Minimum boundary
          desired_roles: [], // Empty array (valid)
          max_hours_per_week: 1, // Minimum boundary
          max_hours_per_shift: 1, // Minimum boundary
          consider_lower_rate: false
        },
        expectedAction: 'CREATE_SUCCESS',
        expectedValidationErrors: []
      },
      {
        ruleId: 'R2',
        description: 'Valid new preferences - maximum boundary values',
        conditions: {
          existingPreferences: false,
          validUserId: true,
          validPayRate: true, // max boundary
          validTravelKm: true, // max boundary
          validDesiredRoles: true, // multiple valid jobs
          validHoursPerWeek: true, // max boundary
          validHoursPerShift: true, // max boundary
          validConsiderLowerRate: true
        },
        input: {
          min_pay_rate: 999.99, // High value
          max_travel_km: 999, // High value
          desired_roles: ['Server', 'Bartender'], // Valid job names
          max_hours_per_week: 44, // Maximum boundary
          max_hours_per_shift: 12, // Maximum boundary
          consider_lower_rate: true
        },
        expectedAction: 'CREATE_SUCCESS',
        expectedValidationErrors: []
      },
      {
        ruleId: 'R3',
        description: 'Valid update of existing preferences',
        conditions: {
          existingPreferences: true,
          validUserId: true,
          validPayRate: true,
          validTravelKm: true,
          validDesiredRoles: true,
          validHoursPerWeek: true,
          validHoursPerShift: true,
          validConsiderLowerRate: true
        },
        input: {
          min_pay_rate: 25,
          max_travel_km: 20,
          desired_roles: ['Manager'],
          max_hours_per_week: 35,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        },
        expectedAction: 'UPDATE_SUCCESS',
        expectedValidationErrors: []
      },
      {
        ruleId: 'R4',
        description: 'Invalid - empty desired_roles validation',
        conditions: {
          existingPreferences: false,
          validUserId: true,
          validPayRate: true,
          validTravelKm: true,
          validDesiredRoles: false, // Empty array should fail validation
          validHoursPerWeek: true,
          validHoursPerShift: true,
          validConsiderLowerRate: true
        },
        input: {
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: [], // This should trigger validation error
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        },
        expectedAction: 'VALIDATION_FAILED',
        expectedValidationErrors: ['Please select at least one preferred job type']
      },
      {
        ruleId: 'R5',
        description: 'Invalid - non-existent job names',
        conditions: {
          existingPreferences: false,
          validUserId: true,
          validPayRate: true,
          validTravelKm: true,
          validDesiredRoles: false, // Invalid job names
          validHoursPerWeek: true,
          validHoursPerShift: true,
          validConsiderLowerRate: true
        },
        input: {
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['NonExistentJob', 'AnotherFakeJob'],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        },
        expectedAction: 'VALIDATION_FAILED',
        expectedValidationErrors: ['One or more selected job types are invalid or inactive']
      },
      {
        ruleId: 'R6',
        description: 'Invalid - hours per week exceeds limit',
        conditions: {
          existingPreferences: false,
          validUserId: true,
          validPayRate: true,
          validTravelKm: true,
          validDesiredRoles: true,
          validHoursPerWeek: false, // Exceeds 44 hour limit
          validHoursPerShift: true,
          validConsiderLowerRate: true
        },
        input: {
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['Server'],
          max_hours_per_week: 50, // Exceeds limit
          max_hours_per_shift: 8,
          consider_lower_rate: false
        },
        expectedAction: 'DATABASE_CONSTRAINT_ERROR',
        expectedValidationErrors: []
      },
      {
        ruleId: 'R7',
        description: 'Invalid - hours per shift exceeds limit',
        conditions: {
          existingPreferences: false,
          validUserId: true,
          validPayRate: true,
          validTravelKm: true,
          validDesiredRoles: true,
          validHoursPerWeek: true,
          validHoursPerShift: false, // Exceeds 12 hour limit
          validConsiderLowerRate: true
        },
        input: {
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['Server'],
          max_hours_per_week: 40,
          max_hours_per_shift: 15, // Exceeds limit
          consider_lower_rate: false
        },
        expectedAction: 'DATABASE_CONSTRAINT_ERROR',
        expectedValidationErrors: []
      }
    ]

    // Execute Decision Table Rules
    decisionTableRules.forEach(rule => {
      test(`${rule.ruleId}: ${rule.description}`, async () => {
        // Arrange
        const jobSeeker = await createTestJobSeeker()

        // Set up existing preferences if required
        if (rule.conditions.existingPreferences) {
          await testSupabase.from('preferences').insert({
            user_id: jobSeeker.user_id,
            min_pay_rate: 18,
            max_travel_km: 12,
            desired_roles: ['Server'],
            max_hours_per_week: 35,
            max_hours_per_shift: 7,
            consider_lower_rate: false
          })
        }

        // Set up job types for desired_roles validation
        if (rule.input.desired_roles.length > 0 && rule.conditions.validDesiredRoles) {
          await testSupabase.from('job_categories').insert({
            category_name: 'Test Category',
            description: 'Test category'
          })

          const { data: category } = await testSupabase
            .from('job_categories')
            .select('category_id')
            .eq('category_name', 'Test Category')
            .single()

          for (const jobName of rule.input.desired_roles) {
            await testSupabase.from('job_types').insert({
              type_name: jobName,
              category_id: category.category_id,
              description: `${jobName} job`,
              is_active: true
            })
          }
        }

        // Act
        const { data, error } = await testSupabase.rpc('upsert_user_preferences', {
          p_target_user_id: jobSeeker.user_id,
          p_min_pay_rate: rule.input.min_pay_rate,
          p_max_travel_km: rule.input.max_travel_km,
          p_desired_roles: rule.input.desired_roles,
          p_max_hours_per_week: rule.input.max_hours_per_week,
          p_max_hours_per_shift: rule.input.max_hours_per_shift,
          p_consider_lower_rate: rule.input.consider_lower_rate
        })

        // Assert based on expected action
        switch (rule.expectedAction) {
          case 'CREATE_SUCCESS':
          case 'UPDATE_SUCCESS':
            expect(error).toBeNull()
            expect(data).toBeTruthy()
            expect(data.length).toBe(1)
            
            const result = data[0]
            expect(result.validation_errors).toEqual([])
            expect(result.user_id).toBe(jobSeeker.user_id)
            expect(result.min_pay_rate).toBe(rule.input.min_pay_rate)
            expect(result.max_travel_km).toBe(rule.input.max_travel_km)
            expect(result.desired_roles).toEqual(rule.input.desired_roles)
            expect(result.max_hours_per_week).toBe(rule.input.max_hours_per_week)
            expect(result.max_hours_per_shift).toBe(rule.input.max_hours_per_shift)
            expect(result.consider_lower_rate).toBe(rule.input.consider_lower_rate)
            break

          case 'VALIDATION_FAILED':
            expect(error).toBeNull()
            expect(data).toBeTruthy()
            expect(data.length).toBe(1)
            
            const validationResult = data[0]
            expect(validationResult.validation_errors).toEqual(rule.expectedValidationErrors)
            expect(validationResult.preference_id).toBeNull()
            break

          case 'DATABASE_CONSTRAINT_ERROR':
            expect(error).not.toBeNull()
            break

          default:
            throw new Error(`Unknown expected action: ${rule.expectedAction}`)
        }
      })
    })
  })

  describe('Additional Edge Cases', () => {
    test('handles null user_id gracefully', async () => {
      // Act
      const { data, error } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: null,
        p_min_pay_rate: 20,
        p_max_travel_km: 15,
        p_desired_roles: ['Server'],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: false
      })

      // Assert
      expect(error).not.toBeNull()
    })

    test('handles invalid UUID format', async () => {
      // Act
      const { data, error } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: 'invalid-uuid',
        p_min_pay_rate: 20,
        p_max_travel_km: 15,
        p_desired_roles: ['Server'],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: false
      })

      // Assert
      expect(error).not.toBeNull()
    })

    test('handles negative pay rate', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Act
      const { data, error } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: -10, // Negative value
        p_max_travel_km: 15,
        p_desired_roles: ['Server'],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: false
      })

      // Assert - Should be handled by database constraints
      expect(error).not.toBeNull()
    })

    test('handles negative travel distance', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Act
      const { data, error } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 20,
        p_max_travel_km: -5, // Negative value
        p_desired_roles: ['Server'],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: false
      })

      // Assert - Should be handled by database constraints
      expect(error).not.toBeNull()
    })

    test('handles zero hours per week', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Act
      const { data, error } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 20,
        p_max_travel_km: 15,
        p_desired_roles: ['Server'],
        p_max_hours_per_week: 0, // Zero hours
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: false
      })

      // Assert - Should be handled by database constraints
      expect(error).not.toBeNull()
    })

    test('handles zero hours per shift', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Act
      const { data, error } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 20,
        p_max_travel_km: 15,
        p_desired_roles: ['Server'],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 0, // Zero hours
        p_consider_lower_rate: false
      })

      // Assert - Should be handled by database constraints
      expect(error).not.toBeNull()
    })
  })

  describe('Performance and Concurrency Tests', () => {
    test('handles concurrent upsert operations for same user', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Set up job types
      await testSupabase.from('job_categories').insert({
        category_name: 'Concurrent Category',
        description: 'Jobs for concurrency testing'
      })

      const { data: category } = await testSupabase
        .from('job_categories')
        .select('category_id')
        .eq('category_name', 'Concurrent Category')
        .single()

      await testSupabase.from('job_types').insert([
        {
          type_name: 'Job A',
          category_id: category.category_id,
          description: 'Job A',
          is_active: true
        },
        {
          type_name: 'Job B',
          category_id: category.category_id,
          description: 'Job B',
          is_active: true
        }
      ])

      // Act - Simulate concurrent updates
      const update1Promise = testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 20,
        p_max_travel_km: 10,
        p_desired_roles: ['Job A'],
        p_max_hours_per_week: 35,
        p_max_hours_per_shift: 7,
        p_consider_lower_rate: false
      })

      const update2Promise = testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 25,
        p_max_travel_km: 15,
        p_desired_roles: ['Job B'],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: true
      })

      const [result1, result2] = await Promise.all([update1Promise, update2Promise])

      // Assert - Both should succeed (last one wins due to upsert)
      expect(result1.error).toBeNull()
      expect(result2.error).toBeNull()

      // Verify final state
      const { data: finalPrefs } = await testSupabase
        .from('preferences')
        .select('*')
        .eq('user_id', jobSeeker.user_id)
        .single()

      expect(finalPrefs).toBeTruthy()
      // One of the updates should have won
      expect([20, 25]).toContain(finalPrefs.min_pay_rate)
    })
  })
})