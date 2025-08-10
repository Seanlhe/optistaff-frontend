**UC3: Set Preferences — Backend Unit Tests**

Below are the backend unit tests for UC3 documented using the established two-column table format. Test IDs follow TC-UC3-BU[step].[subtest], where [step] maps to the UC3 sequence diagram steps (1–22) in uc3_seq.md. For non-sequence utilities (e.g., location), we use TC-UC3-BU-L[n].

---

| Test Case ID | TC-UC3-BU2.1 |
| :---- | :---- |
| Feature | Default preferences creation |
| Component | DB: create_default_preferences |
| Test Description | Creates default preferences for a new user (valid UUID) |
| Input | RPC create_default_preferences with p_user_id = valid user_id |
| Expected Output | One preferences row with defaults (min_pay_rate:15, max_travel_km:15, desired_roles:[], max_hours_per_week:40, max_hours_per_shift:8, consider_lower_rate:false) |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU2.2 |
| :---- | :---- |
| Feature | Idempotency on default creation |
| Component | DB: create_default_preferences |
| Test Description | Second invocation returns existing row; no duplicates |
| Input | Call RPC twice for same user |
| Expected Output | Both succeed; SELECT confirms single row for user |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU2.3 |
| :---- | :---- |
| Feature | Default values structure correctness |
| Component | DB: create_default_preferences |
| Test Description | Verifies presence and types of all expected fields and business rule bounds |
| Input | RPC with valid user_id |
| Expected Output | preference_id/user_id/created_at/updated_at present; numeric bounds valid; desired_roles is array |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU2.4 |
| :---- | :---- |
| Feature | Invalid inputs handling |
| Component | DB: create_default_preferences |
| Test Description | Handles null, invalid UUID, empty string, and non-existent user gracefully |
| Input | p_user_id: null | invalid uuid | "" | valid but non-existent |
| Expected Output | Appropriate errors (e.g., FK 23503) or non-null error for malformed inputs |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU2.5 |
| :---- | :---- |
| Feature | Verify RPC vs direct SELECT consistency |
| Component | DB: create_default_preferences |
| Test Description | Compare fields returned by RPC and subsequent direct SELECT |
| Input | RPC then SELECT preferences by user_id |
| Expected Output | preference_id and fields match in both results |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU2.6 |
| :---- | :---- |
| Feature | Concurrent default creation |
| Component | DB: create_default_preferences |
| Test Description | Concurrent calls for same/different users behave correctly |
| Input | Promise.all with two RPC calls |
| Expected Output | Each user ends with at most one preference row |
| Test Type | Backend Unit |

---

| Test Case ID | TC-UC3-BU4.1 |
| :---- | :---- |
| Feature | Validation: job names and constraints |
| Component | DB: upsert_user_preferences (validation path) |
| Test Description | Valid payload creates/updates preferences without validation errors |
| Input | Valid p_min_pay_rate/p_max_travel_km/p_desired_roles/p_max_hours_* |
| Expected Output | validation_errors: [] and persisted values reflect input |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU4.2 |
| :---- | :---- |
| Feature | Validation: empty desired_roles |
| Component | DB: upsert_user_preferences |
| Test Description | Empty roles array yields validation error message |
| Input | p_desired_roles: [] |
| Expected Output | validation_errors contains "Please select at least one preferred job type" |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU4.3 |
| :---- | :---- |
| Feature | Validation: non-existent job names |
| Component | DB: upsert_user_preferences |
| Test Description | Non-existent job role returns validation error |
| Input | p_desired_roles: ["NonExistentJob"] |
| Expected Output | validation_errors contains invalid/inactive message |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU4.4 |
| :---- | :---- |
| Feature | Validation: numeric boundaries and JSONB integrity |
| Component | DB: upsert_user_preferences + table constraints |
| Test Description | Negative pay/0 or >44 week hours/>12 shift hours; roles with null/number are rejected |
| Input | Various invalid numeric/JSON payloads |
| Expected Output | Either check constraint error (23514) or validation_errors populated |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU4.5 |
| :---- | :---- |
| Feature | Foreign key enforcement |
| Component | Table: preferences |
| Test Description | Insert with non-existent user_id fails FK |
| Input | Direct INSERT into preferences |
| Expected Output | Error 23503 FK violation |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU4.6 |
| :---- | :---- |
| Feature | Concurrent upserts |
| Component | DB: upsert_user_preferences |
| Test Description | Concurrent updates both succeed; final state reflects last write |
| Input | Promise.all with two different payloads for same user |
| Expected Output | Both responses error-free; final row reflects one of the two inputs |
| Test Type | Backend Unit |

