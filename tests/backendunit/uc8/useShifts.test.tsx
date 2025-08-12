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
import { StatusEnum } from '../../../src/types/hooks'

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
    });

    it('Updates shift status to CancelByEmployer', async () => {
        const { result } = renderHook(() => useShifts())

        // Wait for initial fetch
        await waitFor(() => expect(result.current.loading).toBe(false))

        // Create a shift to change status
        const start = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
        await act(async () => {
            await result.current.createShift({
                job_title: 'Status Job',
                job_description: 'Desc',
                job_requirements: 'Req',
                job_type: 'Waiter/Waitress',
                pay_rate: 23,
                job_location: 'Addr',
                postal_code: 123456,
                start_time: start,
                end_time: end,
                break_duration: 0.5,
                staff_needed: 2,
            })
        })
        await waitFor(() => expect(result.current.loading).toBe(false))

        const created = result.current.shifts.find((s) => s.job_title === 'Status Job')
        expect(created).toBeTruthy()

        // Update the status via RPC through the hook
        await act(async () => {
            await result.current.updateShiftStatus(created!.shift_id, StatusEnum.CancelByEmployer)
        })

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.error).toBeNull()

        const updated = result.current.shifts.find((s) => s.shift_id === created!.shift_id)
        expect(updated?.status).toBe(StatusEnum.CancelByEmployer)
    })
});
