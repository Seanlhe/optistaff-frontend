import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  seedRequiredData,
  cleanupTestData,
  createTestClient,
  createTestJobSeeker,
  createTestShift,
  createTestAssignment,
} from '../../../src/test-setup.ts'
import { StatusEnum } from '../../../src/types/hooks.ts'

// Make the app Supabase client point to the local test client
vi.mock('../../../src/integrations/supabase/client', async () => {
  const { testSupabase } = await import('../../../src/test-setup.ts')
  return { supabase: testSupabase }
})

// Stable auth user returned by useAuth
let authUser: { id: string; email: string; role: 'jobseeker' } | null = null
vi.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({ user: authUser }),
}))

import { useAssignments } from '../../../src/hooks/useAssignments'

describe('useAssignments (local Supabase)', () => {
  let jobSeekerId = ''
  let shiftId = ''
  let assignmentId = ''

  beforeAll(async () => {
    await cleanupTestData()
    await seedRequiredData()

    const client = await createTestClient()
    const jobSeeker = await createTestJobSeeker()
    const shift = await createTestShift(client.client_id)
    const assignment = await createTestAssignment(jobSeeker.user_id, shift.shift_id)

    jobSeekerId = jobSeeker.user_id
    shiftId = shift.shift_id
    assignmentId = assignment.assignment_id

    authUser = { id: jobSeekerId, email: 'js@example.com', role: 'jobseeker' }
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  it('fetches assignments by shift id', async () => {
    const { result } = renderHook(() => useAssignments())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const list = await result.current.fetchAssignmentsByShift(shiftId)
    expect(Array.isArray(list)).toBe(true)
    const ids = (list || []).map((a) => a.assignment_id)
    expect(ids).toContain(assignmentId)
  })
})
