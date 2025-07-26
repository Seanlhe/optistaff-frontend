# Testing Framework Configuration

## Vitest Configuration Files

The Vitest JSON configuration can be found in the following TypeScript configuration files:

### Main Configuration
- **vitest.config.ts** - General test configuration with support for all test types

### Specialized Configurations
- **vitest.frontend.config.ts** - Frontend-specific tests (UI components, mocking setup)
- **vitest.backend.config.ts** - Backend-specific tests (database operations, integrations)

## Testing Tools Integration

### Vitest
**Purpose**: Primary test runner and assertion library
**Key Features**:
- Fast execution with native ESM support
- Excellent TypeScript integration
- Compatible with Jest API
- Built-in code coverage
**Selection Rationale**: Performance, modern JavaScript support, seamless Vite integration

### React Testing Library
**Purpose**: Component testing utilities
**Key Features**:
- User-centric testing approach
- Excellent accessibility support
- Encourages best practices
- Strong community adoption
**Selection Rationale**: Focuses on user interactions rather than implementation details

### Jest DOM
**Purpose**: Extended DOM matchers for assertions
**Key Features**:
- Semantic HTML assertions
- Accessibility-focused matchers
- Clear error messages
**Selection Rationale**: Improves test readability and provides meaningful assertions