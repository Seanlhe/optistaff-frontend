
### Use Case 1: Create Account

| Field          | Description |
|----------------|-------------|
| **ID**         | UC1 |
| **Name**       | Create Account |
| **Description**| A new user registers for either a Jobseeker or employer account on the platform. |
| **Actors**     | Unauthenticated Jobseeker or Employer |
| **Triggers**   | “Don't have an account? Sign up” button on sign-in page clicked |
| **Precondition** | The user does not have a pre-existing account with the submitted email. |
| **Postcondition** | New account created and saved to database; verification email sent; can now sign in |
| **Error States** | Email address is already registered |
| **Flow**       | 1. User enters email<br>2. User enters and confirms password<br>3. User chooses Jobseeker<br>4. Jobseeker enters personal details<br>5. System sends verification email |
| **Alternative Flow** | 1–2. Same<br>3. User chooses Employer<br>4. Employer enters company details<br>5. System sends verification email |

---

### Use Case 2: Sign In

| Field          | Description |
|----------------|-------------|
| **ID**         | UC2 |
| **Name**       | Sign In |
| **Description**| User signs into platform |
| **Actors**     | Jobseeker, Employer |
| **Triggers**   | “Sign In” button on landing page clicked |
| **Precondition** | Email and Password registered; user not logged in |
| **Postcondition** | User enters platform and sees dashboard |
| **Error States** | Invalid credentials; login with unverified email |
| **Flow**       | 1. Enter email<br>2. Enter password<br>3. Click “Sign in”<br>4. System validates credentials |
| **Alternative Flow** | Invalid email: system shows “create account”<br>Invalid password: shows “reset password” and sends instructions |

---

### Use Case 3: Set Preferences

| Field          | Description |
|----------------|-------------|
| **ID**         | UC3 |
| **Name**       | Set Preferences |
| **Description**| Jobseeker sets preferences to be eligible for shifts |
| **Actors**     | Jobseeker |
| **Triggers**   | Navigates to "Preferences" section of profile |
| **Preconditions** | Jobseeker is logged in and authenticated |
| **Postconditions** | Preferences saved in database linked to user |
| **Error States** | Nil |
| **Flow**       | 1. Enter preferences (pay, distance, shift cap, job type)<br>2. System displays matching jobs<br>3. Click "Save Preferences"<br>4. System confirms save |
| **Alternative Flow** | Nil |

---

### Use Case 4: Indicate Availability

| Field          | Description |
|----------------|-------------|
| **ID**         | UC4 |
| **Name**       | Indicate Availability |
| **Description**| Jobseeker specifies available days and times |
| **Actors**     | Jobseeker |
| **Triggers**   | Navigates to "Availability" tab |
| **Preconditions** | Jobseeker is logged in and authenticated |
| **Postconditions** | Availability records saved in database |
| **Error States** | Nil |
| **Flow**       | 1. Toggle to week<br>2. Select time slots<br>3. System validates and creates records<br>4. Confirm availability<br>5. System confirms save |
| **Alternative Flow** | N/A |

---

### Use Case 5: Cancel Shift

| Field          | Description |
|----------------|-------------|
| **ID**         | UC5 |
| **Name**       | Cancel Shift |
| **Description**| Jobseeker cancels an assigned shift |
| **Actors**     | Jobseeker |
| **Triggers**   | Clicks "Cancel Shift" button for an upcoming shift |
| **Preconditions** | Logged in; at least one assigned shift |
| **Postconditions** | Removed from shift; rating reduced; shift flagged |
| **Error States** | Nil |
| **Flow**       | 1. Select shift<br>2. Click cancel and choose reason<br>3. Warning about rating<br>4. Confirm<br>5. System confirms cancellation |
| **Alternative Flow** | 4a. Click “go back”<br>5a. Returned to schedule view |

---

### Use Case 6: List Jobs

| Field          | Description |
|----------------|-------------|
| **ID**         | UC6 |
| **Name**       | List Jobs |
| **Description**| Employer defines shift requirements |
| **Actors**     | Employer |
| **Triggers**   | Navigates to "Post a Job" or "Upload Shifts" |
| **Preconditions** | Employer is logged in and authenticated |
| **Postconditions** | Shifts created and set to 'OPEN'; included in scheduling |
| **Error States** | Invalid data; CSV errors prevent import |
| **Flow**       | 1. Click "Post a New Job"<br>2. Fill job form<br>3. Submit<br>4. System validates<br>5. Shift records created<br>6. Confirmation message |
| **Alternative Flow** | Upload via CSV:<br>1a. Select "Upload CSV"<br>2a. Upload file<br>3a. Parse and validate<br>4a. Create valid records<br>5a. Show confirmation and errors |

---

### Use Case 7: Review Employee

| Field          | Description |
|----------------|-------------|
| **ID**         | UC7 |
| **Name**       | Review Employee |
| **Description**| Employer reviews an employee |
| **Actors**     | Employer |
| **Triggers**   | Clicks “Rate Employee” |
| **Preconditions** | Logged in; employee has completed job |
| **Postcondition** | Review and rating saved |
| **Flow**       | 1. Go to completed shift<br>2. Select rating<br>3. Click submit<br>4. Rating updated, confirmation shown |
| **Alternative Flow** | NA |

---

### Use Case 8: Employer Cancels Job Listing

| Field          | Description |
|----------------|-------------|
| **ID**         | UC8 |
| **Name**       | Employer Cancels Job Listing |
| **Description**| Employer cancels a posted shift/job request |
| **Actors**     | Employer |
| **Triggers**   | Clicks "Cancel" on job listing |
| **Preconditions** | Shift removed from allocation; if assigned, notify employee |
| **Postcondition** | Shift status updated to 'CANCELLED' |
| **Flow**       | 1. View posted shifts<br>2. Locate shift<br>3. Click "Cancel"<br>4. Confirm prompt<br>5. Status set to 'CANCELLED'<br>6. Confirmation message shown |
| **Alternative Flow** | If shift is assigned, system notifies employee |
