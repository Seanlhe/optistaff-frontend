# Frontend Test Cases Documentation
## Unit Tests and Integration Tests

### Testing Strategy Overview
The frontend testing for 5 React components (PreferencesMaximum, CalendarEvent, JSPref, Calendar, and PreferencesJobType) is divided into two distinct categories:

**Unit Tests** - Test individual components in isolation with mocked dependencies:
- **Isolated Testing (IT)**: Tests individual component behavior without external dependencies
- **Input Validation Testing (IVT)**: Tests input handling and validation logic
- **State Management Testing (SMT)**: Tests internal component state management

**Integration Tests** - Test component interactions and external service integration:
- **Component Integration Testing (CIT)**: Tests parent-child component interactions
- **Service Integration Testing (SIT)**: Tests integration with external services and APIs
- **Hook Integration Testing (HIT)**: Tests integration with React hooks and context

---

# UNIT TESTS

## 5. PreferencesJobType Component (Job Selection Logic)

**Component Purpose**: Job type selection interface with category-based organization and checkbox management
**Testing Strategy**: State Management Testing (SMT) + Input Validation Testing (IVT)

| Test Case ID | Test Case Name | Validation Type | Test Data | Expected Result | Test Category |
|--------------|----------------|----------------|-----------|-----------------|---------------|
| PJT-UT-01 | Component Structure Rendering | Initial Display | Mock job categories data | Success: Title, description, categories rendered | Display |
| PJT-UT-02 | Checkbox State Initialization | State Management | formData with pre-selected jobs | Success: selectedJobs state matches formData.selectedJobNames | State Initialization |
| PJT-UT-03 | Individual Checkbox Selection | State Management | Click unchecked job checkbox | Success: selectedJobs state updated, setFormData called | State Update |
| PJT-UT-04 | Checkbox Deselection | State Management | Click checked job checkbox | Success: Job removed from selectedJobs and formData | State Update |
| PJT-UT-05 | Multiple Checkbox Selection | State Management | Select multiple jobs across categories | Success: All selections maintained in state | State Persistence |
| PJT-UT-06 | Category Organization | Layout Rendering | Multi-category job data | Success: Jobs grouped under correct category headers | Layout |
| PJT-UT-07 | Checkbox Visual State | CSS Classes | Selected vs unselected checkboxes | Success: Selected jobs show bg-primary-blue/5 styling | Visual State |
| PJT-UT-08 | Form Data Synchronization | Data Flow | Checkbox changes | Success: selectedJobNames array updated correctly | Data Sync |
| PJT-UT-09 | Empty State Handling | Edge Case | No job types data | Success: Component renders without errors | Empty Data |
| PJT-UT-10 | Grid Layout Responsiveness | CSS Classes | Check responsive grid classes | Success: grid-cols-1 sm:grid-cols-2 applied | Responsive Layout |

### PreferencesJobType Unit Test Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| PJT-UT-FAIL-01 | Corrupted Job Type Data | Data Corruption | Job types with missing properties | Success: Component handles missing job_type_id gracefully | Invalid Data |
| PJT-UT-FAIL-02 | Invalid formData Structure | Data Validation | formData without selectedJobNames property | Success: Component initializes with empty selection | Missing Data |
| PJT-UT-FAIL-03 | Rapid Checkbox Changes | Stress Testing | 50 rapid checkbox state changes | Success: State remains consistent, no race conditions | State Stability |
| PJT-UT-FAIL-04 | Malformed Category Data | Data Structure | Categories with null/undefined job arrays | Success: Empty categories render without errors | Data Safety |
| PJT-UT-FAIL-05 | setFormData Function Error | Callback Error | setFormData prop throws error | Success: Component continues functioning | Callback Failure |

---

## 1. PreferencesMaximum Component (Hours Input Fields)

**Component Purpose**: Input fields for maximum hours per week and per shift
**Testing Strategy**: Input Validation Testing (IVT)

