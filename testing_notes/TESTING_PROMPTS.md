# Testing Prompts for Component Test Generation

This document contains reusable prompts for creating comprehensive unit tests and documentation for React components. These prompts follow the same patterns used for the JSDashboard testing suite.

## Table of Contents
1. [Component Analysis Prompt](#component-analysis-prompt)
2. [Unit Test Creation Prompt](#unit-test-creation-prompt)
3. [Documentation Generation Prompt](#documentation-generation-prompt)
4. [Test Verification Prompt](#test-verification-prompt)
5. [Usage Examples](#usage-examples)

---

## Component Analysis Prompt

Use this prompt first to analyze the component structure before creating tests:

```
I need help analyzing a React component for comprehensive unit testing. Please examine the following:

**Component**: [COMPONENT_NAME] (located at [FILE_PATH])

**Requirements**:
1. **Component Structure Analysis**:
   - Identify all props and their types
   - List all hooks used (useState, useEffect, custom hooks)
   - Map out all child components and their interactions
   - Identify external dependencies (APIs, services, utilities)

2. **Interaction Analysis**:
   - Document all user interactions (clicks, form submissions, navigation)
   - Identify state changes and their triggers
   - Map data flow between parent and child components
   - List all conditional rendering scenarios

3. **Test Strategy Planning**:
   - Suggest test categories (rendering, interaction, data processing, error handling)
   - Identify edge cases and error scenarios
   - Recommend mocking strategy for dependencies
   - Estimate test complexity and coverage areas

4. **Dependencies Mapping**:
   - List all custom hooks that need mocking
   - Identify third-party libraries requiring mocks
   - Map out child components for mocking
   - Note any global state or context dependencies

**Context**: This component is part of a [PROJECT_TYPE] application using [TECH_STACK]. The testing framework is Vitest with React Testing Library.

Please provide a detailed analysis with recommendations for comprehensive unit testing approach.
```

---

## Unit Test Creation Prompt

Use this prompt to generate the actual test files:

```
I would like to create comprehensive unit test cases for a React component. The tests should be simple, comprehensible for university students, and use vi.mock to avoid external API calls.

**Component Details**:
- **Component Name**: [COMPONENT_NAME]
- **File Location**: [FILE_PATH]
- **Dependencies**: [LIST_DEPENDENCIES]
- **Custom Hooks Used**: [LIST_HOOKS]
- **Child Components**: [LIST_CHILD_COMPONENTS]

**Testing Requirements**:

1. **Test Framework Setup**:
   - Use Vitest with React Testing Library
   - Follow existing test-setup-frontend.ts patterns
   - All tests should be in `tests/frontendSuccessUnit/` directory
   - Ensure all tests pass immediately after creation

2. **Mocking Strategy**:
   - Mock ALL external dependencies using vi.mock
   - Mock custom hooks (like useAssignments, useUserProfile)
   - Mock child components to focus on unit testing
   - Mock all Lucide React icons
   - NO Supabase calls - use comprehensive mocking
   - Mock any third-party libraries used

3. **Test Categories to Include**:
   - **Rendering Tests**: Component displays correctly with props
   - **Loading States**: Test loading indicators and states
   - **Data Display Tests**: Verify data formatting and display
   - **User Interaction Tests**: Button clicks, form submissions
   - **Error Handling Tests**: API failures, missing data
   - **Edge Case Tests**: Empty data, invalid props, boundary conditions
   - **Accessibility Tests**: Button semantics, proper labels

4. **Test Characteristics**:
   - **University Student Friendly**: Clear, educational test cases
   - **Simple and Comprehensible**: Easy to understand logic
   - **Well-commented**: Explain why each test exists
   - **Comprehensive Coverage**: Test normal cases, edge cases, errors
   - **Isolated Unit Tests**: No integration, no real API calls
   - **Consistent Patterns**: Follow existing test file structure

5. **Test File Structure**:
   ```typescript
   // Mock setup at top
   // Mock hooks, components, libraries
   // Mock data creation
   // Test suite with describe blocks
   // beforeEach/afterEach cleanup
   // Categorized test groups
   // Clear test descriptions
   ```

6. **Specific Test Cases to Include**:
   - Component renders without crashing
   - Props are displayed correctly
   - Loading states work properly
   - User interactions trigger expected behavior
   - Error states are handled gracefully
   - Edge cases don't break the component
   - Accessibility requirements are met

**Output Requirements**:
- Create complete test file: `[COMPONENT_NAME].test.tsx`
- Include all necessary imports and mocks
- Provide mock data that matches component expectations
- Ensure all tests are isolated and independent
- Add clear comments explaining test purpose
- Follow TypeScript best practices
- Make tests pass immediately (no debugging needed)

**Example Test Structure Pattern**:
```typescript
describe("ComponentName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock states
  });

  describe("Rendering Tests", () => {
    it("renders component with basic props", () => {
      // Test implementation
    });
  });

  describe("Interaction Tests", () => {
    it("handles user interactions correctly", () => {
      // Test implementation  
    });
  });
});
```

Please create comprehensive unit tests that cover all functionality while being educational and maintainable.
```

---

## Documentation Generation Prompt

Use this prompt to create comprehensive documentation after tests are written:

```
Help me create a comprehensive markdown documentation guide for the unit tests I just created. This should serve as both documentation and a learning resource for university students.

**Test Files Created**:
- [LIST_TEST_FILES_WITH_TEST_COUNTS]

**Component Information**:
- **Main Component**: [COMPONENT_NAME]
- **Related Components**: [LIST_RELATED_COMPONENTS]
- **Technology Stack**: [TECH_STACK]
- **Testing Framework**: Vitest + React Testing Library

**Documentation Requirements**:

1. **Document Structure**:
   ```markdown
   # [COMPONENT_NAME] Unit Testing Guide
   
   ## Table of Contents
   ## Overview
   ## Test Architecture  
   ## Setup and Configuration
   ## Mocking Strategy
   ## Test Files Documentation
   ## Running Tests
   ## Best Practices
   ```

2. **For Each Test File, Include**:
   - **Purpose statement**: What the component does
   - **Test statistics**: Number of tests per category
   - **Key test categories** with detailed explanations
   - **Complete code snippets** for every test case
   - **Reasoning explanations** for why each test exists
   - **Educational comments** explaining testing concepts

3. **Detailed Code Examples**:
   - Show the ACTUAL test code, not just descriptions
   - Include full test functions with setup, action, assertion
   - Add inline comments explaining testing logic
   - Show proper mocking patterns
   - Demonstrate error handling approaches

4. **Educational Content**:
   - **Mocking Strategy**: Why mock everything, how to mock properly
   - **Test Categories**: Explain different types of tests needed
   - **Best Practices**: Professional testing standards
   - **Common Patterns**: Reusable testing approaches
   - **Troubleshooting**: Common issues and solutions

5. **Running Instructions**:
   - Command reference for running tests
   - Development workflow tips
   - Coverage and debugging options
   - CI/CD considerations

6. **University Student Focus**:
   - Clear explanations of testing concepts
   - Real-world applicable patterns
   - Copy-paste ready examples
   - Professional development preparation
   - Interview-ready testing knowledge

**Format Requirements**:
- Use clear markdown formatting
- Include syntax-highlighted code blocks
- Add table of contents with links
- Use consistent heading structure
- Include command examples in code blocks
- Add explanatory text between code sections

**Content Tone**:
- Educational and approachable
- Professional but accessible
- Focused on learning outcomes
- Practical and actionable
- Comprehensive but not overwhelming

Please create a complete testing guide that serves as both documentation and a comprehensive learning resource for React component testing.
```

---

## Test Verification Prompt

Use this prompt to ensure your tests are working correctly:

```
I need help verifying and fixing the unit tests I created. Please ensure all tests pass and follow best practices.

**Test Files to Verify**:
- [LIST_TEST_FILES]

**Verification Requirements**:

1. **Test Execution**:
   - Run all tests using: `npm run test:frontend:success:run`
   - Ensure 100% pass rate
   - Fix any failing tests
   - Address timeout or performance issues

2. **Code Quality Checks**:
   - Verify all mocks are properly implemented
   - Check TypeScript types are correct
   - Ensure imports are valid and used
   - Validate test data matches component expectations

3. **Best Practices Compliance**:
   - All external dependencies mocked
   - No real API calls or database connections
   - Proper cleanup in beforeEach/afterEach
   - Isolated unit tests (no integration)
   - Clear and descriptive test names

4. **Mock Validation**:
   - Custom hooks properly mocked
   - Child components mocked for isolation
   - Third-party libraries mocked
   - Icons and UI components mocked
   - Mock data realistic and complete

5. **Test Coverage Review**:
   - All component functions tested
   - Error scenarios covered
   - Edge cases included
   - User interactions tested
   - Loading and empty states verified

6. **Educational Value**:
   - Tests are easy to understand
   - Comments explain complex logic  
   - Patterns are consistent and reusable
   - Examples suitable for learning

**Fix Common Issues**:
- Mock setup problems
- Import/export errors
- TypeScript type mismatches
- Test data inconsistencies
- Async operation handling
- Component rendering issues

**Output Requirements**:
- List any issues found and fixes applied
- Confirm all tests pass
- Provide final test statistics
- Suggest any improvements or optimizations

Please verify the tests work correctly and provide feedback on quality and completeness.
```

---

## Usage Examples

### Example 1: Testing a Form Component

```
Component Analysis Prompt Usage:
"I need help analyzing a React component for comprehensive unit testing.

**Component**: UserRegistrationForm (located at src/components/forms/UserRegistrationForm.tsx)

**Requirements**: [Use full Component Analysis Prompt above]

**Context**: This component is part of a job matching application using React, TypeScript, Supabase, and React Hook Form. The testing framework is Vitest with React Testing Library."
```

### Example 2: Testing a Dashboard Widget

```
Unit Test Creation Prompt Usage:
"I would like to create comprehensive unit test cases for a React component.

**Component Details**:
- **Component Name**: NotificationWidget
- **File Location**: src/components/widgets/NotificationWidget.tsx
- **Dependencies**: useNotifications hook, react-query, date-fns
- **Custom Hooks Used**: useNotifications, useAuth
- **Child Components**: NotificationItem, LoadingSpinner, EmptyState

[Continue with full Unit Test Creation Prompt above]"
```

### Example 3: Creating Documentation

```
Documentation Generation Prompt Usage:
"Help me create a comprehensive markdown documentation guide for the unit tests I just created.

**Test Files Created**:
- NotificationWidget.test.tsx (18 tests)
- NotificationItem.test.tsx (12 tests)
- NotificationSettings.test.tsx (15 tests)

**Component Information**:
- **Main Component**: NotificationWidget
- **Related Components**: NotificationItem, NotificationSettings, LoadingSpinner
- **Technology Stack**: React, TypeScript, React Query, Vitest, React Testing Library
- **Testing Framework**: Vitest + React Testing Library

[Continue with full Documentation Generation Prompt above]"
```

---

## Customization Guidelines

### For Different Component Types:

1. **Form Components**:
   - Add validation testing requirements
   - Include submission handling tests
   - Test field interaction and state management

2. **Data Display Components**:
   - Focus on data formatting tests
   - Include loading and empty state scenarios
   - Test sorting, filtering, pagination

3. **Navigation Components**:
   - Test route changes and navigation
   - Include accessibility and keyboard navigation
   - Test active state management

4. **Modal/Dialog Components**:
   - Test open/close functionality
   - Include backdrop click handling
   - Test focus management and accessibility

### For Different Testing Frameworks:

- **Jest**: Replace `vi.mock` with `jest.mock`
- **Enzyme**: Adjust rendering and querying methods
- **Cypress**: Modify for E2E testing patterns

### For Different Tech Stacks:

- **Next.js**: Add router mocking requirements
- **Redux**: Include store mocking and state testing
- **GraphQL**: Add query and mutation mocking
- **Material-UI**: Include theme provider mocking

---

## Best Practices for Using These Prompts

1. **Start with Component Analysis**: Always analyze before coding
2. **Customize for Your Stack**: Adjust technology-specific requirements
3. **Be Specific**: Replace placeholder values with actual component details
4. **Iterate and Refine**: Use verification prompt to improve quality
5. **Document Everything**: Create guides for future reference
6. **Share Patterns**: Use consistent approaches across projects

These prompts will help you create professional-quality test suites that are both comprehensive and educational!