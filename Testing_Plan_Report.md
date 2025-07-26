# OptiStaff Testing Plan - Project Meeting 3

## Testing Framework and Tools

**Testing Framework**: Jest and Vitest for JavaScript/TypeScript testing
**Integration Testing**: Supertest for API endpoint testing
**Database Testing**: Supabase test client with isolated test database
**Frontend Testing**: React Testing Library for component testing

---

## Unit Test Cases

### UC1: Create Account - Unit Test

| Test Case ID | TC-UC1-U1 |
|--------------|-----------|
| **Feature** | User Registration Validation |
| **Component** | `src/utils/authentication.tsx` - `validateRegistrationData()` |
| **Test Description** | Verify email validation logic accepts valid emails and rejects invalid formats |
| **Input** | Valid email: "user@example.com", Invalid email: "invalid-email" |
| **Expected Output** | Valid: `{isValid: true}`, Invalid: `{isValid: false, error: "Invalid email format"}` |
| **Test Type** | Unit Test |

### UC2: Sign In - Unit Test

| Test Case ID | TC-UC2-U1 |
|--------------|-----------|
| **Feature** | Authentication Hook |
| **Component** | `src/hooks/useAuth.tsx` - `signIn()` function |
| **Test Description** | Test sign-in function with valid credentials returns user object |
| **Input** | `{email: "test@example.com", password: "validPassword123"}` |
| **Expected Output** | `{user: {id: "uuid", email: "test@example.com"}, error: null}` |
| **Test Type** | Unit Test |

### UC3: Set Preferences - Unit Test

| Test Case ID | TC-UC3-U1 |
|--------------|-----------|
| **Feature** | Preferences Validation |
| **Component** | `src/utils/preferencesValidator.ts` - `validatePreferences()` |
| **Test Description** | Validate preference constraints (pay rate >= 0, max hours <= 44) |
| **Input** | `{min_pay_rate: 15.50, max_hours_per_week: 40, max_travel_km: 25}` |
| **Expected Output** | `{isValid: true, errors: []}` |
| **Test Type** | Unit Test |

### UC4: Indicate Availability - Unit Test

| Test Case ID | TC-UC4-U1 |
|--------------|-----------|
| **Feature** | Availability Time Slot Validation |
| **Component** | `src/hooks/useAvailability.tsx` - `validateTimeSlot()` |
| **Test Description** | Verify time slot validation prevents overlapping availability |
| **Input** | Existing: `{start: "09:00", end: "17:00"}`, New: `{start: "16:00", end: "20:00"}` |
| **Expected Output** | `{isValid: false, error: "Time slot overlaps with existing availability"}` |
| **Test Type** | Unit Test |

### UC5: Cancel Shift - Unit Test

| Test Case ID | TC-UC5-U1 |
|--------------|-----------|
| **Feature** | Assignment Status Update |
| **Component** | `src/hooks/useAssignments.tsx` - `updateAssignmentStatus()` |
| **Test Description** | Test assignment status change from CONFIRMED to CANCELLED_BY_USER |
| **Input** | `{assignmentId: "uuid", newStatus: "CANCELLED_BY_USER"}` |
| **Expected Output** | `{success: true, updatedAssignment: {status: 7}}` |
| **Test Type** | Unit Test |

### UC6: List Jobs - Unit Test

| Test Case ID | TC-UC6-U1 |
|--------------|-----------|
| **Feature** | Shift Creation Validation |
| **Component** | `src/hooks/useShifts.tsx` - `validateShiftData()` |
| **Test Description** | Validate shift data before creation (end time after start time, positive pay rate) |
| **Input** | `{start_time: "2025-08-01T09:00", end_time: "2025-08-01T17:00", pay_rate: 18.50}` |
| **Expected Output** | `{isValid: true, errors: []}` |
| **Test Type** | Unit Test |

### UC7: Review Employee - Unit Test

| Test Case ID | TC-UC7-U1 |
|--------------|-----------|
| **Feature** | Rating Validation |
| **Component** | `src/hooks/useFeedback.tsx` - `validateRating()` |
| **Test Description** | Ensure rating score is within valid range (1-5) |
| **Input** | `{rating_score: 4, comment: "Good work"}` |
| **Expected Output** | `{isValid: true}` |
| **Test Type** | Unit Test |

