# JSDashboard Test Suite Documentation

## Overview
This document categorizes all test files related to JSDashboard functionality, specifying test types and providing mock setup instructions for each component.

---

## Test File Categories

### 1. Unit Tests

#### 1.1 Component Unit Tests

##### **StatsCard.test.tsx**
- **Test Type**: Component Unit Test - Isolated UI Component
- **Purpose**: Tests individual StatsCard component rendering and props handling
- **Mock Requirements**: None (Pure component)

**Tests Included:**
- Basic rendering with title and value
- Icon handling (with/without icon)
- Props validation

**Mock Setup:**
```typescript
// No mocks required - pure component
import StatsCard from "../../src/components/StatsCard";
import { Star } from "lucide-react";
```

##### **useAssignments.test.tsx**
- **Test Type**: Hook Unit Test - Business Logic
- **Purpose**: Tests assignment data management hook in isolation
- **Mock Requirements**: Supabase client, useAuth hook

**Tests Included:**
- Data fetching (assignments, weekly earnings)
- Assignment status updates
- Error handling (authentication, database errors)
- Weekly total calculations

**Mock Setup:**
```typescript
// Mock external dependencies
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// Usage in tests
const mockUseAuth = vi.mocked(useAuth);
const mockSupabase = vi.mocked(supabase);

// Mock user authentication
mockUseAuth.mockReturnValue({
  user: { id: "test-user-id", email: "test@example.com", role: "jobseeker" },
  loading: false,
  error: null,
});

// Mock database responses
mockSupabase.rpc.mockResolvedValueOnce({
  data: [mockAssignment],
  error: null,
});
```

#### 1.2 Component Integration Unit Tests

##### **JSDashboard.test.tsx**
- **Test Type**: Component Unit Test with Mocked Dependencies
- **Purpose**: Tests JSDashboard component logic with all dependencies mocked
- **Mock Requirements**: All hooks and child components

**Tests Included:**
- Week filtering logic (business rule validation)
- Assignment status transformation
- User interface element rendering
- Loading and error state handling
- Empty state scenarios

**Mock Setup:**
```typescript
// Mock all dependencies
vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: vi.fn(),
}));

vi.mock("../../src/hooks/useUserProfile", () => ({
  useUserProfile: vi.fn(),
}));

// Mock child components
vi.mock("../../src/components/StatsCard", () => ({
  default: vi.fn(({ title, value }) => (
    <div data-testid="stats-card">
      <span>{title}: {value}</span>
    </div>
  )),
}));

vi.mock("../../src/components/JobseekerAssignmentCard", () => ({
  JobseekerAssignmentCard: vi.fn(({ assignment, onViewDetails }) => (
    <div data-testid="assignment-card" data-assignment-id={assignment.id}>
      <span>{assignment.title} - {assignment.company_name}</span>
      <button onClick={() => onViewDetails(assignment)}>View Details</button>
    </div>
  )),
}));

// Mock return values
const mockUseAssignments = vi.mocked(useAssignments);
const mockUseUserProfile = vi.mocked(useUserProfile);

mockUseAssignments.mockReturnValue({
  assignments: mockAssignments,
  weeklyEarnings: [],
  weeklyTotal: 0,
  loading: false,
  error: null,
  updateAssignmentStatus: vi.fn(),
  fetchAssignmentsByShift: vi.fn(),
  fetchAssignments: vi.fn(),
  fetchWeeklyEarnings: vi.fn(),
});
```

---

### 2. Integration Tests

#### 2.1 Full Dashboard Integration Test

##### **JSDashboard-integration.test.tsx**
- **Test Type**: End-to-End Integration Test - Component + Data Flow
- **Purpose**: Tests complete dashboard workflow with real hook implementations
- **Mock Requirements**: Only external services (Supabase, Auth, Geocoding)

**Tests Included:**
- Complete dashboard loading with real data flow
- Assignment filtering with actual date logic
- User profile integration and display
- Week boundary calculations
- Data consistency across components
- Real-world scenarios (weekend filtering, empty states)

**Mock Setup:**
```typescript
// Mock only external services, not internal hooks
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/hooks/useLocationGeocoding", () => ({
  useLocationGeocoding: vi.fn(),
}));

// Mock only complex UI components that aren't core to dashboard logic
vi.mock("../../src/components/MonthlyCalendar", () => ({
  default: vi.fn(() => <div data-testid="monthly-calendar">Calendar Component</div>),
}));

// Setup realistic data responses
const mockSupabase = vi.mocked(supabase);
mockSupabase.rpc.mockImplementation((functionName, params) => {
  if (functionName === "get_assignments_by_jobseeker") {
    return Promise.resolve({
      data: mockAssignmentsResponse,
      error: null,
    });
  }
  if (functionName === "get_user_profile_data") {
    return Promise.resolve({
      data: mockProfileResponse,
      error: null,
    });
  }
  if (functionName === "get_weekly_earnings_summary") {
    return Promise.resolve({
      data: mockWeeklyEarningsResponse,
      error: null,
    });
  }
  return Promise.resolve({ data: null, error: null });
});
```

