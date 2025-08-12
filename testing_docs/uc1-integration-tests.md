**UC1: Create Account — Integration Tests**

Below are the integration tests for UC1 documented using the established two-column table format. Test IDs follow TC-UC1-I[step-range].[subtest], where [step-range] uses the 21 steps in use_case_1_refactored_sequence.md. Entries are sorted by Test Case ID ascending and use step ranges where tests cover multiple sequential steps.

---

| Test Case ID | TC-UC1-I1-7.1 |
| :---- | :---- |
| Feature | Form validation failure prevents signup |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | Invalid input causes validation errors; prevents auth.signUp and navigation |
| Input | Empty/invalid email |
| Expected Output | result.error reflects validation errors; no signUp call; no navigation |
| Test Type | Integration |

| Test Case ID | TC-UC1-I1-15.1 |
| :---- | :---- |
| Feature | Successful job seeker signup |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | Valid jobseeker data; pre-checks for existing email; calls supabase.auth.signUp; sets success message; navigates to login |
| Input | email, password, userType: jobseeker, firstName, lastName, phoneNumber, dateOfBirth, address, postalCode |
| Expected Output | signUp called with correct metadata; sessionStorage.signup_success set; navigation to /auth?mode=login |
| Test Type | Integration |

| Test Case ID | TC-UC1-I1-15.2 |
| :---- | :---- |
| Feature | Successful employer signup |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | Valid employer data; pre-checks; calls supabase.auth.signUp with employer metadata; navigates to login |
| Input | email, password, userType: employer, firstName, lastName, companyName, phoneNumber, officeNumber? |
| Expected Output | signUp called with correct employer metadata; navigation to /auth?mode=login |
| Test Type | Integration |

| Test Case ID | TC-UC1-I5-8.1 |
| :---- | :---- |
| Feature | Loading state transitions |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | loading toggles true during async; false after completion |
| Input | Promise-delayed signUp |
| Expected Output | result.loading true during; false after |
| Test Type | Integration |

| Test Case ID | TC-UC1-I5-8.2 |
| :---- | :---- |
| Feature | Metadata mapping for jobseeker |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | Ensures correct metadata sent to Supabase for jobseeker |
| Input | Jobseeker signup data |
| Expected Output | signUp called with user_type: job-seeker and matching fields |
| Test Type | Integration |

| Test Case ID | TC-UC1-I5-8.3 |
| :---- | :---- |
| Feature | Metadata mapping for employer |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | Ensures correct metadata sent to Supabase for employer |
| Input | Employer signup data |
| Expected Output | signUp called with user_type: client and matching fields |
| Test Type | Integration |

| Test Case ID | TC-UC1-I5-8.4 |
| :---- | :---- |
| Feature | Optional fields omitted |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | When optional fields are undefined, they are not included in metadata |
| Input | Minimal jobseeker data |
| Expected Output | signUp called with only required fields |
| Test Type | Integration |

| Test Case ID | TC-UC1-I8-21.1 |
| :---- | :---- |
| Feature | Supabase signUp error surfaced to user |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | signUp returns error (e.g., duplicate email); error propagated; no navigation |
| Input | Valid signup data; signUp mock error |
| Expected Output | error set to API message; no navigation |
| Test Type | Integration |

| Test Case ID | TC-UC1-I8-21.2 |
| :---- | :---- |
| Feature | Existing, unconfirmed account heuristic |
| Component | tests/integration/uc1/useAuth-signup.test.ts |
| Test Description | signUp returns user with earlier created_at; treat as existing unconfirmed; show guidance |
| Input | Valid data; signUp returns old created_at |
| Expected Output | error message about unconfirmed email; no navigation |
| Test Type | Integration |

