# OptiStaff - Workforce Management Platform

OptiStaff is a comprehensive React-based workforce management platform that connects employers with job seekers for efficient shift-based work scheduling. Built with modern web technologies and powered by Supabase for real-time data management.

## 🚀 Technology Stack

- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Authentication + Real-time)
- **Styling**: Tailwind CSS 4.x with custom theming
- **State Management**: TanStack React Query for server state
- **UI Components**: Radix UI primitives + shadcn/ui components
- **Maps**: Leaflet for location-based features
- **Build Tool**: Vite with optimized development workflow

## 🏗️ Architecture Overview

### Frontend Architecture

- **Component-Based**: Modular React components with TypeScript
- **Custom Hooks**: Domain-specific logic (useAuth, useShifts, useAvailability)
- **Role-Based Routing**: Separate layouts for employers and job seekers
- **Real-time Updates**: Live data synchronization via Supabase subscriptions

### Backend Architecture (Supabase)

- **Dual User System**: Separate profiles for job seekers and clients
- **Automated Business Logic**: Database triggers for ratings, capacity management
- **Row Level Security**: Secure data access with RLS policies
- **Real-time Subscriptions**: Live updates for shifts and assignments

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd optistaff

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and anon key to .env

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📊 Database Schema

### Core Tables

- **`job_seekers`** - Employee profiles and ratings
- **`clients`** - Employer company information
- **`shifts`** - Job postings with scheduling details
- **`assignments`** - Links job seekers to specific shifts
- **`availability`** - Job seeker availability schedules
- **`preferences`** - Job seeker work preferences
- **`feedback`** - Bidirectional rating system
- **`payouts`** - Earnings tracking and payment records

### Status System

The platform uses an integer-based status system with a lookup table:

- **Shift Status**: 1 = OPEN, 2 = FILLED
- **Assignment Status**: 5 = CONFIRMED, 7 = CANCELLED_BY_USER, 8 = NO_SHOW, 9 = COMPLETED

## 🎯 Key Features

### For Job Seekers

- **Availability Management**: Calendar-based scheduling with templates
- **Job Preferences**: Set pay rates, travel distance, preferred roles
- **Shift Browsing**: View and apply for available shifts
- **Earnings Tracking**: Automated payout calculations
- **Rating System**: Build reputation through client feedback

### For Employers

- **Shift Management**: Create and manage job postings
- **Staff Matching**: Automated matching algorithm for job seekers
- **Roster Management**: Track staff assignments and capacity
- **Real-time Updates**: Live status updates for shift filling
- **Feedback System**: Rate job seeker performance

### Advanced Features

- **Smart Matching**: Algorithm considers pay rate, location, preferences, and ratings
- **Template System**: Reusable availability patterns
- **Automated Triggers**: Rating updates, capacity management, status changes
- **Location Integration**: Distance-based job matching
- **Real-time Notifications**: Live updates for assignments and status changes

## 📁 Project Structure

