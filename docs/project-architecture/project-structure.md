# OptiStaff Project Structure Documentation

## Project Overview

**OptiStaff** is a React-based web application for staff scheduling and workforce management, built with TypeScript and Vite. The platform connects employers with job seekers, allowing for efficient shift management, availability tracking, and job assignment.

### Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite with optimized development workflow
- **State Management**: TanStack React Query (v5.56.2) for server state
- **Styling**: Tailwind CSS 4.x with custom theming and utility classes
- **Backend**: Supabase (Authentication, Database & Real-time subscriptions)
- **Routing**: React Router DOM v6.26.2 with protected routes
- **Maps**: Leaflet & React Leaflet for interactive location features
- **UI Components**: Radix UI primitives for accessible component foundation
- **Date Handling**: date-fns v3.6.0 for date manipulation and formatting
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx, tailwind-merge for className management
- **Testing**: Vitest with comprehensive test configurations for frontend and backend
- **Charts**: MUI X-Charts for data visualization
- **File Upload**: React Dropzone for file handling

## Root Directory Structure

```
optistaff-main/
├── docs/                          # Project documentation & planning
├── public/                        # Static assets
├── src/                          # Source code
├── supabase/                     # Supabase configuration
├── tests/                        # Test files (placeholder)
├── package.json                  # Project dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint configuration
└── README.md                    # Project readme
```

## Source Code Architecture (`src/`)

### Application Entry Point

- **`main.tsx`**: Application entry point with React DOM mounting
- **`App.tsx`**: Main app component with routing and React Query setup
- **`index.css`**: Global styles import
- **`styles.css`**: Custom CSS styles and theme definitions

### Components (`src/components/`)

#### Core Components

- **`Availability.tsx`**: Availability management interface with calendar integration
- **`Calendar.tsx`**: Calendar view for scheduling with useAvailability hook integration
- **`CalendarEvent.tsx`**: Individual calendar event component
- **`Map.tsx`**: Interactive map using Leaflet for location selection
- **`LocationAwareMap.tsx`**: Enhanced map with location awareness
- **`ProtectedRoute.tsx`**: Route protection based on authentication
- **`NavItem.tsx`**: Navigation item component for sidebars
- **`MonthlyCalendar.tsx`**: Monthly calendar view component

#### UI Components (`src/components/ui/`)

- **`button.tsx`**: Reusable button component with variants
- **`card.tsx`**: Card container component
- **`input.tsx`**: Form input component
- **`label.tsx`**: Form label component
- **`alert.tsx`**: Alert/notification component

#### Interactive Components

- **`CircleButton.tsx`**: Circular icon button
- **`IconButton.tsx`**: Button with icon and text
- **`ShiftCard.tsx`**: Display component for shift information
- **`ToggleSwitchButton.tsx`**: Toggle switch for preferences
- **`CustomInputField.tsx`**: Custom form input with validation
- **`CustomSelect.tsx`**: Custom select dropdown component
- **`CustomTextArea.tsx`**: Custom textarea component
- **`PreferencesForm.tsx`**: Job seeker preferences form
- **`ProgressIndicator.tsx`**: Multi-step progress indicator

#### Authentication Components (`src/components/auth/`)

- **`AuthHeader.tsx`**: Authentication page header
- **`AuthFooter.tsx`**: Authentication page footer
- **`AuthFormFields.tsx`**: Common form fields for auth
- **`UserTypeToggle.tsx`**: Toggle between employer/job seeker

#### Calendar Components

- **`ClientCalendarDay.tsx`**: Calendar day view for employers
- **`ClientCalendarHeader.tsx`**: Calendar header for employers
- **`EmployeeCalendarDay.tsx`**: Calendar day view for employees
- **`EmployeeCalendarHeader.tsx`**: Calendar header for employees

#### Card Components

- **`StatsCard.tsx`**: Statistics display card
- **`DashboardShiftCard.tsx`**: Shift card for dashboard
- **`ClientShiftCard.tsx`**: Shift card for client view
- **`EmployeeShiftCard.tsx`**: Shift card for employee view
- **`JobseekerAssignmentCard.tsx`**: Assignment card for job seekers
- **`PayoutTotalSummaryCard.tsx`**: Total payout summary
- **`PayoutWeeklySummaryCard.tsx`**: Weekly payout summary
- **`PersonalInfoCard.tsx`**: Personal information display
- **`ProfileDisplayCard.tsx`**: Profile information display
- **`AccountSettingsCard.tsx`**: Account settings interface

