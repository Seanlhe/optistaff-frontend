# Test Tables for UC3 and UC4 Unit Tests

## UC3: Set Preferences Unit Tests

### TC-UC3-U1.1

| Test Case ID | TC-UC3-U1.1 |
|--------------|-----------|
| Feature | JSPref Tab Navigation |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify that JSPref renders correctly with default Preferences tab selected |
| Input | Render `<JSPref />` component |
| Expected Output | Preferences tab active by default, Availability tab inactive, PreferencesForm component visible |
| Test Type | Unit Test |

### TC-UC3-U1.2

| Test Case ID | TC-UC3-U1.2 |
|--------------|-----------|
| Feature | JSPref CSS Classes |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify that correct CSS classes are applied to active and inactive tabs |
| Input | Render `<JSPref />` component |
| Expected Output | Active tab has `bg-white` class, inactive tab has `hover:bg-white/60` class |
| Test Type | Unit Test |

### TC-UC3-U1.3

| Test Case ID | TC-UC3-U1.3 |
|--------------|-----------|
| Feature | Tab Navigation Back to Preferences |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify user can switch back to Preferences tab after switching to Availability |
| Input | Click Availability tab, then click Preferences tab |
| Expected Output | PreferencesForm component visible, Availability component hidden |
| Test Type | Unit Test |

### TC-UC3-U1.4

| Test Case ID | TC-UC3-U1.4 |
|--------------|-----------|
| Feature | Container Structure |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify JSPref renders with correct container structure and styling |
| Input | Render `<JSPref />` component |
| Expected Output | Correct CSS classes for main container, max-width container, and tab buttons |
| Test Type | Unit Test |

### TC-UC3-U1.5

| Test Case ID | TC-UC3-U1.5 |
|--------------|-----------|
| Feature | Tab Button Styling |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify tab buttons render with correct styling structure |
| Input | Render `<JSPref />` component |
| Expected Output | Tab buttons have correct CSS classes and container styling |
| Test Type | Unit Test |

### TC-UC3-U1.6

| Test Case ID | TC-UC3-U1.6 |
|--------------|-----------|
| Feature | Single Component Rendering |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify only one component renders at a time (Preferences OR Availability) |
| Input | Switch between tabs |
| Expected Output | Only one tab content component visible at any time |
| Test Type | Unit Test |

### TC-UC3-U1.7

| Test Case ID | TC-UC3-U1.7 |
|--------------|-----------|
| Feature | Invalid Tab State Handling |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify component handles invalid activeTab state gracefully |
| Input | Render component with edge case activeTab values |
| Expected Output | Component renders default first tab content without crashing |
| Test Type | Unit Test |

### TC-UC3-U1.8

| Test Case ID | TC-UC3-U1.8 |
|--------------|-----------|
| Feature | Missing Child Components |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify component handles missing child components gracefully |
| Input | Render component when child components are unavailable |
| Expected Output | Tab structure renders regardless of child component state |
| Test Type | Unit Test |

### TC-UC3-U2.1

| Test Case ID | TC-UC3-U2.1 |
|--------------|-----------|
| Feature | PreferencesForm Rendering |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify PreferencesForm renders correctly and displays all child components |
| Input | Render `<PreferencesForm />` component |
| Expected Output | All child components visible: PreferencesMaximum, PreferencesPay, PreferencesJobType, LocationAwareMap, Save button |
| Test Type | Unit Test |

### TC-UC3-U2.2

| Test Case ID | TC-UC3-U2.2 |
|--------------|-----------|
| Feature | Error Message Display |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify component displays general error message from usePreferencesForm hook |
| Input | Hook returns error: "Failed to connect to the server." |
| Expected Output | "Error Loading Preferences" and error message displayed |
| Test Type | Unit Test |

### TC-UC3-U7.1

| Test Case ID | TC-UC3-U7.1 |
|--------------|-----------|
| Feature | Job Types Display by Category |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify PreferencesJobType renders job types grouped by category |
| Input | Render component with mock job types data |
| Expected Output | Categories displayed with job types grouped correctly underneath |
| Test Type | Unit Test |

### TC-UC3-U7.2

| Test Case ID | TC-UC3-U7.2 |
|--------------|-----------|
| Feature | Existing Job Selections Loading |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify component loads existing selected job names from form data |
| Input | Form data with pre-selected job types: ["Waiter", "Cashier"] |
| Expected Output | Corresponding checkboxes are checked, styling applied correctly |
| Test Type | Unit Test |

### TC-UC3-U7.3

| Test Case ID | TC-UC3-U7.3 |
|--------------|-----------|
| Feature | Job Type Selection Styling |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify correct styling applied for selected and unselected job types |
| Input | Form data with some selected job types |
| Expected Output | Selected items have `bg-primary-blue/5` styling, unselected have `bg-card-color` |
| Test Type | Unit Test |

