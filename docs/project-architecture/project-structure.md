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
- **`ProtectedRoute.tsx`**: Route protection based on authentication
- **`AuthDebugger.tsx`**: Development authentication debugging component
- **`NavItem.tsx`**: Navigation item component for sidebars

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
- **`PreferencesForm.tsx`**: Job seeker preferences form
- **`ProgressIndicator.tsx`**: Multi-step progress indicator

#### Authentication Components (`src/components/auth/`)
- **`AuthHeader.tsx`**: Authentication page header
- **`AuthFooter.tsx`**: Authentication page footer
- **`AuthFormFields.tsx`**: Common form fields for auth
- **`FormField.tsx`**: Individual form field component
- **`UserTypeToggle.tsx`**: Toggle between employer/job seeker

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
- **`usePreferences.tsx`**: Job seeker preferences management

**Scheduling & Availability:**
- **`useAvailability.tsx`**: Availability data management
  - Calendar integration
  - Time slot management
  - Availability saving and retrieval
- **`useShifts.tsx`**: Shift data management and operations
  - Shift listing and filtering
  - Shift assignment operations

**Business Operations:**
- **`useAssignments.tsx`**: Job assignment management
- **`usePayouts.tsx`**: Payment and payout tracking
- **`useFeedback.tsx`**: User feedback and rating system

### Pages (`src/pages/`)

#### Public Pages
- **`LandingPage.tsx`**: Homepage with company showcase
- **`Auth.tsx`**: Unified authentication page
- **`Login.tsx`**: Dedicated login page
- **`Signup.tsx`**: User registration page

#### Layout Components
- **`ClientLayout.tsx`**: Layout wrapper for employer pages
- **`JSLayout.tsx`**: Layout wrapper for job seeker pages
- **`ProtectedRoute.tsx`**: Route protection wrapper

#### Employer Pages (`src/pages/employer/`)
- **`ClientDashboard.tsx`**: Employer dashboard overview
- **`ClientNav.tsx`**: Employer navigation sidebar
- **`ClientRoster.tsx`**: Staff roster management
- **`UploadJobs.tsx`**: Job posting interface

#### Employee/Job Seeker Pages (`src/pages/employee/`)
- **`JSDashboard.tsx`**: Job seeker dashboard
- **`JSNav.tsx`**: Job seeker navigation sidebar
- **`JSPref.tsx`**: Job seeker preferences management

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

### Type Definitions (`src/types/`)

- **`components.ts`**: Component prop interfaces
- **`navigation.ts`**: Navigation-related types

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
- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run build:dev`: Development build
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

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

### Recent Major Updates (July 2025)

#### Authentication System Overhaul
- **Complete authentication refactor** with modern React patterns
- **New authentication components** in `src/components/auth/` directory
- **Enhanced useAuth hook** with real-time state management and role caching
- **Unified Auth.tsx page** replacing separate login/signup flows
- **Role-based routing** with automatic redirection based on user type
- **Authentication debugging tools** for development workflow
- **Performance optimizations** with localStorage role caching
- **Timeout protection** for database queries to prevent infinite loading
- **Cross-tab session management** with proper authentication state synchronization

#### Hooks Architecture Implementation
- **Comprehensive custom hooks** for all major business logic
- **Availability management** with calendar integration
- **Shift management** system with advanced filtering
- **User profile and preferences** management
- **Assignment and payout** tracking systems
- **Feedback system** implementation

#### UI Component System Enhancement
- **Radix UI integration** for accessible component primitives
- **shadcn/ui style components** for consistent design system
- **Enhanced form components** with better validation
- **Improved navigation components** with role-based visibility
- **Better loading states** and error handling throughout

#### Integration Improvements
- **Supabase client optimization** with proper error handling
- **Real-time subscription management** for live data updates
- **Environment-based configuration** for different deployment stages
- **Enhanced security** with proper route protection

### Branch Status
- **Current Branch**: `devnew`
- **Integration Status**: 99% complete
- **Database Schema**: Fully implemented with all business logic
- **Major Features**: Authentication, Availability Templates, Advanced Shift Management, Job Classification
- **Ready for**: Production deployment and advanced feature development
- **Recent Migrations**: 14 migrations applied (July 2025)

#### Latest Updates (July 22, 2025)
- **Authentication System Fixes**: Resolved infinite loading issues on employer portal pages
- **Role Caching Implementation**: Added localStorage-based role caching to prevent unnecessary database queries
- **Navigation Improvements**: Fixed page refresh redirects to maintain current page context
- **Protected Route Enhancements**: Improved error handling and loading states
- **Session Management**: Enhanced cross-tab authentication behavior with proper session isolation

### Database Migration History
Latest migrations include:
- Enhanced user registration fields
- Job categories and types system
- Status standardization
- Availability templates
- Postal code validation
- Advanced matching algorithm support

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

*This documentation reflects the current project structure as of July 14, 2025, including recent major updates to authentication system, hooks architecture, and UI components. The project is in active development with significant progress in core functionality implementation.*
