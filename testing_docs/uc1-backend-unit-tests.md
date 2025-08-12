**UC1: Create Account — Backend Unit Tests**

Below are the backend unit tests for UC1 documented using the established two-column table format. Test IDs follow TC-UC1-BU[step].[subtest], where [step] is a single number from 1–21 in use_case_1_refactored_sequence.md. Entries are sorted by Test Case ID ascending. Only tests that map to sequence steps are documented.

---

| Test Case ID | TC-UC1-BU8.1 |
| :---- | :---- |
| Feature | Job Seeker profile creation (triggered) |
| Component | tests/backendunit/uc1/handle-new-user.test.ts |
| Test Description | Simulates handle_new_user() outcome: inserts job_seekers row with defaults and creates default preferences |
| Input | user_type: job-seeker; first_name, last_name, phone_number, date_of_birth, address, postal_code |
| Expected Output | job_seekers row exists with provided fields and status ACTIVE; preferences row exists for same user_id |
| Test Type | Backend Unit |

| Test Case ID | TC-UC1-BU8.2 |
| :---- | :---- |
| Feature | Missing metadata handling (job seeker) |
| Component | tests/backendunit/uc1/handle-new-user.test.ts |
| Test Description | Handles missing optional metadata gracefully (fallbacks for first/last names, nullables) |
| Input | user_type: job-seeker; minimal fields |
| Expected Output | job_seekers row created with sensible defaults; preferences row created |
| Test Type | Backend Unit |

| Test Case ID | TC-UC1-BU8.3 |
| :---- | :---- |
| Feature | Invalid date_of_birth handling (job seeker) |
| Component | tests/backendunit/uc1/handle-new-user.test.ts |
| Test Description | Invalid date coerced to NULL in job_seekers.date_of_birth |
| Input | user_type: job-seeker; date_of_birth: "invalid-date" |
| Expected Output | job_seekers row created with date_of_birth = NULL |
| Test Type | Backend Unit |

| Test Case ID | TC-UC1-BU8.4 |
| :---- | :---- |
| Feature | Unknown user_type produces no profile |
| Component | tests/backendunit/uc1/handle-new-user.test.ts |
| Test Description | No records are created for unknown user_type |
| Input | user_type: admin |
| Expected Output | No row in job_seekers or clients for the user_id |
| Test Type | Backend Unit |

| Test Case ID | TC-UC1-BU8.5 |
| :---- | :---- |
| Feature | Foreign key enforcement (job_seekers → auth.users) |
| Component | tests/backendunit/uc1/handle-new-user.test.ts |
| Test Description | Inserting with non-existent user_id fails with FK error |
| Input | job_seekers insert with fake UUID |
| Expected Output | FK violation error message present |
| Test Type | Backend Unit |

| Test Case ID | TC-UC1-BU12.1 |
| :---- | :---- |
| Feature | Employer profile creation (triggered) |
| Component | tests/backendunit/uc1/handle-new-user.test.ts |
| Test Description | Simulates handle_new_user() outcome: inserts clients row; no preferences row created |
| Input | user_type: client; first_name, last_name, company_name, phone_number, address, postal_code, office_number |
| Expected Output | clients row exists with provided fields; no preferences row for this user |
| Test Type | Backend Unit |

| Test Case ID | TC-UC1-BU12.2 |
| :---- | :---- |
| Feature | Foreign key enforcement (clients → auth.users) |
| Component | tests/backendunit/uc1/handle-new-user.test.ts |
| Test Description | Inserting with non-existent client_id fails with FK error |
| Input | clients insert with fake UUID |
| Expected Output | FK violation error message present |
| Test Type | Backend Unit |

