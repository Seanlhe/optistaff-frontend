/**
 * OPTIMIZED Unit Tests for validate_job_names Database Function
 * @description Streamlined tests focusing on essential boundary values and business logic
 * @author OptiStaff Team
 * @testing_approach Boundary Value Testing (BVT) - Essential boundaries only
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { testSupabase, cleanupTestData, ensureTestJobTypes } from '../../src/test-setup'

describe('validate_job_names - Database Function Unit Tests (Optimized)', () => {
  beforeEach(async () => {
    await cleanupTestData()
    await ensureTestJobTypes()
  })

  describe('Core Boundary Values', () => {
    test('validates empty array (minimum boundary)', async () => {
      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: []
      })
      expect(error).toBeNull()
      expect(data).toBeNull() // PostgreSQL limitation
    })

    test('validates single job name (minimum+ boundary)', async () => {
      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: ['Waiter/Waitress']
      })
      expect(error).toBeNull()
      expect(data).toBe(true)
    })

    test('validates multiple job names (nominal boundary)', async () => {
      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: ['Waiter/Waitress', 'Kitchen Helper', 'Cashier']
      })
      expect(error).toBeNull()
      expect(data).toBe(true)
    })

    test('validates large array (maximum- boundary)', async () => {
      // Create 10 test jobs
      const { data: category } = await testSupabase.from('job_categories').insert({
        category_name: `Large Category ${Date.now()}`,
        description: 'Category with many jobs'
      }).select().single()

      const jobNames = []
      for (let i = 1; i <= 10; i++) {
        const jobName = `Job${i}`
        await testSupabase.from('job_types').insert({
          type_name: jobName,
          category_id: category.category_id,
          description: `Job ${i} description`,
          is_active: true
        })
        jobNames.push(jobName)
      }

      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: jobNames
      })
      expect(error).toBeNull()
      expect(data).toBe(true)
    })

    test('rejects mix of valid and invalid job names (boundary case)', async () => {
      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: ['Waiter/Waitress', 'NonExistentJob']
      })
      expect(error).toBeNull()
      expect(data).toBe(false)
    })
  })

  describe('Business Logic Validation', () => {
    test('rejects single invalid job name', async () => {
      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: ['NonExistentJob']
      })
      expect(error).toBeNull()
      expect(data).toBe(false)
    })

    test('rejects inactive job names', async () => {
      const { data: category } = await testSupabase.from('job_categories').insert({
        category_name: `Inactive Category ${Date.now()}`,
        description: 'Category for inactive testing'
      }).select().single()

      await testSupabase.from('job_types').insert({
        type_name: 'Inactive Job',
        category_id: category.category_id,
        description: 'Inactive job type',
        is_active: false
      })

      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: ['Inactive Job']
      })
      expect(error).toBeNull()
      expect(data).toBe(false)
    })

    test('rejects mix of active and inactive job names', async () => {
      const { data: category } = await testSupabase.from('job_categories').insert({
        category_name: `Mixed Status Category ${Date.now()}`,
        description: 'Category with mixed status jobs'
      }).select().single()

      await testSupabase.from('job_types').insert([
        {
          type_name: 'Active Job',
          category_id: category.category_id,
          description: 'Active job type',
          is_active: true
        },
        {
          type_name: 'Inactive Job',
          category_id: category.category_id,
          description: 'Inactive job type',
          is_active: false
        }
      ])

      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: ['Active Job', 'Inactive Job']
      })
      expect(error).toBeNull()
      expect(data).toBe(false)
    })

    test('handles case sensitivity correctly', async () => {
      const { data: category } = await testSupabase.from('job_categories').insert({
        category_name: `Case Category ${Date.now()}`,
        description: 'Category for case sensitivity testing'
      }).select().single()

      await testSupabase.from('job_types').insert({
        type_name: 'CaseSensitiveJob',
        category_id: category.category_id,
        description: 'Case sensitive job',
        is_active: true
      })

      const { data: exactCase } = await testSupabase.rpc('validate_job_names', {
        job_names: ['CaseSensitiveJob']
      })
      const { data: wrongCase } = await testSupabase.rpc('validate_job_names', {
        job_names: ['casesensitivejob']
      })

      expect(exactCase).toBe(true)
      expect(wrongCase).toBe(false)
    })
  })

  describe('Essential Edge Cases', () => {
    test('handles null input gracefully', async () => {
      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: null
      })
      expect(error).toBeNull()
      expect(data).toBe(true)
    })

    test('handles empty string job names', async () => {
      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: ['', 'Waiter/Waitress']
      })
      expect(error).toBeNull()
      expect(data).toBe(false)
    })

    test('handles duplicate job names in array', async () => {
      const { data, error } = await testSupabase.rpc('validate_job_names', {
        job_names: ['Waiter/Waitress', 'Waiter/Waitress']
      })
      expect(error).toBeNull()
      expect(data).toBe(true)
    })

    test('handles concurrent validation requests', async () => {
      const [result1, result2, result3] = await Promise.all([
        testSupabase.rpc('validate_job_names', { job_names: ['Waiter/Waitress'] }),
        testSupabase.rpc('validate_job_names', { job_names: ['Kitchen Helper'] }),
        testSupabase.rpc('validate_job_names', { job_names: ['Waiter/Waitress', 'Kitchen Helper'] })
      ])

      expect(result1.error).toBeNull()
      expect(result2.error).toBeNull()
      expect(result3.error).toBeNull()
      expect(result1.data).toBe(true)
      expect(result2.data).toBe(true)
      expect(result3.data).toBe(true)
    })
  })
})