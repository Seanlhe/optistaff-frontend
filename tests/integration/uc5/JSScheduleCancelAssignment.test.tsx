import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
// import JSSchedule AFTER mocks
// import JSSchedule from '../../../src/pages/employee/JSSchedule'
import { StatusEnum } from '../../../src/types/hooks'

// Mocks
const mockUpdateAssignmentStatus = vi.fn()
const mockFetchAssignments = vi.fn()

// Provide one upcoming assignment (confirmed -> upcoming)
const fixtureAssignment = {
    assignment_id: 'assign-1',
    company_name: 'Tech Corp',
    employee_name: 'Jane Doe',
    employer_name: 'Tech Corp',
    employee_id: 'emp-1',
    job_title: 'Cashier',
    job_location: 'Downtown',
    postal_code: '123456',
    job_description: 'Handle POS',
    job_requirements: 'Friendly',
    job_type: 'Waiter/Waitress',
    pay_rate: 20,
    start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    break_hours: 0.5,
    contact_number: '12345678',
    contact_email: 'manager@corp.com',
    check_in_time: null,
    check_out_time: null,
    status: 'confirmed',
    created_at: new Date().toISOString(),
}

vi.mock('../../../src/hooks/useAssignments', () => ({
    useAssignments: () => ({
        assignments: [fixtureAssignment],
        loading: false,
        error: null,
        updateAssignmentStatus: mockUpdateAssignmentStatus,
        fetchAssignments: mockFetchAssignments,
    }),
}))

vi.mock('../../../src/hooks/useAuth', () => ({
    useAuth: () => ({ user: { id: 'jobseeker-1', email: 'js@example.com', role: 'jobseeker' }, loading: false, error: null }),
}))

vi.mock('../../../src/hooks/useFeedback', () => ({
    useFeedback: () => ({ fetchFeedbackReviewAssignID: vi.fn().mockResolvedValue(null) }),
}))

// NEW: Mock useUserProfile to avoid calling the real hook
vi.mock('../../../src/hooks/useUserProfile', () => ({
    useUserProfile: () => ({ profileData: { display: { rating: 4.8 }, first_name: 'Jane', last_name: 'Doe' } }),
}))

// Keep heavy components light for speed
vi.mock('../../../src/components/StatsCard', () => ({ default: () => <div /> }))
vi.mock('../../../src/components/PayoutTotalSummaryCard', () => ({ default: () => <div /> }))

// Ensure a stable button with accessible name "View Details"
vi.mock('../../../src/components/JobseekerAssignmentCard', () => ({
    JobseekerAssignmentCard: ({ assignment, onViewDetails }: { assignment: { id: string }; onViewDetails: (a: { id: string }) => void }) => (
        <button onClick={() => onViewDetails(assignment)}>View Details</button>
    ),
}))

// Stabilize date-fns formatting if needed
vi.mock('date-fns', async () => {
    const actual = (await vi.importActual('date-fns')) as { format: (d: Date | number, f: string) => string } & Record<string, unknown>
    return {
        ...actual,
        format: vi.fn((date: Date | number, fmt: string) => actual.format(date, fmt)),
    }
})

// Import the component under test AFTER mocks so they apply
import JSSchedule from '../../../src/pages/employee/JSSchedule'

describe('JSSchedule - cancel assignment flow', () => {
    beforeEach(() => {
        // Use real timers for Testing Library's findBy/waitFor
        vi.useRealTimers()
        vi.clearAllMocks()
        mockUpdateAssignmentStatus.mockResolvedValue({ updated_count: 1 })
        mockFetchAssignments.mockResolvedValue(undefined)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('opens details, cancels successfully, closes modal, and refreshes assignments', async () => {
        render(<JSSchedule />)

        // Open details from upcoming assignment card
        const viewButtons = await screen.findAllByRole('button', { name: /view details/i })
        fireEvent.click(viewButtons[0])

        // Modal visible with cancel action
        const cancelBtn = await screen.findByRole('button', { name: /cancel assignment/i })

        // Perform cancel
        fireEvent.click(cancelBtn)

        // Hook call with correct params
        await waitFor(() =>
            expect(mockUpdateAssignmentStatus).toHaveBeenCalledWith('assign-1', StatusEnum.CancelByEmployee)
        )

        // Switch to fake timers to flush 300ms debounce
        vi.useFakeTimers()
        await act(async () => {
            vi.advanceTimersByTime(350)
        })
        vi.useRealTimers()

        await waitFor(() => expect(mockFetchAssignments).toHaveBeenCalled())

        // Modal is closed
        await waitFor(() => expect(screen.queryByRole('button', { name: /cancel assignment/i })).toBeNull())
    })

    it('handles API error without closing the modal', async () => {
        mockUpdateAssignmentStatus.mockRejectedValueOnce(new Error('Network error'))

        render(<JSSchedule />)

        const viewButtons = await screen.findAllByRole('button', { name: /view details/i })
        fireEvent.click(viewButtons[0])

        const cancelBtn = await screen.findByRole('button', { name: /cancel assignment/i })
        fireEvent.click(cancelBtn)

        // Should attempt API call
        await waitFor(() => expect(mockUpdateAssignmentStatus).toHaveBeenCalled())

        // Since it fails, modal should still be visible and no refresh called
        expect(screen.getByRole('button', { name: /cancel assignment/i })).toBeTruthy()
        expect(mockFetchAssignments).not.toHaveBeenCalled()
    })
})
