# Database Function Testing Analysis - OptiStaff Project

## Overview

This document analyzes the testing approaches used in the OptiStaff database function unit tests, based on the academic testing methodologies from the course materials (Week 8, Week 9, and Week 9.2).

---

## Local Supabase Testing Infrastructure

### **Testing Environment Setup**

The OptiStaff database function tests utilize a **local Supabase instance** for isolated, reliable testing. This approach ensures tests run independently of production data and external dependencies.

#### **Local Supabase Configuration**

**From `src/test-setup.ts`:**

```typescript
// Local Supabase configuration
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);
export const testSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

#### **Key Components:**

- **Local URL**: `http://127.0.0.1:54321` (standard Supabase local development port)
- **Anonymous Key**: For standard database operations and RLS-protected queries
- **Service Key**: For admin operations (user management, bypassing RLS)
- **Dual Clients**: Separate clients for regular operations vs admin operations

### **Testing Database Lifecycle Management**

#### **1. Pre-Test Verification**

```typescript
beforeAll(async () => {
  // Verify local Supabase is running
  const { data, error } = await testSupabase
    .from("job_categories")
    .select("count")
    .limit(1);
  if (error) {
    throw new Error(
      "Local Supabase is not running. Run `supabase start` first.",
    );
  }
});
```

#### **2. Test Data Cleanup Strategy**

```typescript
export const cleanupTestData = async () => {
  // Clean up in reverse dependency order to avoid foreign key violations
  await testSupabase
    .from("feedback")
    .delete()
    .neq("feedback_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("assignments")
    .delete()
    .neq("assignment_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("shifts")
    .delete()
    .neq("shift_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("availability")
    .delete()
    .neq("availability_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("preferences")
    .delete()
    .neq("preference_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("job_types")
    .delete()
    .neq("job_type_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("job_categories")
    .delete()
    .neq("category_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("job_seekers")
    .delete()
    .neq("user_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("clients")
    .delete()
    .neq("client_id", "00000000-0000-0000-0000-000000000000");

  // Clean up auth users using admin client
  const { data: users } = await testSupabaseAdmin.auth.admin.listUsers();
  if (users?.users) {
    for (const user of users.users) {
      if (user.email?.includes("test")) {
        await testSupabaseAdmin.auth.admin.deleteUser(user.id);
      }
    }
  }
};
```

**Cleanup Strategy Features:**

- **Dependency Order**: Deletes in reverse dependency order to avoid foreign key constraint violations
- **Selective Deletion**: Uses `neq("id", "00000000-0000-0000-0000-000000000000")` to avoid deleting system records
- **Auth Cleanup**: Removes test users from Supabase Auth using admin client
- **Error Tolerance**: Gracefully handles cleanup errors to prevent test failures

#### **3. Test Data Factories**

**Job Seeker Creation:**

```typescript
export const createTestJobSeeker = async (overrides = {}) => {
  // First create an auth user
  const testEmail = `test-${crypto.randomUUID()}@example.com`;
  const { data: authData, error: authError } =
    await testSupabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: "testpassword123",
      email_confirm: true,
    });

  // Then create job seeker record
  const { data, error } = await testSupabase
    .from("job_seekers")
    .insert({ user_id: authData.user.id, ...defaultData, ...overrides })
    .select()
    .single();
};
```

**Test Job Types Setup:**

```typescript
export const ensureTestJobTypes = async () => {
  // Ensure required job types exist: 'Waiter/Waitress', 'Kitchen Helper', 'Cashier', 'Cleaner'
  const requiredTypes = [
    "Waiter/Waitress",
    "Kitchen Helper",
    "Cashier",
    "Cleaner",
  ];
  // Creates missing job types with proper category relationships
};
```

### **Database Function Testing Integration**

#### **RPC Function Testing**

```typescript
// Example from create-default-preferences.test.ts
const { data, error } = await testSupabase.rpc("create_default_preferences", {
  p_user_id: jobSeeker.user_id,
});
```

**Benefits of Local Testing:**

- **Isolation**: Tests don't affect production data
- **Speed**: Local database operations are faster than remote calls
- **Reliability**: No network dependencies or rate limiting
- **Consistency**: Same database state for every test run
- **Safety**: Can test destructive operations without risk

