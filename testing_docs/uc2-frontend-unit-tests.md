**UC2: Sign In — Frontend Unit Tests**

Below are the frontend unit tests for UC2 documented using the established two‑column table format. Test IDs follow TC‑UC2‑U[step].[subtest], where [step] maps to steps in use_case_2_refactored_sequence.md. Tests are sorted by Test Case ID.

Notes:
- UC1 tests that provide overlapping coverage for UC2 are included (clearly labeled) to avoid duplication.
- Only steps explicitly shown in the UC2 sequence diagram are mapped (error mapping, role-based navigation, etc.).

---

| Test Case ID | TC-UC2-U1.1 |
| :---- | :---- |
| Feature | Navigate to /auth?mode=login renders login form |
| Component | Auth page (tests/frontendunit/uc2/Auth.uc2-login.test.tsx) |
| Test Description | Renders login mode UI and elements |
| Input | Render Auth with initialEntries=["/auth?mode=login"] |
| UC2 Steps Covered | Step 1 (Navigate), Step 2 (Display login form) |
| Assertions | Heading "Welcome Back" and "Sign in to your account" visible; email & password inputs present |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U2.1 |
| :---- | :---- |
| Feature | Form submission calls useAuth.login |
| Component | Auth page (tests/frontendunit/uc2/Auth.uc2-login.test.tsx) |
| Test Description | Submitting the form invokes login with form values |
| Input | Type email/password, click Sign In |
| UC2 Steps Covered | Step 3 (Submit); Step 4 (Controller called) |
| Assertions | login called with provided email and password |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U2.2 |
| :---- | :---- |
| Feature | Loading state on submit |
| Component | Login Form (tests/frontendunit/uc2/LoginFormIntegration.test.tsx) |
| Test Description | Button disabled and label shows loading during submission |
| Input | Submit form; mock pending promise |
| UC2 Steps Covered | Step 3 (Submit feedback) |
| Assertions | Button disabled; loading text visible during submit |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U2.3 |
| :---- | :---- |
| Feature | Email/password validation (basic) |
| Component | Login Form (tests/frontendunit/uc2/LoginFormIntegration.test.tsx) |
| Test Description | Validates required and email format before calling login |
| Input | Invalid/empty email; valid password |
| UC2 Steps Covered | Step 2 (Field validation) |
| Assertions | login not called on invalid email; required attributes present |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U3.1 |
| :---- | :---- |
| Feature | Error display: invalid credentials |
| Component | Auth/Login Form (tests/frontendunit/uc2/LoginErrorHandling.test.tsx) |
| Test Description | Shows error when hook exposes "Invalid credentials" |
| Input | Set hook error to mapped message |
| UC2 Steps Covered | Step 5 (Invalid credentials → display error) |
| Assertions | Error alert with "Invalid credentials" visible |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U3.2 |
| :---- | :---- |
| Feature | Error display: unverified email |
| Component | Auth/Login Form (tests/frontendunit/uc2/LoginErrorHandling.test.tsx) |
| Test Description | Shows error when hook exposes "Please verify your email" |
| Input | Set hook error to mapped message |
| UC2 Steps Covered | Step 6 (Unverified email → display error) |
| Assertions | Error alert with "Please verify your email" visible |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U4.1 |
| :---- | :---- |
| Feature | Component-level navigation completion (jobseeker) |
| Component | Auth page + Router (tests/frontendunit/uc2/Auth.navigation-flow.test.tsx) |
| Test Description | After successful login (job-seeker metadata), app navigates to preferences |
| Input | Mock supabase.auth.signInWithPassword success; submit form |
| UC2 Steps Covered | Step 7 (Valid → role), Step 8 (Navigate), Step 9 (Navigation complete) |
| Assertions | "Employee Preferences Page" rendered |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U4.2 |
| :---- | :---- |
| Feature | Component-level navigation completion (employer) |
| Component | Auth page + Router (tests/frontendunit/uc2/Auth.navigation-flow.test.tsx) |
| Test Description | After successful login (client/employer metadata), app navigates to dashboard |
| Input | Mock supabase.auth.signInWithPassword success; submit form |
| UC2 Steps Covered | Step 7, Step 8, Step 9 |
| Assertions | "Employer Dashboard Page" rendered |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U5.1 |
| :---- | :---- |
| Feature | Stay on login when error (invalid credentials) |
| Component | Auth page + Router (tests/frontendunit/uc2/Auth.stays-on-login-on-error.test.tsx) |
| Test Description | Error case does not navigate; mapped message displayed |
| Input | Mock signInWithPassword returns error "Invalid login credentials"; submit |
| UC2 Steps Covered | Step 5 (Error display); negative navigation (remain on Auth) |
| Assertions | "Welcome Back" remains; "Invalid credentials" visible; no destination page rendered |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U5.2 |
| :---- | :---- |
| Feature | Stay on login when error (unverified email) |
| Component | Auth page + Router (tests/frontendunit/uc2/Auth.stays-on-login-on-error.test.tsx) |
| Test Description | Error case does not navigate; mapped message displayed |
| Input | Mock signInWithPassword returns error "Email not confirmed"; submit |
| UC2 Steps Covered | Step 6 (Error display); negative navigation (remain on Auth) |
| Assertions | "Welcome Back" remains; "Please verify your email" visible; no destination page rendered |
| Test Type | Frontend Unit |

---

Cross‑coverage from UC1 (applies to UC2)

| Test Case ID | TC-UC2-U1.2 (UC1 shared) |
| :---- | :---- |
| Feature | Login form renders in login mode |
| Component | Auth page (tests/frontendunit/uc1/Auth.test.tsx) |
| Test Description | Verifies login mode renders correct headings and fields |
| Input | Render Auth with mode=login |
| UC2 Steps Covered | Step 1, Step 2 |
| Assertions | Login headings and fields exist |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U2.4 (UC1 shared) |
| :---- | :---- |
| Feature | Submission calls login with inputs |
| Component | Auth page (tests/frontendunit/uc1/Auth.test.tsx) |
| Test Description | Submitting login form calls login(email, password) |
| Input | Fill email/password and submit |
| UC2 Steps Covered | Step 3, Step 4 |
| Assertions | login called with typed values |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U2.5 (UC1 shared) |
| :---- | :---- |
| Feature | signInWithPassword invocation |
| Component | useAuth (tests/frontendunit/uc1/useAuth-functions.test.ts) |
| Test Description | login() calls supabase.auth.signInWithPassword with credentials |
| Input | Call login(email, password) |
| UC2 Steps Covered | Step 4 |
| Assertions | signInWithPassword called with email/password |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC2-U2.6 (UC1 shared) |
| :---- | :---- |
| Feature | Required fields present in login mode |
| Component | AuthFormFields (tests/frontendunit/uc1/AuthFormFields.test.tsx) |
| Test Description | Email and password fields marked required in login mode |
| Input | Render login mode fields |
| UC2 Steps Covered | Step 2 |
| Assertions | required attributes present |
| Test Type | Frontend Unit |

---

Run instructions (Frontend Unit / UC2)

- Run only UC2 frontend unit tests:
  - npm run test:frontend:run -- tests/frontendunit/uc2
- Run UC2 frontend unit tests plus UC1 shared tests:
  - npm run test:frontend:run -- tests/frontendunit/uc2 tests/frontendunit/uc1/Auth.test.tsx tests/frontendunit/uc1/useAuth-functions.test.ts tests/frontendunit/uc1/AuthFormFields.test.tsx
- Open interactive UI:
  - npm run test:frontend:ui

All tests map to the explicit UC2 sequence steps only; implementation-specific details beyond the diagram are excluded.
