# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## File Tree Structure

```
optistaff-frontend/
├── eslint.config.js
├── index.html
├── README.md
├── public/
│   ├── fonts/
│   ├── icons/
│   └── images/
└── src/
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── styles.css
    ├── components/
    │   ├── CircleButton.tsx
    │   ├── IconButton.tsx
    │   ├── NavItem.tsx
    │   └── ShiftCard.tsx
    ├── pages/
    │   ├── ClientLayout.tsx
    │   ├── JSLayout.tsx
    │   ├── LandingPage.tsx
    │   ├── Login.tsx
    │   ├── ProtectedRoute.tsx
    │   ├── Signup.tsx
    │   ├── employee/
    │   │   ├── JSDashboard.tsx
    │   │   ├── JSNav.tsx
    │   │   └── JSPref.tsx
    │   └── employer/
    │       ├── ClientDashboard.tsx
    │       ├── ClientNav.tsx
    │       └── ClientRoster.tsx
    └── types/
        ├── components.ts
        └── navigation.ts
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
