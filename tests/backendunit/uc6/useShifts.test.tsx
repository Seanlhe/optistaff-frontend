import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
    seedRequiredData,
    cleanupTestData,
    createTestClient,
} from '../../../src/test-setup'

// Wire the app's Supabase client to the local test Supabase (avoid hoist issues by importing inside the factory)
vi.mock('../../../src/integrations/supabase/client', async () => {
    const { testSupabase } = await import('../../../src/test-setup')
    return { supabase: testSupabase }
})

// Stable auth user reference to avoid changing object identity across renders
let employerId: string = ''
let authUser: { id: string; email: string; role: 'employer' } | null = null

vi.mock('../../../src/hooks/useAuth', () => ({
    useAuth: () => ({ user: authUser }),
}))

import { useShifts } from '../../../src/hooks/useShifts'

describe('Unit Test for useShifts', () => {
    beforeAll(async () => {
        await cleanupTestData()
        await seedRequiredData()
        const client = await createTestClient()
        employerId = client.client_id
        authUser = { id: employerId, email: 'test@example.com', role: 'employer' }
    })

    afterAll(async () => {
        await cleanupTestData()
    })

    it('Create Shift Successfully', async () => {
        const { result } = renderHook(() => useShifts())

        // Initial fetch should complete
        await waitFor(() => {
            console.log('Initial fetch completed', result)
            expect(result.current.loading).toBe(false)
        })
        expect(Array.isArray(result.current.shifts)).toBe(true)

        const start = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

        await act(async () => {
            await result.current.createShift({
                job_title: 'New Job',
                job_description: 'Desc',
                job_requirements: 'Req',
                job_type: 'Waiter/Waitress',
                pay_rate: 20,
                job_location: 'Addr',
                postal_code: 123456,
                start_time: start,
                end_time: end,
                break_duration: 0.5,
                staff_needed: 2,
            })
        })

        await waitFor(() => expect(result.current.loading).toBe(false))
        const titles = result.current.shifts.map((s) => s.job_title)
        expect(titles).toContain('New Job')
    });

    it('Fails to create shift with invalid job type', async () => {
        const { result } = renderHook(() => useShifts())

        // Wait for initial fetch
        await waitFor(() => expect(result.current.loading).toBe(false))
        const initialCount = result.current.shifts.length
        const initialTitles = result.current.shifts.map((s) => s.job_title)

        const start = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

        await act(async () => {
            await result.current.createShift({
                job_title: 'Bad Job',
                job_description: 'Desc',
                job_requirements: 'Req',
                job_type: 'Nonexistent Type', // force RPC validation failure
                pay_rate: 20,
                job_location: 'Addr',
                postal_code: 123456,
                start_time: start,
                end_time: end,
                break_duration: 0.5,
                staff_needed: 2,
            })
        })

        // Should not add a new shift and should set error
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.error).toBeTruthy()
        expect(result.current.shifts.length).toBe(initialCount)
        const titlesAfter = result.current.shifts.map((s) => s.job_title)
        expect(titlesAfter).toEqual(initialTitles)
        expect(titlesAfter).not.toContain('Bad Job')
    });

    it('Update Shift Successfully', async () => {
        const { result } = renderHook(() => useShifts());

        // Wait for initial fetch
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Create a shift to update
        const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        await act(async () => {
            await result.current.createShift({
                job_title: 'Edit Job',
                job_description: 'Desc',
                job_requirements: 'Req',
                job_type: 'Waiter/Waitress',
                pay_rate: 25,
                job_location: 'Addr',
                postal_code: 123456,
                start_time: start,
                end_time: end,
                break_duration: 0.5,
                staff_needed: 2,
            });
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Grab the created shift
        const created = result.current.shifts.find((s) => s.job_title === 'Edit Job');
        expect(created).toBeTruthy();

        const newTitle = 'Edited Job';
        const newRate = (created!.pay_rate as number) + 5;

        await act(async () => {
            await result.current.updateShift({
                shift_id: created!.shift_id,
                job_title: newTitle,
                postal_code: created!.postal_code,
                job_location: created!.job_location,
                job_description: created!.job_description,
                job_requirements: created!.job_requirements,
                pay_rate: newRate,
                start_time: created!.start_time,
                end_time: created!.end_time,
                break_duration: created!.break_duration,
                staff_needed: created!.staff_needed,
            });
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const updated = result.current.shifts.find((s) => s.shift_id === created!.shift_id);
        expect(updated?.job_title).toBe(newTitle);
        expect(updated?.pay_rate).toBe(newRate);
    });

    it('Fails to update shift with invalid shift_id', async () => {
        const { result } = renderHook(() => useShifts())

        // Wait for initial fetch
        await waitFor(() => expect(result.current.loading).toBe(false))

        // Create a shift we will attempt to update incorrectly
        const start = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
        await act(async () => {
            await result.current.createShift({
                job_title: 'Fail Update Job',
                job_description: 'Desc',
                job_requirements: 'Req',
                job_type: 'Waiter/Waitress',
                pay_rate: 22,
                job_location: 'Addr',
                postal_code: 123456,
                start_time: start,
                end_time: end,
                break_duration: 0.5,
                staff_needed: 2,
            })
        })
        await waitFor(() => expect(result.current.loading).toBe(false))

        const created = result.current.shifts.find((s) => s.job_title === 'Fail Update Job')
        expect(created).toBeTruthy()
        const originalTitle = created!.job_title
        const originalRate = created!.pay_rate

        // Attempt update with invalid UUID to force RPC failure
        await act(async () => {
            await result.current.updateShift({
                shift_id: 'invalid-uuid',
                job_title: 'Should Not Update',
                postal_code: created!.postal_code,
                job_location: created!.job_location,
                job_description: created!.job_description,
                job_requirements: created!.job_requirements,
                pay_rate: (created!.pay_rate as number) + 10,
                start_time: created!.start_time,
                end_time: created!.end_time,
                break_duration: created!.break_duration,
                staff_needed: created!.staff_needed,
            });
        });

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.error).toBeTruthy()

        // Ensure the original shift was not modified
        const after = result.current.shifts.find((s) => s.shift_id === created!.shift_id)
        expect(after?.job_title).toBe(originalTitle)
        expect(after?.pay_rate).toBe(originalRate)
    });
});