### TC-UC3-U7.4

| Test Case ID | TC-UC3-U7.4 |
|--------------|-----------|
| Feature | Checkbox Attributes |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify all checkboxes render with correct attributes and styling |
| Input | Render component with job types data |
| Expected Output | All checkboxes have correct type, styling classes (h-4, w-4, rounded-sm) |
| Test Type | Unit Test |

### TC-UC3-U8.1

| Test Case ID | TC-UC3-U8.1 |
|--------------|-----------|
| Feature | Job Types Loading State |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify component shows loading state while useJobTypes hook fetches data |
| Input | useJobTypes hook returns loading: true |
| Expected Output | Loading skeleton with animate-pulse class displayed |
| Test Type | Unit Test |

### TC-UC3-U8.2

| Test Case ID | TC-UC3-U8.2 |
|--------------|-----------|
| Feature | Job Types Error State |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify component shows error state when there is an error loading job types |
| Input | useJobTypes hook returns error: "Failed to load job types" |
| Expected Output | "Error Loading Job Types" message and error text displayed |
| Test Type | Unit Test |

### TC-UC3-U13.1

| Test Case ID | TC-UC3-U13.1 |
|--------------|-----------|
| Feature | Pay Rate Component Rendering |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify PreferencesPay renders correctly with all elements |
| Input | Render component with default form data |
| Expected Output | Pay rate display, slider, checkbox, and labels all visible with correct values |
| Test Type | Unit Test |

### TC-UC3-U13.2

| Test Case ID | TC-UC3-U13.2 |
|--------------|-----------|
| Feature | Pay Rate Value Display |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify component displays correct pay rate value |
| Input | Form data with payRate: 25 |
| Expected Output | "$25" displayed correctly |
| Test Type | Unit Test |

### TC-UC3-U13.3

| Test Case ID | TC-UC3-U13.3 |
|--------------|-----------|
| Feature | Slider Attributes |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify slider has correct attributes and styling |
| Input | Render component with form data |
| Expected Output | Slider type="range", min="5", max="30", correct CSS classes |
| Test Type | Unit Test |

### TC-UC3-U13.4

| Test Case ID | TC-UC3-U13.4 |
|--------------|-----------|
| Feature | Checkbox Default State |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox displays in unchecked state by default |
| Input | Form data with considerLowerRate: false |
| Expected Output | Checkbox unchecked |
| Test Type | Unit Test |

### TC-UC3-U13.5

| Test Case ID | TC-UC3-U13.5 |
|--------------|-----------|
| Feature | Checkbox Checked State |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox displays in checked state when considerLowerRate is true |
| Input | Form data with considerLowerRate: true |
| Expected Output | Checkbox checked |
| Test Type | Unit Test |

### TC-UC3-U13.6

| Test Case ID | TC-UC3-U13.6 |
|--------------|-----------|
| Feature | Checkbox Attributes |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox has correct attributes and styling |
| Input | Render component |
| Expected Output | type="checkbox", id="consider-lower-rate", correct CSS classes |
| Test Type | Unit Test |

### TC-UC3-U13.7

| Test Case ID | TC-UC3-U13.7 |
|--------------|-----------|
| Feature | Label Attributes |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify label has correct attributes and styling |
| Input | Render component |
| Expected Output | Label for="consider-lower-rate", correct CSS classes |
| Test Type | Unit Test |

### TC-UC3-U13.8

| Test Case ID | TC-UC3-U13.8 |
|--------------|-----------|
| Feature | Container Styling |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify component renders with correct container styling |
| Input | Render component |
| Expected Output | Main div has correct CSS classes (p-6, bg-card-color) |
| Test Type | Unit Test |

### TC-UC3-U13.9

| Test Case ID | TC-UC3-U13.9 |
|--------------|-----------|
| Feature | Header Styling |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify header text has correct styling |
| Input | Render component |
| Expected Output | Header has text-base, font-semibold CSS classes |
| Test Type | Unit Test |

### TC-UC3-U13.10

| Test Case ID | TC-UC3-U13.10 |
|--------------|-----------|
| Feature | Pay Rate Display Styling |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify pay rate display has correct styling |
| Input | Render component |
| Expected Output | Pay display has text-2xl, font-bold CSS classes |
| Test Type | Unit Test |

### TC-UC3-U13.11

| Test Case ID | TC-UC3-U13.11 |
|--------------|-----------|
| Feature | Maximum Hours Input Fields |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify both input fields render with correct labels |
| Input | Render component with default form data |
| Expected Output | "Maximum Hours per Week" and "Maximum Hours per Shift" labels and inputs visible |
| Test Type | Unit Test |

### TC-UC3-U13.12

