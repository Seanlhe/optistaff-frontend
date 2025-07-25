/**
 * Unit Tests for get_user_location Database Function
 * @description Tests the get_user_location function using Equivalence Class Testing (ECT)
 * @author OptiStaff Team
 * @testing_approach Equivalence Class Testing - Valid/Invalid input classes with edge cases
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { testSupabase, createTestJobSeeker, cleanupTestData } from '../../src/test-setup'

describe('get_user_location - Database Function Unit Tests', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  // ========================================
  // Equivalence Class Testing (ECT)
  // ========================================
  describe('Valid Input Equivalence Classes', () => {
    test('retrieves location data for user with complete location info', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: '123 Test Street, Singapore'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.user_id).toBe(jobSeeker.user_id)
      expect(location.address_coordinates).toBe('1.3521,103.8198')
      expect(location.postal_code).toBe('123456')
      expect(location.address).toBe('123 Test Street, Singapore')
      expect(location.coordinates_lat).toBe(1.3521)
      expect(location.coordinates_lng).toBe(103.8198)
      expect(location.formatted_address).toBe('123 Test Street, Singapore, Singapore 123456')
    })

    test('retrieves location data for user with partial location info (postal code only)', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: null,
        postal_code: '654321',
        address: null
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.user_id).toBe(jobSeeker.user_id)
      expect(location.address_coordinates).toBeNull()
      expect(location.postal_code).toBe('654321')
      expect(location.address).toBeNull()
      expect(location.coordinates_lat).toBeNull()
      expect(location.coordinates_lng).toBeNull()
      expect(location.formatted_address).toBe('Singapore 654321')
    })

    test('retrieves location data for user with address but no coordinates', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: null,
        postal_code: '111111',
        address: '456 Another Street, Singapore'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.user_id).toBe(jobSeeker.user_id)
      expect(location.address_coordinates).toBeNull()
      expect(location.postal_code).toBe('111111')
      expect(location.address).toBe('456 Another Street, Singapore')
      expect(location.coordinates_lat).toBeNull()
      expect(location.coordinates_lng).toBeNull()
      expect(location.formatted_address).toBe('456 Another Street, Singapore, Singapore 111111')
    })

    test('retrieves location data for user with coordinates but no address', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.2966,103.8520',
        postal_code: '018956',
        address: null
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.user_id).toBe(jobSeeker.user_id)
      expect(location.address_coordinates).toBe('1.2966,103.8520')
      expect(location.postal_code).toBe('018956')
      expect(location.address).toBeNull()
      expect(location.coordinates_lat).toBe(1.2966)
      expect(location.coordinates_lng).toBe(103.8520)
      expect(location.formatted_address).toBe('Singapore 018956')
    })

    test('retrieves location data with all fields null', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: null,
        postal_code: null,
        address: null
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.user_id).toBe(jobSeeker.user_id)
      expect(location.address_coordinates).toBeNull()
      expect(location.postal_code).toBeNull()
      expect(location.address).toBeNull()
      expect(location.coordinates_lat).toBeNull()
      expect(location.coordinates_lng).toBeNull()
      expect(location.formatted_address).toBeNull()
    })
  })

  describe('Invalid Input Equivalence Classes', () => {
    test('returns empty result for non-existent user', async () => {
      // Arrange
      const nonExistentUserId = '00000000-0000-0000-0000-000000000001'

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: nonExistentUserId
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(0) // No results for non-existent user
    })

    test('handles invalid UUID format', async () => {
      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: 'invalid-uuid'
      })

      // Assert
      expect(error).not.toBeNull()
    })

    test('handles null user_id', async () => {
      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: null
      })

      // Assert
      expect(error).not.toBeNull()
    })

    test('handles empty string user_id', async () => {
      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: ''
      })

      // Assert
      expect(error).not.toBeNull()
    })

    test('handles undefined user_id', async () => {
      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: undefined
      })

      // Assert
      expect(error).not.toBeNull()
    })
  })

  describe('Edge Cases for Coordinate Parsing', () => {
    test('handles malformed coordinate string', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: 'invalid,coordinates,format',
        postal_code: '123456',
        address: 'Test Address'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.coordinates_lat).toBeNull() // Should handle gracefully
      expect(location.coordinates_lng).toBeNull() // Should handle gracefully
    })

    test('handles coordinate string with non-numeric values', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: 'abc,def',
        postal_code: '123456',
        address: 'Test Address'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.coordinates_lat).toBeNull()
      expect(location.coordinates_lng).toBeNull()
    })

    test('handles coordinate string with missing comma', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521 103.8198', // Space instead of comma
        postal_code: '123456',
        address: 'Test Address'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.coordinates_lat).toBeNull()
      expect(location.coordinates_lng).toBeNull()
    })

    test('handles coordinate string with only one value', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521', // Missing longitude
        postal_code: '123456',
        address: 'Test Address'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.coordinates_lat).toBeNull()
      expect(location.coordinates_lng).toBeNull()
    })

    test('handles coordinate string with extra values', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198,extra,values', // Too many values
        postal_code: '123456',
        address: 'Test Address'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      // Should parse first two values correctly
      expect(location.coordinates_lat).toBe(1.3521)
      expect(location.coordinates_lng).toBe(103.8198)
    })

    test('handles coordinate string with negative values', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '-1.3521,-103.8198', // Negative coordinates
        postal_code: '123456',
        address: 'Test Address'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.coordinates_lat).toBe(-1.3521)
      expect(location.coordinates_lng).toBe(-103.8198)
    })

    test('handles coordinate string with decimal precision', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.352123456,103.819876543', // High precision
        postal_code: '123456',
        address: 'Test Address'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.coordinates_lat).toBeCloseTo(1.352123456, 6)
      expect(location.coordinates_lng).toBeCloseTo(103.819876543, 6)
    })
  })

  describe('Address Formatting Edge Cases', () => {
    test('handles special characters in address', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: '123 Test Street & Avenue, Unit #01-02, Singapore'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.formatted_address).toBe('123 Test Street & Avenue, Unit #01-02, Singapore, Singapore 123456')
    })

    test('handles very long address', async () => {
      // Arrange
      const longAddress = 'A'.repeat(500) + ' Street, Singapore'
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: longAddress
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.address).toBe(longAddress)
      expect(location.formatted_address).toBe(`${longAddress}, Singapore 123456`)
    })

    test('handles empty string address', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: ''
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.address).toBe('')
      expect(location.formatted_address).toBe('Singapore 123456') // Should handle empty address gracefully
    })

    test('handles whitespace-only address', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: '   \t\n   '
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.formatted_address).toContain('Singapore 123456')
    })
  })

  describe('Postal Code Edge Cases', () => {
    test('handles non-standard postal code format', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: 'S123456', // Non-standard format
        address: '123 Test Street, Singapore'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.postal_code).toBe('S123456')
      expect(location.formatted_address).toBe('123 Test Street, Singapore, Singapore S123456')
    })

    test('handles very long postal code', async () => {
      // Arrange
      const longPostalCode = '1'.repeat(100)
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: longPostalCode,
        address: '123 Test Street, Singapore'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.postal_code).toBe(longPostalCode)
    })

    test('handles empty string postal code', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '',
        address: '123 Test Street, Singapore'
      })

      // Act
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBe(1)

      const location = data[0]
      expect(location.postal_code).toBe('')
      expect(location.formatted_address).toBe('123 Test Street, Singapore, Singapore') // Should handle empty postal code
    })
  })

  describe('Performance and Concurrency Tests', () => {
    test('handles multiple concurrent requests for same user', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: '123 Test Street, Singapore'
      })

      // Act - Simulate concurrent requests
      const [result1, result2, result3] = await Promise.all([
        testSupabase.rpc('get_user_location', { p_user_id: jobSeeker.user_id }),
        testSupabase.rpc('get_user_location', { p_user_id: jobSeeker.user_id }),
        testSupabase.rpc('get_user_location', { p_user_id: jobSeeker.user_id })
      ])

      // Assert - All should return same data
      expect(result1.error).toBeNull()
      expect(result2.error).toBeNull()
      expect(result3.error).toBeNull()

      expect(result1.data[0]).toEqual(result2.data[0])
      expect(result2.data[0]).toEqual(result3.data[0])
    })

    test('handles multiple concurrent requests for different users', async () => {
      // Arrange
      const jobSeeker1 = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: '123 Test Street, Singapore'
      })

      const jobSeeker2 = await createTestJobSeeker({
        address_coordinates: '1.2966,103.8520',
        postal_code: '654321',
        address: '456 Another Street, Singapore'
      })

      // Act - Simulate concurrent requests for different users
      const [result1, result2] = await Promise.all([
        testSupabase.rpc('get_user_location', { p_user_id: jobSeeker1.user_id }),
        testSupabase.rpc('get_user_location', { p_user_id: jobSeeker2.user_id })
      ])

      // Assert - Should return different data for different users
      expect(result1.error).toBeNull()
      expect(result2.error).toBeNull()

      expect(result1.data[0].user_id).toBe(jobSeeker1.user_id)
      expect(result2.data[0].user_id).toBe(jobSeeker2.user_id)
      expect(result1.data[0].postal_code).toBe('123456')
      expect(result2.data[0].postal_code).toBe('654321')
    })

    test('function performance within acceptable limits', async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: '1.3521,103.8198',
        postal_code: '123456',
        address: '123 Test Street, Singapore'
      })

      // Act - Measure performance
      const startTime = Date.now()
      const { data, error } = await testSupabase.rpc('get_user_location', {
        p_user_id: jobSeeker.user_id
      })
      const endTime = Date.now()

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })
})