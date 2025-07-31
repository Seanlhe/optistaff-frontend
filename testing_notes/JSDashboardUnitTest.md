# Understanding Unit Tests vs Integration Tests

*A comprehensive guide using real examples from the OptiStaff frontend codebase*

## Table of Contents
1. [Fundamental Concepts](#fundamental-concepts)
2. [Key Differences](#key-differences)
3. [Project Structure](#project-structure)
4. [Setup and Configuration](#setup-and-configuration)
5. [Unit Test Analysis](#unit-test-analysis)
6. [Integration Test Analysis](#integration-test-analysis)
7. [Dashboard Test Comparison](#dashboard-test-comparison)
8. [Preferences Test Comparison](#preferences-test-comparison)
9. [Testing Strategies](#testing-strategies)
10. [Mock Strategies](#mock-strategies)
11. [Best Practices](#best-practices)

---

## Fundamental Concepts

### Unit Tests
**Definition**: Tests that verify individual components, functions, or modules in isolation from their dependencies.

**Key Characteristics**:
- Test the smallest testable parts of an application
- Dependencies are mocked or stubbed
- Fast execution
- Easy to debug when they fail
- Focus on testing the logic within a single unit

### Integration Tests
**Definition**: Tests that verify the interaction between multiple components, modules, or systems working together.

**Key Characteristics**:
- Test the integration points between components
- Use real implementations where possible
- Slower execution due to real database/API calls
- Test complete workflows and user scenarios
- Focus on testing that components work together correctly

---

## Key Differences

| Aspect | Unit Tests | Integration Tests |
|--------|------------|-------------------|
| **Scope** | Single component/function | Multiple components together |
| **Dependencies** | All mocked | Real or minimal mocking |
| **Speed** | Very fast (milliseconds) | Slower (seconds) |
| **Isolation** | Complete isolation | Real environment |
| **Debugging** | Easy to pinpoint issues | Harder to isolate failures |
| **Maintenance** | Low maintenance | Higher maintenance |
| **Confidence** | High for individual units | High for system behavior |

---

## Project Structure

Your test files are organized into clear categories:

```
tests/
├── frontendSuccessUnit/          # Unit tests with mocked dependencies
│   ├── StatsCard.test.tsx        # Component unit test
│   ├── JSDashboard.test.tsx      # Page component unit test
│   ├── JSPref.test.tsx           # Tab component unit test
│   ├── PreferencesForm.test.tsx  # Form component unit test
│   └── calculate-filled.test.ts  # Pure function unit test
├── frontendFailUnit/             # Unit tests for error scenarios
│   └── usePreferences-error-scenarios.test.ts
├── integration/                  # Integration tests with real dependencies
│   ├── JSDashboard-integration.test.tsx
│   ├── usePreferences.test.tsx
│   └── usePreferences-workflow.test.ts
└── unit/                        # Backend/database unit tests
    ├── preferences-validation.test.ts
    ├── create-default-preferences.test.ts
    └── rating-system.test.ts
```

---

## Setup and Configuration

### Unit Test Setup (`src/test-setup-frontend.ts`)

```javascript
// Frontend test setup - no Supabase required
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Supabase client for frontend tests
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      // ... more mocked methods
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      // ... chainable mock methods
    })),
  })),
}));

// Mock React Router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/" }),
  };
});
```

**Unit Test Characteristics**:
- ✅ No real database connection required
- ✅ All external dependencies are mocked
- ✅ Fast execution
- ✅ Tests run in isolation

### Integration Test Setup (`src/test-setup.ts`)

```javascript
// Test setup for local Supabase testing
import { createClient } from "@supabase/supabase-js";
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";

// Local Supabase configuration
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);

// Test data cleanup utilities
export const cleanupTestData = async () => {
  // Clean up in reverse dependency order
  await testSupabase.from("preferences").delete().neq("preference_id", "00000000-0000-0000-0000-000000000000");
  // ... more cleanup
};

// Test data factories
export const createTestJobSeeker = async (overrides = {}) => {
  const testEmail = `test-${crypto.randomUUID()}@example.com`;
  // ... create real user in database
};
```

**Integration Test Characteristics**:
- ⚠️ Requires local Supabase to be running (`supabase start`)
- ✅ Uses real database connections
- ✅ Tests actual data flows
- ✅ Higher confidence in system behavior

---

## Unit Test Analysis

### 1. Component Unit Test - `StatsCard.test.tsx`

```javascript
describe("StatsCard - Essential Tests", () => {
  it("renders title and value correctly", () => {
    render(<StatsCard title="Rating" value="4.5" />);
    
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders with icon when provided", () => {
    render(<StatsCard title="Rating" value="4.5" icon={<Star data-testid="star-icon" />} />);
    
    expect(screen.getByTestId("star-icon")).toBeInTheDocument();
  });
});
```

**What makes this a unit test**:
- ✅ Tests a single component in isolation
- ✅ No external dependencies
- ✅ Focuses on component's own logic and rendering
- ✅ Fast execution

### 2. Page Component Unit Test - `JSDashboard.test.tsx`

```javascript
// Mock all dependencies
vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: vi.fn(),
}));
vi.mock("../../src/hooks/useUserProfile", () => ({
  useUserProfile: vi.fn(),
}));
vi.mock("../../src/components/StatsCard", () => ({
  default: vi.fn(({ title, value }) => (
    <div data-testid="stats-card">{title}: {value}</div>
  )),
}));

describe("JSDashboard - Essential Tests", () => {
  beforeEach(() => {
    // Setup mock return values
    mockUseAssignments.mockReturnValue({
      assignments: mockAssignments,
      loading: false,
      error: null,
    });
  });

  it("filters assignments to current week only", () => {
    render(<Dashboard />);
    
    const assignmentCards = screen.getAllByTestId("assignment-card");
    expect(assignmentCards).toHaveLength(1); // Only current week assignments
  });
});
```

**What makes this a unit test**:
- ✅ All hooks and components are mocked
- ✅ Tests the Dashboard component's logic in isolation
- ✅ Focuses on filtering logic and UI rendering
- ✅ No real API calls or database interactions

### 3. Pure Function Unit Test - `preferences-validation.test.ts`

```javascript
describe("Preferences Validation - Unit Tests", () => {
  describe("Boundary Value Testing for numeric fields", () => {
    test("validates minimum pay rate boundary (positive)", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: 5, // Minimum reasonable rate
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects negative pay rate", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: -5,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Minimum pay rate cannot be negative");
    });
  });
});
```

**What makes this a unit test**:
- ✅ Tests pure function with no side effects
- ✅ No external dependencies
- ✅ Focuses on validation logic
- ✅ Uses Equivalence Class Testing approach

### 4. Error Scenario Unit Test - `usePreferences-error-scenarios.test.ts`

```javascript
describe("usePreferences Hooks - Error Scenarios", () => {
  beforeEach(() => {
    // Mock all dependencies
    mockUseAuth.mockReturnValue({
      user: { id: "test-user-id" },
      loading: false,
      error: null,
    });
  });

  test("usePreferences handles null user gracefully", async () => {
    mockUseAuth.mockReturnValue({
      user: null, // Test error condition
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => usePreferences());

    expect(result.current.preferences).toBeNull();
    expect(result.current.error).toBe("User not authenticated");
  });

  test("fetchPreferences handles database connection error", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(new Error("Database connection failed")),
        }),
      }),
    });

    const { result } = renderHook(() => usePreferences());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Database connection failed");
  });
});
```

**What makes this a unit test**:
- ✅ All dependencies mocked
- ✅ Tests error handling in isolation
- ✅ Simulates various failure scenarios
- ✅ Focuses on hook's error handling logic

---

## Integration Test Analysis

### 1. Page Integration Test - `JSDashboard-integration.test.tsx`

```javascript
// Integration test - using real components with minimal mocking
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(), // Mock only the database calls
  },
}));

// Mock only complex components, not business logic
vi.mock("../../src/components/MonthlyCalendar", () => ({
  default: vi.fn(() => <div data-testid="monthly-calendar">Calendar Component</div>),
}));

describe("JSDashboard Integration Tests", () => {
  describe("Complete Dashboard Workflow", () => {
    it("loads and displays complete dashboard with real data flow", async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByText("Loading assignments...")).not.toBeInTheDocument();
      });

      // Verify complete user workflow
      expect(screen.getByText("Welcome Back,")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Restaurant Server")).toBeInTheDocument();
      
      // Verify RPC calls were made with correct parameters
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_assignments_by_jobseeker", {
        p_user_id: mockUser.id,
      });
    });

    it("handles assignment status updates with complete data refresh", async () => {
      render(<Dashboard />);
      
      // Test complete user interaction workflow
      const viewDetailsButtons = screen.getAllByText("View Details");
      fireEvent.click(viewDetailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Assignment Details")).toBeInTheDocument();
      });

      const completeButton = screen.getByText("Mark as Completed");
      fireEvent.click(completeButton);

      // Verify data refresh happens
      await waitFor(() => {
        expect(payoutRefreshCount).toBe(2);
      });
    });
  });
});
```

**What makes this an integration test**:
- ✅ Tests complete user workflows
- ✅ Uses real components and hooks together
- ✅ Minimal mocking (only external services)
- ✅ Tests actual data flow through the system
- ✅ Verifies component interactions

### 2. Hook Integration Test - `usePreferences.test.tsx`

```javascript
// Uses real database connection
import { testSupabase, createTestJobSeeker, cleanupTestData } from "../../src/test-setup";

describe("usePreferences Hook - Integration Tests", () => {
  beforeEach(async () => {
    await cleanupTestData(); // Real database cleanup
    await createTestJobSeeker({ user_id: mockUser.id }); // Real user creation
  });

  test("fetches existing preferences successfully", async () => {
    // Create real preferences in database
    await testSupabase.from("preferences").insert({
      user_id: mockUser.id,
      min_pay_rate: 20,
      max_travel_km: 15,
      desired_roles: ["Server", "Bartender"],
    });

    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify real data was fetched
    expect(result.current.preferences?.min_pay_rate).toBe(20);
    expect(result.current.preferences?.desired_roles).toEqual(["Server", "Bartender"]);
  });

  test("saves preferences with minimum valid values", async () => {
    const { result } = renderHook(() => usePreferences());

    const minValidPreferences = {
      payRate: 15,
      maxTravelKm: 1,
      selectedJobNames: [],
      maxHoursPerWeek: 1,
      maxHoursPerShift: 1,
      considerLowerRate: false,
    };

    await act(async () => {
      saveResult = await result.current.savePreferences(minValidPreferences);
    });

    // Verify real database update
    expect(saveResult).toBe(true);
    expect(result.current.preferences?.min_pay_rate).toBe(15);
  });
});
```

**What makes this an integration test**:
- ✅ Uses real database connections
- ✅ Tests actual data persistence
- ✅ Verifies complete hook workflow
- ✅ Tests real validation and error handling
- ✅ Uses test data factories for realistic scenarios

### 3. Workflow Integration Test - `usePreferences-workflow.test.ts`

```javascript
describe("usePreferences Database Functions - Integration Workflow Tests", () => {
  describe("Complete User Preferences Lifecycle", () => {
    test("new user workflow: create defaults → validate jobs → upsert preferences", async () => {
      const jobSeeker = await createTestJobSeeker();

      // Step 1: Create default preferences
      const { data: defaultPrefs, error: defaultError } =
        await testSupabase.rpc("create_default_preferences", {
          p_user_id: jobSeeker.user_id,
        });

      expect(defaultError).toBeNull();
      expect(defaultPrefs[0].desired_roles).toEqual([]);

      // Step 2: Validate job names
      const { data: isValid, error: validationError } = await testSupabase.rpc(
        "validate_job_names",
        { job_names: ["Waiter", "Chef"] }
      );

      expect(validationError).toBeNull();
      expect(isValid).toBe(true);

      // Step 3: Upsert preferences with validated job names
      const { data: upsertResult, error: upsertError } = await testSupabase.rpc(
        "upsert_user_preferences",
        {
          p_target_user_id: jobSeeker.user_id,
          p_desired_roles: ["Waiter", "Chef"],
          // ... other parameters
        }
      );

      expect(upsertError).toBeNull();
      expect(upsertResult[0].desired_roles).toEqual(["Waiter", "Chef"]);

      // Step 4: Verify final state in database
      const { data: finalPrefs } = await testSupabase
        .from("preferences")
        .select("*")
        .eq("user_id", jobSeeker.user_id)
        .single();

      expect(finalPrefs.desired_roles).toEqual(["Waiter", "Chef"]);
    });
  });
});
```

**What makes this an integration test**:
- ✅ Tests complete multi-step workflows
- ✅ Uses real database functions
- ✅ Tests integration between different database operations
- ✅ Verifies end-to-end user scenarios
- ✅ Tests actual business process flow

---

## Dashboard Test Comparison

### Unit Test: `JSDashboard.test.tsx`

**Approach**: Heavy mocking to isolate component logic
```javascript
// Everything is mocked
vi.mock("../../src/hooks/useAssignments");
vi.mock("../../src/hooks/useUserProfile");
vi.mock("../../src/components/StatsCard");
vi.mock("../../src/components/PayoutWeeklySummaryCard");

describe("JSDashboard - Essential Tests", () => {
  it("filters assignments to current week only", () => {
    // Test focuses on filtering logic within the component
    render(<Dashboard />);
    
    const assignmentCards = screen.getAllByTestId("assignment-card");
    expect(assignmentCards).toHaveLength(1); // Only current week
  });

  it("displays current week date range", () => {
    // Test focuses on date calculation logic
    render(<Dashboard />);
    
    const expectedRange = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`;
    expect(screen.getByText(expectedRange)).toBeInTheDocument();
  });
});
```

**What it tests**:
- ✅ Date filtering logic
- ✅ UI rendering based on props
- ✅ Component state management
- ✅ Error and loading state handling

### Integration Test: `JSDashboard-integration.test.tsx`

**Approach**: Minimal mocking to test real component interactions
```javascript
// Only mock external services, not business logic
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() }
}));

describe("JSDashboard Integration Tests", () => {
  it("loads and displays complete dashboard with real data flow", async () => {
    render(<Dashboard />);

    // Test complete user workflow
    await waitFor(() => {
      expect(screen.queryByText("Loading assignments...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Welcome Back,")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Restaurant Server")).toBeInTheDocument();

    // Verify actual RPC calls were made
    expect(mockSupabase.rpc).toHaveBeenCalledWith("get_assignments_by_jobseeker", {
      p_user_id: mockUser.id,
    });
  });

  it("synchronizes payout data with assignment changes", async () => {
    // Test real interaction between components
    render(<Dashboard />);
    
    const viewDetailsButtons = screen.getAllByText("View Details");
    fireEvent.click(viewDetailsButtons[0]);

    const completeButton = screen.getByText("Mark as Completed");
    fireEvent.click(completeButton);

    // Verify data synchronization happens
    await waitFor(() => {
      expect(payoutRefreshCount).toBe(2);
    });
  });
});
```

**What it tests**:
- ✅ Complete user workflows
- ✅ Component interactions and data flow
- ✅ Real hook behavior together
- ✅ System integration points

---

## Preferences Test Comparison

### Unit Test: `JSPref.test.tsx`

**Approach**: Test tab component behavior in isolation
```javascript
// Mock child components to isolate tab logic
vi.mock("../../src/components/PreferencesForm", () => ({
  default: vi.fn(() => <div data-testid="mock-preferences-form">Preferences Form</div>),
}));
vi.mock("../../src/components/Availability", () => ({
  default: vi.fn(() => <div data-testid="mock-availability">Availability Component</div>),
}));

describe("Preferences (JSPref)", () => {
  it("renders correctly with default tab selected", () => {
    render(<Preferences />);

    expect(screen.getByRole("button", { name: "Preferences" })).toBeTruthy();
    expect(screen.getByTestId("mock-preferences-form")).toBeTruthy();
    expect(screen.queryByTestId("mock-availability")).toBeNull();
  });

  it("switches to Availability tab when clicked", () => {
    render(<Preferences />);

    fireEvent.click(screen.getByRole("button", { name: "Availability" }));

    expect(screen.getByTestId("mock-availability")).toBeTruthy();
    expect(screen.queryByTestId("mock-preferences-form")).toBeNull();
  });
});
```

**What it tests**:
- ✅ Tab switching logic
- ✅ CSS class application
- ✅ Component visibility state
- ✅ UI behavior in isolation

### Integration Test: `usePreferences.test.tsx`

**Approach**: Test complete preferences workflow with real database
```javascript
// Use real database connection
import { testSupabase, createTestJobSeeker } from "../../src/test-setup";

describe("usePreferences Hook - Integration Tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await createTestJobSeeker({ user_id: mockUser.id });
  });

  test("creates default preferences when none exist", async () => {
    // Test real database interaction
    const { result } = renderHook(() => usePreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify real default creation
    expect(result.current.preferences?.min_pay_rate).toBe(15);
    expect(result.current.preferences?.desired_roles).toEqual([]);
  });

  test("saves preferences with maximum valid values", async () => {
    // Create real job types in database
    await testSupabase.from("job_types").insert([
      { type_name: "Server", category_id: category.category_id, is_active: true },
      { type_name: "Manager", category_id: category.category_id, is_active: true },
    ]);

    const { result } = renderHook(() => usePreferences());

    const maxValidPreferences = {
      payRate: 100,
      selectedJobNames: ["Server", "Manager"],
      maxHoursPerWeek: 44,
      // ... other fields
    };

    await act(async () => {
      saveResult = await result.current.savePreferences(maxValidPreferences);
    });

    // Verify real database update
    expect(saveResult).toBe(true);
    expect(result.current.preferences?.desired_roles).toEqual(["Server", "Manager"]);
  });
});
```

**What it tests**:
- ✅ Complete preference lifecycle
- ✅ Real database validation
- ✅ Actual data persistence
- ✅ End-to-end user scenarios

---

## Testing Strategies

### 1. Equivalence Class Testing (ECT)
Used in `preferences-validation.test.ts`:

```javascript
describe("Boundary Value Testing for numeric fields", () => {
  // Valid equivalence class
  test("validates minimum pay rate boundary (positive)", () => {
    const result = validatePreferences({
      min_pay_rate: 5, // Valid class: positive numbers
    });
    expect(result.isValid).toBe(true);
  });

  // Invalid equivalence class
  test("rejects negative pay rate", () => {
    const result = validatePreferences({
      min_pay_rate: -5, // Invalid class: negative numbers
    });
    expect(result.isValid).toBe(false);
  });
});
```

### 2. Boundary Value Testing (BVT)
Testing edge cases:

```javascript
test("validates maximum hours per week (44 hours)", () => {
  const result = validatePreferences({
    max_hours_per_week: 44, // Boundary: maximum allowed
  });
  expect(result.isValid).toBe(true);
});

test("rejects hours per week over limit (45 hours)", () => {
  const result = validatePreferences({
    max_hours_per_week: 45, // Boundary + 1: should fail
  });
  expect(result.isValid).toBe(false);
});
```

### 3. Decision Table Testing
Used in `usePreferences.test.tsx`:

```javascript
const updateTestCases = [
  {
    description: "updates single field (pay rate)",
    update: { min_pay_rate: 25 },
    expectedField: "min_pay_rate",
    expectedValue: 25,
  },
  {
    description: "updates multiple fields",
    update: { min_pay_rate: 30, max_travel_km: 20 },
    expectedField: "min_pay_rate", 
    expectedValue: 30,
  },
];

updateTestCases.forEach(({ description, update, expectedField, expectedValue }) => {
  test(description, async () => {
    // Test each decision path
  });
});
```

### 4. Error Scenario Testing
Comprehensive error handling in `usePreferences-error-scenarios.test.ts`:

```javascript
describe("Authentication Error Scenarios", () => {
  test("usePreferences handles null user gracefully", () => {
    // Test authentication failure
  });
});

describe("Database Error Scenarios", () => {
  test("fetchPreferences handles database connection error", () => {
    // Test database connectivity issues
  });
});

describe("Network and Connectivity Error Scenarios", () => {
  test("handles network timeout during preferences fetch", () => {
    // Test network failures
  });
});
```

---

## Mock Strategies

### 1. Component Mocking (Unit Tests)
```javascript
// Mock child components to test parent logic
vi.mock("../../src/components/StatsCard", () => ({
  default: vi.fn(({ title, value }) => (
    <div data-testid="stats-card">{title}: {value}</div>
  )),
}));

// Mock hooks to control return values
vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: vi.fn(),
}));
```

### 2. Service Mocking (Unit Tests)
```javascript
// Mock external services completely
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn(() => ({ select: vi.fn().mockReturnThis() })),
  })),
}));
```

### 3. Minimal Mocking (Integration Tests)
```javascript
// Only mock external services, keep business logic real
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() }, // Mock only the database client
}));