---

## Mock Setup Patterns

### Common Mock Patterns

#### 1. **Pure Component Testing (No Mocks)**
```typescript
// For simple UI components like StatsCard
import { render, screen } from "@testing-library/react";
import StatsCard from "../../src/components/StatsCard";

// No mocks needed - test direct rendering
```

#### 2. **Hook Testing with External Dependencies**
```typescript
// Mock external services but test hook logic
vi.mock("../../src/integrations/supabase/client");
vi.mock("../../src/hooks/useAuth");

// Test hook behavior with mocked responses
```

#### 3. **Component Testing with Mocked Dependencies**
```typescript
// Mock all child components and hooks
vi.mock("../../src/hooks/useAssignments");
vi.mock("../../src/components/StatsCard");

// Test component logic without external dependencies
```

#### 4. **Integration Testing with Service Mocks**
```typescript
// Mock only external services, use real internal components/hooks
vi.mock("../../src/integrations/supabase/client");
vi.mock("../../src/hooks/useAuth");

// Test real data flow and component interactions
```

### Mock Data Templates

#### Assignment Mock Data
```typescript
const mockAssignment = {
  assignment_id: "assign-1",
  shift_id: "shift-1",
  user_id: "test-user-id",
  status: "confirmed",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-15T10:00:00Z",
  start_time: "2025-01-20T09:00:00Z",
  end_time: "2025-01-20T17:00:00Z",
  job_title: "Restaurant Server",
  company_name: "Test Restaurant",
  job_location: "Singapore",
  pay_rate: 18.50,
  job_description: "Serve customers",
};
```

#### Profile Mock Data
```typescript
const mockProfileData = {
  display: {
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    rating: 4.5,
    accountStatus: "ACTIVE" as const,
    email: "john.doe@example.com",
    accountCreated: "2025-01-01T00:00:00Z",
  },
  personalInfo: {
    phoneNumber: "+6591234567",
    homeAddress: "123 Test Street",
    postalCode: "123456",
  },
  userRole: "jobseeker" as const,
};
```

---

## Test Execution Guide

### Running Specific Test Types

#### Run All Unit Tests
```bash
npm run test:frontend:success:run tests/frontendSuccessUnit/StatsCard.test.tsx tests/frontendSuccessUnit/useAssignments.test.tsx tests/frontendSuccessUnit/JSDashboard.test.tsx
```

#### Run Integration Tests
```bash
npm run test:frontend:success:run tests/integration/JSDashboard-integration.test.tsx
```

#### Run Individual Test Files
```bash
# Component unit test
npx vitest run tests/frontendSuccessUnit/StatsCard.test.tsx

# Hook unit test
npx vitest run tests/frontendSuccessUnit/useAssignments.test.tsx

# Component integration test
npx vitest run tests/frontendSuccessUnit/JSDashboard.test.tsx

# Full integration test
npx vitest run tests/integration/JSDashboard-integration.test.tsx
```

### Test Performance

| Test Type | File Count | Test Count | Avg Duration | Purpose |
|-----------|------------|------------|--------------|---------|
| Component Unit | 1 | 3 | ~20ms | UI component validation |
| Hook Unit | 1 | 5 | ~230ms | Business logic validation |
| Component Integration | 1 | 9 | ~50ms | Component behavior validation |
| Full Integration | 1 | 8 | ~300ms | End-to-end workflow validation |
| **Total** | **4** | **25** | **~600ms** | **Complete test coverage** |

---

## Best Practices

### When to Use Each Test Type

#### **Unit Tests** - Use When:
- Testing individual component rendering
- Validating business logic in hooks
- Testing pure functions and utilities
- Isolating specific functionality

#### **Integration Tests** - Use When:
- Testing component interactions
- Validating data flow between components
- Testing real-world user scenarios
- Ensuring system parts work together

### Mock Guidelines

#### **What to Mock:**
- External APIs (Supabase, third-party services)
- Authentication systems
- File system operations
- Complex child components (in unit tests)

#### **What NOT to Mock:**
- Internal business logic (in integration tests)
- Simple utility functions
- React hooks (useState, useEffect, etc.)
- Date/time functions (unless testing specific dates)

### Test Data Strategy

- **Use realistic data** that matches your application's data structure
- **Create reusable mock factories** for common objects
- **Test edge cases** with boundary values
- **Include both success and error scenarios**

This documentation provides a complete guide for understanding and maintaining the JSDashboard test suite, ensuring comprehensive coverage while maintaining test clarity and performance.