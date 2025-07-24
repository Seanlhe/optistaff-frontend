# Testing Guide

This guide explains what real functionality each test file covers in the OptiStaff job seeker preferences system.

## Overview

The test files in `tests/frontendSuccessUnit/` cover a comprehensive **job seeker preferences system** that allows users to specify their work availability, location constraints, preferred job types, and compensation expectations.

## Test File → Source File → Functionality Mapping

### 1. **Calendar.test.tsx** → `src/components/Calendar.tsx`
**Tests the weekly availability calendar for job seekers to set working hours**

**Source File Functions:**
- Weekly calendar display with navigation (prev/next week, today button)
- 24-hour × 7-day grid layout for time slot selection
- Integration with Supabase database for availability storage
- Template system for saving/loading availability patterns

**What the Tests Verify:**
- ✅ Calendar renders with current week and navigation controls
- ✅ Loads existing availability events from database on mount
- ✅ Creates new availability slots via double-click on time slots
- ✅ Saves availability data to backend when Save button clicked
- ✅ Refreshes data when refresh button clicked
- ✅ Opens template dialogs for saving/loading availability patterns
- ✅ Handles template selection and applies template to calendar
- ✅ Updates and deletes existing availability events
- ✅ Shows error messages for API failures
- ✅ Displays loading states during save operations
- ✅ Renders all 24 hours and 7 days correctly

### 2. **CalendarEvent.test.tsx** → `src/components/CalendarEvent.tsx`
**Tests individual draggable/resizable time blocks within the calendar**

**Source File Functions:**
- Visual representation of availability time slots
- Drag-and-drop functionality for moving events
- Resize handles for adjusting event duration
- Mouse and keyboard interaction handling

**What the Tests Verify:**
- ✅ Event positioning based on start/end times (48px per hour calculation)
- ✅ Visual state changes (selected/unselected, dragging states)
- ✅ Mouse interactions (click to select, double-click to delete)
- ✅ Keyboard deletion (Delete/Backspace keys)
- ✅ Drag-and-drop with time and day boundary constraints
- ✅ Resize functionality using bottom resize handle
- ✅ Time display formatting (HH:MM - HH:MM)
- ✅ Z-index management during dragging operations
- ✅ Event boundary validation (staying within day limits)

### 3. **JSPref.test.tsx** → `src/pages/employee/JSPref.tsx`
**Tests the main preferences page with tab navigation**

**Source File Functions:**
- Tab switching between "Preferences" and "Availability" views
- Layout management for preference components
- State management for active tab

**What the Tests Verify:**
- ✅ Renders with "Preferences" tab selected by default
- ✅ Applies correct CSS classes to active/inactive tabs
- ✅ Switches to Availability tab when clicked
- ✅ Switches back to Preferences tab when clicked
- ✅ Updates CSS classes when switching tabs
- ✅ Maintains correct container structure and styling
- ✅ Only renders one component at a time
- ✅ Maintains tab state across multiple clicks

### 4. **LocationAwareMap.test.tsx** → `src/components/LocationAwareMap.tsx`
**Tests interactive map for travel distance preferences**

**Source File Functions:**
- Leaflet map integration with Singapore boundaries
- Home location marker display and management
- Travel radius circle visualization
- Distance slider controls (5-30km range)

**What the Tests Verify:**
- ✅ Map renders with Singapore center coordinates
- ✅ Displays home location marker when location available
- ✅ Shows travel radius circle with correct size (km to meters conversion)
- ✅ Slider controls adjust maximum travel distance
- ✅ Loading overlay displays during map operations
- ✅ Error handling for location service failures
- ✅ Fallback behavior when no home location set
- ✅ Retry functionality for failed location operations
- ✅ Distance labels update with slider changes
- ✅ Map zoom and pan controls work correctly

### 5. **PreferencesForm.test.tsx** → `src/components/PreferencesForm.tsx`
**Tests the main form container that orchestrates all preference components**

**Source File Functions:**
- Form submission workflow and validation
- Integration with `usePreferencesForm` hook
- Child component coordination (PreferencesMaximum, PreferencesPay, etc.)
- Error handling and success messaging

**What the Tests Verify:**
- ✅ Renders all child components (maximum, pay, job type, map)
- ✅ Handles successful form submission with success message
- ✅ Handles failed form submission gracefully
- ✅ Displays general error messages from the hook
- ✅ Displays and handles location-specific errors
- ✅ Form data flows correctly between components
- ✅ Submit button shows correct states (Submit/Saving/Validating)

### 6. **PreferencesJobType.test.tsx** → `src/components/PreferencesJobType.tsx`
**Tests job type selection with categorized checkboxes**

