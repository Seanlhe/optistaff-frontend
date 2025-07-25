# Testing Guide

This project uses Vitest for testing with separate configurations for frontend and backend tests.

## Test Structure

```
src/
├── test-setup-frontend.ts # Global frontend test setup
└── test-setup.ts         # Backend test setup (Supabase)

tests/
├── frontendSuccessUnit/  # Frontend component tests (passing)
├── frontendFailUnit/     # Frontend component tests (failing/WIP)
├── integration/          # Backend integration tests
└── unit/                # Backend unit tests
```

## Available Test Scripts

### Frontend Tests (Component/UI Tests)
- `npm run test:frontend` - Run all frontend tests (success + fail) in watch mode
- `npm run test:frontend:run` - Run all frontend tests once
- `npm run test:frontend:ui` - Run all frontend tests with Vitest UI
- `npm run test:frontend:coverage` - Run all frontend tests with coverage report
- `npm run test:frontend:watch` - Explicit watch mode for all frontend tests

### Frontend Success Tests (Passing Tests)
- `npm run test:frontendsuccess` - Run only passing frontend tests in watch mode
- `npm run test:frontendsuccess:run` - Run only passing frontend tests once
- `npm run test:frontendsuccess:ui` - Run only passing tests with Vitest UI
- `npm run test:frontendsuccess:coverage` - Run only passing tests with coverage
- `npm run test:frontendsuccess:watch` - Explicit watch mode for passing tests

### Frontend Fail Tests (Failing/WIP Tests)
- `npm run test:frontendfail` - Run only failing frontend tests in watch mode
- `npm run test:frontendfail:run` - Run only failing frontend tests once
- `npm run test:frontendfail:ui` - Run only failing tests with Vitest UI
- `npm run test:frontendfail:coverage` - Run only failing tests with coverage
- `npm run test:frontendfail:watch` - Explicit watch mode for failing tests

### Backend Tests (Integration/Database Tests)
- `npm run test:backend` - Run backend tests in watch mode (starts Supabase)
- `npm run test:backend:run` - Run backend tests once
- `npm run test:backend:ui` - Run with Vitest UI
- `npm run test:backend:coverage` - Run with coverage report
- `npm run test:backend:watch` - Explicit watch mode

### Combined Tests
- `npm run test` - Run both frontend and backend tests once
- `npm run test:watch` - Run both in watch mode

## Running Specific Tests (No package.json Changes Needed)

### 1. Command Line Filtering

```bash
# Run specific test file
npm run test:frontend -- tests/frontendSuccessUnit/Calendar.test.tsx

# Run multiple specific files
npm run test:frontend -- tests/frontendSuccessUnit/Calendar.test.tsx tests/frontendSuccessUnit/PreferencesForm.test.tsx

# Run tests matching a pattern in filename
npm run test:frontend -- --grep "Calendar"
npm run test:frontend -- --grep "Preferences"

# Run tests matching a pattern in test name
npm run test:frontend -- -t "renders correctly"
npm run test:frontend -- -t "handles.*submission"

# Run backend tests with specific files
npm run test:backend -- tests/unit/preferences-validation.test.ts
```

### 2. Interactive Filtering (Recommended for Development)

```bash
# Start tests in watch mode
npm run test:frontend

# Then use interactive commands:
# Press 'p' - Filter by filename pattern
# Press 't' - Filter by test name pattern  
# Press 'a' - Run all tests
# Press 'f' - Run only failed tests
# Press 'q' - Quit
```

### 3. Environment Variables

```bash
# Run only specific file patterns
VITEST_INCLUDE="**/Calendar.test.*" npm run test:frontend
VITEST_INCLUDE="**/Preferences*.test.*" npm run test:frontend

# Run tests with specific names
VITEST_GREP="renders correctly" npm run test:frontend
```

### 4. Using Vitest CLI Directly

```bash
# Frontend tests
npx vitest --config vitest.frontend.config.ts tests/frontendSuccessUnit/Calendar.test.tsx
npx vitest --config vitest.frontend.config.ts --grep "Calendar"

# Backend tests  
npx vitest --config vitest.backend.config.ts tests/unit/preferences-validation.test.ts
```

## Test Setup Files - Why They're Needed

### Frontend Test Setup (`src/test-setup-frontend.ts`)

**Purpose**: Provides global mocks and utilities for component tests that don't need real backend services.

