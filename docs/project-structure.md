# OptiStaff Project Structure Documentation

## Project Overview

**OptiStaff** is a React-based web application for staff scheduling and workforce management, built with TypeScript and Vite. The platform connects employers with job seekers, allowing for efficient shift management, availability tracking, and job assignment.

### Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 
- **State Management**: TanStack React Query (v5.56.2)
- **Styling**: Tailwind CSS 4.x with custom theming
- **Backend**: Supabase (Authentication & Database)
- **Routing**: React Router DOM v6.26.2
- **Maps**: Leaflet & React Leaflet
- **UI Components**: Radix UI primitives
- **Date Handling**: date-fns v3.6.0

## Root Directory Structure

```
optistaff-main/
├── docs/                          # Project documentation
├── public/                        # Static assets
├── src/                          # Source code
├── supabase/                     # Supabase configuration
├── tests/                        # Test files
├── package.json                  # Project dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
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
- **`Availability.tsx`**: Availability management interface
- **`Calendar.tsx`**: Calendar view for scheduling
- **`CalendarEvent.tsx`**: Individual calendar event component
- **`Map.tsx`**: Interactive map using Leaflet for location selection
- **`ProtectedRoute.tsx`**: Route protection based on authentication

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

- **`useAuth.tsx`**: Authentication state management
  - User login/logout
  - Session management
  - Role-based access control
- **`useAvailability.tsx`**: Availability data management
- **`useShifts.tsx`**: Shift data management and operations

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

- **`supabase/client.ts`**: Supabase client configuration
  - Database connection
  - Authentication setup
  - Real-time subscriptions

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

*This documentation reflects the current project structure as of July 2025. Please update as the project evolves.*
