# True Backend Unit Tests

## Overview

This directory contains **true backend unit tests** that test database functions, triggers, and constraints by running against a local Supabase instance.

## Key Difference from Frontend Tests

### ❌ Frontend/Utility Tests (incorrectly labeled as "backend"):
```typescript
// These test JavaScript functions, not database logic
import { validateSignupForm } from "../../../src/utils/authentication";
test("should validate email format", () => {
  expect(validateSignupForm({...})).toEqual([]);
});
```

### ✅ True Backend Unit Tests:
```typescript
// These test actual database functions and triggers
import { testSupabase, testSupabaseAdmin } from "../../src/test-setup";
test("should create job_seekers record via database trigger", async () => {
  const { data } = await testSupabaseAdmin.auth.admin.createUser({...});
  // Verify database trigger created the profile
  const jobSeeker = await testSupabase.from("job_seekers").select("*")...
});
```

## Prerequisites

### 1. Local Supabase Instance Required
Backend tests **must** run against a local Supabase instance because they:
- Test database functions and triggers
- Verify data constraints and relationships
- Test Row Level Security (RLS) policies
- Need real PostgreSQL database behavior

### 2. Start Supabase Before Running Tests
```bash
# Start local Supabase (required for backend tests)
supabase start

# Run backend tests (automatically starts Supabase)
npm run test:backend:run
```

## What These Tests Cover

### 1. Database Triggers (`handle-new-user.test.ts`)
Tests the `handle_new_user()` PostgreSQL function that:
- Creates `job_seekers` records when `user_type = "job-seeker"`
- Creates `clients` records when `user_type = "client"`
- Creates default `preferences` for job seekers
- Handles missing/invalid metadata gracefully

### 2. Database Functions
Tests PostgreSQL functions like:
- `create_default_preferences()`
- `upsert_user_preferences()`
- `get_user_preferences_with_location()`
- Custom business logic functions

### 3. Database Constraints
Tests PostgreSQL constraints:
- Foreign key relationships (`job_seekers.user_id → auth.users.id`)
- Check constraints (status values, postal code format)
- Unique constraints
- Not null constraints

### 4. Cascade Behavior
Tests database cascade operations:
- Deleting `auth.users` cascades to `job_seekers`/`clients`
- Related data cleanup behavior

## Test Configuration

### Backend Test Config (`vitest.backend.config.ts`)
- **Requires Supabase setup**: `setupFiles: ["./src/test-setup.ts"]`
- **Sequential execution**: `singleFork: true` to avoid database conflicts
- **Longer timeouts**: `testTimeout: 10000` for database operations

### Test Setup (`src/test-setup.ts`)
- **Local Supabase connection**: `http://127.0.0.1:54321`
- **Admin client**: For creating auth.users records
- **Cleanup utilities**: Clean test data between tests

## Running Backend Tests

```bash
# Run all backend tests (starts Supabase automatically)
npm run test:backend:run

# Run specific backend test file
npm run test:backend:run tests/backend/handle-new-user.test.ts

# Run with UI for debugging
npm run test:backend:ui

# Run specific database functions only
npm run test:db-functions
```

## Test Structure

### Arrange-Act-Assert Pattern
```typescript
test("should create job_seekers record when user_type is 'job-seeker'", async () => {
  // Arrange - Set up test data
  const userData = { user_type: "job-seeker", first_name: "John" };
  
  // Act - Trigger database operation
  const { data } = await testSupabaseAdmin.auth.admin.createUser({
    email: "test@example.com",
    user_metadata: userData
  });
  
  // Assert - Verify database state
  const jobSeeker = await testSupabase
    .from("job_seekers")
    .select("*")
    .eq("user_id", data.user.id)
    .single();
    
  expect(jobSeeker.data.first_name).toBe("John");
});
```

## Database Test Categories

### 1. Happy Path Tests
- Valid user creation scenarios
- Proper data insertion and relationships
- Expected trigger behavior

### 2. Edge Case Tests
- Missing metadata handling
- Invalid data format handling
- Unknown user types

### 3. Error Handling Tests
- Constraint violation behavior
- Foreign key enforcement
- Data validation failures

### 4. Security Tests
- Row Level Security (RLS) policy enforcement
- Cross-user data access prevention
- Permission-based operations

## Integration vs Unit Tests

### Backend Unit Tests (This Directory)
- Test individual database functions in isolation
- Test specific triggers and constraints
- Mock external dependencies where possible

### Integration Tests (`tests/integration/`)
- Test complete user flows (signup → auth → profile creation)
- Test multiple system components together
- Test external service integrations

## Benefits of True Backend Testing

1. **Real Database Behavior**: Tests actual PostgreSQL functions and triggers
2. **Constraint Validation**: Verifies database constraints work as expected
3. **Data Integrity**: Ensures foreign keys, cascades, and relationships work
4. **Security Testing**: Validates RLS policies and access controls
5. **Performance Insights**: Can identify slow queries and optimization needs

## Common Pitfalls to Avoid

1. **Don't test frontend logic here** - That belongs in `tests/unit/frontend/`
2. **Don't test external APIs** - Mock them or test in integration tests
3. **Clean up test data** - Use `beforeEach(cleanupTestData)` to avoid conflicts
4. **Use transactions when possible** - To isolate test data changes
