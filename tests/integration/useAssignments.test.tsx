import { describe, test, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAssignments } from '../../src/hooks/useAssignments'
import { testSupabase, createTestJobSeeker, createTestClient, createTestShift, createTestAssignment } from '../../src/test-setup'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAssignments hook - Equivalence Class Testing', () => {
  describe('Valid assignment status classes', () => {
    const validStatuses = [
      { status: 5, name: 'CONFIRMED' },
      { status: 7, name: 'CANCELLED_BY_USER' },
      { status: 8, name: 'NO_SHOW' },
      { status: 9, name: 'COMPLETED' }
    ]

    validStatuses.forEach(({ status, name }) => {
      test(`fetches assignments with ${name} status`, async () => {
        // Arrange
        const jobSeeker = await createTestJobSeeker()
        const client = await createTestClient()
        const shift = await createTestShift(client.client_id)
        await createTestAssignment(jobSeeker.user_id, shift.shift_id, { status })

        // Act
        const { result } = renderHook(
          () => useAssignments(jobSeeker.user_id),
          { wrapper: createWrapper() }
        )

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.assignments).toHaveLength(1)
        expect(result.current.assignments[0].status).toBe(status)
      })
    })
  })

  test('handles empty assignment list', async () => {
    // Arrange
    const jobSeeker = await createTestJobSeeker()

    // Act
    const { result } = renderHook(
      () => useAssignments(jobSeeker.user_id),
      { wrapper: createWrapper() }
    )

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.assignments).toHaveLength(0)
  })

  test('updates assignment status successfully', async () => {
    // Arrange
    const jobSeeker = await createTestJobSeeker()
    const client = await createTestClient()
    const shift = await createTestShift(client.client_id)
    const assignment = await createTestAssignment(jobSeeker.user_id, shift.shift_id, { status: 5 })

    // Act
    const { result } = renderHook(
      () => useAssignments(jobSeeker.user_id),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Update status
    await result.current.updateAssignmentStatus.mutateAsync({
      assignmentId: assignment.assignment_id,
      status: 'COMPLETED'
    })

    // Assert
    await waitFor(() => {
      expect(result.current.assignments[0].status).toBe(9) // COMPLETED
    })
  })
})