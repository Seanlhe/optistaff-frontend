**UC3: Set Preferences Unit Tests**   
**TC-UC3-U1 (Tab Navigation)**

| Test Case ID | TC-UC3-U1.1 |
| :---- | :---- |
| Feature | JSPref Tab Navigation |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify that JSPref renders correctly with default Preferences tab selected |
| Input | Render \<JSPref /\> component |
| Expected Output | Preferences tab active by default, Availability tab inactive, PreferencesForm component visible |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U1.2 |
| :---- | :---- |
| Feature | JSPref CSS Classes |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify that correct CSS classes are applied to active and inactive tabs |
| Input | Render \<JSPref /\> component |
| Expected Output | Active tab has bg-white class, inactive tab has hover:bg-white/60 class |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U1.3 |
| :---- | :---- |
| Feature | Tab Navigation Back to Preferences |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify user can switch back to Preferences tab after switching to Availability |
| Input | Click Availability tab, then click Preferences tab |
| Expected Output | PreferencesForm component visible, Availability component hidden |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U1.4 |
| :---- | :---- |
| Feature | Container Structure |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify JSPref renders with correct container structure and styling |
| Input | Render \<JSPref /\> component |
| Expected Output | Correct CSS classes for main container, max-width container, and tab buttons |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U1.5 |
| :---- | :---- |
| Feature | Tab Button Styling |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify tab buttons render with correct styling structure |
| Input | Render \<JSPref /\> component |
| Expected Output | Tab buttons have correct CSS classes and container styling |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U1.6 |
| :---- | :---- |
| Feature | Single Component Rendering |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify only one component renders at a time (Preferences OR Availability) |
| Input | Switch between tabs |
| Expected Output | Only one tab content component visible at any time |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U1.7 |
| :---- | :---- |
| Feature | Invalid Tab State Handling |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify component handles invalid activeTab state gracefully |
| Input | Render component with edge case activeTab values |
| Expected Output | Component renders default first tab content without crashing |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U1.8 |
| :---- | :---- |
| Feature | Missing Child Components |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify component handles missing child components gracefully |
| Input | Render component when child components are unavailable |
| Expected Output | Tab structure renders regardless of child component state |
| Test Type | Unit Test |

**TC-UC3-U2 (Preferences Form Component)**

| Test Case ID | TC-UC3-U2.1 |
| :---- | :---- |
| Feature | PreferencesForm Rendering |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify PreferencesForm renders correctly and displays all child components |
| Input | Render \<PreferencesForm /\> component |
| Expected Output | All child components visible: PreferencesMaximum, PreferencesPay, PreferencesJobType, LocationAwareMap, Save button |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U2.2 |
| :---- | :---- |
| Feature | Error Message Display |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify component displays general error message from usePreferencesForm hook |
| Input | Hook returns error: "Failed to connect to the server." |
| Expected Output | "Error Loading Preferences" and error message displayed |
| Test Type | Unit Test |

**TC-UC3-U7 (Job Type Selection)**

| Test Case ID | TC-UC3-U7.1 |
| :---- | :---- |
| Feature | Job Types Display by Category |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify PreferencesJobType renders job types grouped by category |
| Input | Render component with mock job types data |
| Expected Output | Categories displayed with job types grouped correctly underneath |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U7.2 |
| :---- | :---- |
| Feature | Existing Job Selections Loading |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify component loads existing selected job names from form data |
| Input | Form data with pre-selected job types: \["Waiter", "Cashier"\] |
| Expected Output | Corresponding checkboxes are checked, styling applied correctly |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U7.3 |
| :---- | :---- |
| Feature | Job Type Selection Styling |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify correct styling applied for selected and unselected job types |
| Input | Form data with some selected job types |
| Expected Output | Selected items have bg-primary-blue/5 styling, unselected have bg-card-color |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U7.4 |
| :---- | :---- |
| Feature | Checkbox Attributes |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify all checkboxes render with correct attributes and styling |
| Input | Render component with job types data |
| Expected Output | All checkboxes have correct type, styling classes (h-4, w-4, rounded-sm) |
| Test Type | Unit Test |

**TC-UC3-U8** 

