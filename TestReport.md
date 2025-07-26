# OptiStaff Testing Report - Comprehensive Test Coverage

## Testing Framework and Tools

**Testing Framework**: Vitest (v3.2.4) for JavaScript/TypeScript testing
**Integration Testing**: Supabase test client with isolated test database
**Frontend Testing**: React Testing Library (@testing-library/react v16.3.0) for component testing
**Coverage Analysis**: @vitest/coverage-v8 (v3.2.4) for code coverage reporting

---

## Unit Test Cases

### UC1: Create Account - Unit Test

| Test Case ID | TC-UC1-U1 |
|--------------|-----------|
| **Feature** | Email Validation Logic |
| **Component** | `src/utils/authentication.tsx:1` - `isValidEmail()` |
| **Test Description** | Verify email validation logic accepts valid emails and rejects invalid formats |
| **Input** | Valid email: "user@example.com", Invalid email: "invalid-email" |
| **Expected Output** | Valid: `true`, Invalid: `false` |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC1-U2 |
|--------------|-----------|
| **Feature** | Password Validation Logic |
| **Component** | `src/utils/authentication.tsx:7` - `isValidPassword()` |
| **Test Description** | Test password validation requirements (minimum 6 characters, uppercase) |
| **Input** | Valid: "Password123", Invalid: "pass" |
| **Expected Output** | Valid: `true`, Invalid: `false` |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC1-U3 |
|--------------|-----------|
| **Feature** | Signup Function |
| **Component** | `src/hooks/useAuth.tsx:268` - `signup()` |
| **Test Description** | Test user registration with complete signup data |
| **Input** | `{email: "test@example.com", password: "Password123", userType: "jobseeker", firstName: "John", lastName: "Doe"}` |
| **Expected Output** | User account created, navigation to preferences page |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

### UC2: Sign In - Unit Test

| Test Case ID | TC-UC2-U1 |
|--------------|-----------|
| **Feature** | Authentication Login Function |
| **Component** | `src/hooks/useAuth.tsx:220` - `login()` |
| **Test Description** | Test sign-in function with valid credentials returns user object |
| **Input** | `{email: "test@example.com", password: "validPassword123"}` |
| **Expected Output** | `{user: {id: "uuid", email: "test@example.com", role: "jobseeker"}, error: null}` |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC2-U2 |
|--------------|-----------|
| **Feature** | User Role Detection |
| **Component** | `src/hooks/useAuth.tsx:23` - `updateUserState()` |
| **Test Description** | Test role detection from user metadata and database lookup |
| **Input** | User with metadata: `{user_type: "job-seeker"}` |
| **Expected Output** | Role set to "jobseeker", navigation to preferences |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

### UC3: Set Preferences - Unit Test

| Test Case ID | TC-UC3-U1 |
|--------------|-----------|
| **Feature** | Preferences Validation |
| **Component** | `src/utils/preferencesValidator.ts:8` - `validatePreferences()` |
| **Test Description** | Validate preference constraints (pay rate >= 0, max hours <= 44, Singapore labor law) |
| **Input** | `{min_pay_rate: 15.50, max_hours_per_week: 40, max_travel_km: 25, desired_roles: ["server"]}` |
| **Expected Output** | `{isValid: true, errors: []}` |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC3-U2 |
|--------------|-----------|
| **Feature** | Preferences Form State Management |
| **Component** | `src/components/PreferencesForm.tsx:11` - `PreferencesForm` |
| **Test Description** | Test form data state updates and submission handling |
| **Input** | Form data updates: `{payRate: 20, maxHoursPerWeek: 40, selectedJobNames: ["waiter"]}` |
| **Expected Output** | Form state updated, submit button enabled |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC3-U3 |
|--------------|-----------|
| **Feature** | Preferences Update Function |
| **Component** | `src/hooks/usePreferences.tsx:102` - `updatePreferences()` |
| **Test Description** | Test updating user preferences in database |
| **Input** | Preference updates: `{min_pay_rate: 18.00, max_travel_km: 20}` |
| **Expected Output** | Database updated, function returns `true` |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

### UC4: Indicate Availability - Unit Test

