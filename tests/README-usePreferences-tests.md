# usePreferences Database Functions - Test Suite Documentation

## Overview

This test suite provides comprehensive testing for the database functions used in the usePreferences ecosystem, following the testing principles from Week 8 & 9 software testing notes:

- **Boundary Value Testing (BVT)**: Testing edge cases and boundary conditions
- **Equivalence Class Testing (ECT)**: Testing representative values from input domains
- **Decision Table Testing**: Testing complex business logic with multiple conditions

## Test Structure

### 📁 Test Organization

```
tests/
├── unit/
│   └── usepreferences-db-functions.test.ts          # Database function unit tests
├── integration/
│   └── usepreferences-workflow.test.ts              # Integration workflow tests
├── frontendSuccessUnit/
│   └── usePreferences-hooks.test.ts                 # Frontend hook success scenarios
├── frontendFailUnit/
│   └── usePreferences-error-scenarios.test.ts       # Frontend hook error scenarios
└── README-usePreferences-tests.md                   # This documentation
```

## 🎯 Testing Approach by Function

### 1. `create_default_preferences` - Equivalence Class Testing (ECT)

**Valid Input Classes:**

- New user with valid UUID
- Existing user (idempotent operation)

**Invalid Input Classes:**

- Null user_id
- Invalid UUID format
- Non-existent user_id

**Test Coverage:**

- ✅ Creates default preferences with correct values
- ✅ Handles duplicate creation gracefully
- ✅ Error handling for invalid inputs

### 2. `upsert_user_preferences` - Decision Table Testing

**Decision Rules Tested:**

| Rule | Existing Prefs | Valid User | Valid Pay | Valid Travel | Valid Jobs   | Valid Hours/Week | Valid Hours/Shift | Expected Result  |
| ---- | -------------- | ---------- | --------- | ------------ | ------------ | ---------------- | ----------------- | ---------------- |
| R1   | No             | Yes        | Yes (min) | Yes (min)    | Yes (empty)  | Yes (min)        | Yes (min)         | CREATE_SUCCESS   |
| R2   | No             | Yes        | Yes (max) | Yes (max)    | Yes (multi)  | Yes (max)        | Yes (max)         | CREATE_SUCCESS   |
| R3   | Yes            | Yes        | Yes       | Yes          | Yes          | Yes              | Yes               | UPDATE_SUCCESS   |
| R4   | No             | Yes        | Yes       | Yes          | No (empty)   | Yes              | Yes               | VALIDATION_FAIL  |
| R5   | No             | Yes        | Yes       | Yes          | No (invalid) | Yes              | Yes               | VALIDATION_FAIL  |
| R6   | No             | Yes        | Yes       | Yes          | Yes          | No (>44)         | Yes               | CONSTRAINT_ERROR |
| R7   | No             | Yes        | Yes       | Yes          | Yes          | Yes              | No (>12)          | CONSTRAINT_ERROR |

### 3. `validate_job_names` - Boundary Value Testing (BVT)

**Boundary Values Tested:**

- **Array Length**: Empty (0), Single (1), Multiple (3), Large (10+)
- **Job Name Validity**: Valid, Invalid, Mixed, Inactive
- **Edge Cases**: Null input, Duplicates, Malformed data

### 4. `get_user_location` - Equivalence Class Testing (ECT)

**Valid Input Classes:**

- User with complete location data
- User with partial location data (postal code only)
- User with address but no coordinates

**Invalid Input Classes:**

- Non-existent user
- Invalid UUID format
- Null user_id

**Edge Cases:**

- Malformed coordinate strings
- Non-numeric coordinate values
- Missing comma in coordinates

## 🚀 Running the Tests

### Prerequisites

1. **Local Supabase Instance**: Ensure Supabase is running locally

   ```bash
   supabase start
   ```

2. **Database Functions**: Ensure all database functions are deployed
   ```bash
   supabase db push
   ```

### Running Individual Test Suites

```bash
# Unit tests for database functions
npm test tests/unit/usepreferences-db-functions.test.ts

# Integration workflow tests
npm test tests/integration/usepreferences-workflow.test.ts

# Frontend hook success scenarios
npm test tests/frontendSuccessUnit/usePreferences-hooks.test.ts

# Frontend hook error scenarios
npm test tests/frontendFailUnit/usePreferences-error-scenarios.test.ts
```

### Running All usePreferences Tests

```bash
# Run all usePreferences related tests
npm test -- --grep "usePreferences"
```

### Running Tests with Coverage

```bash
# Generate coverage report
npm run test:coverage
```

## 📊 Test Categories

### Unit Tests (`tests/unit/usepreferences-db-functions.test.ts`)

**Purpose**: Test individual database functions in isolation

**Test Types:**