| Test Case ID | TC-UC3-U13.12 |
|--------------|-----------|
| Feature | Weekly Input Attributes |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify maximum hours per week input has correct attributes |
| Input | Render component |
| Expected Output | type="number", min="1", max="44", correct CSS classes |
| Test Type | Unit Test |

### TC-UC3-U13.13

| Test Case ID | TC-UC3-U13.13 |
|--------------|-----------|
| Feature | Shift Input Attributes |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify maximum hours per shift input has correct attributes |
| Input | Render component |
| Expected Output | type="number", min="1", max="12", correct CSS classes |
| Test Type | Unit Test |

### TC-UC3-U13.14

| Test Case ID | TC-UC3-U13.14 |
|--------------|-----------|
| Feature | Empty Value Display |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify empty string displayed when form data values are 0 or undefined |
| Input | Form data with maxHoursPerWeek: 0, maxHoursPerShift: 0 |
| Expected Output | Input values are empty strings |
| Test Type | Unit Test |

### TC-UC3-U13.15

| Test Case ID | TC-UC3-U13.15 |
|--------------|-----------|
| Feature | Undefined Value Display |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify empty string displayed when form data values are undefined |
| Input | Form data with undefined maxHoursPerWeek and maxHoursPerShift |
| Expected Output | Input values are empty strings |
| Test Type | Unit Test |

### TC-UC3-U13.16

| Test Case ID | TC-UC3-U13.16 |
|--------------|-----------|
| Feature | Layout Classes |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify component renders with correct layout classes |
| Input | Render component |
| Expected Output | Main div has flex, gap-8, mb-5, items-end classes |
| Test Type | Unit Test |

### TC-UC3-U13.17

| Test Case ID | TC-UC3-U13.17 |
|--------------|-----------|
| Feature | Label Styling |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify labels have correct styling |
| Input | Render component |
| Expected Output | Labels have block, text-base, font-semibold, mb-2, text-main classes |
| Test Type | Unit Test |

### TC-UC3-U13.18

| Test Case ID | TC-UC3-U13.18 |
|--------------|-----------|
| Feature | Location Error Handling |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify component displays and handles location-specific errors |
| Input | Trigger location error via LocationAwareMap |
| Expected Output | "Location Service Issue" displayed with "Try Again" button |
| Test Type | Unit Test |

### TC-UC3-U15.1

| Test Case ID | TC-UC3-U15.1 |
|--------------|-----------|
| Feature | Form Submission Success |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify form handles successful submission correctly |
| Input | Mock savePreferences to return true, click Save button |
| Expected Output | savePreferences called with form data, success message displayed |
| Test Type | Unit Test |

### TC-UC3-U15.2

| Test Case ID | TC-UC3-U15.2 |
|--------------|-----------|
| Feature | Job Type Selection |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify checkbox selection updates form data correctly |
| Input | Click unchecked job type checkbox |
| Expected Output | setFormData called with job type added to selectedJobNames array |
| Test Type | Unit Test |

### TC-UC3-U15.3

| Test Case ID | TC-UC3-U15.3 |
|--------------|-----------|
| Feature | Job Type Deselection |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify checkbox deselection updates form data correctly |
| Input | Click checked job type checkbox |
| Expected Output | setFormData called with job type removed from selectedJobNames array |
| Test Type | Unit Test |

### TC-UC3-U15.4

| Test Case ID | TC-UC3-U15.4 |
|--------------|-----------|
| Feature | Multiple Job Type Selections |
| Component | src/components/PreferencesJobType.tsx |
| Test Description | Verify multiple job type selections work correctly |
| Input | Click multiple job type checkboxes in sequence |
| Expected Output | setFormData called multiple times, each adding to selectedJobNames array |
| Test Type | Unit Test |

### TC-UC3-U15.5

| Test Case ID | TC-UC3-U15.5 |
|--------------|-----------|
| Feature | Pay Rate Slider Change |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify pay rate slider updates form data correctly |
| Input | Change slider value to 25 |
| Expected Output | setFormData called with payRate: 25 |
| Test Type | Unit Test |

### TC-UC3-U15.6

| Test Case ID | TC-UC3-U15.6 |
|--------------|-----------|
| Feature | Minimum Pay Rate Boundary |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify minimum pay rate value (5) is handled correctly |
| Input | Set slider to minimum value 5 |
| Expected Output | setFormData called with payRate: 5 |
| Test Type | Unit Test |

### TC-UC3-U15.7

| Test Case ID | TC-UC3-U15.7 |
|--------------|-----------|
| Feature | Maximum Pay Rate Boundary |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify maximum pay rate value (30) is handled correctly |
| Input | Set slider to maximum value 30 |
| Expected Output | setFormData called with payRate: 30 |
| Test Type | Unit Test |

### TC-UC3-U15.8

