# usePayouts Integration Testing Guide

## Table of Contents
- [Integration Testing Overview](#integration-testing-overview)
- [Prerequisites & Setup](#prerequisites--setup)
- [Test Architecture Analysis](#test-architecture-analysis)
- [Key Concepts for Students](#key-concepts-for-students)
- [Test File Breakdown](#test-file-breakdown)
- [Implementation Patterns](#implementation-patterns)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
- [Critical Code Snippets](#critical-code-snippets)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Integration Testing Overview

### What is Integration Testing?
Integration testing verifies that different components of your application work correctly together. Unlike unit tests that isolate individual functions, integration tests validate the complete data flow from database to user interface.

### Why Integration Testing Matters
- **Real-world Validation**: Tests actual user scenarios with real dependencies
- **Database Interactions**: Validates SQL queries, stored procedures, and data relationships
- **End-to-End Confidence**: Ensures components work together as intended
- **Regression Prevention**: Catches issues that unit tests might miss

### Academic Context
In software engineering, integration testing sits between unit testing and end-to-end testing in the testing pyramid:
- **Unit Tests**: Fast, isolated, numerous
- **Integration Tests**: Medium speed, real dependencies, moderate quantity
- **E2E Tests**: Slow, full system, few but critical

---

## Prerequisites & Setup

### Required Software
1. **Node.js** (v18+)
2. **Supabase CLI** 
3. **Docker** (for local Supabase)

### Installation Commands
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
supabase start

# Install project dependencies
npm install
```

### Environment Configuration
Your local Supabase runs on:
- **URL**: `http://127.0.0.1:54321`
- **Anon Key**: Pre-configured in test-setup.ts
- **Service Key**: Admin operations (user creation/deletion)

---

## Test Architecture Analysis

### File Structure
```
tests/
├── integration/
│   └── usePayouts-hooks.test.ts    # Main integration test
├── unit/                           # Database function tests
src/
├── test-setup.ts                   # Test utilities & database config
├── hooks/
│   └── usePayouts.tsx             # Hook being tested
└── integrations/
    └── supabase/client.ts         # Production Supabase client
```

### Test Configuration (vitest.backend.config.ts)
```javascript
export default defineConfig({
  test: {
    setupFiles: ["./src/test-setup.ts"],  // Database setup
    testTimeout: 10000,                   // Long timeout for DB ops
    pool: "forks",                        // Separate processes
    poolOptions: {
      forks: { singleFork: true }         // Sequential execution
    },
    maxConcurrency: 1                     # Prevent race conditions
  }
});
```

### Why This Configuration?
- **Sequential Execution**: Database tests can interfere with each other
- **Long Timeouts**: Database operations take longer than pure unit tests
- **Single Fork**: Ensures test isolation and data consistency

---

## Key Concepts for Students

### 1. Test Data Factories
**Concept**: Reusable functions that create test data consistently.

**Purpose**: 
- Eliminate code duplication
- Ensure data relationships are correct
- Make tests more maintainable

**Example from codebase**:
```javascript
export const createTestJobSeeker = async (overrides = {}) => {
  // Creates auth user first
  const { data: authData } = await testSupabaseAdmin.auth.admin.createUser({
    email: `test-${crypto.randomUUID()}@example.com`,
    password: "testpassword123",
    email_confirm: true,
  });

  // Then creates job seeker record
  const { data } = await testSupabase
    .from("job_seekers")
    .insert({
      user_id: authData.user.id,
      first_name: "Test",
      last_name: "JobSeeker",
      ...overrides
    })
    .select()
    .single();

  return data;
};
```

### 2. Database Cleanup Strategy
**Concept**: Remove test data to ensure test isolation.

**Why Important**: 
- Tests should not depend on data from previous tests
- Prevents false positives/negatives
- Maintains predictable test environment

**Implementation**:
```javascript
export const cleanupTestData = async () => {
  // Clean in reverse dependency order (foreign keys)
  await testSupabase.from("payouts").delete().neq("payout_id", "never-exists");
  await testSupabase.from("assignments").delete().neq("assignment_id", "never-exists");
  await testSupabase.from("shifts").delete().neq("shift_id", "never-exists");
  // ... more cleanup
};
```

### 3. Hybrid Testing Approach
**Concept**: Mix real and mocked dependencies strategically.

**In usePayouts test**:
- **Mocked**: `useAuth` hook (predictable user state)
- **Real**: Database operations, React hook logic, RPC functions

**Why Hybrid?**
- Auth mocking ensures consistent user context
- Real database validates actual data operations
- Balances control with realism

### 4. React Hook Testing
**Concept**: Test custom hooks with real component lifecycle.

**Tools Used**:
- `renderHook()`: Simulates React component mounting
- `waitFor()`: Handles async state updates
- `act()`: Wraps state-changing operations

---

## Test File Breakdown

### Test Structure (usePayouts-hooks.test.ts)

#### 1. Imports and Setup (Lines 8-25)
```javascript
import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePayouts } from "../../src/hooks/usePayouts";
import { useAuth } from "../../src/hooks/useAuth";
import {
  testSupabase,
  testSupabaseAdmin,
  cleanupTestData,
  createTestJobSeeker,
  // ... other factories
} from "../../src/test-setup";

// Mock only useAuth, keep everything else real
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));
```

#### 2. Test Data Setup (Lines 35-121)
```javascript
beforeEach(async () => {
  await cleanupTestData();
  
  // Create complete data ecosystem
  testJobSeeker = await createTestJobSeeker();
  testUserId = testJobSeeker.user_id;
  
  // Mock auth to return our test user
  vi.mocked(useAuth).mockReturnValue({
    user: { id: testUserId, email: `test-${testUserId}@example.com` },
    loading: false,
    error: null,
  });
  
  // Create supporting data (client, job types, shifts, assignments)
  // ... detailed setup code
});
```

#### 3. Database RPC Tests (Lines 123-232)
Tests the Postgres function directly:
```javascript
test("get_user_total_earnings calculates correct total", async () => {
  // Arrange - Create real payout data
  await testSupabase.from("payouts").insert([{
    assignment_id: testAssignment.assignment_id,
    amount: 204.00,
    payment_date: new Date("2025-01-02T00:00:00Z").toISOString(),
    payment_method: "BANK_TRANSFER",
    status: "COMPLETED",
  }]);

  // Act - Call RPC function
  const { data, error } = await testSupabase.rpc("get_user_total_earnings", {
    target_user_id: testUserId,
  });

  // Assert
  expect(error).toBeNull();
  expect(Number(data)).toBe(204.00);
});
```

#### 4. React Hook Integration Tests (Lines 234-388)
Tests the hook with real database:
```javascript
test("hook fetches real earnings from database", async () => {
  // Arrange - Create real payout
  await testSupabase.from("payouts").insert({
    assignment_id: testAssignment.assignment_id,
    amount: 275.25,
    // ... other fields
  });

  // Act - Render hook
  const { result } = renderHook(() => usePayouts());

  // Wait for async loading to complete
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // Assert - Verify hook state
  expect(result.current.totalEarnings).toBe(275.25);
  expect(result.current.error).toBeNull();
});
```

---

## Implementation Patterns

### 1. Data Factory Pattern
**Purpose**: Create consistent, related test data.

**Key Features**:
- **Hierarchical Creation**: Create dependencies first (categories → job types → shifts)
- **Realistic Data**: Use proper data types and relationships
- **Flexible Overrides**: Allow customization through parameters

**Example**: Creating a complete shift with dependencies:
```javascript
// 1. Create job category
const jobCategory = await testSupabase
  .from("job_categories")
  .insert({ category_name: "Test Category" })
  .select().single();

// 2. Create job type (depends on category)
const jobType = await testSupabase
  .from("job_types")
  .insert({
    type_name: "Test Job Type",
    category_id: jobCategory.data.category_id
  })
  .select().single();

// 3. Create shift (depends on client and job type)
const shift = await testSupabase
  .from("shifts")
  .insert({
    client_id: testClient.client_id,
    job_type_id: jobType.data.job_type_id,
    title: "Test Shift",
    pay_rate: 25.50
  })
  .select().single();
```

### 2. Cleanup Strategy Pattern
**Purpose**: Ensure test isolation by removing test data.

**Implementation**:
```javascript
export const cleanupTestData = async () => {
  // Order matters: delete children before parents
  await testSupabase.from("payouts").delete().neq("payout_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase.from("assignments").delete().neq("assignment_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase.from("shifts").delete().neq("shift_id", "00000000-0000-0000-0000-000000000000");
  // ... continue in dependency order
};
```

**Why This Pattern?**
- Avoids foreign key constraint violations
- Ensures complete cleanup
- Uses non-existent UUID to delete all test records

### 3. Hybrid Mocking Pattern
**Purpose**: Control some dependencies while keeping others real.

**Strategy**:
```javascript
// Mock authentication for predictable user state  
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// But use real Supabase for database operations
import { testSupabase } from "../../src/test-setup";
```

**Benefits**:
- **Controlled**: Auth state doesn't vary between tests
- **Realistic**: Database operations use real queries
- **Focused**: Tests the specific hook logic, not auth logic

---

## Step-by-Step Setup Guide

### Step 1: Install Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Step 2: Create Test Configuration
Create `vitest.backend.config.ts`:
```javascript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["tests/integration/**/*.test.{ts,tsx}"],
    testTimeout: 10000,
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true }
    },
    maxConcurrency: 1
  }
});
```

### Step 3: Create Test Setup File
Create `src/test-setup.ts`:
```javascript
import { createClient } from "@supabase/supabase-js";
import { beforeEach, afterEach } from "vitest";

// Local Supabase configuration
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseAnonKey = "your-anon-key";
const supabaseServiceKey = "your-service-key";

export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);
export const testSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cleanup function
export const cleanupTestData = async () => {
  // Clean your tables in dependency order
};

// Test data factories
export const createTestJobSeeker = async (overrides = {}) => {
  // Implementation as shown above
};

// Global test hooks
beforeEach(async () => {
  await cleanupTestData();
});
```

### Step 4: Start Local Supabase
```bash
supabase init
supabase start
```

### Step 5: Create Your Integration Test
Create `tests/integration/your-hook.test.ts`:
```javascript
import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useYourHook } from "../../src/hooks/useYourHook";
import { testSupabase, createTestData } from "../../src/test-setup";

describe("useYourHook Integration Tests", () => {
  beforeEach(async () => {
    // Setup test data
  });

  test("hook fetches real data", async () => {
    // Arrange
    await testSupabase.from("your_table").insert({ /* test data */ });

    // Act
    const { result } = renderHook(() => useYourHook());

    // Wait for async completion
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.data).toBeDefined();
  });
});
```

### Step 6: Run Tests
```bash
npm run test:backend
```

---

## Critical Code Snippets

### 1. Database Connection Setup
```javascript
// src/test-setup.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Local dev key

export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);
export const testSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

### 2. Auth User Creation
```javascript
// Creating test auth user
const { data: authData, error } = await testSupabaseAdmin.auth.admin.createUser({
  email: `test-${crypto.randomUUID()}@example.com`,
  password: "testpassword123",
  email_confirm: true, // Skip email verification
});

if (error) throw error;
return authData.user;
```

### 3. React Hook Testing Pattern
```javascript
test("hook updates when data changes", async () => {
  // Initial render
  const { result } = renderHook(() => usePayouts());

  // Wait for initial load
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // Verify initial state
  expect(result.current.totalEarnings).toBe(0);

  // Add data to database
  await testSupabase.from("payouts").insert({
    assignment_id: testAssignment.assignment_id,
    amount: 100.00,
    payment_method: "BANK_TRANSFER",
    status: "COMPLETED"
  });

  // Trigger refetch
  await act(async () => {
    await result.current.fetchTotalEarnings();
  });

  // Verify updated state
  expect(result.current.totalEarnings).toBe(100.00);
});
```

### 4. Database RPC Testing
```javascript
test("RPC function calculates correctly", async () => {
  // Insert test data
  await testSupabase.from("payouts").insert([
    { assignment_id: "uuid1", amount: 100.00, status: "COMPLETED" },
    { assignment_id: "uuid2", amount: 150.50, status: "COMPLETED" }
  ]);

  // Call RPC function
  const { data, error } = await testSupabase.rpc("get_user_total_earnings", {
    target_user_id: testUserId
  });

  // Verify results
  expect(error).toBeNull();
  expect(Number(data)).toBe(250.50);
});
```

### 5. Error Handling Test
```javascript
test("handles unauthenticated user", async () => {
  // Mock auth to return null user
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    error: null
  });

  const { result } = renderHook(() => usePayouts());

  // Verify error handling
  expect(result.current.error).toBe("User not authenticated");
  expect(result.current.totalEarnings).toBe(0);
});
```

---

## Best Practices

### 1. Test Organization
- **Group Related Tests**: Use `describe` blocks for logical grouping
- **Clear Test Names**: Describe what you're testing and expected outcome
- **Arrange-Act-Assert**: Structure tests clearly

### 2. Data Management
- **Use Factories**: Don't duplicate data creation code
- **Clean Between Tests**: Ensure test isolation
- **Realistic Data**: Use valid data types and relationships

### 3. Async Testing
- **Use waitFor()**: For async state changes
- **Use act()**: When triggering state updates
- **Set Timeouts**: Database operations need more time

### 4. Mocking Strategy
- **Mock Strategically**: Only mock what you need to control
- **Keep Tests Focused**: Don't test external dependencies
- **Use Real Data**: When testing data operations

### 5. Error Testing
- **Test Error Scenarios**: Network failures, invalid data, auth issues
- **Test Edge Cases**: Empty results, non-existent users
- **Verify Error Messages**: Ensure proper user feedback

### 6. Performance Considerations
- **Sequential Execution**: Prevent database race conditions
- **Cleanup Efficiently**: Use bulk operations when possible
- **Monitor Test Speed**: Long-running tests indicate issues

---

## Troubleshooting

### Common Issues

#### 1. "Local Supabase is not running"
**Error**: Connection refused on port 54321
**Solution**: 
```bash
supabase start
# Wait for all services to be ready
supabase status
```

#### 2. "Foreign key constraint violation"
**Error**: Cannot delete record due to dependent records
**Solution**: Check cleanup order in `cleanupTestData()`:
```javascript
// Wrong order - will fail
await testSupabase.from("clients").delete().neq("client_id", "never-exists");
await testSupabase.from("shifts").delete().neq("shift_id", "never-exists");

// Correct order - children first
await testSupabase.from("shifts").delete().neq("shift_id", "never-exists");
await testSupabase.from("clients").delete().neq("client_id", "never-exists");
```

#### 3. "Test timeout exceeded"
**Error**: Tests take too long to complete
**Solutions**:
- Increase timeout in vitest config: `testTimeout: 15000`
- Check for infinite loops in async operations
- Verify database queries are efficient

#### 4. "Hook not updating"
**Error**: React hook state doesn't change after database update
**Solution**: Use `act()` for state updates:
```javascript
// Wrong - state change not wrapped
await result.current.fetchTotalEarnings();

// Correct - wrapped in act()
await act(async () => {
  await result.current.fetchTotalEarnings();
});
```

#### 5. "Mock not working"
**Error**: Mocked function still calls original implementation
**Solution**: Ensure mock is called before hook render:
```javascript
// Set up mock before rendering hook
vi.mocked(useAuth).mockReturnValue({
  user: { id: testUserId },
  loading: false,
  error: null
});

// Then render hook
const { result } = renderHook(() => usePayouts());
```

#### 6. "Race conditions between tests"
**Error**: Tests pass individually but fail when run together
**Solution**: Ensure proper test isolation:
- Use `singleFork: true` in vitest config
- Set `maxConcurrency: 1`
- Verify cleanup functions remove all test data

### Debugging Tips

#### 1. Check Database State
```javascript
// Add to your test to see what's in the database
const { data } = await testSupabase.from("payouts").select("*");
console.log("Current payouts:", data);
```

#### 2. Verify Mock Calls
```javascript
// Check if your mock was called correctly
expect(vi.mocked(useAuth)).toHaveBeenCalled();
expect(vi.mocked(useAuth)).toHaveReturnedWith({
  user: expect.objectContaining({ id: testUserId })
});
```

#### 3. Test Hook State Changes
```javascript
// Log hook state to debug issues
const { result } = renderHook(() => usePayouts());
console.log("Hook state:", result.current);
```

#### 4. Database Connection Testing
```javascript
// Verify database connection
const { data, error } = await testSupabase
  .from("job_categories")
  .select("count")
  .limit(1);

if (error) {
  console.error("Database connection failed:", error);
}
```

### Environment Setup Checklist

- [ ] Supabase CLI installed globally
- [ ] Docker running (for local Supabase)
- [ ] Local Supabase started (`supabase start`)
- [ ] Database migrations applied
- [ ] Test configuration file created
- [ ] Test setup file with cleanup functions
- [ ] Vitest and testing-library dependencies installed

---

## Conclusion

Integration testing with React hooks and Supabase provides confidence that your application works correctly in real-world scenarios. This approach:

- **Validates Real Data Flow**: Tests actual database queries and relationships
- **Catches Integration Issues**: Finds problems unit tests miss
- **Builds Confidence**: Ensures components work together correctly
- **Supports Refactoring**: Provides safety net for code changes

The key is balancing realism (real database) with control (mocked auth) to create maintainable, reliable tests that accurately reflect your application's behavior.

Remember: Integration tests are more valuable than unit tests for catching real bugs, but they're also slower and more complex. Use them strategically for critical user flows and data operations.