| Test Case ID | TC-UC4-U1 |
|--------------|-----------|
| **Feature** | Calendar Time Slot Creation |
| **Component** | `src/components/Calendar.tsx:79` - `handleDoubleClick()` |
| **Test Description** | Test creating new availability slot on calendar double-click |
| **Input** | Double-click on Monday 9AM slot |
| **Expected Output** | New time slot created: `{startTime: "09:00", endTime: "10:00", day_of_week: 1}` |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC4-U2 |
|--------------|-----------|
| **Feature** | Availability Time Slot Validation |
| **Component** | `src/hooks/useAvailability.tsx:74` - `setAvailability()` |
| **Test Description** | Test availability saving with validation and database operations |
| **Input** | Time blocks: `[{start_time: "2025-08-01T09:00", end_time: "2025-08-01T17:00", submission_cycle: "PRIMARY"}]` |
| **Expected Output** | Database records created, function returns `true` |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC4-U3 |
|--------------|-----------|
| **Feature** | Calendar Event Management |
| **Component** | `src/components/Calendar.tsx:91` - `handleUpdateEvent()` and `handleDeleteEvent()` |
| **Test Description** | Test updating and deleting calendar events |
| **Input** | Event update/delete operations |
| **Expected Output** | Events array updated correctly |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

### UC5: Cancel Shift - Unit Test

| Test Case ID | TC-UC5-U1 |
|--------------|-----------|
| **Feature** | Assignment Status Update |
| **Component** | `src/hooks/useAssignments.tsx:89` - `updateAssignmentStatus()` |
| **Test Description** | Test assignment status change from confirmed to cancelled by user |
| **Input** | `{assignmentId: "uuid", status_name: "CancelByJobseeker"}` |
| **Expected Output** | `{updated_count: 1, payout_created: false}` |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC5-U2 |
|--------------|-----------|
| **Feature** | Assignment Data Fetching |
| **Component** | `src/hooks/useAssignments.tsx:21` - `fetchAssignments()` |
| **Test Description** | Test fetching user assignments for display |
| **Input** | Authenticated user ID |
| **Expected Output** | Array of user assignments loaded |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

### UC6: List Jobs - Unit Test

| Test Case ID | TC-UC6-U1 |
|--------------|-----------|
| **Feature** | Shift Creation Validation |
| **Component** | `src/hooks/useShifts.tsx:48` - `createShift()` |
| **Test Description** | Validate shift data before creation (end time after start time, positive pay rate) |
| **Input** | `{title: "Server", start_time: new Date("2025-08-01T09:00"), end_time: new Date("2025-08-01T17:00"), pay_rate: 18.50}` |
| **Expected Output** | Shift created successfully, database record inserted |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC6-U2 |
|--------------|-----------|
| **Feature** | Shift Data Management |
| **Component** | `src/hooks/useShifts.tsx:17` - `fetchShifts()` |
| **Test Description** | Test fetching shifts for employer dashboard |
| **Input** | Employer user ID |
| **Expected Output** | Array of employer's shifts loaded |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

### UC7: Review Employee - Unit Test

| Test Case ID | TC-UC7-U1 |
|--------------|-----------|
| **Feature** | Feedback Submission |
| **Component** | `src/hooks/useFeedback.tsx:54` - `submitFeedback()` |
| **Test Description** | Test employee feedback submission with rating and comment |
| **Input** | `{rating_score: 4, comment: "Good work", assignment_id: "uuid"}` |
| **Expected Output** | Feedback record created in database |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC7-U2 |
|--------------|-----------|
| **Feature** | Feedback Data Management |
| **Component** | `src/hooks/useFeedback.tsx:19` - `fetchFeedback()` |
| **Test Description** | Test fetching feedback records for reviewer |
| **Input** | Reviewer user ID |
| **Expected Output** | Array of feedback records loaded |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

### UC8: Employer Cancels Job Listing - Unit Test

| Test Case ID | TC-UC8-U1 |
|--------------|-----------|
| **Feature** | Shift Deletion |
| **Component** | `src/hooks/useShifts.tsx:107` - `deleteShift()` |
| **Test Description** | Test shift deletion and database cleanup |
| **Input** | `{shift_id: "uuid"}` |
| **Expected Output** | Shift removed from database, shifts list refreshed |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC8-U2 |
|--------------|-----------|
| **Feature** | Shift Status Update |
| **Component** | `src/hooks/useShifts.tsx:82` - `updateShift()` |
| **Test Description** | Test updating shift status to cancelled |
| **Input** | `{shift_id: "uuid", status: "CANCELLED"}` |
| **Expected Output** | Shift status updated in database |
| **Test Type** | Unit Test |
| **Actual Result** | TBD |

---

## Integration Test Cases

### UC1: Create Account - Integration Test

| Test Case ID | TC-UC1-I1 |
|--------------|-----------|
| **Feature** | Complete User Registration Flow |
| **Components** | Auth Form → useAuth Hook → Supabase Client → Database |
| **Test Description** | Test end-to-end user registration from form submission to database record creation |
| **Integration Strategy** | **Call Graph-based, Top-down**: Start from Auth component, integrate real Supabase database |
| **Input** | Form data: `{email: "newuser@test.com", password: "Password123", userType: "job-seeker", firstName: "John", lastName: "Doe"}` |
| **Expected Output** | User record created in `job_seekers` table, preferences record created, navigation to preferences |
| **Test Type** | Integration Test |
| **Actual Result** | TBD |