**Source File Functions:**
- Integration with `useJobTypes` hook for data fetching
- Job types grouped by categories (Food Service, Retail, etc.)
- Multi-selection checkbox interface
- Form data synchronization

**What the Tests Verify:**
- ✅ Renders job types grouped by category
- ✅ Shows loading state with skeleton placeholders
- ✅ Shows error state when job types fail to load
- ✅ Loads existing selected job names from form data
- ✅ Handles checkbox selection correctly
- ✅ Handles checkbox deselection correctly
- ✅ Handles multiple selections correctly
- ✅ Applies correct styling for selected/unselected job types
- ✅ Renders checkboxes with correct attributes

### 7. **PreferencesMaximum.test.tsx** → `src/components/PreferencesMaximum.tsx`
**Tests input fields for maximum working hours constraints**

**Source File Functions:**
- Number inputs for max hours per week (1-44) and per shift (1-12)
- Input validation and sanitization
- Form data synchronization

**What the Tests Verify:**
- ✅ Renders both input fields with correct labels
- ✅ Displays correct input attributes (min/max values, types)
- ✅ Handles maximum hours per week changes correctly
- ✅ Handles maximum hours per shift changes correctly
- ✅ Handles empty input values by setting to 0
- ✅ Handles non-numeric input by setting to 0
- ✅ Displays empty string when form data values are 0/undefined
- ✅ Handles decimal input by converting to integers
- ✅ Renders with correct layout and label styling

### 8. **PreferencesPay.test.tsx** → `src/components/PreferencesPay.tsx`
**Tests pay rate slider and lower rate acceptance checkbox**

**Source File Functions:**
- Range slider for pay rate selection (5-30 dollars)
- Real-time pay rate display updates
- Checkbox for accepting lower pay rates
- Form data synchronization

**What the Tests Verify:**
- ✅ Renders with all elements (slider, display, checkbox, labels)
- ✅ Displays correct pay rate value from form data
- ✅ Slider has correct attributes and styling
- ✅ Handles pay rate changes correctly
- ✅ Handles minimum/maximum pay rate constraints
- ✅ Checkbox displays correct state (checked/unchecked)
- ✅ Handles checkbox changes correctly (checking/unchecking)
- ✅ Labels have correct attributes for accessibility
- ✅ Container has correct styling and layout

## Quick Reference

**To run specific functionality tests:**
```bash
# Test availability calendar functionality
npm run test:frontendsuccess -- -t "Calendar"

# Test job type selection functionality  
npm run test:frontendsuccess -- -t "PreferencesJobType"

# Test location/travel distance functionality
npm run test:frontendsuccess -- -t "LocationAwareMap"

# Test pay rate functionality
npm run test:frontendsuccess -- -t "PreferencesPay"
```

**All tests verify the complete job seeker preferences workflow:**
1. Setting weekly availability through drag-and-drop calendar
2. Specifying travel distance preferences with interactive map
3. Selecting preferred job types from categorized options
4. Setting maximum working hours constraints
5. Defining pay rate preferences and flexibility

## Test Scripts

### Frontend Tests (Component/UI Tests)

#### All Frontend Tests
- `npm run test:frontend` - Run all frontend tests (success + fail) in watch mode
- `npm run test:frontend:run` - Run all frontend tests once
- `npm run test:frontend:ui` - Run all frontend tests with Vitest UI
- `npm run test:frontend:coverage` - Run all frontend tests with coverage report
- `npm run test:frontend:watch` - Explicit watch mode for all frontend tests

#### Success Tests (Passing Tests)
- `npm run test:frontendsuccess` - Run only passing frontend tests in watch mode
- `npm run test:frontendsuccess:run` - Run only passing frontend tests once
- `npm run test:frontendsuccess:ui` - Run only passing tests with Vitest UI
- `npm run test:frontendsuccess:coverage` - Run only passing tests with coverage
- `npm run test:frontendsuccess:watch` - Explicit watch mode for passing tests

#### Fail Tests (Failing/WIP Tests)
- `npm run test:frontendfail` - Run only failing frontend tests in watch mode
- `npm run test:frontendfail:run` - Run only failing frontend tests once
- `npm run test:frontendfail:ui` - Run only failing tests with Vitest UI
- `npm run test:frontendfail:coverage` - Run only failing tests with coverage
- `npm run test:frontendfail:watch` - Explicit watch mode for failing tests

### Backend Tests (Integration/Database Tests)
- `npm run test:backend` - Run backend tests in watch mode (starts Supabase)
- `npm run test:backend:run` - Run backend tests once
- `npm run test:backend:ui` - Run backend tests with Vitest UI
- `npm run test:backend:coverage` - Run backend tests with coverage
- `npm run test:backend:watch` - Explicit watch mode for backend tests