- **Boundary Value Testing**: `validate_job_names` function
- **Equivalence Class Testing**: `create_default_preferences`, `get_user_location`
- **Decision Table Testing**: `upsert_user_preferences`

**Key Features:**

- Direct database function calls
- Comprehensive input validation
- Error scenario coverage
- Performance boundary testing

### Integration Tests (`tests/integration/usepreferences-workflow.test.ts`)

**Purpose**: Test complete workflows as they occur in the application

**Workflows Tested:**

- New user setup: defaults → validation → upsert
- Existing user update: fetch → validate → update
- Location + preferences integration
- Error recovery workflows
- Concurrency scenarios

### Frontend Success Tests (`tests/frontendSuccessUnit/usePreferences-hooks.test.ts`)

**Purpose**: Test React hooks with successful scenarios

**Hooks Tested:**

- `usePreferences`: Core CRUD operations
- `usePreferencesLocation`: Location data management
- `usePreferencesForm`: Form-specific logic with optimistic updates

**Features:**

- Mocked Supabase client
- React hook testing with `@testing-library/react`
- State management validation
- Function integration testing

### Frontend Failure Tests (`tests/frontendFailUnit/usePreferences-error-scenarios.test.ts`)

**Purpose**: Test error handling and edge cases in React hooks

**Error Scenarios:**

- Authentication failures
- Database connection errors
- Network timeouts
- Validation failures
- Malformed responses
- Concurrent operations

## 🔧 Test Utilities and Setup

### Database Test Setup (`src/test-setup.ts`)

**Features:**

- Local Supabase client configuration
- Test data cleanup utilities
- Test data factories
- Global test lifecycle management

**Key Functions:**

```typescript
cleanupTestData(); // Clean database between tests
createTestJobSeeker(); // Create test job seeker
createTestClient(); // Create test client
createTestShift(); // Create test shift
```

### Mock Strategies

**Database Function Mocking:**

```typescript
// Mock successful RPC call
mockSupabase.rpc.mockResolvedValue({
  data: [expectedResult],
  error: null,
});

// Mock validation error
mockSupabase.rpc.mockResolvedValue({
  data: [{ validation_errors: ["Error message"] }],
  error: null,
});
```

**Authentication Mocking:**

```typescript
// Mock authenticated user
mockUseAuth.mockReturnValue({
  user: { id: "test-user-id", email: "test@example.com" },
  loading: false,
  error: null,
});

// Mock unauthenticated state
mockUseAuth.mockReturnValue({
  user: null,
  loading: false,
  error: null,
});
```

## 📈 Test Metrics and Coverage

### Expected Coverage Targets

- **Database Functions**: 95%+ line coverage
- **Hook Logic**: 90%+ branch coverage
- **Error Scenarios**: 100% error path coverage
- **Integration Workflows**: 85%+ end-to-end coverage

### Key Performance Metrics

- **Database Function Response Time**: < 100ms for simple operations
- **Batch Validation**: < 5 seconds for 20+ job names
- **Concurrent Operations**: Handle 2+ simultaneous requests
- **Error Recovery**: < 200ms for fallback operations

## 🐛 Debugging Test Failures

### Common Issues and Solutions

1. **Database Connection Failures**

   ```bash
   # Ensure Supabase is running
   supabase status
   supabase start
   ```

2. **Function Not Found Errors**

   ```bash
   # Deploy database functions
   supabase db push
   ```

3. **Test Data Conflicts**

   ```bash
   # Reset database
   supabase db reset
   ```

4. **Mock Configuration Issues**
   - Check mock return values match expected interface
   - Verify mock is called with correct parameters
   - Ensure mocks are cleared between tests

### Debug Logging

Enable debug logging in tests:

```typescript
// Add to test setup
console.log("Mock called with:", mockSupabase.rpc.mock.calls);
console.log("Current state:", result.current);
```

## 🎯 Best Practices

### Test Writing Guidelines

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Test Names**: Clearly state what is being tested
3. **Test One Thing**: Each test should verify a single behavior
4. **Clean State**: Ensure tests don't depend on each other
5. **Mock External Dependencies**: Isolate units under test

### Maintenance Guidelines

1. **Update Tests with Code Changes**: Keep tests in sync with implementation
2. **Review Test Coverage**: Regularly check coverage reports
3. **Refactor Test Utilities**: Keep test code DRY and maintainable
4. **Document Complex Scenarios**: Add comments for complex test logic

## 📚 References

- **Testing Notes**: `testing_notes/week 8 Software Testing (with GFG).md`
- **Testing Principles**: `testing_notes/week 9.md`
- **Vitest Documentation**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Supabase Testing**: https://supabase.com/docs/guides/getting-started/local-development

---

**Last Updated**: January 2025  
**Test Suite Version**: 1.0  
**Coverage Target**: 90%+  
**Maintainer**: OptiStaff Team