### UC2: Sign In - Integration Test

| Test Case ID | TC-UC2-I1 |
|--------------|-----------|
| **Feature** | Authentication Flow with Role-based Routing |
| **Components** | Login Form → useAuth Hook → Database Role Lookup → Navigation |
| **Test Description** | Test complete sign-in flow including role detection and dashboard redirection |
| **Integration Strategy** | **Call Graph-based, Top-down**: Start from Login component, integrate authentication and routing |
| **Input** | `{email: "employer@test.com", password: "validpass"}` |
| **Expected Output** | User authenticated, role cached, redirected to employer dashboard |
| **Test Type** | Integration Test |
| **Actual Result** | TBD |

### UC3: Set Preferences - Integration Test

| Test Case ID | TC-UC3-I1 |
|--------------|-----------|
| **Feature** | Preferences Form to Database Integration |
| **Components** | PreferencesForm → usePreferences Hook → Database Operations |
| **Test Description** | Test preferences saving from form to database with validation |
| **Integration Strategy** | **Decomposition-based, Bottom-up**: Start with database function, integrate upward to form component |
| **Input** | Preferences: `{min_pay_rate: 20.00, max_travel_km: 30, desired_roles: ["server", "cashier"]}` |
| **Expected Output** | Preferences saved to database, form shows success message |
| **Test Type** | Integration Test |
| **Actual Result** | TBD |

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
| **Actual Result** | TBD |

### UC5: Cancel Shift - Integration Test

| Test Case ID | TC-UC5-I1 |
|--------------|-----------|
| **Feature** | Shift Cancellation with Database Triggers |
| **Components** | Assignment Component → useAssignments Hook → Database Triggers |
| **Test Description** | Test shift cancellation flow including automatic status updates |
| **Integration Strategy** | **Call Graph-based, Top-down**: Start from UI component, integrate database triggers |
| **Input** | `{assignmentId: "uuid", status_name: "CancelByJobseeker"}` |
| **Expected Output** | Assignment status updated, database triggers executed, UI refreshed |
| **Test Type** | Integration Test |
| **Actual Result** | TBD |

### UC6: List Jobs - Integration Test

| Test Case ID | TC-UC6-I1 |
|--------------|-----------|
| **Feature** | Job Posting to Shift Creation |
| **Components** | Shift Creation Form → useShifts Hook → create_shift() RPC Function |
| **Test Description** | Test complete job posting flow from form to database record |
| **Integration Strategy** | **Decomposition-based, Top-down**: Start from UI form, integrate database operations |
| **Input** | Shift data: `{title: "Restaurant Server", start_time: "2025-08-01T11:00", pay_rate: 18.50, staff_needed: 3}` |
| **Expected Output** | Shift record created with status 'OPEN', visible in shifts list |
| **Test Type** | Integration Test |
| **Actual Result** | TBD |

### UC7: Review Employee - Integration Test

| Test Case ID | TC-UC7-I1 |
|--------------|-----------|
| **Feature** | Employee Rating with Database Operations |
| **Components** | Feedback Form → useFeedback Hook → Database Insert |
| **Test Description** | Test employee rating submission and database integration |
| **Integration Strategy** | **Call Graph-based, Bottom-up**: Start with database operations, integrate feedback UI |
| **Input** | `{assignment_id: "uuid", rating_score: 4, comment: "Punctual and professional"}` |
| **Expected Output** | Feedback record created, confirmation displayed |
| **Test Type** | Integration Test |
| **Actual Result** | TBD |

### UC8: Employer Cancels Job Listing - Integration Test

| Test Case ID | TC-UC8-I1 |
|--------------|-----------|
| **Feature** | Job Cancellation with Database Cleanup |
| **Components** | Shift Management → useShifts Hook → Database Operations |
| **Test Description** | Test job cancellation flow including database cleanup |
| **Integration Strategy** | **Decomposition-based, Top-down**: Start from management UI, integrate database operations |
| **Input** | `{shift_id: "uuid"}` |
| **Expected Output** | Shift deleted from database, shifts list updated |
| **Test Type** | Integration Test |
| **Actual Result** | TBD |

---

## Failure Test Cases

### UC1: Create Account - Failure Tests