### Combined Tests
- `npm run test` - Run both frontend and backend tests once
- `npm run test:watch` - Run both in watch mode

## Test Types

### Frontend Tests (`tests/frontendSuccessUnit/` & `tests/frontendFailUnit/`)

**Purpose**: Test React component behavior, UI rendering, and user interactions without real backend dependencies.

**Configuration**: `vitest.frontend.config.ts`
**Setup File**: `src/test-setup-frontend.ts`
**Environment**: jsdom

**Features**:
- Mocked Supabase client
- Mocked React Router hooks
- Mocked React Query hooks
- Mocked UI icons and external dependencies
- Fast execution (no database calls)
- Isolated component testing

**Example Test Structure**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MyComponent from '../../src/components/MyComponent';

// Mock dependencies
vi.mock('../../src/hooks/useMyHook', () => ({
  useMyHook: vi.fn(() => ({ data: null, loading: false }))
}));

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
```

### Backend Tests (`tests/unit/` & `tests/integration/`)

**Purpose**: Test database operations, API logic, and hook integrations with real backend services.

**Configuration**: `vitest.backend.config.ts`
**Setup File**: `src/test-setup.ts`
**Environment**: jsdom
**Prerequisites**: Local Supabase instance (`supabase start`)

**Features**:
- Real Supabase connection
- Automatic database cleanup between tests
- Test data factories
- Admin operations support
- Integration with actual database schema

**Example Test Structure**:
```typescript
import { testSupabase, createTestJobSeeker } from '../src/test-setup';

describe('Database Operations', () => {
  it('creates user preferences', async () => {
    const jobSeeker = await createTestJobSeeker();
    
    const { data, error } = await testSupabase
      .from('preferences')
      .insert({ user_id: jobSeeker.user_id, pay_rate: 25 });
    
    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });
});
```

## Running Specific Tests

### Command Line Filtering

```bash
# Run specific test file
npm run test:frontendsuccess -- tests/frontendSuccessUnit/Calendar.test.tsx

# Run multiple specific files
npm run test:frontendsuccess -- tests/frontendSuccessUnit/Calendar.test.tsx tests/frontendSuccessUnit/PreferencesForm.test.tsx

# Run tests matching a pattern in test name
npm run test:frontendsuccess -- -t "renders correctly"
npm run test:frontendsuccess -- -t "handles.*submission"

# Run backend tests with specific files
npm run test:backend -- tests/unit/preferences-validation.test.ts
```

### Interactive Filtering (Recommended for Development)

```bash
# Start tests in watch mode
npm run test:frontendsuccess

# Then use interactive commands:
# Press 'p' - Filter by filename pattern
# Press 't' - Filter by test name pattern  
# Press 'a' - Run all tests
# Press 'f' - Run only failed tests
# Press 'q' - Quit
```

### Using Vitest CLI Directly

```bash
# Frontend tests
npx vitest --config vitest.frontend.config.ts tests/frontendSuccessUnit/Calendar.test.tsx
npx vitest --config vitest.frontend.config.ts -t "Calendar"

# Backend tests  
npx vitest --config vitest.backend.config.ts tests/unit/preferences-validation.test.ts
```

## Test Organization Strategy

### Success vs Fail Folders

**`frontendSuccessUnit/`**: Contains all passing frontend tests
- Well-written, maintainable tests
- Proper mocking and setup
- Reliable and fast execution
- Used for CI/CD validation

**`frontendFailUnit/`**: Contains failing or work-in-progress frontend tests
- Tests under development
- Tests with known issues
- Experimental test approaches
- Helps separate stable from unstable tests

### Moving Tests Between Folders

When a test in `frontendFailUnit/` is fixed:
1. Move the file to `frontendSuccessUnit/`
2. Ensure all tests in the file pass
3. Update any related documentation

When a test starts failing:
1. Investigate the root cause
2. If it's a temporary issue, fix it
3. If it requires significant work, consider moving to `frontendFailUnit/`

## Writing Tests

### Frontend Component Tests

```typescript
// tests/frontendSuccessUnit/MyComponent.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MyComponent from '../../src/components/MyComponent';