| Test Case ID | TC-UC3-U15.8 |
|--------------|-----------|
| Feature | Consider Lower Rate Toggle |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox toggles considerLowerRate correctly when checking |
| Input | Click unchecked considerLowerRate checkbox |
| Expected Output | setFormData called with considerLowerRate: true |
| Test Type | Unit Test |

### TC-UC3-U15.9

| Test Case ID | TC-UC3-U15.9 |
|--------------|-----------|
| Feature | Consider Lower Rate Untoggle |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify checkbox toggles considerLowerRate correctly when unchecking |
| Input | Click checked considerLowerRate checkbox |
| Expected Output | setFormData called with considerLowerRate: false |
| Test Type | Unit Test |

### TC-UC3-U15.10

| Test Case ID | TC-UC3-U15.10 |
|--------------|-----------|
| Feature | String Input Handling |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify slider handles string input correctly |
| Input | Fire change event with string value "15" |
| Expected Output | setFormData called with numeric payRate: 15 |
| Test Type | Unit Test |

### TC-UC3-U15.11

| Test Case ID | TC-UC3-U15.11 |
|--------------|-----------|
| Feature | Display Update on Change |
| Component | src/components/PreferencesPay.tsx |
| Test Description | Verify pay rate display updates when slider changes |
| Input | Rerender with updated payRate: 25 |
| Expected Output | Display shows "$25", old "$20" not visible |
| Test Type | Unit Test |

### TC-UC3-U15.12

| Test Case ID | TC-UC3-U15.12 |
|--------------|-----------|
| Feature | Weekly Hours Change |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify maximum hours per week input updates form data correctly |
| Input | Change weekly hours input to 35 |
| Expected Output | setFormData called with maxHoursPerWeek: 35 |
| Test Type | Unit Test |

### TC-UC3-U15.13

| Test Case ID | TC-UC3-U15.13 |
|--------------|-----------|
| Feature | Shift Hours Change |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify maximum hours per shift input updates form data correctly |
| Input | Change shift hours input to 6 |
| Expected Output | setFormData called with maxHoursPerShift: 6 |
| Test Type | Unit Test |

### TC-UC3-U15.14

| Test Case ID | TC-UC3-U15.14 |
|--------------|-----------|
| Feature | Empty Input Handling |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify empty input values are handled by setting to 0 |
| Input | Clear input field (empty string) |
| Expected Output | setFormData called with value: 0 |
| Test Type | Unit Test |

### TC-UC3-U15.15

| Test Case ID | TC-UC3-U15.15 |
|--------------|-----------|
| Feature | Non-numeric Input Handling |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify non-numeric input is handled by setting to 0 |
| Input | Enter "abc" in input field |
| Expected Output | setFormData called with value: 0 |
| Test Type | Unit Test |

### TC-UC3-U15.16

| Test Case ID | TC-UC3-U15.16 |
|--------------|-----------|
| Feature | Decimal Input Conversion |
| Component | src/components/PreferencesMaximum.tsx |
| Test Description | Verify decimal input is converted to integer |
| Input | Enter "25.7" in input field |
| Expected Output | setFormData called with value: 25 |
| Test Type | Unit Test |

### TC-UC3-U18.1

| Test Case ID | TC-UC3-U18.1 |
|--------------|-----------|
| Feature | Form Submission Failure |
| Component | src/components/PreferencesForm.tsx |
| Test Description | Verify form handles failed submission correctly |
| Input | Mock savePreferences to return false, click Save button |
| Expected Output | savePreferences called, no success message displayed, button not disabled |
| Test Type | Unit Test |

## UC4: Indicate Availability Unit Tests

### TC-UC4-U1.1

| Test Case ID | TC-UC4-U1.1 |
|--------------|-----------|
| Feature | Availability Tab Switch |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify user can switch to Availability tab |
| Input | Click Availability tab button |
| Expected Output | Availability component visible, Preferences component hidden, tab styling updated |
| Test Type | Unit Test |

### TC-UC4-U1.2

| Test Case ID | TC-UC4-U1.2 |
|--------------|-----------|
| Feature | Tab CSS Class Updates |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify CSS classes update correctly when switching tabs |
| Input | Switch between Preferences and Availability tabs |
| Expected Output | Active tab gets `bg-white`, inactive tab gets `hover:bg-white/60` |
| Test Type | Unit Test |

### TC-UC4-U1.3

| Test Case ID | TC-UC4-U1.3 |
|--------------|-----------|
| Feature | Tab State Persistence |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify tab state maintains across multiple clicks |
| Input | Click same tab multiple times |
| Expected Output | Tab state remains consistent, correct component always visible |
| Test Type | Unit Test |

### TC-UC4-U1.4

| Test Case ID | TC-UC4-U1.4 |
|--------------|-----------|
| Feature | Rapid Tab Switching |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify component handles rapid tab switching gracefully |
| Input | Rapidly click between tabs 20 times |
| Expected Output | Component remains functional, correct tab state maintained |
| Test Type | Unit Test |

