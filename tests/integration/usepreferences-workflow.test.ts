/**
 * Integration Tests for usePreferences Database Functions Workflow
 * @description Tests the complete workflow of database functions as used in usePreferences ecosystem
 * @author OptiStaff Team
 * @testing_approach Integration testing of function interactions and workflows
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { testSupabase, createTestJobSeeker, cleanupTestData } from '../../src/test-setup'

describe('usePreferences Database Functions - Integration Workflow Tests', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  // ========================================
  // Complete User Preferences Lifecycle
  // ========================================
  describe('Complete User Preferences Lifecycle', () => {
    test('new user workflow: create defaults → validate jobs → upsert preferences', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Set up job types for testing
      await testSupabase.from('job_categories').insert({
        category_name: 'Food Service',
        description: 'Food and beverage service jobs'
      })

      const { data: category } = await testSupabase
        .from('job_categories')
        .select('category_id')
        .eq('category_name', 'Food Service')
        .single()

      await testSupabase.from('job_types').insert([
        {
          type_name: 'Waiter',
          category_id: category.category_id,
          description: 'Restaurant waiter',
          is_active: true
        },
        {
          type_name: 'Chef',
          category_id: category.category_id,
          description: 'Kitchen chef',
          is_active: true
        }
      ])

      // Step 1: Create default preferences (as done in fetchPreferences)
      const { data: defaultPrefs, error: defaultError } = await testSupabase.rpc('create_default_preferences', {
        p_user_id: jobSeeker.user_id
      })

      expect(defaultError).toBeNull()
      expect(defaultPrefs).toBeTruthy()
      expect(defaultPrefs[0].desired_roles).toEqual([])

      // Step 2: Validate job names (as done in usePreferencesForm)
      const jobNamesToValidate = ['Waiter', 'Chef']
      const { data: isValid, error: validationError } = await testSupabase.rpc('validate_job_names', {
        job_names: jobNamesToValidate
      })

      expect(validationError).toBeNull()
      expect(isValid).toBe(true)

      // Step 3: Upsert preferences with validated job names (as done in savePreferences)
      const { data: upsertResult, error: upsertError } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 22,
        p_max_travel_km: 25,
        p_desired_roles: jobNamesToValidate,
        p_max_hours_per_week: 38,
        p_max_hours_per_shift: 9,
        p_consider_lower_rate: true
      })

      expect(upsertError).toBeNull()
      expect(upsertResult).toBeTruthy()
      expect(upsertResult[0].validation_errors).toEqual([])
      expect(upsertResult[0].desired_roles).toEqual(jobNamesToValidate)
      expect(upsertResult[0].min_pay_rate).toBe(22)

      // Step 4: Verify final state in database
      const { data: finalPrefs } = await testSupabase
        .from('preferences')
        .select('*')
        .eq('user_id', jobSeeker.user_id)
        .single()

      expect(finalPrefs.desired_roles).toEqual(jobNamesToValidate)
      expect(finalPrefs.min_pay_rate).toBe(22)
      expect(finalPrefs.max_travel_km).toBe(25)
    })

    test('existing user workflow: fetch → validate → update preferences', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Create existing preferences
      await testSupabase.from('preferences').insert({
        user_id: jobSeeker.user_id,
        min_pay_rate: 18,
        max_travel_km: 15,
        desired_roles: ['Server'],
        max_hours_per_week: 35,
        max_hours_per_shift: 7,
        consider_lower_rate: false
      })

      // Set up job types
      await testSupabase.from('job_categories').insert({
        category_name: 'Hospitality',
        description: 'Hospitality jobs'
      })

      const { data: category } = await testSupabase
        .from('job_categories')
        .select('category_id')
        .eq('category_name', 'Hospitality')
        .single()

      await testSupabase.from('job_types').insert([
        {
          type_name: 'Server',
          category_id: category.category_id,
          description: 'Restaurant server',
          is_active: true
        },
        {
          type_name: 'Bartender',
          category_id: category.category_id,
          description: 'Bar service',
          is_active: true
        }
      ])

      // Step 1: Validate new job names
      const newJobNames = ['Server', 'Bartender']
      const { data: isValid, error: validationError } = await testSupabase.rpc('validate_job_names', {
        job_names: newJobNames
      })

      expect(validationError).toBeNull()
      expect(isValid).toBe(true)

      // Step 2: Update preferences with new job names
      const { data: updateResult, error: updateError } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 20,
        p_max_travel_km: 20,
        p_desired_roles: newJobNames,
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: true
      })

      expect(updateError).toBeNull()
      expect(updateResult).toBeTruthy()
      expect(updateResult[0].validation_errors).toEqual([])
      expect(updateResult[0].desired_roles).toEqual(newJobNames)
      expect(updateResult[0].min_pay_rate).toBe(20)
    })
  })

  // ========================================
  // Location and Preferences Integration
  // ========================================
  describe('Location and Preferences Integration', () => {
    test('complete user setup: location + preferences workflow', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: '123 Marina Bay, Singapore'
      })

      // Set up job types
      await testSupabase.from('job_categories').insert({
        category_name: 'Retail',
        description: 'Retail jobs'
      })

      const { data: category } = await testSupabase
        .from('job_categories')
        .select('category_id')
        .eq('category_name', 'Retail')
        .single()

      await testSupabase.from('job_types').insert({
        type_name: 'Sales Associate',
        category_id: category.category_id,
        description: 'Retail sales',
        is_active: true
      })

      // Step 1: Get user location (as done in usePreferencesLocation)
      const { data: locationData, error: locationError } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      expect(locationError).toBeNull()
      expect(locationData).toBeTruthy()
      expect(locationData[0].coordinates_lat).toBe(1.3521)
      expect(locationData[0].coordinates_lng).toBe(103.8198)
      expect(locationData[0].formatted_address).toContain('Marina Bay')

      // Step 2: Create preferences with location context
      const { data: prefsResult, error: prefsError } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 18,
        p_max_travel_km: 10, // Small travel distance since we have location
        p_desired_roles: ['Sales Associate'],
        p_max_hours_per_week: 30,
        p_max_hours_per_shift: 6,
        p_consider_lower_rate: false
      })

      expect(prefsError).toBeNull()
      expect(prefsResult).toBeTruthy()
      expect(prefsResult[0].max_travel_km).toBe(10)

      // Step 3: Verify both location and preferences are properly set
      const { data: finalLocation } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      const { data: finalPrefs } = await testSupabase
        .from('preferences')
        .select('*')
        .eq('user_id', jobSeeker.user_id)
        .single()

      expect(finalLocation[0].coordinates_lat).toBe(1.3521)
      expect(finalPrefs.max_travel_km).toBe(10)
      expect(finalPrefs.desired_roles).toEqual(['Sales Associate'])
    })
  })

  // ========================================
  // Error Handling and Recovery Workflows
  // ========================================
  describe('Error Handling and Recovery Workflows', () => {
    test('validation failure → retry with corrected data workflow', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Set up valid job type
      await testSupabase.from('job_categories').insert({
        category_name: 'Valid Category',
        description: 'Valid jobs'
      })

      const { data: category } = await testSupabase
        .from('job_categories')
        .select('category_id')
        .eq('category_name', 'Valid Category')
        .single()

      await testSupabase.from('job_types').insert({
        type_name: 'Valid Job',
        category_id: category.category_id,
        description: 'Valid job type',
        is_active: true
      })

      // Step 1: Try to save preferences with invalid job names
      const { data: failResult, error: failError } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 20,
        p_max_travel_km: 15,
        p_desired_roles: ['Invalid Job', 'Another Invalid Job'],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: false
      })

      expect(failError).toBeNull()
      expect(failResult).toBeTruthy()
      expect(failResult[0].validation_errors).toContain('One or more selected job types are invalid or inactive')

      // Step 2: Validate corrected job names
      const { data: isValid, error: validationError } = await testSupabase.rpc('validate_job_names', {
        job_names: ['Valid Job']
      })

      expect(validationError).toBeNull()
      expect(isValid).toBe(true)

      // Step 3: Retry with valid job names
      const { data: successResult, error: successError } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 20,
        p_max_travel_km: 15,
        p_desired_roles: ['Valid Job'],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: false
      })

      expect(successError).toBeNull()
      expect(successResult).toBeTruthy()
      expect(successResult[0].validation_errors).toEqual([])
      expect(successResult[0].desired_roles).toEqual(['Valid Job'])
    })

    test('missing location → create preferences → add location later workflow', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: null,
        postal_code: null,
        address: null
      })

      // Step 1: Check location (should be empty)
      const { data: initialLocation, error: locationError1 } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      expect(locationError1).toBeNull()
      expect(initialLocation).toHaveLength(0)

      // Step 2: Create preferences without location
      const { data: prefsResult, error: prefsError } = await testSupabase.rpc('create_default_preferences', {
        p_user_id: jobSeeker.user_id
      })

      expect(prefsError).toBeNull()
      expect(prefsResult).toBeTruthy()

      // Step 3: Update job seeker with location info (simulating profile update)
      await testSupabase
        .from('job_seekers')
        .update({
          address_coordinates: '1.2966,103.8520',
          postal_code: '018956',
          address: '1 Raffles Place, Singapore'
        })
        .eq('user_id', jobSeeker.user_id)

      // Step 4: Check location again (should now have data)
      const { data: updatedLocation, error: locationError2 } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      expect(locationError2).toBeNull()
      expect(updatedLocation).toHaveLength(1)
      expect(updatedLocation[0].coordinates_lat).toBe(1.2966)
      expect(updatedLocation[0].coordinates_lng).toBe(103.8520)
      expect(updatedLocation[0].formatted_address).toContain('Raffles Place')

      // Step 5: Update preferences with location-aware travel distance
      const { data: locationAwarePrefs, error: updateError } = await testSupabase.rpc('upsert_user_preferences', {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 25,
        p_max_travel_km: 5, // Smaller distance now that we have precise location
        p_desired_roles: [],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: false
      })

      expect(updateError).toBeNull()
      expect(locationAwarePrefs).toBeTruthy()
      expect(locationAwarePrefs[0].max_travel_km).toBe(5)
    })
  })

  // ========================================
  // Performance and Concurrency Tests
  // ========================================
  describe('Performance and Concurrency', () => {
    test('concurrent preference updates for same user', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker()

      // Create initial preferences
      await testSupabase.rpc('create_default_preferences', {
        p_user_id: jobSeeker.user_id
      })

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

    test('batch validation of multiple job names', async () => {
      // Arrange - Create many job types
      await testSupabase.from('job_categories').insert({
        category_name: 'Batch Category',
        description: 'Category for batch testing'
      })

      const { data: category } = await testSupabase
        .from('job_categories')
        .select('category_id')
        .eq('category_name', 'Batch Category')
        .single()

      const jobTypes = []
      const jobNames = []
      for (let i = 1; i <= 20; i++) {
        const jobName = `BatchJob${i}`
        jobTypes.push({
          type_name: jobName,
          category_id: category.category_id,
          description: `Batch job ${i}`,
          is_active: true
        })
        jobNames.push(jobName)
      }

      await testSupabase.from('job_types').insert(jobTypes)

      // Act - Validate large batch of job names
      const startTime = Date.now()
      const { data: isValid, error } = await testSupabase.rpc('validate_job_names', {
        job_names: jobNames
      })
      const endTime = Date.now()

      // Assert
      expect(error).toBeNull()
      expect(isValid).toBe(true)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})