#### Detail Components

- **`ClientShiftDetails.tsx`**: Detailed shift view for clients
- **`EmployeeShiftDetails.tsx`**: Detailed shift view for employees
- **`JobseekerAssignmentDetailModals.tsx`**: Assignment detail modals

#### Form Components

- **`DateInput.tsx`**: Date input component
- **`PasswordField.tsx`**: Password input with validation
- **`ConfirmPasswordField.tsx`**: Password confirmation field
- **`AddressLookupField.tsx`**: Address lookup with geocoding

#### Preferences Components

- **`PreferencesJobType.tsx`**: Job type selection
- **`PreferencesPay.tsx`**: Pay rate preferences
- **`PreferencesMaximum.tsx`**: Maximum hours/travel preferences

#### Dialog Components

- **`SaveOptionsDialog.tsx`**: Save options dialog
- **`TemplateNameDialog.tsx`**: Template naming dialog
- **`TemplateSelectDialog.tsx`**: Template selection dialog
- **`UploadModal.tsx`**: File upload modal

#### Job Creation Components (`src/components/job-creation/`)

- Job creation specific components for employers

#### Settings Components (`src/components/settings/`)

- Settings page specific components

#### Error Handling

- **`LocationErrorBoundary.tsx`**: Error boundary for location features

### Custom Hooks (`src/hooks/`)

**Authentication & User Management:**

- **`useAuth.tsx`**: Authentication state management
  - User login/logout with role caching
  - Session management with timeout protection
  - Role-based access control with localStorage persistence
  - Real-time auth state synchronization across tabs
  - Database query optimization with cache-first approach
  - Graceful error handling and fallback mechanisms
- **`useUserProfile.tsx`**: User profile data management
- **`usePreferences.tsx`**: Job seeker preferences management with location integration
- **`usePreferencesForm.tsx`**: Form-specific preferences logic
- **`usePreferencesLocation.tsx`**: Location-specific preferences handling

**Scheduling & Availability:**

- **`useAvailability.tsx`**: Availability data management
  - Calendar integration
  - Time slot management
  - Availability saving and retrieval
- **`useAvailabilityTemplate.tsx`**: Template-based availability management
- **`useShifts.tsx`**: Shift data management and operations
  - Shift listing and filtering
  - Shift assignment operations

**Business Operations:**

- **`useAssignments.tsx`**: Job assignment management
- **`usePayouts.tsx`**: Payment and payout tracking
- **`useFeedback.tsx`**: User feedback and rating system
- **`useJobTypes.tsx`**: Job type and category management

**Location & Geocoding:**

- **`useLocationGeocoding.tsx`**: Geocoding services integration
- **`useAddressLookup.tsx`**: Address lookup and validation

### Pages (`src/pages/`)

#### Public Pages

- **`LandingPage.tsx`**: Homepage with company showcase
- **`Auth.tsx`**: Unified authentication page

#### Layout Components

- **`ClientLayout.tsx`**: Layout wrapper for employer pages
- **`JSLayout.tsx`**: Layout wrapper for job seeker pages
- **`ProtectedRoute.tsx`**: Route protection wrapper

#### Employer Pages (`src/pages/employer/`)

- **`ClientRoster.tsx`**: Staff roster management with calendar view
- **`UploadJobs.tsx`**: Job posting interface
- **`UploadCSV.tsx`**: Bulk job upload via CSV
- **`ClientDbContainer.tsx`**: Dashboard container component
- **`ClientHistory.tsx`**: Historical data view
- **`ClientSettings.tsx`**: Employer settings page
- **`ClientEdit.tsx`**: Shift editing interface

#### Employee/Job Seeker Pages (`src/pages/employee/`)

- **`JSDashboard.tsx`**: Job seeker dashboard with assignments
- **`JSPref.tsx`**: Job seeker preferences management
- **`JSSchedule.tsx`**: Schedule management interface
- **`JSSettings.tsx`**: Job seeker settings
- **`EmployeeHistory.tsx`**: Assignment history view

#### Alternative Employee Structure (`src/pages/jobseeker/`)

- **`Preferences.tsx`**: Alternative preferences component

### Integrations (`src/integrations/`)

#### Supabase Integration (`src/integrations/supabase/`)

