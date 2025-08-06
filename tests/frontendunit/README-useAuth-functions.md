# useAuth Hook Functions Unit Tests

## Overview

This test file contains comprehensive unit tests for the three main functions in the `useAuth` hook:
- `login(email, password)`
- `logout()`
- `signup(signupData)`

## Function Analysis

### 1. `login(email: string, password: string)`

**Purpose**: Authenticates a user with email and password credentials.

**Parameters**:
- `email`: User's email address
- `password`: User's password

**Returns**: `void` (no return value)

**State Changes**:
- `authState.loading`: Set to `true` during login process, `false` when complete
- `authState.error`: Cleared at start, set to error message if login fails
- `authState.user`: Updated with user data if login succeeds
- **Navigation**: Redirects to appropriate dashboard (`/employee/preferences` for jobseekers, `/employer/dashboard` for employers)
- **localStorage**: May cache user role for future sessions

**Behavior**:
1. Sets loading state to true and clears any existing errors
2. Calls Supabase's `signInWithPassword()` method
3. If successful, calls `updateUserState()` with navigation enabled
4. If failed, sets error state with the error message

### 2. `logout()`

**Purpose**: Signs out the current user and clears all authentication state.

**Parameters**: None

**Returns**: `void` (no return value)

**State Changes**:
- `authState.loading`: Set to `true` during logout, `false` when complete
- `authState.user`: Set to `null`
- `authState.error`: Cleared on success, set to error message if logout fails
- **localStorage**: Removes cached user role (`user_role_${userId}`)
- **Navigation**: Redirects to home page (`/`) on successful logout

**Behavior**:
1. Sets loading state to true
2. Removes cached user role from localStorage if user exists
3. Calls Supabase's `signOut()` method
4. Clears user state and navigates to home page
5. Handles any logout errors

### 3. `signup(signupData: SignupData)`

**Purpose**: Creates a new user account with the provided registration data.

**Parameters**:
- `signupData`: Object containing user registration information (see `SignupData` type)

**Returns**: `void` (no return value)

**State Changes**:
- `authState.loading`: Set to `true` during signup, `false` when complete
- `authState.error`: Set to validation errors or signup errors
- `authState.user`: Remains `null` (users must confirm email first)
- **sessionStorage**: Stores success message for login page display
- **Navigation**: Redirects to login page (`/auth?mode=login`) on successful signup

**Behavior**:
1. Sets loading state and clears errors
2. Validates form data using `validateSignupForm()`
3. Checks if email already exists in custom tables (`job_seekers`/`clients`)
4. Calls Supabase's `signUp()` method with user metadata
5. Handles various signup scenarios (new user, existing unconfirmed user, etc.)
6. On success, navigates to login page and stores success message

## Test Coverage

### Login Function Tests
- ✅ Sets loading to true when login starts
- ✅ Calls supabase signInWithPassword with correct parameters
- ✅ Sets error state when login fails
- ✅ Clears error state when login starts (after previous error)

### Logout Function Tests
- ✅ Sets loading to true when logout starts
- ✅ Calls supabase signOut
- ✅ Clears user state after successful logout
- ✅ Removes user role from localStorage when user exists
- ✅ Sets error state when logout fails

### Signup Function Tests
- ✅ Sets loading to true when signup starts
- ✅ Validates form data before attempting signup
- ✅ Does not proceed with signup if validation fails
- ✅ Checks for existing email in custom tables
- ✅ Sets error if email already exists in custom tables
- ✅ Calls supabase signUp with correct user metadata
- ✅ Stores success message and navigates to login on successful signup
- ✅ Handles signup errors appropriately
- ✅ Handles existing unconfirmed users

### Return Value Tests
- ✅ Verifies all functions return void/undefined

## Key Testing Features

1. **Mocking**: All external dependencies are properly mocked:
   - Supabase client methods
   - React Router navigation
   - Authentication utilities
   - localStorage and sessionStorage

2. **State Testing**: Tests verify proper state changes in `authState` object

3. **Error Handling**: Tests cover various error scenarios and proper error message handling

4. **Side Effects**: Tests verify navigation calls, storage operations, and other side effects

5. **Validation**: Tests ensure form validation is properly called and respected

## Running Tests

```bash
# Run all useAuth function tests
npm test useAuth-functions.test.ts

# Run with coverage
npm run test:coverage useAuth-functions.test.ts
```

## Dependencies

- **Vitest**: Testing framework
- **@testing-library/react**: React testing utilities
- **vi**: Vitest mocking utilities

## Notes

- Tests use `as any` for mock data to simplify TypeScript compatibility in testing environment
- All async functions are properly awaited using `act()` from React Testing Library
- Tests focus on function behavior rather than implementation details
- Mocks are reset between tests to ensure isolation