| Test Case ID | Test Case Name | Validation Type | Test Data | Expected Result | Test Category |
|--------------|----------------|----------------|-----------|-----------------|---------------|
| PM-UT-01 | Field Rendering | Initial Display | Default form data (40, 8) | Success: Both inputs show correct values | Display |
| PM-UT-02 | Input Attributes | HTML Validation | Check input element properties | Success: Correct type, min, max, placeholder attributes | HTML Attributes |
| PM-UT-03 | Weekly Hours Change | Valid Input | Change to 35 hours | Success: setFormData called with maxHoursPerWeek: 35 | Valid Input |
| PM-UT-04 | Shift Hours Change | Valid Input | Change to 6 hours | Success: setFormData called with maxHoursPerShift: 6 | Valid Input |
| PM-UT-05 | Empty Input Handling | Edge Case | Clear input field | Success: Value set to 0 | Empty Input |
| PM-UT-06 | Non-numeric Input | Invalid Input | Enter 'abc' | Success: Value set to 0 | Invalid Input |
| PM-UT-07 | Decimal Input Processing | Data Processing | Enter 25.7 | Success: Value converted to integer 25 | Decimal Handling |
| PM-UT-08 | Zero/Undefined Display | Edge Display | Form data with 0 values | Success: Empty string displayed in inputs | Zero Display |
| PM-UT-09 | Layout Styling | CSS Classes | Check container classes | Success: Correct Tailwind classes applied | Layout |

---

## 2. CalendarEvent Component (Individual Event Logic)

**Component Purpose**: Individual event display and calculation logic (isolated from parent)
**Testing Strategy**: Isolated Testing (IT)

| Test Case ID | Test Case Name | Test Type | Test Data | Expected Result | Test Category |
|--------------|----------------|-----------|-----------|-----------------|---------------|
| CE-UT-01 | Event Time Display | Visual Rendering | Event 10:00-12:00 | Success: "10:00 - 12:00" text displayed | Time Formatting |
| CE-UT-02 | Position Calculation | Layout Math | 10 AM start time | Success: top: 480px (10 * 48px) | Positioning |
| CE-UT-03 | Height Calculation | Layout Math | 2-hour duration | Success: height: 96px (2 * 48px) | Sizing |
| CE-UT-04 | Selection State Toggle | State Management | Click event element | Success: Background changes to selected state | State Management |
| CE-UT-05 | Focus/Blur Handling | Accessibility | Focus and blur events | Success: Selection state updates correctly | Focus Management |
| CE-UT-06 | Z-index During Drag | Visual State | Start dragging operation | Success: z-index increases to 10 | Visual Layering |
| CE-UT-07 | Minute-precision Events | Precise Timing | Event 10:15-11:45 | Success: Correct positioning with minute accuracy | Precision Display |
| CE-UT-08 | CSS Styling Classes | Styling | Unselected event state | Success: bg-primary-blue/40, border-primary-blue/60 classes | UI Styling |

### CalendarEvent Unit Test Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| CE-UT-FAIL-01 | Invalid Date Objects | Data Corruption | Event with new Date('invalid') | Success: Event element renders gracefully | Invalid Data |
| CE-UT-FAIL-02 | Missing Event Properties | Data Validation | Event with null/undefined fields | Success: Component handles missing data | Missing Data |
| CE-UT-FAIL-03 | Negative Duration | Data Logic | End time before start time | Success: Renders with minimum height | Duration Error |
| CE-UT-FAIL-04 | Extreme Time Values | Data Edge | Unix epoch start/max date | Success: Handles extreme dates | Time Boundaries |
| CE-UT-FAIL-05 | Corrupted Event Structure | Data Corruption | Event with wrong data types | Success: Graceful handling of type mismatches | Type Safety |

---

## 3. JSPref Component (Individual Tab Logic)

**Component Purpose**: Tab state management and CSS styling logic (without child component integration)
**Testing Strategy**: State Management Testing (SMT)

| Test Case ID | Test Case Name | Test Type | Test Data | Expected Result | Test Category |
|--------------|----------------|-----------|-----------|-----------------|---------------|
| JS-UT-01 | Default Tab Selection | Initial State | Component mounts with default state | Success: activeTab state set to 'preferences' | Initial State |
| JS-UT-02 | CSS Active Tab Styling | State-Based Styling | Preferences tab selected | Success: bg-white class applied, no hover classes | CSS Logic |
| JS-UT-03 | Tab State Change | State Management | Click tab button | Success: activeTab state updates correctly | State Update |
| JS-UT-04 | Container Structure | Layout Rendering | Check layout elements | Success: Correct Tailwind classes (bg-tertiary-bg, min-h-full, p-4) | Layout |
| JS-UT-05 | Button Styling Attributes | UI Rendering | Tab button elements | Success: px-3, py-2, rounded-lg, text-sm classes present | UI Consistency |
| JS-UT-06 | Multiple Tab State Changes | State Persistence | Multiple state changes | Success: State remains consistent, no side effects | State Persistence |