```
optistaff-main/
├── docs/                          # Project documentation
│   └── project-architecture/      # Architecture documentation
├── public/                        # Static assets
│   ├── fonts/                     # Montserrat font variants
│   ├── icons/                     # SVG/PNG icons
│   └── images/                    # Brand assets and graphics
├── src/                          # Source code
│   ├── components/               # Reusable UI components
│   │   ├── auth/                 # Authentication components
│   │   ├── ui/                   # Base UI components (shadcn/ui style)
│   │   ├── Calendar.tsx          # Calendar scheduling component
│   │   ├── Map.tsx              # Leaflet map integration
│   │   └── ProtectedRoute.tsx   # Route protection
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.tsx          # Authentication management
│   │   ├── useAvailability.tsx  # Availability scheduling
│   │   ├── useShifts.tsx        # Shift management
│   │   ├── useUserProfile.tsx   # User profile data
│   │   └── usePreferences.tsx   # Job seeker preferences
│   ├── integrations/            # External service integrations
│   │   └── supabase/           # Supabase client configuration
│   ├── pages/                   # Application pages
│   │   ├── auth/               # Authentication pages
│   │   ├── employee/           # Job seeker pages
│   │   ├── employer/           # Client/employer pages
│   │   └── LandingPage.tsx     # Homepage
│   ├── types/                  # TypeScript definitions
│   ├── utils/                  # Utility functions
│   └── lib/                    # Library utilities
├── supabase/                   # Supabase configuration
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Git Workflow Guide for Team

### Branch Strategy for Incremental Development

Based on our file structure, create branches that align with specific pages/features for easier testing and merging:

### Page-Based Branches

- **`page/landing`** - Work on `src/pages/LandingPage.tsx`
- **`page/login`** - Work on `src/pages/Login.tsx`
- **`page/signup`** - Work on `src/pages/Signup.tsx`
- **`page/employee-dashboard`** - Work on `src/pages/employee/JSDashboard.tsx`
- **`page/employee-preferences`** - Work on `src/pages/employee/JSPref.tsx`
- **`page/client-dashboard`** - Work on `src/pages/employer/ClientDashboard.tsx`
- **`page/client-roster`** - Work on `src/pages/employer/ClientRoster.tsx`

## File Structure Guide

### `src/pages/` - Main Application Pages

**What it's for:** Complete page components that users navigate to

- **`LandingPage.tsx`** - Homepage/welcome page
- **`Login.tsx`** - User authentication page
- **`Signup.tsx`** - User registration page
- **`ProtectedRoute.tsx`** - Route protection logic
- **`ClientLayout.tsx`** - Layout wrapper for employer pages
- **`JSLayout.tsx`** - Layout wrapper for employee pages

### `src/pages/employee/` - Employee-Specific Pages

**What it's for:** Pages that only employees can access

- **`JSDashboard.tsx`** - Employee main dashboard
- **`JSNav.tsx`** - Employee navigation component
- **`JSPref.tsx`** - Employee preferences/settings page

### `src/pages/employer/` - Employer-Specific Pages

**What it's for:** Pages that only employers/clients can access

- **`ClientDashboard.tsx`** - Employer main dashboard
- **`ClientNav.tsx`** - Employer navigation component
- **`ClientRoster.tsx`** - Staff scheduling and roster management

### `src/components/` - Reusable Components

**What it's for:** Shared UI components used across multiple pages

- **`CircleButton.tsx`** - Circular button component
- **`IconButton.tsx`** - Button with icon component
- **`NavItem.tsx`** - Navigation menu item component
- **`ShiftCard.tsx`** - Display shift information card

### `src/types/` - TypeScript Definitions

**What it's for:** Type definitions and interfaces

- **`components.ts`** - Component prop types and interfaces
- **`navigation.ts`** - Navigation-related types

### `public/` - Static Assets

**What it's for:** Images, fonts, and other static files

- **`public/fonts/`** - Montserrat font files for consistent typography
- **`public/icons/`** - SVG and PNG icons for UI elements
- **`public/images/`** - Brand assets like the OptiStaff logo

## Where to Add Your Code

### Working on a New Employee Feature?

→ Create files in `src/pages/employee/`
→ Add shared components to `src/components/`
→ Update types in `src/types/components.ts`

### Working on a New Employer Feature?

→ Create files in `src/pages/employer/`
→ Add shared components to `src/components/`
→ Update types in `src/types/components.ts`

### Creating Reusable Components?

→ Add to `src/components/`
→ Define props in `src/types/components.ts`
→ Import and use in page components

### Adding New Assets?

→ Icons: `public/icons/`
→ Images: `public/images/`
→ Fonts: `public/fonts/`

## Incremental Workflow Model

1. **Pick a page/feature** from the file structure
2. **Create a branch** for that specific page (e.g., `page/client-roster`)
3. **Work only on that page** and its related components
4. **Test the page** thoroughly in isolation
5. **Merge to develop** once the page is complete and tested
6. **Move to the next page/feature**

This approach ensures each page can be developed, tested, and integrated independently!