**Why it's needed**:
- **Isolation**: Components often import hooks/services that connect to Supabase, but component tests should focus on UI behavior, not backend integration
- **Speed**: Mocked dependencies make tests run faster (no network calls, no database)
- **Reliability**: Tests don't fail due to network issues or backend unavailability
- **Consistency**: Provides predictable mock responses across all component tests

**What it provides**:
```typescript
// Global mocks applied to ALL frontend tests
- Supabase client (mocked to return null data)
- React Router hooks (mocked navigation)
- React Query hooks (mocked loading states)
- Common UI icons (mocked components)
- Test utilities (console mocking, cleanup helpers)
```

**How to use**:
```typescript
// In your component test - global mocks are already active
import { mockConsole, cleanupMocks } from '../test-setup-frontend'

describe('MyComponent', () => {
  beforeEach(() => {
    mockConsole() // Optional: suppress console output
  })
  
  afterEach(() => {
    cleanupMocks() // Optional: clean up mocks
  })
  
  // Override global mocks when needed
  vi.mock('../hooks/useMyHook', () => ({
    useMyHook: () => ({ data: 'specific mock data' })
  }))
})
```

### Backend Test Setup (`src/test-setup.ts`)

**Purpose**: Provides real database connections and utilities for integration/unit tests that need to test actual backend logic.

**Why it's needed**:
- **Real Data**: Tests actual database operations, not mocked responses
- **Data Integrity**: Ensures your database schema and queries work correctly
- **Cleanup**: Automatically cleans test data between tests to prevent interference
- **Factories**: Provides helper functions to create test data consistently
- **Isolation**: Each test starts with a clean database state

**What it provides**:
```typescript
// Real connections and utilities
- testSupabase: Client for regular operations
- testSupabaseAdmin: Client for admin operations (user management)
- cleanupTestData(): Removes all test data from database
- createTestJobSeeker(): Factory for creating test job seekers
- createTestClient(): Factory for creating test clients
- createTestShift(): Factory for creating test shifts
- createTestAssignment(): Factory for creating test assignments
```

**How to use**:
```typescript
import { testSupabase, createTestJobSeeker, createTestClient } from '../src/test-setup'

describe('Preferences Integration', () => {
  it('saves user preferences to database', async () => {
    // Create test data using factories
    const jobSeeker = await createTestJobSeeker()
    
    // Test real database operations
    const { data, error } = await testSupabase
      .from('preferences')
      .insert({ user_id: jobSeeker.user_id, pay_rate: 25 })
    
    expect(error).toBeNull()
    expect(data).toBeTruthy()
    // Cleanup happens automatically in afterEach
  })
})
```

## Test Configuration Details

### Frontend Tests
- **Config**: `vitest.frontend.config.ts`
- **Setup**: `src/test-setup-frontend.ts` (global mocks & utilities)
- **Environment**: jsdom
- **Includes**: `tests/frontendSuccessUnit/**/*.test.{ts,tsx}`, `tests/frontendFailUnit/**/*.test.{ts,tsx}`
- **Excludes**: `tests/integration/**/*`, `tests/unit/**/*`
- **Features**: 
  - Mocked Supabase client
  - Mocked React Router
  - Mocked React Query
  - Mocked UI icons
  - Fast execution (no database)
  - Test utilities for common tasks

### Backend Tests
- **Config**: `vitest.backend.config.ts`
- **Setup**: `src/test-setup.ts` (real database & factories)
- **Environment**: jsdom
- **Includes**: `tests/unit/**/*.test.{ts,tsx}`, `tests/integration/**/*.test.{ts,tsx}`
- **Excludes**: `tests/frontendSuccessUnit/**/*`, `tests/frontendFailUnit/**/*`
- **Features**:
  - Real Supabase connection (local)
  - Automatic database cleanup between tests
  - Test data factories
  - Admin operations support
  - Requires `supabase start`

## When to Edit Test Setup Files

### Edit `src/test-setup-frontend.ts` when:
- Adding a new library that needs global mocking (e.g., new UI library, analytics)
- Creating reusable test utilities for component tests
- Adding common mock data that many component tests need
- Setting up global test configuration (like custom matchers)

### Edit `src/test-setup.ts` when:
- Adding new database tables that need cleanup
- Creating new test data factories for database entities
- Adding new test utilities for backend operations
- Modifying database connection settings for tests

