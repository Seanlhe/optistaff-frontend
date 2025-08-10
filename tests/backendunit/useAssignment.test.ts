import { afterEach, beforeAll, afterAll, describe, expect, it } from 'vitest'
import {
  createTestJobSeeker,
  createTestClient,
  createTestShift,
  createTestAssignment,
  cleanupTestData,
  seedRequiredData,
  testSupabase,
} from '../../src/test-setup'

describe('Unit Tests for useAssignments', () => {
  let client, jobSeeker, shift;
  beforeAll(async () => {
    await seedRequiredData()
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  it('Creating a shift and assignment', async () => {
    // first create client
    client = await createTestClient()
    // then create shift for client
    shift = await createTestShift(client.client_id)
    expect(shift).toHaveProperty('shift_id')

    // create job seeker for assignment
    jobSeeker = await createTestJobSeeker()
    // then create assignment
    const assignment = await createTestAssignment(jobSeeker.user_id, shift.shift_id)
    expect(assignment).toHaveProperty('assignment_id')
    expect(assignment.user_id).toBe(jobSeeker.user_id)
    expect(assignment.shift_id).toBe(shift.shift_id)
  })

  it('Fetching assignment by Shift ID', async () => {
    
    // then create assignment
    const assignment = await testSupabase.rpc('')
    expect(assignment).toHaveProperty('assignment_id')
    expect(assignment.user_id).toBe(seeker.user_id)
    expect(assignment.shift_id).toBe(shift.shift_id)
  })
})