### TC-UC4-U10.1

| Test Case ID | TC-UC4-U10.1 |
|--------------|-----------|
| Feature | Template Modal Rendering |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify modal renders when isOpen is true |
| Input | Render component with isOpen: true |
| Expected Output | "Templates" heading, "Save as New Template" button, and X icon visible |
| Test Type | Unit Test |

### TC-UC4-U10.2

| Test Case ID | TC-UC4-U10.2 |
|--------------|-----------|
| Feature | Template Fetching |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify fetchAllTemplates is called when modal opens |
| Input | Render component with isOpen: true |
| Expected Output | fetchAllTemplates hook method called |
| Test Type | Unit Test |

### TC-UC4-U10.3

| Test Case ID | TC-UC4-U10.3 |
|--------------|-----------|
| Feature | Template Display |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify templates display when available |
| Input | Mock templates data with multiple templates |
| Expected Output | All template names displayed correctly |
| Test Type | Unit Test |

### TC-UC4-U10.4

| Test Case ID | TC-UC4-U10.4 |
|--------------|-----------|
| Feature | Creation Date Formatting |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify creation dates are formatted correctly |
| Input | Templates with various creation dates |
| Expected Output | Dates formatted as "Created: MM/DD/YYYY" |
| Test Type | Unit Test |

### TC-UC4-U10.5

| Test Case ID | TC-UC4-U10.5 |
|--------------|-----------|
| Feature | Delete Button Click |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify onDelete called when Delete button is clicked |
| Input | Click Delete button on template |
| Expected Output | onDelete called with correct template_id |
| Test Type | Unit Test |

### TC-UC4-U10.6

| Test Case ID | TC-UC4-U10.6 |
|--------------|-----------|
| Feature | Close Button Click |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify onClose called when X button is clicked |
| Input | Click X button |
| Expected Output | onClose called |
| Test Type | Unit Test |

### TC-UC4-U15.1

| Test Case ID | TC-UC4-U15.1 |
|--------------|-----------|
| Feature | Template Selection |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify onSelect called when Use button is clicked |
| Input | Click Use button on template |
| Expected Output | onSelect called with correct template_id |
| Test Type | Unit Test |

### TC-UC4-U22.1

| Test Case ID | TC-UC4-U22.1 |
|--------------|-----------|
| Feature | Event Time Display |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify calendar event renders with correct time display |
| Input | Event with startTime: 10:00, endTime: 12:00 |
| Expected Output | "10:00 - 12:00" displayed |
| Test Type | Unit Test |

### TC-UC4-U22.2

| Test Case ID | TC-UC4-U22.2 |
|--------------|-----------|
| Feature | Event Positioning |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify correct positioning and height based on event times |
| Input | Event with 2-hour duration starting at 10:00 AM |
| Expected Output | top: "480px" (10 * 48px), height: "96px" (2 * 48px) |
| Test Type | Unit Test |

### TC-UC4-U22.3

| Test Case ID | TC-UC4-U22.3 |
|--------------|-----------|
| Feature | Unselected State Styling |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify correct CSS classes applied for unselected state |
| Input | Render unselected calendar event |
| Expected Output | bg-primary-blue/40, border-primary-blue/60, hover:bg-primary-blue/80, cursor-grab classes |
| Test Type | Unit Test |

### TC-UC4-U22.4

| Test Case ID | TC-UC4-U22.4 |
|--------------|-----------|
| Feature | Selection Toggle |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify selection state toggles when clicked |
| Input | Click on calendar event |
| Expected Output | Background changes to bg-primary-blue, border to border-primary-blue |
| Test Type | Unit Test |

### TC-UC4-U22.5

| Test Case ID | TC-UC4-U22.5 |
|--------------|-----------|
| Feature | Focus/Blur Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify focus and blur events work correctly |
| Input | Focus then blur calendar event |
| Expected Output | Focus selects event, blur deselects (when not dragging) |
| Test Type | Unit Test |

### TC-UC4-U22.6

| Test Case ID | TC-UC4-U22.6 |
|--------------|-----------|
| Feature | Double-click Deletion |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify event deletion on double-click |
| Input | Double-click calendar event |
| Expected Output | onDelete called with event ID |
| Test Type | Unit Test |

### TC-UC4-U22.7

| Test Case ID | TC-UC4-U22.7 |
|--------------|-----------|
| Feature | Keyboard Delete |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify event deletion on Delete key when selected |
| Input | Select event, press Delete key |
| Expected Output | onDelete called with event ID |
| Test Type | Unit Test |

### TC-UC4-U22.8

| Test Case ID | TC-UC4-U22.8 |
|--------------|-----------|
| Feature | Keyboard Backspace |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify event deletion on Backspace key when selected |
| Input | Select event, press Backspace key |
| Expected Output | onDelete called with event ID |
| Test Type | Unit Test |

