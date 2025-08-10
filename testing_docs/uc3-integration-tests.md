**UC3: Set Preferences — Integration Tests**

Below are the integration tests for UC3 documented using the established two-column table format. Test IDs follow TC-UC3-I[step].[subtest], where [step] maps to the UC3 sequence diagram steps (1–22) in uc3_seq.md.

---

File: tests/integration/uc3/JSPref-preferences-flow-integration.test.tsx

| Test Case ID | TC-UC3-I1.1 |
| :---- | :---- |
| Feature | Page-level preferences flow |
| Component | JSPref page + PreferencesForm subtree |
| Test Description | Navigate → load existing data → display job types → modify fields → save success |
| Input | Render JSPref, interact: uncheck job, change radius, change pay, toggle consider lower, click Save |
| Expected Output | savePreferences called with updated payload; success message displayed |
| Test Type | Integration |

| Test Case ID | TC-UC3-I17.1 |
| :---- | :---- |
| Feature | Save failure path (page-level) |
| Component | JSPref page + PreferencesForm |
| Test Description | Save resolves false and no success message shown |
| Input | Render JSPref; click Save (mock returns false) |
| Expected Output | savePreferences called; success message not shown |
| Test Type | Integration |

---

File: tests/integration/uc3/PreferencesForm-integration.test.tsx

| Test Case ID | TC-UC3-I12.2 |
| :---- | :---- |
| Feature | Form sections render |
| Component | PreferencesForm |
| Test Description | Renders pay, maximums, job type, and map with initial values |
| Input | Hook mock getFormData returns initial form data |
| Expected Output | $20 displayed, Travel Radius: 15km, Save enabled |
| Test Type | Integration |

| Test Case ID | TC-UC3-I17.2 |
| :---- | :---- |
| Feature | Save success |
| Component | PreferencesForm |
| Test Description | Clicking save triggers save and shows success message |
| Input | savePreferences resolves true |
| Expected Output | Success message rendered and disappears after timeout |
| Test Type | Integration |

| Test Case ID | TC-UC3-I17.3 |
| :---- | :---- |
| Feature | Save failure |
| Component | PreferencesForm |
| Test Description | Clicking save when savePreferences resolves false |
| Input | Click save |
| Expected Output | savePreferences called; no success message |
| Test Type | Integration |

| Test Case ID | TC-UC3-I12.3 |
| :---- | :---- |
| Feature | Child component state propagation |
| Component | PreferencesForm |
| Test Description | Changes from child components (pay slider, checkbox, radius) are saved |
| Input | Adjust slider, toggle checkbox, change radius, click save |
| Expected Output | savePreferences called with updated values (pay, radius, considerLowerRate) |
| Test Type | Integration |

---

File: tests/integration/uc3/PreferencesJobType-integration.test.tsx

| Test Case ID | TC-UC3-I7.1 |
| :---- | :---- |
| Feature | Job type data loading and grouping |
| Component | PreferencesJobType + useJobTypes |
| Test Description | Loads job types and displays them grouped by category |
| Input | Supabase client stub returns job types with categories |
| Expected Output | Category headers and job names rendered |
| Test Type | Integration |

| Test Case ID | TC-UC3-I12.1 |
| :---- | :---- |
| Feature | Checkbox selection updates parent form data |
| Component | PreferencesJobType |
| Test Description | Selecting Chef adds it; deselecting Waiter removes it |
| Input | Click Chef; click Waiter |
| Expected Output | setFormData called with updated selectedJobNames arrays |
| Test Type | Integration |

| Test Case ID | TC-UC3-I8.1 |
| :---- | :---- |
| Feature | Loading state during fetch |
| Component | PreferencesJobType |
| Test Description | Shows loading skeleton while job types fetch |
| Input | Initial render before stubbed order() resolves |
| Expected Output | Either loading skeleton or content visible without crash |
| Test Type | Integration |

---

File: tests/integration/uc3/PreferencesSubComponents-integration.test.tsx

| Test Case ID | TC-UC3-I12.4 |
| :---- | :---- |
| Feature | Maximum hours updates |
| Component | PreferencesMaximum |
| Test Description | Update max hours per week and per shift via inputs |
| Input | Change 40→35 (week), 8→6 (shift) |
| Expected Output | setFormData called with updated hours |
| Test Type | Integration |

| Test Case ID | TC-UC3-I15.1 |
| :---- | :---- |
| Feature | Pay preferences interactions |
| Component | PreferencesPay |
| Test Description | Slider and checkbox interactions update form data |
| Input | Move slider 20→25; toggle consider lower |
| Expected Output | setFormData called with payRate 25 and considerLowerRate true |
| Test Type | Integration |

| Test Case ID | TC-UC3-I7.2 |
| :---- | :---- |
| Feature | Job types render and interaction |
| Component | PreferencesJobType |
| Test Description | Renders container and supports selecting a job type |
| Input | Click Chef checkbox |
| Expected Output | setFormData adds Chef to selectedJobNames |
| Test Type | Integration |

---

File: tests/integration/uc3/PreferencesPay-integration.test.tsx

| Test Case ID | TC-UC3-I12.5 |
| :---- | :---- |
| Feature | Component initialization |
| Component | PreferencesPay |
| Test Description | Renders with initial pay, slider bounds, and checkbox state |
| Input | Render with formData (payRate 20, considerLowerRate false) |
| Expected Output | $20 displayed, slider min=5 max=30, checkbox unchecked |
| Test Type | Integration |

| Test Case ID | TC-UC3-I15.2 |
| :---- | :---- |
| Feature | Pay rate interaction |
| Component | PreferencesPay |
| Test Description | Changing slider updates pay rate |
| Input | Change slider 20→25 |
| Expected Output | setFormData called with payRate 25 |
| Test Type | Integration |

| Test Case ID | TC-UC3-I15.3 |
| :---- | :---- |
| Feature | Boundary interactions |
| Component | PreferencesPay |
| Test Description | Handles min (5) and max (30) slider values |
| Input | Set slider to 5 then 30 |
| Expected Output | setFormData called with 5, then 30 |
| Test Type | Integration |

| Test Case ID | TC-UC3-I15.4 |
| :---- | :---- |
| Feature | Checkbox toggle on/off |
| Component | PreferencesPay |
| Test Description | Toggle consider lower rate on and off |
| Input | Click checkbox when unchecked; click again when checked |
| Expected Output | setFormData called with considerLowerRate true then false |
| Test Type | Integration |

| Test Case ID | TC-UC3-I15.5 |
| :---- | :---- |
| Feature | Multiple sequential interactions |
| Component | PreferencesPay |
| Test Description | Multiple changes update form data correctly each time |
| Input | Change slider 20→28, toggle checkbox, slider 28→15 |
| Expected Output | setFormData called with 28, then considerLowerRate true, then 15 |
| Test Type | Integration |

---

File: tests/integration/uc3/create-default-preferences.test.ts

| Test Case ID | TC-UC3-I2.1 |
| :---- | :---- |
| Feature | Default preferences creation via RPC |
| Component | DB RPC: create_default_preferences |
| Test Description | Verifies RPC default creation and idempotency, and matches direct SELECT |
| Input | RPC with p_user_id; repeated invocation; direct SELECT |
| Expected Output | Single row with expected default values; direct SELECT matches RPC result |
| Test Type | Integration (DB boundary) |


