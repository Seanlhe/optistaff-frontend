**UC2: Sign In — Integration Tests**

Below are the integration tests for UC2 documented using the established two‑column table format. Test IDs follow TC‑UC2‑I[step‑range].[subtest], where [step‑range] maps to steps in use_case_2_refactored_sequence.md. Entries are sorted by Test Case ID.

Scope:
- Includes tests in tests/integration/uc2/
- Includes E2E test for UC2 (cypress/e2e/uc2_signin.cy.ts) as end‑to‑end integration
- Excludes role fallback/caching/database lookups, per UC2 sequence scope

---

| Test Case ID | TC-UC2-I1-4.1 |
| :---- | :---- |
| Feature | Hook-level: signIn flow calls Supabase + error mapping |
| Component | useAuth hook (tests/integration/uc2/useAuth-error-states.test.ts) |
| Test Description | login() maps Supabase errors to UC2 strings and avoids navigation on error |
| Input | signInWithPassword returns errors: "Invalid login credentials" and "Email not confirmed" |
| UC2 Steps Covered | Step 3-4 (submit → Controller → Supabase), Step 5-6 (mapped errors), negative navigation |
| Expected Behavior | result.error === "Invalid credentials" / "Please verify your email"; navigate not called |
| Integration Points | useAuth ↔ supabase.auth.signInWithPassword, useAuth ↔ react-router-dom.useNavigate |

| Test Case ID | TC-UC2-I4-9.1 |
| :---- | :---- |
| Feature | Component-level navigation completion (jobseeker) |
| Component | Auth + Router (tests/frontendunit/uc2/Auth.navigation-flow.test.tsx) |
| Test Description | Successful login with job-seeker metadata navigates to /employee/preferences |
| Input | Mock signInWithPassword success with job-seeker metadata |
| UC2 Steps Covered | Step 7 (role), Step 8 (navigate), Step 9 (navigation complete) |
| Expected Behavior | Destination route content visible |
| Integration Points | Auth ↔ useAuth ↔ react-router-dom |

| Test Case ID | TC-UC2-I4-9.2 |
| :---- | :---- |
| Feature | Component-level navigation completion (employer) |
| Component | Auth + Router (tests/frontendunit/uc2/Auth.navigation-flow.test.tsx) |
| Test Description | Successful login with client/employer metadata navigates to /employer/dashboard |
| Input | Mock signInWithPassword success with client metadata |
| UC2 Steps Covered | Step 7, Step 8, Step 9 |
| Expected Behavior | Destination route content visible |
| Integration Points | Auth ↔ useAuth ↔ react-router-dom |

| Test Case ID | TC-UC2-I5-6.1 |
| :---- | :---- |
| Feature | Component-level error paths (invalid credentials) |
| Component | Auth + Router (tests/frontendunit/uc2/Auth.stays-on-login-on-error.test.tsx) |
| Test Description | Error keeps user on Auth; displays mapped message |
| Input | Mock signInWithPassword error: "Invalid login credentials" |
| UC2 Steps Covered | Step 5; negative navigation |
| Expected Behavior | "Invalid credentials" visible; stays on /auth |
| Integration Points | Auth ↔ useAuth ↔ react-router-dom |

| Test Case ID | TC-UC2-I6-6.2 |
| :---- | :---- |
| Feature | Component-level error paths (unverified email) |
| Component | Auth + Router (tests/frontendunit/uc2/Auth.stays-on-login-on-error.test.tsx) |
| Test Description | Error keeps user on Auth; displays mapped message |
| Input | Mock signInWithPassword error: "Email not confirmed" |
| UC2 Steps Covered | Step 6; negative navigation |
| Expected Behavior | "Please verify your email" visible; stays on /auth |
| Integration Points | Auth ↔ useAuth ↔ react-router-dom |

| Test Case ID | TC-UC2-I1-9.3 (E2E) |
| :---- | :---- |
| Feature | End‑to‑End UC2 Sign In flow (success + error) |
| Component | Cypress E2E (cypress/e2e/uc2_signin.cy.ts) |
| Test Description | Validates full UC2 flow: render login, submit, auth call, role‑based navigation, and error display |
| Input | Intercept Supabase /auth/v1/token: success(job‑seeker), success(client), invalid credentials, unverified email |
| UC2 Steps Covered | Step 1 through Step 9 |
| Expected Behavior | Navigates to /employee/preferences or /employer/dashboard on success; shows mapped errors and stays on /auth on failure |
| Integration Points | Browser ↔ App (Auth/useAuth/router) ↔ Supabase HTTP |

---

Run instructions (Integration / UC2)

- Run hook integration (frontend config excludes integration by default, so pass file explicitly):
  - npm run test:frontend:run -- tests/integration/uc2/useAuth-error-states.test.ts
- Run component‑level integration tests:
  - npm run test:frontend:run -- tests/frontendunit/uc2/Auth.navigation-flow.test.tsx tests/frontendunit/uc2/Auth.stays-on-login-on-error.test.tsx
- Run E2E UC2:
  - Ensure app is running: npm run dev
  - Cypress baseUrl set (cypress.config.ts)
  - npx cypress run --spec cypress/e2e/uc2_signin.cy.ts

Cross‑coverage notes
- UC1 frontend unit tests provide coverage for UC2 Step 1–4 (render login, submit, login() called, signInWithPassword called).
- We reference those tests in the UC2 frontend unit documentation to avoid duplication instead of repeating them here.