### TC-UC4-U22.9

| Test Case ID | TC-UC4-U22.9 |
|--------------|-----------|
| Feature | Keyboard No-op When Unselected |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify no deletion on keyboard press when not selected |
| Input | Press Delete without selecting event |
| Expected Output | onDelete not called |
| Test Type | Unit Test |

### TC-UC4-U22.10

| Test Case ID | TC-UC4-U22.10 |
|--------------|-----------|
| Feature | Resize Handle Display |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify resize handle shows on hover |
| Input | Render calendar event |
| Expected Output | Resize handle with cursor-ns-resize, opacity-0, hover:opacity-100 classes |
| Test Type | Unit Test |

### TC-UC4-U22.11

| Test Case ID | TC-UC4-U22.11 |
|--------------|-----------|
| Feature | Drag Initiation |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify dragging state initiates on mouse down |
| Input | Mouse down on calendar event |
| Expected Output | opacity-50 and cursor-grabbing classes applied |
| Test Type | Unit Test |

### TC-UC4-U22.12

| Test Case ID | TC-UC4-U22.12 |
|--------------|-----------|
| Feature | Drag Mouse Movement |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify dragging with mouse move events |
| Input | Mouse down, move mouse, mouse up |
| Expected Output | onUpdate called during movement, dragging styles removed on mouse up |
| Test Type | Unit Test |

### TC-UC4-U22.13

| Test Case ID | TC-UC4-U22.13 |
|--------------|-----------|
| Feature | Horizontal Drag Between Days |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify horizontal dragging moves event between days |
| Input | Mouse down, move horizontally 200px (1 day width) |
| Expected Output | onUpdate called with new day position |
| Test Type | Unit Test |

### TC-UC4-U22.14

| Test Case ID | TC-UC4-U22.14 |
|--------------|-----------|
| Feature | Resize Functionality |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify event resize functionality works |
| Input | Mouse down on resize handle, move mouse |
| Expected Output | onUpdate called with new event duration |
| Test Type | Unit Test |

### TC-UC4-U22.15

| Test Case ID | TC-UC4-U22.15 |
|--------------|-----------|
| Feature | Resize Handle Event Propagation |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify resize handle prevents event propagation |
| Input | Click on resize handle |
| Expected Output | Main event mousedown handler not triggered |
| Test Type | Unit Test |

### TC-UC4-U22.16

| Test Case ID | TC-UC4-U22.16 |
|--------------|-----------|
| Feature | Different Duration Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify events with different durations render correctly |
| Input | Event with 30-minute duration |
| Expected Output | height: "24px" (0.5 * 48px) |
| Test Type | Unit Test |

### TC-UC4-U22.17

| Test Case ID | TC-UC4-U22.17 |
|--------------|-----------|
| Feature | Different Time of Day |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify events at different times of day position correctly |
| Input | Event starting at 6 PM (18:00) |
| Expected Output | top: "864px" (18 * 48px) |
| Test Type | Unit Test |

### TC-UC4-U22.18

| Test Case ID | TC-UC4-U22.18 |
|--------------|-----------|
| Feature | Minute-precise Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify events spanning minutes calculate positioning correctly |
| Input | Event from 10:15 to 11:45 |
| Expected Output | top: "492px" (10.25 * 48px), height: "72px" (1.5 * 48px) |
| Test Type | Unit Test |

### TC-UC4-U22.19

| Test Case ID | TC-UC4-U22.19 |
|--------------|-----------|
| Feature | Z-index During Drag |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify correct z-index when dragging |
| Input | Start dragging event |
| Expected Output | z-index changes from 1 to 10, returns to 1 after drag |
| Test Type | Unit Test |

### TC-UC4-U22.20

| Test Case ID | TC-UC4-U22.20 |
|--------------|-----------|
| Feature | Invalid Date Handling |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles invalid date objects gracefully |
| Input | Event with invalid Date objects |
| Expected Output | Component renders without crashing |
| Test Type | Unit Test |

### TC-UC4-U22.21

| Test Case ID | TC-UC4-U22.21 |
|--------------|-----------|
| Feature | Missing Event Properties |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles missing event properties gracefully |
| Input | Event with null/undefined startTime, endTime, empty ID |
| Expected Output | Component renders without crashing |
| Test Type | Unit Test |

### TC-UC4-U22.22

| Test Case ID | TC-UC4-U22.22 |
|--------------|-----------|
| Feature | Negative Duration Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles negative duration events gracefully |
| Input | Event where endTime is before startTime |
| Expected Output | Component handles gracefully without breaking |
| Test Type | Unit Test |

### TC-UC4-U22.23

| Test Case ID | TC-UC4-U22.23 |
|--------------|-----------|
| Feature | Invalid day_of_week Values |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles invalid day_of_week values gracefully |
| Input | Event with day_of_week outside 0-6 range |
| Expected Output | Component renders without errors |
| Test Type | Unit Test |