- **`client.ts`**: Supabase client configuration
  - Database connection setup
  - Authentication configuration
  - Real-time subscriptions
  - Environment-based configuration

### Utilities (`src/utils/`)

- **`authentication.tsx`**: Authentication helper functions
  - Email validation
  - Password validation
  - Security utilities
- **`uploadjobs.tsx`**: Job upload utility functions
  - Time validation
  - Form validation helpers
- **`field-validation.tsx`**: Form field validation utilities
- **`preferencesValidator.ts`**: Preferences validation logic
- **`clientShifts.ts`**: Client-side shift management utilities
- **`JSShifts.ts`**: Job seeker shift utilities
- **`locationErrorHandler.ts`**: Location error handling
- **`review.tsx`**: Review and feedback utilities

### Type Definitions (`src/types/`)

- **`components.ts`**: Component prop interfaces
- **`navigation.ts`**: Navigation-related types
- **`database.ts`**: Supabase database type definitions (auto-generated)
- **`hooks.ts`**: Hook-specific type definitions and interfaces
- **`google-maps.d.ts`**: Google Maps API type declarations

### Library Utilities (`src/lib/`)

- **`utils.ts`**: Common utility functions (className merging with clsx/tailwind-merge)

## Public Assets (`public/`)

### Images (`public/images/`)

- Company logos: capitaland.svg, fourseasons.svg, marriot.svg, mercure.svg, sats.svg, tripdotcom.svg
- Application graphics: dashboard.svg, optistafflogo.svg

### Icons (`public/icons/`)

- Navigation icons: calendar.svg, clock.svg, person.svg, users.svg
- Feature icons: analytics.png, notifications.svg, gearicon.svg, dooricon.svg
- Action icons: uploadicon.svg, quotationicon.svg

### Fonts (`public/fonts/`)

- Montserrat font family variants: Bold, Italic, Medium, SemiBold

## Documentation (`docs/`)

### Project Documentation Files

- **`project-structure.md`**: This comprehensive project structure documentation
- **`auth-page-enhancement-plan.md`**: Detailed plan for authentication page enhancements with Google Maps integration
- **`comprehensive-integration-plan.md`**: Full integration strategy and implementation plan
- **`integration-completion-status.md`**: Current status of integration work and progress tracking
- **`integration-changes-log.md`**: Log of all integration changes and modifications

### Development Branch Documentation

- **`dev-hooks-auth-branch-changes.md`**: Changes and updates in the authentication hooks development branch
- **`dev-hooks-avail-branch-changes.md`**: Availability management development branch documentation
- **`dev-hooks-useShifts-documentation.md`**: Shift management hooks development documentation
- **`useShifts-merge-demo-branch.md`**: Demo branch merge documentation for shift management
- **`auth-debugging-guide.md`**: Authentication debugging and troubleshooting guide

## Configuration Files

### TypeScript Configuration

- **`tsconfig.json`**: Main TypeScript configuration
- **`tsconfig.app.json`**: Application-specific TypeScript settings
- **`tsconfig.node.json`**: Node.js environment TypeScript settings

### Build & Development Tools

- **`vite.config.ts`**: Vite build configuration with React, Tailwind, and SVG support
- **`eslint.config.js`**: ESLint configuration for code quality
- **`tailwind.config.js`** & **`tailwind.config.ts`**: Tailwind CSS configuration

## Key Features

### User Authentication

- Dual role system (Employer/Job Seeker)
- Supabase-powered authentication
- Protected routes based on user roles
- Session persistence

### Employer Features

- Dashboard with shift overview
- Staff roster management
- Job posting and management
- Real-time staff availability tracking

### Job Seeker Features

- Availability calendar management
- Job preferences setting
- Interactive location selection with maps
- Shift browsing and application

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Component-based UI architecture
- Consistent design system with Radix UI

## Development Workflow

### Available Scripts