### JSPref Unit Test Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| JS-UT-FAIL-01 | Invalid ActiveTab State | Edge Case | Component with corrupted state | Success: Renders default tab gracefully | Error Recovery |
| JS-UT-FAIL-02 | Rapid State Changes | Stress Testing | 100 rapid state changes | Success: Consistent styling maintained | Stability |
| JS-UT-FAIL-03 | Component Re-rendering | State Consistency | Rerender during state change | Success: State restored correctly | State Recovery |

---

## 4. Calendar Component (Individual Calendar Logic)

**Component Purpose**: Calendar rendering and navigation logic (without external services)
**Testing Strategy**: Isolated Testing (IT)

| Test Case ID | Test Case Name | Test Type | Test Data | Expected Result | Test Category |
|--------------|----------------|-----------|-----------|-----------------|---------------|
| CAL-UT-01 | Calendar Structure | Layout Rendering | Component mount | Success: Week headers, navigation buttons rendered | Basic Rendering |
| CAL-UT-02 | Week Navigation Logic | Navigation State | Click previous/next arrows | Success: Week state changes correctly | Navigation |
| CAL-UT-03 | Today Button Logic | Date Navigation | Click "Today" button | Success: Returns to current week state | Navigation |
| CAL-UT-04 | Time Grid Structure | Layout Verification | Check 24-hour time column | Success: All hours 0-23 displayed correctly | Time Display |
| CAL-UT-05 | Event Creation Logic | UI Logic | Double-click on time slot | Success: Event creation function called | Event Management |

### Calendar Unit Test Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| CAL-UT-FAIL-01 | Invalid Date Operations | Date Handling | Date functions return Invalid Date | Success: Calendar structure maintained | Date Error |
| CAL-UT-FAIL-02 | Boundary Date Navigation | Edge Case | Navigate to extreme dates | Success: Calendar handles boundary dates | Navigation Edge |
| CAL-UT-FAIL-03 | Rapid UI Interactions | Stress Testing | Rapid clicking of buttons | Success: Component state remains stable | Interaction Stress |

---

# INTEGRATION TESTS

## 5. PreferencesJobType Component (Hook-Service Integration)

**Integration Purpose**: Job type selection with external data service and loading states
**Testing Strategy**: Service Integration Testing (SIT) + Hook Integration Testing (HIT)

| Test Case ID | Test Case Name | Integration Aspect | Test Data | Expected Result | Test Category |
|--------------|----------------|-------------------|-----------|-----------------|---------------|
| PJT-INT-01 | useJobTypes Hook Integration | Hook Integration | Mock useJobTypes hook response | Success: Component receives and renders job data | Hook Integration |
| PJT-INT-02 | Loading State Integration | Service Integration | useJobTypes returns loading: true | Success: Loading skeleton with animate-pulse rendered | Loading Integration |
| PJT-INT-03 | Error State Integration | Service Integration | useJobTypes returns error message | Success: Error state with retry message displayed | Error Integration |
| PJT-INT-04 | Data Transformation Integration | Data Integration | Raw job types from API | Success: Data correctly grouped by categories | Data Processing |
| PJT-INT-05 | Parent Form Integration | Component Integration | formData prop changes | Success: Component re-syncs with parent form state | Form Integration |
| PJT-INT-06 | State Persistence Integration | State Integration | Component unmount/remount cycle | Success: Selected jobs persist through lifecycle | State Persistence |

### PreferencesJobType Integration Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| PJT-INT-FAIL-01 | Hook Data Loading Error | Service Failure | useJobTypes hook throws error | Success: Error boundary catches and shows error state | Service Error |
| PJT-INT-FAIL-02 | Parent Form Sync Error | Integration Error | setFormData callback fails | Success: Local state maintained, error handled gracefully | Form Sync Error |
| PJT-INT-FAIL-03 | Invalid Hook Response | Data Integration | useJobTypes returns malformed data | Success: Component handles invalid data structure | Data Validation |
| PJT-INT-FAIL-04 | Network Timeout Integration | Service Integration | API request times out | Success: Loading state persists, no crash | Network Error |

