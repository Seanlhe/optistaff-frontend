# OptiStaff - Modern Staffing & Job Matching Platform

> A React + TypeScript application built with Vite and Supabase for connecting job seekers with employers in the service industry.

## 🌟 Overview

OptiStaff is a comprehensive staffing platform designed to streamline the connection between job seekers and employers, particularly in service industries like hospitality, retail, and food service. The platform features real-time job matching, user authentication, and comprehensive dashboards for both job seekers and employers.

## 💻 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI Components
- **Backend**: Supabase (PostgreSQL + Authentication + Real-time)
- **State Management**: TanStack React Query
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Testing**: Cypress (E2E)

## 📁 Project Structure

```
optistaff-main/
├── public/                     # Static assets
│   ├── fonts/                 # Custom fonts (Montserrat)
│   └── icons/                 # App icons
├── src/
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/
│   │   └── supabase/         # Supabase client configuration
│   ├── lib/                   # Utility functions and configurations
│   ├── pages/                 # Application pages/routes
│   │   ├── employer/         # Employer-specific pages
│   │   ├── jobseeker/        # Job seeker-specific pages
│   │   ├── Auth.tsx          # Authentication page
│   │   ├── Index.tsx         # Landing page
│   │   ├── Profile.tsx       # User profile page
│   │   └── NotFound.tsx      # 404 page
│   ├── types/                 # TypeScript type definitions
│   └── styles/               # Global styles and CSS
├── supabase/                  # Supabase configuration
│   ├── functions/            # Edge functions
│   ├── migrations/           # Database migrations
│   └── config.toml          # Supabase project config
├── tests/                     # Test files
│   └── e2e/                 # End-to-end tests
└── docs/                     # Documentation files
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Supabase account** (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd optistaff-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   > **Note**: Get these values from your Supabase project dashboard at [supabase.com](https://supabase.com)

4. **Database Setup**
   
   If you have Supabase CLI installed:
   ```bash
   # Link to your Supabase project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build for development environment
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🏗️ Key Features

### Authentication System
- **Dual Registration**: Separate signup flows for job seekers and employers
- **Secure Authentication**: Powered by Supabase Auth
- **Role-based Access**: Different dashboards and permissions for user types

### Job Seeker Features
- **Profile Management**: Personal information and contact details
- **Job Search**: Browse and filter available positions
- **Application Tracking**: Monitor application status

### Employer Features
- **Company Profile**: Manage company information and branding
- **Job Posting**: Create and manage job listings
- **Candidate Management**: Review and manage job applications

### Real-time Features
- **Live Updates**: Real-time job posting updates
- **Instant Notifications**: Application status changes
- **Dynamic Dashboard**: Live data updates without page refresh

## 🗄️ Database Schema

The application uses the following main database tables:

- **`job_seekers`**: Job seeker profiles and information
- **`clients`**: Employer/company profiles
- **`jobs`**: Job postings and requirements
- **`applications`**: Job applications and status tracking

> **Note**: Full database schema and migrations are available in the `supabase/migrations/` directory.

## 🔐 Authentication Flow

1. **User Registration**: Users choose between job seeker or employer registration
2. **Profile Creation**: Minimal required information collected during signup
3. **Email Verification**: Supabase handles email confirmation
4. **Dashboard Access**: Users redirected to role-appropriate dashboard

### Required Fields by User Type

**Job Seekers**:
- First Name, Last Name, Email, Password
- Phone Number (optional)

**Employers**:
- First Name, Last Name, Email, Password, Company Name

## 🎨 UI/UX Design

- **Modern Design**: Clean, professional interface using Radix UI components
- **Responsive Layout**: Mobile-first design approach
- **Accessible**: Built with accessibility standards in mind
- **Dark/Light Mode**: Theme switching capability (if implemented)

## 🧪 Testing

Run end-to-end tests with Cypress:

```bash
npm run test:e2e
```

Tests cover:
- User registration flows
- Authentication processes
- Core user journeys
- Cross-browser compatibility

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The `dist/` folder contains the production-ready files.


### Environment Variables

Ensure production environment has:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 📈 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Optimized images and fonts
- **Caching**: Intelligent browser caching strategies

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured for React and TypeScript best practices
- **Prettier**: Automatic code formatting (if configured)

### Component Architecture
- **Functional Components**: React hooks-based architecture
- **Custom Hooks**: Reusable logic extraction
- **Component Composition**: Radix UI component composition patterns



## Recent Changes

### Added Calendar Components (Jovita)
- **Added a Calendar Component**
  - Created `src/components/Calendar.tsx` as a reusable weekly calendar.
  - Uses `date-fns` for date calculations and formatting.
  - Uses Lucide icons for navigation arrows.

- **Configured Import Aliases**
  - Updated `tsconfig.app.json` to include:
    ```json
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
    ```

- **Set Up shadcn/ui**
  - Initialized shadcn/ui for component styling.
  - Chose the "New York" style theme. Theme color : Zinc