### Don't edit setup files for:
- Test-specific mocks (use `vi.mock()` in individual test files)
- One-off test data (create it directly in the test)
- Temporary debugging code

## Writing Tests

### Frontend Component Tests
```typescript
// Global mocks from test-setup-frontend.ts are automatically active
// Override only when you need specific behavior

vi.mock('../hooks/useMyHook', () => ({
  useMyHook: () => ({ data: 'specific mock data', loading: false })
}))

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeTruthy()
  })
  
  it('handles loading state', () => {
    // Override the global mock for this specific test
    vi.mocked(useMyHook).mockReturnValue({ 
      data: null, 
      loading: true 
    })
    
    render(<MyComponent />)
    expect(screen.getByText('Loading...')).toBeTruthy()
  })
})
```

### Backend Tests
```typescript
import { 
  testSupabase, 
  createTestJobSeeker, 
  createTestClient,
  cleanupTestData 
} from '../src/test-setup'

describe('Database Operations', () => {
  // Cleanup happens automatically, but you can do it manually if needed
  beforeEach(async () => {
    await cleanupTestData() // Optional - already done automatically
  })

  it('creates and retrieves job seeker preferences', async () => {
    // Use factories to create test data
    const jobSeeker = await createTestJobSeeker({
      first_name: 'John',
      last_name: 'Doe'
    })
    
    // Test real database operations
    const { data, error } = await testSupabase
      .from('preferences')
      .insert({
        user_id: jobSeeker.user_id,
        pay_rate: 25,
        max_travel_km: 20
      })
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data.pay_rate).toBe(25)
    expect(data.max_travel_km).toBe(20)
  })
  
  it('handles complex relationships', async () => {
    const client = await createTestClient()
    const jobSeeker = await createTestJobSeeker()
    const shift = await createTestShift(client.client_id)
    
    // Test relationships work correctly
    const assignment = await createTestAssignment(
      jobSeeker.user_id, 
      shift.shift_id
    )
    
    expect(assignment.user_id).toBe(jobSeeker.user_id)
    expect(assignment.shift_id).toBe(shift.shift_id)
  })
})
```

## Common Patterns

### Running Tests During Development
```bash
# Start all frontend tests in watch mode for component development
npm run test:frontend

# Start only passing tests in watch mode
npm run test:frontendsuccess

# Start only failing tests in watch mode
npm run test:frontendfail

# Start backend tests for API/database development  
npm run test:backend

# Run specific test file while developing
npm run test:frontend -- tests/frontendSuccessUnit/MyComponent.test.tsx

# Run specific failing test file
npm run test:frontendfail -- tests/frontendFailUnit/MyComponent.test.tsx
```

### Running Tests in CI/CD
```bash
# Run all tests once
npm run test

# Run with coverage
npm run test:frontend:coverage
npm run test:backend:coverage
```

### Debugging Tests
```bash
# Run with Vitest UI for debugging
npm run test:frontend:ui
npm run test:backend:ui

# Run specific failing test
npm run test:frontend -- -t "specific test name"
```

## Troubleshooting

### Frontend Tests
- If components import Supabase directly, they're mocked globally
- Individual test files can override global mocks
- No Supabase instance needed

### Backend Tests  
- Requires local Supabase: `supabase start`
- Database is cleaned between tests automatically
- Use test data factories from `test-setup.ts`

### Common Issues

#### Frontend Tests
- **"Module not found"**: Check import paths and aliases in `vitest.frontend.config.ts`
- **"Component not rendering"**: Ensure all dependencies are mocked in test setup or individual test
- **"Mock not working"**: Individual test mocks override global mocks - check mock order
- **"Tests hanging"**: Usually due to unmocked async operations - check for missing mocks

#### Backend Tests  
- **"Supabase not running"**: Run `supabase start` before backend tests
- **"Database connection failed"**: Verify local Supabase is running on port 54321
- **"Test data conflicts"**: Cleanup should be automatic, but check `cleanupTestData()` function
- **"Permission denied"**: Some operations need admin client (`testSupabaseAdmin`)

#### Test Setup Issues
- **Global mocks not applying**: Check that setup file is listed in vitest config `setupFiles`
- **Mocks conflicting**: Individual test mocks override global ones - this is expected behavior
- **Cleanup not working**: Check that cleanup functions are properly called in setup hooks