### UC8: Employer Cancels Job Listing - Unit Test

| Test Case ID | TC-UC8-U1 |
|--------------|-----------|
| **Feature** | Shift Status Validation |
| **Component** | `src/hooks/useShifts.tsx` - `canCancelShift()` |
| **Test Description** | Check if shift can be cancelled based on current status and assignments |
| **Input** | `{shiftId: "uuid", currentStatus: "OPEN", assignedCount: 0}` |
| **Expected Output** | `{canCancel: true, reason: "No assignments"}` |
| **Test Type** | Unit Test |

---

## Integration Test Cases

### UC1: Create Account - Integration Test

| Test Case ID | TC-UC1-I1 |
|--------------|-----------|
| **Feature** | Complete User Registration Flow |
| **Components** | Auth Page → useAuth Hook → Supabase Client → Database |
| **Test Description** | Test end-to-end user registration from form submission to database record creation |
| **Integration Strategy** | **Call Graph-based, Top-down**: Start from Auth component, mock Supabase initially, then integrate real database |
| **Input** | Form data: `{email: "newuser@test.com", password: "password123", userType: "job-seeker", firstName: "John", lastName: "Doe"}` |
| **Expected Output** | User record created in `job_seekers` table, preferences record created, success response |
| **Test Type** | Integration Test |

### UC2: Sign In - Integration Test

| Test Case ID | TC-UC2-I1 |
|--------------|-----------|
| **Feature** | Authentication Flow with Role-based Routing |
| **Components** | Login Form → useAuth Hook → ProtectedRoute → Dashboard |
| **Test Description** | Test complete sign-in flow including role detection and dashboard redirection |
| **Integration Strategy** | **Call Graph-based, Top-down**: Start from Login component, integrate authentication and routing |
| **Input** | `{email: "employer@test.com", password: "validpass"}` |
| **Expected Output** | User authenticated, role cached, redirected to employer dashboard |
| **Test Type** | Integration Test |

### UC3: Set Preferences - Integration Test

| Test Case ID | TC-UC3-I1 |
|--------------|-----------|
| **Feature** | Preferences Form to Database Integration |
| **Components** | PreferencesForm → usePreferences Hook → Database Functions |
| **Test Description** | Test preferences saving from form to database with validation |
| **Integration Strategy** | **Decomposition-based, Bottom-up**: Start with database function, integrate upward to form component |
| **Input** | Preferences: `{min_pay_rate: 20.00, max_travel_km: 30, desired_roles: ["server", "cashier"]}` |
| **Expected Output** | Preferences saved to database, form shows success message, matching jobs updated |
| **Test Type** | Integration Test |

### UC4: Indicate Availability - Integration Test

| Test Case ID | TC-UC4-I1 |
|--------------|-----------|
| **Feature** | Calendar Availability Integration |
| **Components** | Calendar Component → useAvailability Hook → Database |
| **Test Description** | Test availability selection from calendar UI to database storage |
| **Integration Strategy** | **Call Graph-based, Bottom-up**: Start with database operations, integrate calendar UI |
| **Input** | Time slots: `[{day: "Monday", start: "09:00", end: "17:00"}, {day: "Tuesday", start: "10:00", end: "18:00"}]` |
| **Expected Output** | Availability records created, calendar UI updated, confirmation displayed |
| **Test Type** | Integration Test |

### UC5: Cancel Shift - Integration Test

| Test Case ID | TC-UC5-I1 |
|--------------|-----------|
| **Feature** | Shift Cancellation with Rating Impact |
| **Components** | Assignment Component → useAssignments Hook → Database Triggers |
| **Test Description** | Test shift cancellation flow including automatic rating penalty |
| **Integration Strategy** | **Call Graph-based, Top-down**: Start from UI component, integrate database triggers |
| **Input** | `{assignmentId: "uuid", cancellationReason: "Personal emergency"}` |
| **Expected Output** | Assignment status updated to CANCELLED_BY_USER, job seeker rating reduced, shift reopened |
| **Test Type** | Integration Test |