| Test Case ID | TC-UC3-U8.1 |
| :---- | :---- |
| Feature | Job Types Loading State |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify component shows loading state while useJobTypes hook fetches data |
| Input | useJobTypes hook returns loading: true |
| Expected Output | Loading skeleton with animate-pulse class displayed |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U8.2 |
| :---- | :---- |
| Feature | Job Types Error State |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify component shows error state when there is an error loading job types |
| Input | useJobTypes hook returns error: "Failed to load job types" |
| Expected Output | "Error Loading Job Types" message and error text displayed |
| Test Type | Unit Test |

**TC-UC3-U13 (Display Complete Form)**

| Test Case ID | TC-UC3-U13.1 |
| :---- | :---- |
| Feature | Pay Rate Component Rendering |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify PreferencesPay renders correctly with all elements |
| Input | Render component with default form data |
| Expected Output | Pay rate display, slider, checkbox, and labels all visible with correct values |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.2 |
| :---- | :---- |
| Feature | Pay Rate Value Display |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify component displays correct pay rate value |
| Input | Form data with payRate: 25 |
| Expected Output | "$25" displayed correctly |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.3 |
| :---- | :---- |
| Feature | Slider Attributes |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify slider has correct attributes and styling |
| Input | Render component with form data |
| Expected Output | Slider type="range", min="5", max="30", correct CSS classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.4 |
| :---- | :---- |
| Feature | Checkbox Default State |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox displays in unchecked state by default |
| Input | Form data with considerLowerRate: false |
| Expected Output | Checkbox unchecked |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.5 |
| :---- | :---- |
| Feature | Checkbox Checked State |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox displays in checked state when considerLowerRate is true |
| Input | Form data with considerLowerRate: true |
| Expected Output | Checkbox checked |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.6 |
| :---- | :---- |
| Feature | Checkbox Attributes |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox has correct attributes and styling |
| Input | Render component |
| Expected Output | type="checkbox", id="consider-lower-rate", correct CSS classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.7 |
| :---- | :---- |
| Feature | Label Attributes |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify label has correct attributes and styling |
| Input | Render component |
| Expected Output | Label for="consider-lower-rate", correct CSS classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.8 |
| :---- | :---- |
| Feature | Container Styling |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify component renders with correct container styling |
| Input | Render component |
| Expected Output | Main div has correct CSS classes (p-6, bg-card-color) |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.9 |
| :---- | :---- |
| Feature | Header Styling |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify header text has correct styling |
| Input | Render component |
| Expected Output | Header has text-base, font-semibold CSS classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.10 |
| :---- | :---- |
| Feature | Pay Rate Display Styling |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify pay rate display has correct styling |
| Input | Render component |
| Expected Output | Pay display has text-2xl, font-bold CSS classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.11 |
| :---- | :---- |
| Feature | Maximum Hours Input Fields |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify both input fields render with correct labels |
| Input | Render component with default form data |
| Expected Output | "Maximum Hours per Week" and "Maximum Hours per Shift" labels and inputs visible |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.12 |
| :---- | :---- |
| Feature | Weekly Input Attributes |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify maximum hours per week input has correct attributes |
| Input | Render component |
| Expected Output | type="number", min="1", max="44", correct CSS classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.13 |
| :---- | :---- |
| Feature | Shift Input Attributes |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify maximum hours per shift input has correct attributes |
| Input | Render component |
| Expected Output | type="number", min="1", max="12", correct CSS classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.14 |
| :---- | :---- |
| Feature | Empty Value Display |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify empty string displayed when form data values are 0 or undefined |
| Input | Form data with maxHoursPerWeek: 0, maxHoursPerShift: 0 |
| Expected Output | Input values are empty strings |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.15 |
| :---- | :---- |
| Feature | Undefined Value Display |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify empty string displayed when form data values are undefined |
| Input | Form data with undefined maxHoursPerWeek and maxHoursPerShift |
| Expected Output | Input values are empty strings |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.16 |
| :---- | :---- |
| Feature | Layout Classes |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify component renders with correct layout classes |
| Input | Render component |
| Expected Output | Main div has flex, gap-8, mb-5, items-end classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.17 |
| :---- | :---- |
| Feature | Label Styling |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify labels have correct styling |
| Input | Render component |
| Expected Output | Labels have block, text-base, font-semibold, mb-2, text-main classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U13.18 |
| :---- | :---- |
| Feature | Location Error Handling |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify component displays and handles location-specific errors |
| Input | Trigger location error via LocationAwareMap |
| Expected Output | "Location Service Issue" displayed with "Try Again" button |
| Test Type | Unit Test |