| Test Case ID | TC-UC1-F1 |
|--------------|-----------|
| **Feature** | Email Validation Error |
| **Component** | `src/utils/authentication.tsx:27` - `getEmailError()` |
| **Test Description** | Test invalid email format handling |
| **Input** | Email: "invalid-email-format" |
| **Expected Output** | Error: "Please enter a valid email." |
| **Test Type** | Failure Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC1-F2 |
|--------------|-----------|
| **Feature** | Password Validation Error |
| **Component** | `src/utils/authentication.tsx:34` - `getPasswordError()` |
| **Test Description** | Test weak password handling |
| **Input** | Password: "weak" |
| **Expected Output** | Error: "Password must be 6 characters or longer." |
| **Test Type** | Failure Test |
| **Actual Result** | TBD |

| Test Case ID | TC-UC1-F3 |
|--------------|-----------|
| **Feature** | Signup Authentication Error |
| **Component** | `src/hooks/useAuth.tsx:370` - `signup()` error handling |
| **Test Description** | Test signup failure with duplicate email |
| **Input** | Existing email in database |
| **Expected Output** | Error message displayed, no navigation |
| **Test Type** | Failure Test |
| **Actual Result** | TBD |

### UC2: Sign In - Failure Tests

| Test Case ID | TC-UC2-F1 |
|--------------|-----------|
| **Feature** | Invalid Credentials |
| **Component** | `src/hooks/useAuth.tsx:233` - `login()` error handling |
| **Test Description** | Test login with incorrect credentials |
| **Input** | `{email: "user@example.com", password: "wrongpassword"}` |
| **Expected Output** | Error: "Invalid login credentials" |
| **Test Type** | Failure Test |
| **Actual Result** | TBD |

### UC3: Set Preferences - Failure Tests

| Test Case ID | TC-UC3-F1 |
|--------------|-----------|
| **Feature** | Preferences Validation Error |
| **Component** | `src/utils/preferencesValidator.ts:15` - `validatePreferences()` |
| **Test Description** | Test invalid preference values |
| **Input** | `{min_pay_rate: -5, max_hours_per_week: 50}` |
| **Expected Output** | Errors: ["Minimum pay rate cannot be negative", "Maximum hours per week cannot exceed 44"] |
| **Test Type** | Failure Test |
| **Actual Result** | TBD |

### UC5: Cancel Shift - Failure Tests

| Test Case ID | TC-UC5-F1 |
|--------------|-----------|
| **Feature** | Invalid Assignment Status Update |
| **Component** | `src/hooks/useAssignments.tsx:98` - `updateAssignmentStatus()` error handling |
| **Test Description** | Test cancelling already cancelled assignment |
| **Input** | Assignment with status already "CancelByJobseeker" |
| **Expected Output** | Error message about invalid status transition |
| **Test Type** | Failure Test |
| **Actual Result** | TBD |

---

## Testing Timeline (Week 11-12)

### Week 11: Unit Testing Implementation
- **Days 1-2**: Set up testing infrastructure (Vitest, React Testing Library configuration)
- **Days 3-4**: Implement unit tests for UC1-UC4 (Authentication, Preferences, Availability)
- **Days 5-7**: Implement unit tests for UC5-UC8 (Assignments, Shifts, Feedback)
- **Deliverable**: All 16 unit test suites completed and passing

### Week 12: Integration Testing Implementation
- **Days 1-2**: Set up integration testing environment (test database, mock services)
- **Days 3-4**: Implement integration tests for UC1-UC4 using specified strategies
- **Days 5-7**: Implement integration tests for UC5-UC8 using specified strategies
- **Deliverable**: All 8 integration test suites completed and passing

---

## Testing Tools and Frameworks Summary

| Testing Level | Tool/Framework | Purpose |
|---------------|----------------|---------|
| **Unit Testing** | Vitest + React Testing Library | Component and function testing |
| **Integration Testing** | Vitest + Supabase Test Client | Database and API integration |
| **Mock/Stub Management** | Vitest Mocking | External service mocking |
| **Coverage Analysis** | @vitest/coverage-v8 | Code coverage reporting |
| **DOM Simulation** | jsdom | Browser environment simulation |

---

## Success Criteria

- **Unit Tests**: 100% of core functions tested with >90% code coverage
- **Integration Tests**: All 8 use case flows tested end-to-end
- **Failure Tests**: All critical error scenarios handled gracefully
- **Test Execution**: All tests pass consistently in CI/CD environment
- **Documentation**: Complete test documentation with actual component references
- **Timeline Adherence**: All testing phases completed within 2-week timeline

This testing report ensures comprehensive coverage of all use cases while accurately referencing the actual codebase components, hooks, and utilities found in the OptiStaff frontend application.