---

## 1. JSPref Component (Parent-Child Integration)

**Integration Purpose**: Tab navigation system with child component rendering
**Testing Strategy**: Component Integration Testing (CIT)

| Test Case ID | Test Case Name | Integration Aspect | Test Data | Expected Result | Test Category |
|--------------|----------------|-------------------|-----------|-----------------|---------------|
| JSP-INT-01 | Tab Content Switching | Child Component Integration | Click Availability tab | Success: Availability component renders, Preferences hidden | Navigation Integration |
| JSP-INT-02 | Bidirectional Navigation | Multi-Component Integration | Switch between tabs multiple times | Success: Only one component rendered at a time | State Integration |
| JSP-INT-03 | Child Component Lifecycle | Component Integration | Tab switching with component states | Success: Child components mount/unmount correctly | Lifecycle Integration |

### JSPref Integration Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| JSP-INT-FAIL-01 | Missing Child Components | Integration Error | Mocked components throw errors | Success: Tab structure persists | Integration Failure |
| JSP-INT-FAIL-02 | Child Component Errors | Error Boundary | Child components fail to render | Success: Parent handles child errors gracefully | Error Integration |

---

## 2. PreferencesForm Component (Form-Service Integration)

**Integration Purpose**: Form container with child components and external services
**Testing Strategy**: Service Integration Testing (SIT)

| Test Case ID | Test Case Name | Integration Aspect | Test Data | Expected Result | Test Category |
|--------------|----------------|-------------------|-----------|-----------------|---------------|
| PF-INT-01 | Child Component Rendering | Component Integration | Mock child components | Success: All child components render correctly | UI Integration |
| PF-INT-02 | Form Submission Service | Service Integration | Valid form data submission | Success: "Preferences saved successfully!" message | Service Integration |
| PF-INT-03 | Hook Integration | Hook Integration | usePreferencesForm hook integration | Success: Form data and methods work correctly | Hook Integration |
| PF-INT-04 | Location Service Integration | External Service | Location permission handling | Success: Location service integration works | Service Integration |

### PreferencesForm Integration Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| PF-INT-FAIL-01 | Service Failure | API Integration | savePreferences service fails | Success: Error handled gracefully | Service Error |
| PF-INT-FAIL-02 | Location Service Error | External Service | Location permission denied | Success: "Location Service Issue" with retry | Service Error |

---

## 3. Calendar Component (Calendar-Service Integration)

**Integration Purpose**: Calendar with external API services and template system
**Testing Strategy**: Service Integration Testing (SIT)

| Test Case ID | Test Case Name | Integration Aspect | Test Data | Expected Result | Test Category |
|--------------|----------------|-------------------|-----------|-----------------|---------------|
| CAL-INT-01 | Data Loading Integration | API Integration | Mock availability data loaded | Success: Events rendered with correct positioning | Data Integration |
| CAL-INT-02 | Save Functionality | API Integration | Click "Save" with events | Success: setAvailability called with time blocks | Save Integration |
| CAL-INT-03 | Template System Integration | Service Integration | Template selection and application | Success: Template applied, dialog closes | Template Integration |
| CAL-INT-04 | Refresh Data Integration | API Integration | Click refresh button | Success: getAvailability called again | Data Refresh |

### Calendar Integration Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| CAL-INT-FAIL-01 | Database Connection Error | API Failure | getAvailability throws connection error | Success: Basic calendar structure renders | Database Error |
| CAL-INT-FAIL-02 | Save Operation Failure | API Failure | setAvailability rejects with error | Success: Calendar remains functional | Save Error |
| CAL-INT-FAIL-03 | Template Operation Failures | Service Failure | Template operations fail | Success: Calendar remains usable | Template Error |
| CAL-INT-FAIL-04 | Corrupted API Data | Data Integration | Malformed event objects from API | Success: Calendar handles bad data gracefully | Data Corruption |

---

## 4. CalendarEvent Component (Parent-Child Integration)