// Keep hooks and components real to test interactions
```

### 4. Database Mocking vs Real Database

**Unit Tests**: Mock database completely
```javascript
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
  })),
};
```

**Integration Tests**: Use real database
```javascript
// Real database connection
export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);

// Real test data creation
export const createTestJobSeeker = async (overrides = {}) => {
  const { data, error } = await testSupabase
    .from("job_seekers")
    .insert(defaultData)
    .select()
    .single();
  return data;
};
```

---

## Best Practices

### When to Use Unit Tests
✅ **Use unit tests when**:
- Testing individual component logic
- Testing pure functions and utilities
- Testing error handling scenarios
- Need fast feedback during development
- Testing edge cases and boundary conditions
- Validating input/output transformations

**Example**: `StatsCard.test.tsx` tests component rendering logic
```javascript
it("renders title and value correctly", () => {
  render(<StatsCard title="Rating" value="4.5" />);
  expect(screen.getByText("Rating")).toBeInTheDocument();
});
```

### When to Use Integration Tests
✅ **Use integration tests when**:
- Testing complete user workflows
- Verifying component interactions
- Testing database operations and data flow
- Validating API integrations
- Testing complex business processes

**Example**: `JSDashboard-integration.test.tsx` tests complete dashboard workflow
```javascript
it("loads and displays complete dashboard with real data flow", async () => {
  render(<Dashboard />);
  // Test complete user experience with real data
});
```

### Mock Strategy Guidelines

#### Unit Tests - Heavy Mocking
```javascript
// Mock everything except the unit under test
vi.mock("../../src/hooks/useAssignments");
vi.mock("../../src/components/StatsCard");
vi.mock("@supabase/supabase-js");
```

#### Integration Tests - Minimal Mocking
```javascript
// Only mock external services you can't control
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() }
}));
// Keep business logic components real
```

### Test Organization

#### Directory Structure
```
tests/
├── frontendSuccessUnit/    # Fast unit tests with mocks
├── frontendFailUnit/       # Error scenario unit tests  
├── integration/            # Slower integration tests
└── unit/                   # Backend/database unit tests
```

#### Naming Conventions
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `ComponentName-integration.test.tsx`
- Error scenarios: `hook-error-scenarios.test.ts`
- Workflows: `feature-workflow.test.ts`

### Configuration Strategy

#### Unit Test Config (`vitest.frontend.config.ts`)
```javascript
export default defineConfig({
  test: {
    setupFiles: ["./src/test-setup-frontend.ts"], // Heavy mocking
    environment: "jsdom",
    include: ["tests/frontendSuccessUnit/**/*.test.{ts,tsx}"],
  },
});
```

#### Integration Test Config (uses `src/test-setup.ts`)
```javascript
// Real database setup with cleanup utilities
import { testSupabase, cleanupTestData } from "./src/test-setup";
```

### Key Takeaways

1. **Unit Tests**: Fast, isolated, heavily mocked - test individual pieces
2. **Integration Tests**: Slower, real dependencies - test pieces working together
3. **Use both**: Unit tests for development speed, integration tests for confidence
4. **Mock strategically**: Mock what you can't control, keep business logic real
5. **Organize clearly**: Separate unit and integration tests in different directories
6. **Test data**: Use factories for integration tests, mock data for unit tests

---

## Summary

Understanding the difference between unit and integration tests is crucial for building a robust test suite:

- **Unit tests** give you fast feedback and help you catch regressions quickly
- **Integration tests** give you confidence that your system works as a whole
- **Both are necessary** for a complete testing strategy
- **Your codebase** demonstrates excellent examples of both approaches

Use this guide as a reference when writing your own tests, and remember: the goal is not just code coverage, but confidence in your system's behavior.