### UC6: List Jobs - Integration Test

| Test Case ID | TC-UC6-I1 |
|--------------|-----------|
| **Feature** | Job Posting to Shift Creation |
| **Components** | UploadJobs Component → useShifts Hook → create_shift() Function |
| **Test Description** | Test complete job posting flow from form to database record |
| **Integration Strategy** | **Decomposition-based, Top-down**: Start from UI form, mock database initially, then integrate |
| **Input** | Shift data: `{title: "Restaurant Server", start_time: "2025-08-01T11:00", pay_rate: 18.50, staff_needed: 3}` |
| **Expected Output** | Shift record created with status OPEN, visible to job seekers, confirmation shown |
| **Test Type** | Integration Test |

### UC7: Review Employee - Integration Test

| Test Case ID | TC-UC7-I1 |
|--------------|-----------|
| **Feature** | Employee Rating with Automatic Calculation |
| **Components** | Feedback Form → useFeedback Hook → Rating Calculation Triggers |
| **Test Description** | Test employee rating submission and automatic rating recalculation |
| **Integration Strategy** | **Call Graph-based, Bottom-up**: Start with database triggers, integrate feedback UI |
| **Input** | `{assignmentId: "uuid", rating_score: 4, comment: "Punctual and professional"}` |
| **Expected Output** | Feedback record created, job seeker rating automatically updated, confirmation displayed |
| **Test Type** | Integration Test |

### UC8: Employer Cancels Job Listing - Integration Test

| Test Case ID | TC-UC8-I1 |
|--------------|-----------|
| **Feature** | Job Cancellation with Notification |
| **Components** | Shift Management → useShifts Hook → Notification System |
| **Test Description** | Test job cancellation flow including employee notification for assigned shifts |
| **Integration Strategy** | **Decomposition-based, Top-down**: Start from management UI, integrate notification system |
| **Input** | `{shiftId: "uuid", hasAssignments: true}` |
| **Expected Output** | Shift status updated to CANCELLED, assigned employees notified, shift removed from listings |
| **Test Type** | Integration Test |

---

## Testing Timeline (3 Weeks)

### Week 11: Unit Testing Implementation
- **Days 1-2**: Set up testing infrastructure (Jest, Vitest configuration)
- **Days 3-4**: Implement unit tests for UC1-UC4 (Authentication, Preferences, Availability)
- **Days 5-7**: Implement unit tests for UC5-UC8 (Assignments, Shifts, Feedback)
- **Deliverable**: All 8 unit test suites completed and passing

### Week 12: Integration Testing Implementation
- **Days 1-2**: Set up integration testing environment (test database, Supertest)
- **Days 3-4**: Implement integration tests for UC1-UC4 using specified strategies
- **Days 5-7**: Implement integration tests for UC5-UC8 using specified strategies
- **Deliverable**: All 8 integration test suites completed and passing

### Week 13: Test Execution and Documentation
- **Days 1-2**: Execute all test suites, fix any failing tests
- **Days 3-4**: Generate test coverage reports and performance metrics
- **Days 5-7**: Document test results, create final testing report
- **Deliverable**: Complete test execution report with coverage analysis

---

## Testing Tools and Frameworks Summary

| Testing Level | Tool/Framework | Purpose |
|---------------|----------------|---------|
| **Unit Testing** | Jest + Vitest | Component and function testing |
| **Integration Testing** | Supertest + Jest | API and database integration |
| **Database Testing** | Supabase Test Client | Isolated database operations |
| **Frontend Testing** | React Testing Library | Component integration testing |
| **Coverage Analysis** | Jest Coverage | Code coverage reporting |

---

## Success Criteria

- **Unit Tests**: 100% of core functions tested with >90% code coverage
- **Integration Tests**: All 8 use case flows tested end-to-end
- **Test Execution**: All tests pass consistently in CI/CD environment
- **Documentation**: Complete test documentation in table format as required
- **Timeline Adherence**: All testing phases completed within 3-week timeline

This testing plan ensures comprehensive coverage of all use cases while meeting the academic requirements for systematic testing approach documentation.