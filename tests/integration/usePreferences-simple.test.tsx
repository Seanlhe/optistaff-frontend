import { describe, test, expect, beforeEach } from 'vitest'
import { testSupabase, testSupabaseAdmin, cleanupTestData } from '../../src/test-setup'

describe('Preferences Integration Tests - Direct Database Operations', () => {
  let testUserId: string

  beforeEach(async () => {
    await cleanupTestData()
    testUserId = crypto.randomUUID()
    
    try {
      // Create auth user first using admin client
      const { data: authUser, error: authError } = await testSupabaseAdmin.auth.admin.createUser({
        user_id: testUserId,
        email: `test-${testUserId}@example.com`,
        password: 'testpassword123',
        email_confirm: true
      })
      
      if (authError) {
        console.error('Auth user creation failed:', authError)
        throw authError
      }
      
      // Create job seeker record using admin client
      const { data: jobSeeker, error: jobSeekerError } = await testSupabaseAdmin.from('job_seekers').insert({
        user_id: testUserId,
        first_name: 'Test',
        last_name: 'User',
        phone_number: '12345678',
        status: 'ACTIVE'
      }).select().single()
      
      if (jobSeekerError) {
        console.error('Job seeker creation failed:', jobSeekerError)
        throw jobSeekerError
      }
      
      console.log('Test setup successful:', { authUser: authUser.user?.id, jobSeeker: jobSeeker?.user_id })
    } catch (error) {
      console.error('Test setup failed:', error)
      throw error
    }
  })

  describe('Test Setup Verification', () => {
    test('verifies auth user and job seeker creation', async () => {
      // Verify auth user exists
      const { data: authUsers } = await testSupabaseAdmin.auth.admin.listUsers()
      const testUser = authUsers.users.find(u => u.id === testUserId)
      expect(testUser).toBeTruthy()
      expect(testUser?.id).toBe(testUserId)
      
      // Verify job seeker exists
      const { data: jobSeeker, error } = await testSupabaseAdmin
        .from('job_seekers')
        .select('*')
        .eq('user_id', testUserId)
        .single()
        
      expect(error).toBeNull()
      expect(jobSeeker).toBeTruthy()
      expect(jobSeeker.user_id).toBe(testUserId)
    })
  })

  describe('Preferences CRUD Operations', () => {
    test('creates default preferences', async () => {
      // Act
      const { data, error } = await testSupabase
        .from('preferences')
        .insert({
          user_id: testUserId,
          min_pay_rate: 15,
          max_travel_km: 15,
          desired_roles: [],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        })
        .select()
        .single()

      // Assert
      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.min_pay_rate).toBe(15)
      expect(data.desired_roles).toEqual([])
    })

    test('updates existing preferences', async () => {
      // Arrange - Create initial preferences
      await testSupabase.from('preferences').insert({
        user_id: testUserId,
        min_pay_rate: 15,
        max_travel_km: 15,
        desired_roles: [],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      })

      // Act - Update preferences
      const { data, error } = await testSupabase
        .from('preferences')
        .update({
          min_pay_rate: 25,
          desired_roles: ['Server', 'Bartender']
        })
        .eq('user_id', testUserId)
        .select()
        .single()

      // Assert
      expect(error).toBeNull()
      expect(data.min_pay_rate).toBe(25)
      expect(data.desired_roles).toEqual(['Server', 'Bartender'])
    })

    test('validates job names against job_types table', async () => {
      // Arrange - Create job category and types
      const { data: category } = await testSupabase
        .from('job_categories')
        .insert({
          category_name: 'Hospitality',
          description: 'Hospitality jobs'
        })
        .select()
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

      // Act - Try to save preferences with valid job names
      const { data, error } = await testSupabase
        .from('preferences')
        .insert({
          user_id: testUserId,
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: ['Server', 'Bartender'],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        })
        .select()
        .single()

      // Assert
      expect(error).toBeNull()
      expect(data.desired_roles).toEqual(['Server', 'Bartender'])

      // Verify job types exist
      const { data: jobTypes } = await testSupabase
        .from('job_types')
        .select('type_name')
        .in('type_name', ['Server', 'Bartender'])
        .eq('is_active', true)

      expect(jobTypes).toHaveLength(2)
    })

    test('handles upsert operation (insert or update)', async () => {
      // Act - First upsert (insert)
      const { data: insertData, error: insertError } = await testSupabase
        .from('preferences')
        .upsert({
          user_id: testUserId,
          min_pay_rate: 18,
          max_travel_km: 12,
          desired_roles: ['Server'],
          max_hours_per_week: 35,
          max_hours_per_shift: 7,
          consider_lower_rate: true
        }, { onConflict: 'user_id' })
        .select()
        .single()

      // Assert first upsert
      expect(insertError).toBeNull()
      expect(insertData.min_pay_rate).toBe(18)

      // Act - Second upsert (update)
      const { data: updateData, error: updateError } = await testSupabase
        .from('preferences')
        .upsert({
          user_id: testUserId,
          min_pay_rate: 22,
          max_travel_km: 20,
          desired_roles: ['Manager'],
          max_hours_per_week: 42,
          max_hours_per_shift: 9,
          consider_lower_rate: false
        }, { onConflict: 'user_id' })
        .select()
        .single()

      // Assert second upsert
      expect(updateError).toBeNull()
      expect(updateData.min_pay_rate).toBe(22)
      expect(updateData.desired_roles).toEqual(['Manager'])
    })
  })

  describe('Location Data Integration', () => {
    test('loads location data from job_seekers table', async () => {
      // Arrange - Add location data
      await testSupabase
        .from('job_seekers')
        .update({
          address_coordinates: '1.3521,103.8198', // Singapore coordinates
          postal_code: '238880'
        })
        .eq('user_id', testUserId)

      // Act
      const { data, error } = await testSupabase
        .from('job_seekers')
        .select('address_coordinates, postal_code')
        .eq('user_id', testUserId)
        .single()

      // Assert
      expect(error).toBeNull()
      expect(data.address_coordinates).toBe('1.3521,103.8198')
      expect(data.postal_code).toBe('238880')

      // Parse coordinates
      const [lat, lng] = data.address_coordinates.split(',').map(Number)
      expect(lat).toBeCloseTo(1.3521, 4)
      expect(lng).toBeCloseTo(103.8198, 4)
    })

    test('validates Singapore coordinates bounds', async () => {
      // Test valid Singapore coordinates
      const validCoordinates = '1.3521,103.8198'
      const [lat, lng] = validCoordinates.split(',').map(Number)
      
      // Singapore bounds validation
      const isValidSingapore = lat >= 1.2290 && lat <= 1.4784 && lng >= 103.6000 && lng <= 104.0120
      expect(isValidSingapore).toBe(true)

      // Test invalid coordinates (outside Singapore)
      const invalidCoordinates = '40.7128,-74.0060' // New York
      const [invalidLat, invalidLng] = invalidCoordinates.split(',').map(Number)
      const isInvalidSingapore = invalidLat >= 1.2290 && invalidLat <= 1.4784 && invalidLng >= 103.6000 && invalidLng <= 104.0120
      expect(isInvalidSingapore).toBe(false)
    })
  })

  describe('Preferences Business Logic', () => {
    test('enforces database constraints', async () => {
      // Test max_hours_per_week constraint (should be <= 44)
      const { error: weekError } = await testSupabase
        .from('preferences')
        .insert({
          user_id: testUserId,
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: [],
          max_hours_per_week: 50, // Over limit
          max_hours_per_shift: 8,
          consider_lower_rate: false
        })

      // Should fail due to database constraint
      expect(weekError).toBeTruthy()
      expect(weekError?.message).toContain('violates check constraint')

      // Test max_hours_per_shift constraint (should be <= 12)
      const { error: shiftError } = await testSupabase
        .from('preferences')
        .insert({
          user_id: testUserId,
          min_pay_rate: 20,
          max_travel_km: 15,
          desired_roles: [],
          max_hours_per_week: 40,
          max_hours_per_shift: 15, // Over limit
          consider_lower_rate: false
        })

      // Should fail due to database constraint
      expect(shiftError).toBeTruthy()
      expect(shiftError?.message).toContain('violates check constraint')
    })

    test('enforces positive pay rate constraint', async () => {
      // Test negative pay rate
      const { error } = await testSupabase
        .from('preferences')
        .insert({
          user_id: testUserId,
          min_pay_rate: -5, // Negative
          max_travel_km: 15,
          desired_roles: [],
          max_hours_per_week: 40,
          max_hours_per_shift: 8,
          consider_lower_rate: false
        })

      // Should fail due to database constraint
      expect(error).toBeTruthy()
      expect(error?.message).toContain('violates check constraint')
    })
  })
})