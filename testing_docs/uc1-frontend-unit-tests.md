**UC1: Create Account — Frontend Unit Tests**

Below are the frontend unit tests for UC1 documented using the established two-column table format. Test IDs follow TC-UC1-U[step].[subtest], where [step] maps to the 21 steps in use_case_1_refactored_sequence.md. Tests are sorted by Test Case ID ascending and use single-step numbers.

Notes:
- Omitted tests that do not directly map to UC1 sequence steps (e.g., generic Button/Alert components, login-mode-only checks)
- Step 1 (navigation) is indirectly covered via rendering the signup route; explicit navigation itself is not directly unit-tested here

---

| Test Case ID | TC-UC1-U2.1 |
| :---- | :---- |
| Feature | Navigate to signup renders signup form |
| Component | Auth page (tests/frontendunit/uc1/Auth.test.tsx) |
| Test Description | Displays Create Account UI and user type toggle when rendering /auth?mode=signup |
| Input | Render Auth with initialEntries=["/auth?mode=signup"] |
| Expected Output | Heading "Create Account" and "I am a..." visible |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U2.2 |
| :---- | :---- |
| Feature | Signup footer content visible |
| Component | Auth page (tests/frontendunit/uc1/Auth.test.tsx) |
| Test Description | Shows "Already have an account? Sign In" in signup mode |
| Input | Render Auth with mode=signup |
| Expected Output | Signup footer text/links visible |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U2.3 |
| :---- | :---- |
| Feature | Footer links: signup mode |
| Component | AuthFooter (tests/frontendunit/uc1/AuthFooter.test.tsx) |
| Test Description | Renders "Already have an account? Sign In" for signup mode |
| Input | Render AuthFooter in signup mode |
| Expected Output | Links/text visible |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U2.4 |
| :---- | :---- |
| Feature | Signup header visible |
| Component | AuthHeader (tests/frontendunit/uc1/AuthHeader.test.tsx) |
| Test Description | Renders Create Account title in signup mode |
| Input | Render AuthHeader with mode=signup |
| Expected Output | "Create Account" title visible |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.1 |
| :---- | :---- |
| Feature | User type toggle renders and switches |
| Component | Auth page (tests/frontendunit/uc1/Auth.test.tsx) |
| Test Description | Renders Job Seeker/Employer buttons; clicking Employer shows employer fields |
| Input | Click Employer |
| Expected Output | Company name placeholder appears |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.2 |
| :---- | :---- |
| Feature | Job seeker fields render |
| Component | Auth page (tests/frontendunit/uc1/Auth.test.tsx) |
| Test Description | Common fields render; DoB label visible |
| Input | None |
| Expected Output | Email, password, name fields and Date of Birth label visible |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.3 |
| :---- | :---- |
| Feature | Field rendering (signup) |
| Component | AuthFormFields (tests/frontendunit/uc1/AuthFormFields.test.tsx) |
| Test Description | Renders email, password, confirm password, names, and DoB |
| Input | mode=signup |
| Expected Output | Inputs and DoB label visible |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.4 |
| :---- | :---- |
| Feature | Address validation workflow |
| Component | AddressLookupField (tests/frontendunit/uc1/AddressLookupField.test.tsx) |
| Test Description | Clicking Validate triggers lookup; postal code populated |
| Input | Enter address; click Validate |
| Expected Output | postalCode input auto-filled with stubbed value |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.5 |
| :---- | :---- |
| Feature | Confirm password behavior |
| Component | ConfirmPasswordField (tests/frontendunit/uc1/ConfirmPasswordField.test.tsx) |
| Test Description | Renders and validates confirmation input |
| Input | Type passwords in both fields |
| Expected Output | Mismatch feedback shown appropriately |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.6 |
| :---- | :---- |
| Feature | Date input renders and can select date |
| Component | DateInput (tests/frontendunit/uc1/DateInput.test.tsx) |
| Test Description | Renders date field with label and supports selection |
| Input | Choose a date |
| Expected Output | Value updated/selection reflected |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.7 |
| :---- | :---- |
| Feature | Password input behavior |
| Component | PasswordField (tests/frontendunit/uc1/PasswordField.test.tsx) |
| Test Description | Renders with masking and supports user input |
| Input | Type value |
| Expected Output | Value accepted; visibility toggle works (if present) |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.8 |
| :---- | :---- |
| Feature | Toggle renders both options and updates selection |
| Component | UserTypeToggle (tests/frontendunit/uc1/UserTypeToggle.test.tsx) |
| Test Description | Clicking Employer toggles active styling |
| Input | Click Employer |
| Expected Output | Employer button becomes active; Job Seeker inactive |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.9 |
| :---- | :---- |
| Feature | Real-time input formatters |
| Component | utils/field-validation (tests/frontendunit/uc1/uc1-field-validation.test.ts) |
| Test Description | Ensures formatting rules for names, phone, postal |
| Input | Mixed strings with symbols/numbers |
| Expected Output | Cleaned values per formatter rules |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.10 |
| :---- | :---- |
| Feature | Real-time field validators |
| Component | utils/field-validation (tests/frontendunit/uc1/uc1-field-validation.test.ts) |
| Test Description | Valid/invalid checks for names, phone, postal, companyName |
| Input | Boundary and equivalence cases |
| Expected Output | Validation results match rules with messages |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.11 |
| :---- | :---- |
| Feature | Input constraints mapping |
| Component | utils/field-validation (tests/frontendunit/uc1/uc1-field-validation.test.ts) |
| Test Description | Verifies constraints for firstName, lastName, phoneNumber, postalCode, companyName |
| Input | Inspect inputConstraints mapping |
| Expected Output | Correct formatter, validator, and maxLength assignments |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.12 |
| :---- | :---- |
| Feature | useFieldValidation hook - formatting |
| Component | utils/field-validation (tests/frontendunit/uc1/uc1-field-validation.test.ts) |
| Test Description | formatField returns correctly formatted values for supported fields |
| Input | Various inputs for firstName/lastName/phoneNumber/postalCode |
| Expected Output | Correctly formatted values returned |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U3.13 |
| :---- | :---- |
| Feature | useFieldValidation hook - validation |
| Component | utils/field-validation (tests/frontendunit/uc1/uc1-field-validation.test.ts) |
| Test Description | validateField returns correct validity and messages |
| Input | Various inputs for firstName/phoneNumber/postalCode/companyName |
| Expected Output | Correct validation results |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U4.1 |
| :---- | :---- |
| Feature | validateSignupForm validation paths |
| Component | Utils: validateSignupForm (tests/frontendunit/uc1/uc1-authentication-validation.test.ts) |
| Test Description | Boundary and equivalence classes for email, password, names |
| Input | Various invalid/valid inputs |
| Expected Output | Validation errors array matches expectations |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U4.2 |
| :---- | :---- |
| Feature | signup: validation failure stops flow |
| Component | useAuth (tests/frontendunit/uc1/useAuth-functions.test.ts) |
| Test Description | validateSignupForm returns error; no auth.signUp call |
| Input | Invalid email |
| Expected Output | signUp not called |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U6.1 |
| :---- | :---- |
| Feature | Signup submit calls useAuth.signup |
| Component | Auth page (tests/frontendunit/uc1/Auth.test.tsx) |
| Test Description | Filling fields and submitting triggers signup() with form data |
| Input | Fill email, password, confirm, first/last name; submit |
| Expected Output | signup mock called once with expected payload |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U6.2 |
| :---- | :---- |
| Feature | signup: loading state toggles |
| Component | useAuth (tests/frontendunit/uc1/useAuth-functions.test.ts) |
| Test Description | Sets loading true on start; false on completion |
| Input | Call signup() and resolve later |
| Expected Output | loading true then false |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U7.1 |
| :---- | :---- |
| Feature | signup: metadata mapping (jobseeker) |
| Component | useAuth (tests/frontendunit/uc1/useAuth-functions.test.ts) |
| Test Description | Calls auth.signUp with correct jobseeker metadata |
| Input | Jobseeker form data |
| Expected Output | user_type: job-seeker with fields |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U16.1 |
| :---- | :---- |
| Feature | signup: success handling |
| Component | useAuth (tests/frontendunit/uc1/useAuth-functions.test.ts) |
| Test Description | Stores signup_success message in sessionStorage |
| Input | Successful signUp mock |
| Expected Output | sessionStorage.setItem called with message |
| Test Type | Frontend Unit |

| Test Case ID | TC-UC1-U19.1 |
| :---- | :---- |
| Feature | Validation failure UI remains stable |
| Component | Auth page (tests/frontendunit/uc1/Auth.test.tsx) |
| Test Description | Submitting empty form keeps page rendered (error path) |
| Input | Click submit on empty form |
| Expected Output | Heading remains visible |
| Test Type | Frontend Unit |