### TC-UC4-U22.24

| Test Case ID | TC-UC4-U22.24 |
|--------------|-----------|
| Feature | Invalid Drag Coordinates |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles drag operations with invalid coordinates gracefully |
| Input | Drag with negative or extremely large coordinate values |
| Expected Output | Component handles gracefully without breaking |
| Test Type | Unit Test |

### TC-UC4-U22.25

| Test Case ID | TC-UC4-U22.25 |
|--------------|-----------|
| Feature | Invalid Keyboard Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles keyboard events with invalid properties gracefully |
| Input | Keyboard events with missing or invalid properties |
| Expected Output | Component handles gracefully without errors |
| Test Type | Unit Test |

### TC-UC4-U22.26

| Test Case ID | TC-UC4-U22.26 |
|--------------|-----------|
| Feature | Resize Boundary Violations |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles resize operations with boundary violations gracefully |
| Input | Resize beyond calendar boundaries |
| Expected Output | Component handles gracefully, prevents invalid sizes |
| Test Type | Unit Test |

### TC-UC4-U22.27

| Test Case ID | TC-UC4-U22.27 |
|--------------|-----------|
| Feature | Null Callback Functions |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles null or undefined callback functions gracefully |
| Input | Pass null/undefined onUpdate or onDelete functions |
| Expected Output | Component renders and handles interactions without crashing |
| Test Type | Unit Test |

### TC-UC4-U22.28

| Test Case ID | TC-UC4-U22.28 |
|--------------|-----------|
| Feature | Extreme Time Values |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles extreme time values gracefully |
| Input | Events with very early or very late times |
| Expected Output | Component calculates positions correctly or handles gracefully |
| Test Type | Unit Test |

### TC-UC4-U22.29

| Test Case ID | TC-UC4-U22.29 |
|--------------|-----------|
| Feature | Rapid Interactions |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles rapid interaction events gracefully |
| Input | Rapid mouse clicks, drags, keyboard presses |
| Expected Output | Component remains stable and functional |
| Test Type | Unit Test |

### TC-UC4-U22.30

| Test Case ID | TC-UC4-U22.30 |
|--------------|-----------|
| Feature | Corrupted Event Data |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles corrupted event data structure gracefully |
| Input | Event object with unexpected properties or structure |
| Expected Output | Component renders safely without breaking |
| Test Type | Unit Test |

### TC-UC4-U25.1

| Test Case ID | TC-UC4-U25.1 |
|--------------|-----------|
| Feature | Save as Template Button |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify onSaveTemplate called when Save as New Template button is clicked |
| Input | Click "Save as New Template" button |
| Expected Output | onSaveTemplate called |
| Test Type | Unit Test |

### TC-UC4-U26.1

| Test Case ID | TC-UC4-U26.1 |
|--------------|-----------|
| Feature | Template Name Modal Rendering |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify modal renders when isOpen is true |
| Input | Render component with isOpen: true |
| Expected Output | "Save Template" heading, template name input, Save and Cancel buttons visible |
| Test Type | Unit Test |

### TC-UC4-U26.2

| Test Case ID | TC-UC4-U26.2 |
|--------------|-----------|
| Feature | Template Name Input |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify user can enter template name |
| Input | Type "My Template" in input field |
| Expected Output | Input value updates to "My Template" |
| Test Type | Unit Test |

### TC-UC4-U26.3

| Test Case ID | TC-UC4-U26.3 |
|--------------|-----------|
| Feature | Cancel Button Click |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify onClose called when Cancel button is clicked |
| Input | Click Cancel button |
| Expected Output | onClose called |
| Test Type | Unit Test |

### TC-UC4-U26.4

| Test Case ID | TC-UC4-U26.4 |
|--------------|-----------|
| Feature | X Button Click |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify onClose called when X button is clicked |
| Input | Click X button |
| Expected Output | onClose called |
| Test Type | Unit Test |

### TC-UC4-U26.5

| Test Case ID | TC-UC4-U26.5 |
|--------------|-----------|
| Feature | Input Focus |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify input field receives focus when modal opens |
| Input | Render modal with isOpen: true |
| Expected Output | Input field is focused (document.activeElement) |
| Test Type | Unit Test |

### TC-UC4-U27.1

| Test Case ID | TC-UC4-U27.1 |
|--------------|-----------|
| Feature | Template Name Submission |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify onSave called with trimmed template name when form is submitted |
| Input | Enter "  My Template  ", click Save Template button |
| Expected Output | onSave called with "My Template" (trimmed) |
| Test Type | Unit Test |

### TC-UC4-U27.2

| Test Case ID | TC-UC4-U27.2 |
|--------------|-----------|
| Feature | Enter Key Submission |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify onSave called when form is submitted via Enter key |
| Input | Enter template name, press Enter key |
| Expected Output | onSave called with template name |
| Test Type | Unit Test |