#### **Test Lifecycle Pattern**

```typescript
describe("Database Function Unit Tests", () => {
  beforeEach(async () => {
    await cleanupTestData(); // Clean slate for each test
    await ensureTestJobTypes(); // Ensure required reference data
  });

  test("function behavior", async () => {
    // Test uses clean database with required reference data
    const result = await testSupabase.rpc("database_function", params);
    // Assertions...
  });

  // Cleanup happens automatically after each test
});
```

### **Local Supabase Development Workflow**

#### **Prerequisites**

1. **Supabase CLI**: `npm install -g @supabase/cli`
2. **Docker**: Required for local Supabase services
3. **Local Instance**: `supabase start` (starts local services on port 54321)

#### **Testing Commands**

```bash
# Start local Supabase (required before running tests)
supabase start

# Run database function tests
npm run test tests/unit/

# Stop local Supabase
supabase stop
```

#### **Local Services**

When `supabase start` runs, it provides:

- **PostgreSQL Database**: Local database with full schema
- **Auth Service**: User authentication and management
- **API Gateway**: REST and GraphQL APIs
- **Storage Service**: File storage (if used)
- **Edge Functions**: Serverless functions (if used)

### **Advantages of Local Supabase Testing**

#### **1. Development Benefits**

- **Fast Feedback**: Immediate test results without network latency
- **Offline Development**: Tests work without internet connection
- **Cost Effective**: No API usage costs for testing
- **Parallel Testing**: Multiple developers can run tests simultaneously

#### **2. Testing Benefits**

- **Deterministic**: Same starting state for every test
- **Comprehensive**: Can test all database functions and triggers
- **Safe**: Destructive tests don't affect production
- **Realistic**: Uses actual Supabase services, not mocks

#### **3. CI/CD Integration**

- **Automated Testing**: Can be integrated into CI/CD pipelines
- **Consistent Environment**: Same local setup across all environments
- **Schema Validation**: Tests run against actual database schema
- **Migration Testing**: Can test database migrations safely

### **Best Practices Implemented**

#### **1. Test Isolation**

- Each test starts with a clean database state
- No test dependencies or shared state between tests
- Proper cleanup prevents test pollution

#### **2. Realistic Test Data**

- Uses actual Supabase Auth for user creation
- Maintains proper foreign key relationships
- Tests with realistic data structures

#### **3. Error Handling**

- Graceful handling of cleanup failures
- Proper error propagation for debugging
- Verification that local Supabase is running

#### **4. Performance Optimization**

- Efficient cleanup using batch operations
- Selective deletion to preserve system data
- Reusable test data factories

This local Supabase testing infrastructure provides a robust, isolated, and efficient environment for testing database functions while maintaining the same behavior as the production Supabase environment.

---

## Testing Methodologies Reference

Based on the testing notes, the following systematic testing techniques are used:

### **1. Boundary Value Testing (BVT)**

- **Purpose**: Target errors at the edges of input domains
- **Approach**: Test minimum, minimum+, nominal, maximum-, and maximum values
- **Rationale**: Errors tend to occur near extreme values of inputs

### **2. Equivalence Class Testing (ECT)**

- **Purpose**: Partition input domain into equivalence classes to reduce redundancy
- **Approach**: Test one representative value from each equivalence class
- **Rationale**: All data points within a class are processed the same way

### **3. Decision Table Testing**

- **Purpose**: Handle complex logical dependencies and business rules
- **Approach**: Create tables mapping condition combinations to actions
- **Rationale**: Systematic coverage of all logical business rules

---

## Test File Analysis

### **1. `get-user-location.test.ts`**

#### **Primary Testing Approach: Equivalence Class Testing (ECT)**

**Evidence from Code:**

```typescript
describe('Valid Input Equivalence Classes', () => {
  test('retrieves location data for user with complete location info', async () => {
  test('retrieves location data for user with partial location info (postal code only)', async () => {
  test('retrieves location data for user with address but no coordinates', async () => {
  test('retrieves location data with all fields null', async () => {

describe('Invalid Input Equivalence Classes', () => {
  test('returns empty result for non-existent user', async () => {
  test('handles null user_id gracefully', async () => {
  test('handles invalid UUID format', async () => {
```

**Analysis:**