**Development:**
- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run build:dev`: Development build
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

**Testing:**
- `npm run test`: Run all tests (frontend + backend)
- `npm run test:watch`: Run all tests in watch mode
- `npm run test:frontend`: Run frontend tests in watch mode
- `npm run test:frontend:run`: Run frontend tests once
- `npm run test:frontend:ui`: Run frontend tests with Vitest UI
- `npm run test:frontend:coverage`: Run frontend tests with coverage
- `npm run test:frontend:unit`: Run frontend unit tests
- `npm run test:backend`: Run backend tests (requires Supabase)
- `npm run test:backend:run`: Run backend tests once
- `npm run test:backend:ui`: Run backend tests with UI
- `npm run test:backend:coverage`: Run backend tests with coverage
- `npm run test:db-functions`: Run specific database function tests
- `npm run test:preferences`: Run preferences-related tests
- `npm run test:pure`: Run pure unit tests (no external dependencies)

### State Management

- React Query for server state management
- Local state with React hooks
- Custom hooks for domain-specific logic

### Data Flow

1. Authentication via Supabase
2. Protected routes based on user role
3. Role-specific layouts and navigation
4. Domain-specific pages and components
5. Real-time data synchronization

## Current Development Status

### Recent Major Updates (January 2025)

#### Database Schema Enhancements

- **Enhanced User Registration**: Complete field support for job seekers and clients
- **Comprehensive Testing Suite**: Extensive test coverage for database functions and frontend components
- **Status Standardization**: Integer-based status system with lookup table
- **Availability Templates**: Reusable scheduling patterns for job seekers
- **Advanced Matching Algorithm**: Smart job seeker-to-shift matching
- **Postal Code Validation**: 6-digit Singapore postal code constraints

#### Authentication System Implementation

- **Complete authentication system** with modern React patterns
- **Authentication components** in `src/components/auth/` directory
- **Enhanced useAuth hook** with real-time state management and role caching
- **Unified Auth.tsx page** with login/signup functionality
- **Role-based routing** with automatic redirection based on user type
- **Performance optimizations** with localStorage role caching
- **Timeout protection** for database queries to prevent infinite loading
- **Cross-tab session management** with proper authentication state synchronization

#### Comprehensive Hooks Architecture

- **Complete custom hooks** for all major business logic
- **Availability management** with calendar integration and templates
- **Shift management** system with advanced filtering and matching
- **User profile and preferences** management with enhanced fields
- **Assignment and payout** tracking systems with status management
- **Feedback system** implementation with bidirectional ratings
- **Location services** with geocoding and address lookup

#### UI Component System

- **Radix UI integration** for accessible component primitives
- **Comprehensive component library** with consistent design system
- **Enhanced form components** with validation
- **Calendar components** for both employers and employees
- **Card components** for data display
- **Modal and dialog components** for user interactions
- **Error handling components** with boundaries

#### Backend Integration

- **Supabase client optimization** with proper error handling
- **Real-time subscription management** for live data updates
- **Environment-based configuration** for different deployment stages
- **Enhanced security** with Row Level Security (RLS) policies
- **Automated business logic** with database triggers and functions
- **Advanced query functions** for reporting and analytics

### Current Development Status

- **Integration Status**: Production ready
- **Database Schema**: Fully implemented with comprehensive business logic
- **Major Features**: Authentication, Availability Management, Shift Management, Assignment Tracking, Payout System
- **Testing**: Comprehensive test suite with frontend and backend coverage
- **Ready for**: Production deployment and feature expansion
- **Recent Migrations**: Latest schema updates applied (January 2025)

#### Key Features Implemented

- **Authentication System**: Complete user registration and login with role-based access
- **Dashboard Views**: Separate dashboards for employers and job seekers
- **Shift Management**: Create, edit, and manage shifts with calendar views
- **Assignment System**: Job seeker assignment to shifts with status tracking
- **Preferences System**: Comprehensive job seeker preferences with location integration
- **Payout Tracking**: Earnings calculation and payout management
- **Feedback System**: Bidirectional rating system between employers and job seekers
- **Calendar Integration**: Monthly and weekly calendar views with shift visualization
- **Location Services**: Address lookup and geocoding integration
- **File Upload**: CSV upload for bulk job creation

### Database Migration History

Latest migrations include:

- Enhanced user registration fields
- Comprehensive database functions
- Status standardization
- Availability templates
- Postal code validation
- Advanced matching algorithm support
- Payout system implementation

---

## Future Considerations

### Potential Enhancements

- Add comprehensive testing setup
- Implement error boundary components
- Add internationalization (i18n)
- Enhance accessibility features
- Add performance monitoring
- Implement offline capabilities

### Scalability

- Consider state management library for complex state
- Implement code splitting for better performance
- Add monitoring and analytics
- Enhance error handling and logging

---

_This documentation reflects the current project structure as of January 2025, including comprehensive implementation of authentication system, hooks architecture, UI components, and testing infrastructure. The project is production-ready with full feature implementation._