// Mock external dependencies
vi.mock('../../src/hooks/useMyHook', () => ({
  useMyHook: vi.fn(() => ({ data: 'mock data', loading: false }))
}));

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default state', () => {
    render(<MyComponent />);
    expect(screen.getByText('Default Content')).toBeTruthy();
  });

  it('handles user interaction', async () => {
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Button Clicked')).toBeTruthy();
    });
  });

  it('handles loading state', () => {
    // Override global mock for specific test
    vi.mocked(useMyHook).mockReturnValue({ 
      data: null, 
      loading: true 
    });
    
    render(<MyComponent />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });
});
```

### Backend Integration Tests

```typescript
// tests/integration/myFeature.test.tsx
import { 
  testSupabase, 
  createTestJobSeeker, 
  createTestClient,
  cleanupTestData 
} from '../src/test-setup';

describe('My Feature Integration', () => {
  beforeEach(async () => {
    await cleanupTestData(); // Optional - done automatically
  });

  it('integrates with database correctly', async () => {
    // Create test data
    const jobSeeker = await createTestJobSeeker({
      first_name: 'John',
      last_name: 'Doe'
    });
    
    // Test database operations
    const { data, error } = await testSupabase
      .from('my_table')
      .insert({
        user_id: jobSeeker.user_id,
        some_field: 'test value'
      })
      .select()
      .single();
    
    expect(error).toBeNull();
    expect(data.some_field).toBe('test value');
  });
});
```

## Best Practices

### Frontend Tests
1. **Mock External Dependencies**: Always mock hooks, API calls, and external libraries
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test User Behavior**: Focus on what users do, not implementation details
4. **Isolate Components**: Each test should focus on one component
5. **Use waitFor for Async**: Always wait for async operations to complete

### Backend Tests
1. **Use Test Factories**: Leverage provided factory functions for consistent test data
2. **Clean State**: Rely on automatic cleanup, but be aware of test isolation
3. **Test Real Operations**: Use actual database calls, not mocks
4. **Handle Async Properly**: Always await database operations
5. **Test Edge Cases**: Include error conditions and boundary cases

### General Guidelines
1. **Descriptive Test Names**: Use clear, behavior-focused test descriptions
2. **AAA Pattern**: Arrange, Act, Assert - structure tests clearly
3. **One Assertion Per Test**: Keep tests focused and easy to debug
4. **DRY Principle**: Extract common setup into beforeEach blocks
5. **Fast Feedback**: Keep tests fast and reliable

## Troubleshooting

### Frontend Tests

**Module not found errors**:
- Check import paths use `../../src/` prefix
- Verify path aliases in `vitest.frontend.config.ts`

**Component not rendering**:
- Ensure all dependencies are mocked
- Check for missing global mocks in test setup

**Mock not working**:
- Individual test mocks override global mocks
- Use `vi.clearAllMocks()` in beforeEach
- Verify mock syntax: `vi.mocked(hook).mockReturnValue(...)`

**Tests hanging**:
- Usually due to unmocked async operations
- Check for missing mocks of external dependencies

### Backend Tests  

**Supabase not running**:
- Run `supabase start` before backend tests
- Verify local Supabase is running on port 54321

**Database connection failed**:
- Check Supabase status with `supabase status`
- Ensure environment variables are set correctly

**Test data conflicts**:
- Cleanup should be automatic via `test-setup.ts`
- Check `cleanupTestData()` function if issues persist

**Permission denied**:
- Some operations need admin client (`testSupabaseAdmin`)
- Verify test user has correct permissions

## Continuous Integration

### Running Tests in CI/CD

```bash
# Run all tests (recommended for CI)
npm run test

# Run only passing tests (for quick feedback)
npm run test:frontendsuccess:run

# Run with coverage (for quality metrics)
npm run test:frontendsuccess:coverage
npm run test:backend:coverage
```

### Test Organization in CI

1. **Pull Request Validation**: Run `npm run test:frontendsuccess:run` for fast feedback
2. **Main Branch Testing**: Run full test suite including backend tests
3. **Coverage Reports**: Generate coverage for quality tracking
4. **Fail Tests Monitoring**: Periodically run fail tests to track progress

## Development Workflow

### Daily Development
```bash
# Start relevant tests in watch mode
npm run test:frontendsuccess     # For component work
npm run test:backend             # For API/database work

# Run specific tests while developing
npm run test:frontendsuccess -- tests/frontendSuccessUnit/MyComponent.test.tsx
```

### Before Committing
```bash
# Run all passing tests
npm run test:frontendsuccess:run

# Run linting
npm run lint

# If working on backend features
npm run test:backend:run
```

### Code Review
- Ensure new tests are in appropriate folders
- Verify test coverage for new features
- Check that tests follow established patterns
- Confirm tests pass consistently

---

This testing guide provides a comprehensive framework for maintaining high-quality, reliable tests in the OptiStaff frontend application. The separation of success and fail tests allows for better development workflow while maintaining a stable test suite for continuous integration.