### TC-UC4-U27.3

| Test Case ID | TC-UC4-U27.3 |
|--------------|-----------|
| Feature | Input Clear After Save |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify input field clears after successful save |
| Input | Enter template name, click Save |
| Expected Output | Input field value becomes empty string |
| Test Type | Unit Test |

---

**UC4: Indicate Availability — Integration Tests**

Below are the integration tests for UC4 documented using the established two-column table format. Test IDs follow TC-UC4-I\[step\].\[subtest\], where \[step\] maps to the UC4 sequence diagram steps (1–27) from CompiledUC.md.

---

File: tests/integration/uc4/JSPref-tab-navigation.test.tsx

| Test Case ID | TC-UC4-I1.1 |
| :---- | :---- |
| Feature | Tab navigation to availability |
| Component | JSPref page + tab switching |
| Test Description | Navigate to availability tab and verify component switching |
| Input | Render JSPref, click Availability tab |
| Expected Output | Availability tab active, Availability component visible, Preferences component hidden |
| Test Type | Integration |

| Test Case ID | TC-UC4-I1.2 |
| :---- | :---- |
| Feature | Tab state persistence |
| Component | JSPref page |
| Test Description | Tab state maintains across multiple clicks |
| Input | Click same tab multiple times |
| Expected Output | Tab state remains consistent, correct component always visible |
| Test Type | Integration |

| Test Case ID | TC-UC4-I1.3 |
| :---- | :---- |
| Feature | Tab switching error handling |
| Component | JSPref page |
| Test Description | System handles tab switching errors gracefully |
| Input | Rapid tab switching between Preferences and Availability |
| Expected Output | Component remains functional, no crashes, correct tab state maintained |
| Test Type | Integration |

---

File: tests/integration/uc4/Calendar-integration.test.tsx

| Test Case ID | TC-UC4-I1.1 |
| :---- | :---- |
| Feature | Calendar rendering and navigation |
| Component | Calendar + useAvailability hook |
| Test Description | Navigate to availability and load calendar - renders calendar with week view and navigation controls |
| Input | Render Calendar component |
| Expected Output | Today/Save/Templates buttons visible, week days displayed, time slots rendered |
| Test Type | Integration |

| Test Case ID | TC-UC4-I2.1 |
| :---- | :---- |
| Feature | Calendar interface display |
| Component | Calendar + date navigation |
| Test Description | Render calendar with availability interface - user can navigate between weeks |
| Input | Click previous/next week buttons |
| Expected Output | Calendar updates week display, month heading changes, no crashes |
| Test Type | Integration |

| Test Case ID | TC-UC4-I3.1 |
| :---- | :---- |
| Feature | Load existing availability data |
| Component | Calendar + useAvailability hook |
| Test Description | Get availability data from database - calendar loads and displays existing availability |
| Input | Component mount with authenticated user |
| Expected Output | getAvailability called, existing events displayed on calendar |
| Test Type | Integration |

| Test Case ID | TC-UC4-I7.1 |
| :---- | :---- |
| Feature | Show availability interface |
| Component | Calendar + UI components |
| Test Description | Display interactive calendar - calendar displays complete interface with time slots and controls |
| Input | Render Calendar after data load |
| Expected Output | Week view displayed, time slots clickable, navigation functional |
| Test Type | Integration |

| Test Case ID | TC-UC4-I17.1 |
| :---- | :---- |
| Feature | Save availability to database |
| Component | Calendar + useAvailability hook |
| Test Description | Save availability - save button triggers availability data save to Supabase |
| Input | Create availability slots, click Save button |
| Expected Output | setAvailability called, save completes without errors |
| Test Type | Integration |

| Test Case ID | TC-UC4-I17.2 |
| :---- | :---- |
| Feature | Save error handling |
| Component | Calendar + error handling |
| Test Description | Handle save errors gracefully - system handles save errors gracefully |
| Input | Create slots, click Save (with potential errors) |
| Expected Output | Component remains functional, no crashes, error handled gracefully |
| Test Type | Integration |

| Test Case ID | TC-UC4-I22.1 |
| :---- | :---- |
| Feature | Create availability slot |
| Component | Calendar + event creation |
| Test Description | Manual time slot creation - user can create availability slots by double-clicking time slots |
| Input | Double-click on calendar time slot |
| Expected Output | New CalendarEvent created and displayed on calendar |
| Test Type | Integration |

| Test Case ID | TC-UC4-I22.2 |
| :---- | :---- |
| Feature | Delete availability slot |
| Component | Calendar + event deletion |
| Test Description | Manual time slot modification - user can delete availability slots by double-clicking events |
| Input | Create event, then double-click the created event |
| Expected Output | Event removed from calendar display |
| Test Type | Integration |