- **Valid Equivalence Classes**:
  - Complete location data (address + postal_code + coordinates)
  - Partial location data (postal_code only)
  - Address without coordinates
  - No location data (all null)
- **Invalid Equivalence Classes**:
  - Non-existent user_id
  - Null user_id
  - Invalid UUID format

**Additional Testing Techniques:**

- **Edge Case Testing**: Coordinate parsing with negative values, missing commas
- **Performance Testing**: Concurrent requests for same user
- **Address Formatting Testing**: Various address format combinations

**Academic Justification:**
This follows ECT principles by partitioning the input domain (user location data) into distinct classes based on data completeness and validity, testing one representative from each class.

---

### **2. `validate-job-names.test.ts`**

#### **Primary Testing Approach: Boundary Value Testing (BVT)**

**Evidence from Code:**

```typescript
describe('Core Boundary Values', () => {
  test('validates empty array (minimum boundary)', async () => {
  test('validates single job name (minimum+ boundary)', async () => {
  test('validates multiple job names (nominal boundary)', async () => {
  test('validates large array (maximum- boundary)', async () => {
```

**Analysis:**

- **Minimum Boundary**: Empty array `[]`
- **Minimum+ Boundary**: Single job name `['Waiter/Waitress']`
- **Nominal Boundary**: Multiple job names `['Waiter/Waitress', 'Kitchen Helper', 'Cashier']`
- **Maximum- Boundary**: Large array (10 job names)
- **Boundary Case**: Mix of valid and invalid job names

**Additional Testing Techniques:**

- **Business Logic Validation**: Active vs inactive job names, case sensitivity
- **Edge Cases**: Null input, empty strings, duplicates, concurrent requests

**Academic Justification:**
This follows BVT principles by focusing on boundary conditions of the input array size, testing minimum, nominal, and maximum values where errors are most likely to occur.

---

### **3. `create-default-preferences.test.ts`**

#### **Primary Testing Approach: Equivalence Class Testing (ECT)**

**Evidence from Code:**

```typescript
describe("Valid Input Equivalence Classes", () => {
  test("creates default preferences for new user (valid UUID)", async () => {
  test("handles duplicate creation gracefully (idempotent operation)", async () => {
  test("creates preferences with correct default values structure", async () => {

describe("Invalid Input Equivalence Classes", () => {
  test("handles null user_id gracefully", async () => {
  test("handles invalid UUID format", async () => {
  test("handles non-existent user_id", async () => {
  test("handles empty string user_id", async () => {
```

**Analysis:**

- **Valid Equivalence Classes**:
  - New user (valid UUID)
  - Existing user (idempotent operation)
  - Valid structure verification
- **Invalid Equivalence Classes**:
  - Null user_id
  - Invalid UUID format
  - Non-existent user_id
  - Empty string user_id

**Additional Testing Techniques:**

- **Edge Cases**: Concurrent creation attempts, direct query verification
- **Business Rule Validation**: Default values compliance with constraints
- **Database Constraint Testing**: Foreign key violations

**Academic Justification:**
This follows ECT principles by partitioning user_id inputs into valid and invalid classes, with comprehensive coverage of each equivalence class to ensure robust error handling.

---

### **4. `upsert-user-preferences.test.ts`**

#### **Primary Testing Approach: Simplified Functional Testing**

**Evidence from Code:**

```typescript
describe('Basic Function Tests', () => {
  test('creates new preferences successfully', async () => {
  test('updates existing preferences', async () => {
  test('validates empty desired_roles', async () => {
  test('validates non-existent job names', async () => {

describe('Edge Cases', () => {
  test('handles invalid UUID format', async () => {
  test('handles concurrent upsert operations', async () => {
```

**Analysis:**

- **Basic Functional Tests**:
  - Create operation (new preferences)
  - Update operation (existing preferences)
  - Validation scenarios (empty roles, invalid job names)
- **Edge Case Testing**:
  - Invalid UUID format handling
  - Concurrent operation handling

**Testing Characteristics:**

- **Simplified Approach**: Focuses on core functionality rather than systematic boundary/equivalence testing
- **Business Logic Validation**: Tests validation errors for empty roles and invalid job names
- **CRUD Operations**: Tests both create and update aspects of upsert functionality
- **Concurrency Testing**: Validates behavior under concurrent access

