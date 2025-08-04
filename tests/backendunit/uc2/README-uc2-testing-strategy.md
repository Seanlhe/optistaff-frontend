# UC2 Sign In - Focused Testing Strategy

## Overview

UC2 (Sign In) shares significant functionality with UC1 (Create Account), so this directory contains only tests for UC2-specific logic that is not covered by UC1 tests.

## Key Insight: Shared Validation Logic

UC2 login forms use the **same components** as UC1 signup forms:
- Same `AuthFormFields` component  
- Same `useFieldValidation` hook
- Same real-time field validation

**Therefore, basic form validation is already covered by UC1 tests.**

## What UC1 Tests Already Cover for UC2

### From `uc1-field-validation.test.ts`:
- ✅ Email format validation (used in login forms)
- ✅ Real-time field formatting and validation  
- ✅ `useFieldValidation` hook functionality
- ✅ Input constraints and formatters

### From `uc1-authentication-validation.test.ts`:
- ✅ Email validation functions (`isValidEmail`)
- ✅ Password validation functions (`isValidPassword`) 
- ✅ Error message generation functions

## UC2-Specific Tests in This Directory

### `uc2-login-logic.test.ts`

Tests **only** the login-specific logic that differs from signup:

#### 1. Role Determination (UC2 Step 7)
- Tests `determineUserRole()` logic from `useAuth.updateUserState()`
- User metadata parsing: `"job-seeker"` → `"jobseeker"`, `"client"` → `"employer"`
- Edge cases: unknown user types, missing metadata

#### 2. Navigation Logic (UC2 Step 9)  
- Tests post-login route determination
- Jobseeker → `/employee/preferences`
- Employer → `/employer/dashboard`

#### 3. Role Caching (UC2 Step 10)
- Tests localStorage caching key generation
- Cache validation logic
- Performance optimization for repeat logins

#### 4. Login Error Classification
- Tests error message parsing and user-friendly error display
- Invalid credentials, unverified email, network errors
- Based on actual Supabase auth error patterns

#### 5. Login State Management
- Tests auth state transitions during login flow
- Loading states, error states, success states
- State cleanup between login attempts

## UC2 Sequence Diagram Coverage

| Sequence Step | Coverage |
|---------------|----------|
| Step 1: Navigate to login | UI functionality (not unit tested) |
| Step 2: Display login form | UI functionality (not unit tested) |
| Step 3: Submit email/password | **Covered by UC1** (same AuthFormFields) |
| Step 4: Form validation | **Covered by UC1** (same validation hooks) |
| Step 5: Call useAuth.login() | Integration test scope |
| Step 6: Supabase authentication | External service (mocked in integration tests) |
| Step 7: Role determination | **✅ UC2 specific test** |
| Step 8: Cache role | **✅ UC2 specific test** |  
| Step 9: Navigate based on role | **✅ UC2 specific test** |
| Step 10: Error handling | **✅ UC2 specific test** |

## Benefits of This Approach

1. **Avoid Duplication**: Don't re-test shared validation logic
2. **Focus on Uniqueness**: Test only UC2-specific business logic
3. **Maintainability**: Changes to shared components only require UC1 test updates
4. **Performance**: Faster test execution with fewer redundant tests
5. **Clarity**: Each test file has a clear, focused purpose

## Running UC2 Tests

```bash
# Run only UC2-specific tests
npm run test:backend:run tests/backendunit/uc2/

# Run UC1 tests (which also cover UC2 shared functionality)  
npm run test:backend:run tests/backendunit/uc1/

# Run both UC1 and UC2 tests together
npm run test:backend:run tests/backendunit/uc1/ tests/backendunit/uc2/
```

## Test Dependencies

**UC2 tests depend on UC1 tests for complete coverage:**
- UC2 tests alone are NOT sufficient
- Must run UC1 + UC2 tests together for full UC2 coverage
- UC1 tests provide the foundation, UC2 tests add the login-specific layer