**Integration Purpose**: Event component with parent calendar communication
**Testing Strategy**: Component Integration Testing (CIT)

| Test Case ID | Test Case Name | Integration Aspect | Test Data | Expected Result | Test Category |
|--------------|----------------|-------------------|-----------|-----------------|---------------|
| CEV-INT-01 | Parent Callback Integration | Callback Integration | Double-click event | Success: onDelete called with event ID | Delete Integration |
| CEV-INT-02 | Drag Update Integration | Parent Communication | Mouse drag sequence | Success: onUpdate called with new position | Update Integration |
| CEV-INT-03 | Keyboard Integration | Parent Communication | Press Delete key when selected | Success: onDelete triggered via parent | Keyboard Integration |
| CEV-INT-04 | Cross-Day Movement | Complex Integration | Drag event to different day | Success: onUpdate called with new day data | Day Transfer |

### CalendarEvent Integration Failure Cases

| Test Case ID | Test Case Name | Failure Scenario | Test Data | Expected Behavior | Test Category |
|--------------|----------------|------------------|-----------|-------------------|---------------|
| CEV-INT-FAIL-01 | Null Callback Functions | Integration Contract | onUpdate/onDelete as null | Success: Component functions without callbacks | Callback Failure |
| CEV-INT-FAIL-02 | Parent Communication Error | Integration Failure | Parent rejects callback data | Success: Event handles parent rejection gracefully | Communication Error |

---

# TESTING STRATEGY SUMMARY

## Unit Testing Strategies

### 1. Isolated Testing (IT)
- **Used for**: `CalendarEvent`, `Calendar` (individual component logic)
- **Approach**: Tests components in complete isolation with all dependencies mocked
- **Benefits**: Fast execution, pinpoints exact component issues, clear failure diagnosis
- **Coverage**: Component rendering, state management, calculations, individual event handlers

### 2. Input Validation Testing (IVT)
- **Used for**: `PreferencesMaximum`
- **Approach**: Tests input handling, validation, and data transformation logic
- **Benefits**: Ensures robust input processing and edge case handling
- **Coverage**: Data validation, type conversion, boundary values, user input edge cases

### 3. State Management Testing (SMT)
- **Used for**: `JSPref` (tab state logic)
- **Approach**: Tests internal component state changes and state-driven UI updates
- **Benefits**: Validates state consistency and state-driven behavior
- **Coverage**: State initialization, state updates, state persistence, state-driven styling

## Integration Testing Strategies

### 1. Component Integration Testing (CIT)
- **Used for**: `JSPref`, `CalendarEvent` (parent-child communication)
- **Approach**: Tests interaction between parent and child components
- **Benefits**: Validates component composition and data flow between components
- **Coverage**: Parent-child communication, callback integration, lifecycle management

### 2. Service Integration Testing (SIT)
- **Used for**: `PreferencesForm`, `Calendar` (external services)
- **Approach**: Tests integration with external APIs, services, and data sources
- **Benefits**: Validates external service integration and error handling
- **Coverage**: API calls, service failures, data persistence, external service errors

### 3. Hook Integration Testing (HIT)
- **Used for**: `PreferencesForm` (React hooks)
- **Approach**: Tests integration with custom React hooks and context providers
- **Benefits**: Validates hook-component integration and hook-driven behavior
- **Coverage**: Hook data flow, hook state management, hook error handling

## Test Execution Results

### Unit Tests
- **Total Unit Test Cases**: 38 tests across 5 components
- **Success Tests**: 33 tests covering normal component operation
- **Failure Tests**: 16 tests covering error conditions and edge cases
- **Focus**: Individual component behavior, isolated logic testing

### Integration Tests
- **Total Integration Test Cases**: 24 tests across 5 components
- **Success Tests**: 20 tests covering normal integration scenarios  
- **Failure Tests**: 12 tests covering integration failure conditions
- **Focus**: Component interactions, service integration, data flow

### Overall Coverage
- **Total Test Cases**: 62 tests across 5 components
- **Unit vs Integration Split**: 61% Unit Tests, 39% Integration Tests
- **Component Coverage**: Complete coverage of both isolated and integrated functionality
- **Testing Framework**: Vitest with React Testing Library for both unit and integration testing
- **Execution Strategy**: Unit tests run first (fast feedback), integration tests follow