**Academic Classification:**
While labeled as "simplified functional testing," this actually demonstrates:

- **Functional Testing**: Black-box testing based on function specifications
- **Error Handling Testing**: Validation of error conditions and edge cases
- **Concurrency Testing**: Real-world scenario testing for database operations

**Academic Justification:**
This follows a pragmatic functional testing approach, focusing on the core business requirements of the upsert operation while ensuring robust error handling and concurrent access scenarios are covered.

---

## Testing Pattern Summary

### **Common Testing Patterns Across All Files**

#### **1. Test Structure Pattern**

```typescript
describe("Function Name - Database Function Unit Tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await ensureTestJobTypes();
  });

  describe("Primary Testing Approach", () => {
    // Main test cases
  });

  describe("Edge Cases and Additional Scenarios", () => {
    // Edge cases, performance, concurrent access
  });
});
```

#### **2. Academic Testing Methodology Application**

| File                                 | Primary Approach       | Secondary Approaches           | Justification                                      |
| ------------------------------------ | ---------------------- | ------------------------------ | -------------------------------------------------- |
| `get-user-location.test.ts`          | **ECT**                | Edge Cases, Performance        | Location data has distinct completeness states     |
| `validate-job-names.test.ts`         | **BVT**                | Business Logic, Edge Cases     | Array size boundaries are critical for validation  |
| `create-default-preferences.test.ts` | **ECT**                | Edge Cases, Constraint Testing | User ID validity has clear valid/invalid classes   |
| `upsert-user-preferences.test.ts`    | **Functional Testing** | Business Logic, Concurrency    | CRUD operations with validation and error handling |

#### **3. Comprehensive Coverage Strategy**

Each test file demonstrates:

- **Systematic Approach**: Following academic testing principles
- **Comprehensive Coverage**: Valid inputs, invalid inputs, edge cases
- **Real-world Scenarios**: Concurrent access, performance considerations
- **Database Integration**: Proper setup/teardown, constraint testing
- **Error Handling**: Graceful handling of various error conditions

---

## Academic Compliance

### **Week 8 Principles Applied**

- ✅ **Systematic Test Case Design**: Each test has clear identifier, description, inputs, expected outputs
- ✅ **Fault Detection**: Tests designed to uncover defects in database functions
- ✅ **Confidence Building**: Comprehensive coverage builds confidence in function reliability

### **Week 9 Techniques Applied**

- ✅ **Boundary Value Testing**: `validate-job-names.test.ts` focuses on array size boundaries
- ✅ **Equivalence Class Testing**: `get-user-location.test.ts` and `create-default-preferences.test.ts` partition inputs into classes
- ✅ **Specification-based Testing**: All tests are black-box, based on function specifications

### **Testing Best Practices Implemented**

- ✅ **Test Independence**: Each test can run independently with proper setup/teardown
- ✅ **Comprehensive Coverage**: Valid inputs, invalid inputs, edge cases, performance
- ✅ **Clear Documentation**: Each test file includes purpose, approach, and author information
- ✅ **Realistic Scenarios**: Tests include concurrent access and real-world usage patterns

---

## Conclusion

The OptiStaff database function tests demonstrate excellent application of academic testing methodologies:

1. **`get-user-location.test.ts`**: Exemplary use of **Equivalence Class Testing** for location data validation
2. **`validate-job-names.test.ts`**: Proper application of **Boundary Value Testing** for array input validation
3. **`create-default-preferences.test.ts`**: Comprehensive **Equivalence Class Testing** for user ID validation
4. **`upsert-user-preferences.test.ts`**: Practical **Functional Testing** approach with business logic validation and concurrency testing

Each test file follows systematic testing principles while addressing real-world scenarios, providing both academic rigor and practical value for the OptiStaff application. The combination of different testing approaches (ECT, BVT, and Functional Testing) demonstrates a comprehensive understanding of when to apply specific testing methodologies based on the function's characteristics and requirements.

---

**Generated:** Based on analysis of testing notes (Week 8, Week 9, Week 9.2) and database function test implementations  
**Author:** OptiStaff Testing Team  
**Academic Framework:** SUTD 50.003 Software Testing Methodologies
