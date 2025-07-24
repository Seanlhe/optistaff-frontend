import { describe, test, expect } from 'vitest'
import { testSupabase, createTestJobSeeker, createTestClient, createTestShift, createTestAssignment } from '../../src/test-setup'

describe('Job Seeker Rating System - Decision Table Testing', () => {
  const testCases = [
    {
      description: 'Perfect rating, no penalties',
      feedbackRating: 5.0,
      cancellations: 0,
      noShows: 0,
      expectedRating: 5.0
    },
    {
      description: 'Good rating with single cancellation penalty',
      feedbackRating: 4.0,
      cancellations: 1,
      noShows: 0,
      expectedRating: 3.9 // 4.0 - (1 * 0.1)
    },
    {
      description: 'Good rating with no-show penalty',
      feedbackRating: 4.0,
      cancellations: 0,
      noShows: 1,
      expectedRating: 3.7 // 4.0 - (1 * 0.3)
    },
    {
      description: 'Average rating with multiple penalties',
      feedbackRating: 3.5,
      cancellations: 2,
      noShows: 1,
      expectedRating: 2.8 // 3.5 - (2 * 0.1) - (1 * 0.3)
    },
    {
      description: 'Low rating with heavy penalties (floor at 0.0)',
      feedbackRating: 2.0,
      cancellations: 5,
      noShows: 3,
      expectedRating: 0.6 // 2.0 - (5 * 0.1) - (3 * 0.3) = 0.6
    }
  ]

  testCases.forEach(({ description, feedbackRating, cancellations, noShows, expectedRating }) => {
    test(description, async () => {
      // Arrange - Create test user and client
      const jobSeeker = await createTestJobSeeker()
      const client = await createTestClient()

      // Create assignments with different statuses
      for (let i = 0; i < cancellations; i++) {
        const shift = await createTestShift(client.client_id)
        await createTestAssignment(jobSeeker.user_id, shift.shift_id, {
          status: 7 // CANCELLED_BY_USER
        })
      }

      for (let i = 0; i < noShows; i++) {
        const shift = await createTestShift(client.client_id)
        await createTestAssignment(jobSeeker.user_id, shift.shift_id, {
          status: 8 // NO_SHOW
        })
      }

      // Create completed assignment with feedback
      const shift = await createTestShift(client.client_id)
      const assignment = await createTestAssignment(jobSeeker.user_id, shift.shift_id, {
        status: 9 // COMPLETED
      })

      // Add feedback
      await testSupabase.from('feedback').insert({
        assignment_id: assignment.assignment_id,
        reviewer_id: client.client_id,
        reviewee_id: jobSeeker.user_id,
        rating_score: feedbackRating,
        review_type: 'CLIENT_TO_EMPLOYEE',
        comment: 'Test feedback'
      })

      // Act - Trigger rating update
      await testSupabase.rpc('update_job_seeker_rating')

      // Assert - Check final rating
      const { data } = await testSupabase
        .from('job_seekers')
        .select('rating')
        .eq('user_id', jobSeeker.user_id)
        .single()

      expect(data.rating).toBeCloseTo(expectedRating, 1)
    })
  })
})