**TC-UC3-U15 (User Interaction with form)**

| Test Case ID | TC-UC3-U15.1 |
| :---- | :---- |
| Feature | Form Submission Success |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify form handles successful submission correctly |
| Input | Mock savePreferences to return true, click Save button |
| Expected Output | savePreferences called with form data, success message displayed |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.2 |
| :---- | :---- |
| Feature | Job Type Selection |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify checkbox selection updates form data correctly |
| Input | Click unchecked job type checkbox |
| Expected Output | setFormData called with job type added to selectedJobNames array |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.3 |
| :---- | :---- |
| Feature | Job Type Deselection |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify checkbox deselection updates form data correctly |
| Input | Click checked job type checkbox |
| Expected Output | setFormData called with job type removed from selectedJobNames array |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.4 |
| :---- | :---- |
| Feature | Multiple Job Type Selections |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify multiple job type selections work correctly |
| Input | Click multiple job type checkboxes in sequence |
| Expected Output | setFormData called multiple times, each adding to selectedJobNames array |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.5 |
| :---- | :---- |
| Feature | Pay Rate Slider Change |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify pay rate slider updates form data correctly |
| Input | Change slider value to 25 |
| Expected Output | setFormData called with payRate: 25 |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.6 |
| :---- | :---- |
| Feature | Minimum Pay Rate Boundary |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify minimum pay rate value (5) is handled correctly |
| Input | Set slider to minimum value 5 |
| Expected Output | setFormData called with payRate: 5 |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.7 |
| :---- | :---- |
| Feature | Maximum Pay Rate Boundary |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify maximum pay rate value (30) is handled correctly |
| Input | Set slider to maximum value 30 |
| Expected Output | setFormData called with payRate: 30 |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.8 |
| :---- | :---- |
| Feature | Consider Lower Rate Toggle |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox toggles considerLowerRate correctly when checking |
| Input | Click unchecked considerLowerRate checkbox |
| Expected Output | setFormData called with considerLowerRate: true |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.9 |
| :---- | :---- |
| Feature | Consider Lower Rate Untoggle |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox toggles considerLowerRate correctly when unchecking |
| Input | Click checked considerLowerRate checkbox |
| Expected Output | setFormData called with considerLowerRate: false |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.10 |
| :---- | :---- |
| Feature | String Input Handling |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify slider handles string input correctly |
| Input | Fire change event with string value "15" |
| Expected Output | setFormData called with numeric payRate: 15 |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.11 |
| :---- | :---- |
| Feature | Display Update on Change |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify pay rate display updates when slider changes |
| Input | Rerender with updated payRate: 25 |
| Expected Output | Display shows "20" not visible |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.12 |
| :---- | :---- |
| Feature | Weekly Hours Change |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify maximum hours per week input updates form data correctly |
| Input | Change weekly hours input to 35 |
| Expected Output | setFormData called with maxHoursPerWeek: 35 |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.13 |
| :---- | :---- |
| Feature | Shift Hours Change |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify maximum hours per shift input updates form data correctly |
| Input | Change shift hours input to 6 |
| Expected Output | setFormData called with maxHoursPerShift: 6 |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.14 |
| :---- | :---- |
| Feature | Empty Input Handling |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify empty input values are handled by setting to 0 |
| Input | Clear input field (empty string) |
| Expected Output | setFormData called with value: 0 |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.15 |
| :---- | :---- |
| Feature | Non-numeric Input Handling |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify non-numeric input is handled by setting to 0 |
| Input | Enter "abc" in input field |
| Expected Output | setFormData called with value: 0 |
| Test Type | Unit Test |

| Test Case ID | TC-UC3-U15.16 |
| :---- | :---- |
| Feature | Decimal Input Conversion |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify decimal input is converted to integer |
| Input | Enter "25.7" in input field |
| Expected Output | setFormData called with value: 25 |
| Test Type | Unit Test |

**TC-UC3-U18** 

| Test Case ID | TC-UC3-U18.1 |
| :---- | :---- |
| Feature | Form Submission Failure |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify form handles failed submission correctly |
| Input | Mock savePreferences to return false, click Save button |
| Expected Output | savePreferences called, no success message displayed, button not disabled |
| Test Type | Unit Test |

