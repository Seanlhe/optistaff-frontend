import { afterEach, beforeAll, afterAll, describe, expect, it } from 'vitest'
import {
  createTestJobSeeker,
  createTestClient,
  seedRequiredData,
  cleanupTestData,
  createTestShift,
  createTestAssignment,
  testSupabase,
} from '../../../src/test-setup.ts'
import { StatusEnum } from '../../../src/types/hooks.ts';
import { useAssignments } from '../../../src/hooks/useAssignments.tsx'


const setup = await (async () => {
  await seedRequiredData();
  const client = await createTestClient();
  const jobSeeker = await createTestJobSeeker();
  const shift = await createTestShift(client.client_id);
  const assignment = await createTestAssignment(jobSeeker.user_id, shift.shift_id);
  return { client, jobSeeker, shift, assignment };
})().catch((e) => {
  console.warn('Setup failed:', e);
  return { client: null, jobSeeker: null, shift: null, assignment: null };
});

describe.runIf(Boolean(setup.client && setup.jobSeeker && setup.shift && setup.assignment))('Unit Tests for useAssignments', () => {
  const { jobSeeker, assignment } = setup;

  afterAll(async () => {
    await cleanupTestData();
  })
  it('Fetching Assignment By Jobseeker', async () => {
    const { data: fetchedAssignments, error } = await testSupabase.rpc('get_assignments_by_jobseeker', { p_user_id: jobSeeker.user_id });
    if (error) throw error;
    expect(fetchedAssignments).toHaveLength(1);
    expect(fetchedAssignments[0].assignment_id).toBe(assignment!.assignment_id);
  })

  it('Updating Assignment Status to CancelByEmployee', async () => {
    const { data, error: updateError } = await testSupabase.rpc('update_assignment_status', {
      p_assignment_id: assignment!.assignment_id,
      p_status_name: StatusEnum.CancelByEmployee
    }).single();
    if (updateError) throw updateError;
    expect(data).toHaveProperty('updated_count', 1);
    expect(data).toHaveProperty('payout_created', false);
    const { data: fetchedAssignments, error: fetchError } = await testSupabase.rpc('get_assignments_by_jobseeker', { p_user_id: jobSeeker.user_id });
    if (fetchError) throw fetchError;
    expect(fetchedAssignments[0].status).toBe(StatusEnum.CancelByEmployee);
  });
})