---

| Test Case ID | TC-UC3-BU3.1 |
| :---- | :---- |
| Feature | Job name validation: boundaries |
| Component | DB: validate_job_names |
| Test Description | Validates empty array, single, multiple, and large sets of job names |
| Input | job_names: [], [one], [many] |
| Expected Output | true for valid sets; null for []; error-free |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU3.2 |
| :---- | :---- |
| Feature | Job name validation: business logic |
| Component | DB: validate_job_names |
| Test Description | Invalid names, inactive names, mixed active/inactive, case sensitivity |
| Input | Mixed arrays and case-variant names |
| Expected Output | false for invalid/inactive/mixed; true for exact-case active |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU3.3 |
| :---- | :---- |
| Feature | Job name validation: essential edge cases |
| Component | DB: validate_job_names |
| Test Description | null input, empty string names, duplicates, concurrent calls |
| Input | job_names: null | [""] | duplicates |
| Expected Output | true for null; false for empty string; true for duplicates of valid |
| Test Type | Backend Unit |

---

| Test Case ID | TC-UC3-BU-L1 |
| :---- | :---- |
| Feature | Location retrieval: complete data |
| Component | DB: get_user_location |
| Test Description | Retrieves full location record and computed fields |
| Input | address, postal_code, address_coordinates set |
| Expected Output | coordinates parsed; formatted_address "<address>, Singapore <postal>" |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU-L2 |
| :---- | :---- |
| Feature | Location retrieval: partial/no data |
| Component | DB: get_user_location |
| Test Description | Postal-only; address-only; all-null cases |
| Input | Various partial inputs |
| Expected Output | Graceful results; null coordinates when not parseable |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU-L3 |
| :---- | :---- |
| Feature | Location retrieval: invalid inputs |
| Component | DB: get_user_location |
| Test Description | Non-existent user, null user_id, invalid UUID |
| Input | p_user_id variants |
| Expected Output | [] for null/non-existent; error for invalid UUID |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU-L4 |
| :---- | :---- |
| Feature | Location: coordinate parsing |
| Component | DB: get_user_location |
| Test Description | Valid coordinates, negative values, malformed string (no comma) |
| Input | address_coordinates variants |
| Expected Output | Parsed floats or nulls when malformed |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU-L5 |
| :---- | :---- |
| Feature | Location: formatting and performance |
| Component | DB: get_user_location |
| Test Description | Address-only formatted text; multiple concurrent requests |
| Input | address-only; Promise.all of 5 RPCs |
| Expected Output | "<address>, Singapore" formatting; all requests succeed with same data |
| Test Type | Backend Unit |

---

| Test Case ID | TC-UC3-BU18.1 |
| :---- | :---- |
| Feature | Save success path (DB response) |
| Component | DB: upsert_user_preferences |
| Test Description | Successful upsert returns row with validation_errors: [] |
| Input | Valid payload |
| Expected Output | Success with row and [] errors |
| Test Type | Backend Unit |

| Test Case ID | TC-UC3-BU18.2 |
| :---- | :---- |
| Feature | Save with deactivated job during race |
| Component | DB: upsert_user_preferences + job_types |
| Test Description | Deactivating a job during save yields invalid/inactive error |
| Input | Start save, deactivate job, await save |
| Expected Output | validation_errors includes invalid/inactive message |
| Test Type | Backend Unit |


