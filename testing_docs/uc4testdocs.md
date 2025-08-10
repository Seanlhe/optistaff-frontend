**UC4: Indicate Availability Unit Tests**   
**TC-UC4-U1 (Tab Switching)**

| Test Case ID | TC-UC4-U1.1 |
| :---- | :---- |
| Feature | Availability Tab Switch |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify user can switch to Availability tab |
| Input | Click Availability tab button |
| Expected Output | Availability component visible, Preferences component hidden, tab styling updated |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U1.2 |
| :---- | :---- |
| Feature | Tab CSS Class Updates |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify CSS classes update correctly when switching tabs |
| Input | Switch between Preferences and Availability tabs |
| Expected Output | Active tab gets bg-white, inactive tab gets hover:bg-white/60 |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U1.3 |
| :---- | :---- |
| Feature | Tab State Persistence |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify tab state maintains across multiple clicks |
| Input | Click same tab multiple times |
| Expected Output | Tab state remains consistent, correct component always visible |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U1.4 |
| :---- | :---- |
| Feature | Rapid Tab Switching |
| Component | src/pages/employee/JSPref.tsx |
| Test Description | Verify component handles rapid tab switching gracefully |
| Input | Rapidly click between tabs 20 times |
| Expected Output | Component remains functional, correct tab state maintained |
| Test Type | Unit Test |

**TC-UC4-U10 (Render Template Component)**

| Test Case ID | TC-UC4-U10.1 |
| :---- | :---- |
| Feature | Template Modal Rendering |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify modal renders when isOpen is true |
| Input | Render component with isOpen: true |
| Expected Output | "Templates" heading, "Save as New Template" button, and X icon visible |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U10.2 |
| :---- | :---- |
| Feature | Template Fetching |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify fetchAllTemplates is called when modal opens |
| Input | Render component with isOpen: true |
| Expected Output | fetchAllTemplates hook method called |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U10.3 |
| :---- | :---- |
| Feature | Template Display |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify templates display when available |
| Input | Mock templates data with multiple templates |
| Expected Output | All template names displayed correctly |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U10.4 |
| :---- | :---- |
| Feature | Creation Date Formatting |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify creation dates are formatted correctly |
| Input | Templates with various creation dates |
| Expected Output | Dates formatted as "Created: MM/DD/YYYY" |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U10.5 |
| :---- | :---- |
| Feature | Delete Button Click |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify onDelete called when Delete button is clicked |
| Input | Click Delete button on template |
| Expected Output | onDelete called with correct template\_id |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U10.6 |
| :---- | :---- |
| Feature | Close Button Click |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify onClose called when X button is clicked |
| Input | Click X button |
| Expected Output | onClose called |
| Test Type | Unit Test |

**TC-UC4-U15 (User Interaction with Template Dialog)**

| Test Case ID | TC-UC4-U15.1 |
| :---- | :---- |
| Feature | Template Selection |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify onSelect called when Use button is clicked |
| Input | Click Use button on template |
| Expected Output | onSelect called with correct template\_id |
| Test Type | Unit Test |

**TC-UC4-U22 (Event Creation)**

| Test Case ID | TC-UC4-U22.1 |
| :---- | :---- |
| Feature | Event Time Display |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify calendar event renders with correct time display |
| Input | Event with startTime: 10:00, endTime: 12:00 |
| Expected Output | "10:00 \- 12:00" displayed |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.2 |
| :---- | :---- |
| Feature | Event Positioning |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify correct positioning and height based on event times |
| Input | Event with 2-hour duration starting at 10:00 AM |
| Expected Output | top: "480px" (10 \* 48px), height: "96px" (2 \* 48px) |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.3 |
| :---- | :---- |
| Feature | Unselected State Styling |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify correct CSS classes applied for unselected state |
| Input | Render unselected calendar event |
| Expected Output | bg-primary-blue/40, border-primary-blue/60, hover:bg-primary-blue/80, cursor-grab classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.4 |
| :---- | :---- |
| Feature | Selection Toggle |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify selection state toggles when clicked |
| Input | Click on calendar event |
| Expected Output | Background changes to bg-primary-blue, border to border-primary-blue |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.5 |
| :---- | :---- |
| Feature | Focus/Blur Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify focus and blur events work correctly |
| Input | Focus then blur calendar event |
| Expected Output | Focus selects event, blur deselects (when not dragging) |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.6 |
| :---- | :---- |
| Feature | Double-click Deletion |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify event deletion on double-click |
| Input | Double-click calendar event |
| Expected Output | onDelete called with event ID |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.7 |
| :---- | :---- |
| Feature | Keyboard Delete |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify event deletion on Delete key when selected |
| Input | Select event, press Delete key |
| Expected Output | onDelete called with event ID |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.8 |
| :---- | :---- |
| Feature | Keyboard Backspace |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify event deletion on Backspace key when selected |
| Input | Select event, press Backspace key |
| Expected Output | onDelete called with event ID |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.9 |
| :---- | :---- |
| Feature | Keyboard No-op When Unselected |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify no deletion on keyboard press when not selected |
| Input | Press Delete without selecting event |
| Expected Output | onDelete not called |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.10 |
| :---- | :---- |
| Feature | Resize Handle Display |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify resize handle shows on hover |
| Input | Render calendar event |
| Expected Output | Resize handle with cursor-ns-resize, opacity-0, hover:opacity-100 classes |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.11 |
| :---- | :---- |
| Feature | Drag Initiation |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify dragging state initiates on mouse down |
| Input | Mouse down on calendar event |
| Expected Output | opacity-50 and cursor-grabbing classes applied |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.12 |
| :---- | :---- |
| Feature | Drag Mouse Movement |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify dragging with mouse move events |
| Input | Mouse down, move mouse, mouse up |
| Expected Output | onUpdate called during movement, dragging styles removed on mouse up |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.13 |
| :---- | :---- |
| Feature | Horizontal Drag Between Days |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify horizontal dragging moves event between days |
| Input | Mouse down, move horizontally 200px (1 day width) |
| Expected Output | onUpdate called with new day position |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.14 |
| :---- | :---- |
| Feature | Resize Functionality |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify event resize functionality works |
| Input | Mouse down on resize handle, move mouse |
| Expected Output | onUpdate called with new event duration |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.15 |
| :---- | :---- |
| Feature | Resize Handle Event Propagation |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify resize handle prevents event propagation |
| Input | Click on resize handle |
| Expected Output | Main event mousedown handler not triggered |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.16 |
| :---- | :---- |
| Feature | Different Duration Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify events with different durations render correctly |
| Input | Event with 30-minute duration |
| Expected Output | height: "24px" (0.5 \* 48px) |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.17 |
| :---- | :---- |
| Feature | Different Time of Day |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify events at different times of day position correctly |
| Input | Event starting at 6 PM (18:00) |
| Expected Output | top: "864px" (18 \* 48px) |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.18 |
| :---- | :---- |
| Feature | Minute-precise Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify events spanning minutes calculate positioning correctly |
| Input | Event from 10:15 to 11:45 |
| Expected Output | top: "492px" (10.25 \* 48px), height: "72px" (1.5 \* 48px) |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.19 |
| :---- | :---- |
| Feature | Z-index During Drag |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify correct z-index when dragging |
| Input | Start dragging event |
| Expected Output | z-index changes from 1 to 10, returns to 1 after drag |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.20 |
| :---- | :---- |
| Feature | Invalid Date Handling |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles invalid date objects gracefully |
| Input | Event with invalid Date objects |
| Expected Output | Component renders without crashing |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.21 |
| :---- | :---- |
| Feature | Missing Event Properties |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles missing event properties gracefully |
| Input | Event with null/undefined startTime, endTime, empty ID |
| Expected Output | Component renders without crashing |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.22 |
| :---- | :---- |
| Feature | Negative Duration Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles negative duration events gracefully |
| Input | Event where endTime is before startTime |
| Expected Output | Component handles gracefully without breaking |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.23 |
| :---- | :---- |
| Feature | Invalid day\_of\_week Values |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles invalid day\_of\_week values gracefully |
| Input | Event with day\_of\_week outside 0-6 range |
| Expected Output | Component renders without errors |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.24 |
| :---- | :---- |
| Feature | Invalid Drag Coordinates |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles drag operations with invalid coordinates gracefully |
| Input | Drag with negative or extremely large coordinate values |
| Expected Output | Component handles gracefully without breaking |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.25 |
| :---- | :---- |
| Feature | Invalid Keyboard Events |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles keyboard events with invalid properties gracefully |
| Input | Keyboard events with missing or invalid properties |
| Expected Output | Component handles gracefully without errors |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.26 |
| :---- | :---- |
| Feature | Resize Boundary Violations |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles resize operations with boundary violations gracefully |
| Input | Resize beyond calendar boundaries |
| Expected Output | Component handles gracefully, prevents invalid sizes |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.27 |
| :---- | :---- |
| Feature | Null Callback Functions |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles null or undefined callback functions gracefully |
| Input | Pass null/undefined onUpdate or onDelete functions |
| Expected Output | Component renders and handles interactions without crashing |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.28 |
| :---- | :---- |
| Feature | Extreme Time Values |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles extreme time values gracefully |
| Input | Events with very early or very late times |
| Expected Output | Component calculates positions correctly or handles gracefully |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.29 |
| :---- | :---- |
| Feature | Rapid Interactions |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles rapid interaction events gracefully |
| Input | Rapid mouse clicks, drags, keyboard presses |
| Expected Output | Component remains stable and functional |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U22.30 |
| :---- | :---- |
| Feature | Corrupted Event Data |
| Component | src/components/CalendarEvent.tsx |
| Test Description | Verify component handles corrupted event data structure gracefully |
| Input | Event object with unexpected properties or structure |
| Expected Output | Component renders safely without breaking |
| Test Type | Unit Test |

**TC-UC4-U25 (Save Button)**

| Test Case ID | TC-UC4-U25.1 |
| :---- | :---- |
| Feature | Save as Template Button |
| Component | src/components/TemplateSelectDialog.tsx |
| Test Description | Verify onSaveTemplate called when Save as New Template button is clicked |
| Input | Click "Save as New Template" button |
| Expected Output | onSaveTemplate called |
| Test Type | Unit Test |

**TC-UC4-U26 (Template Saving)**

| Test Case ID | TC-UC4-U26.1 |
| :---- | :---- |
| Feature | Template Name Modal Rendering |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify modal renders when isOpen is true |
| Input | Render component with isOpen: true |
| Expected Output | "Save Template" heading, template name input, Save and Cancel buttons visible |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U26.2 |
| :---- | :---- |
| Feature | Template Name Input |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify user can enter template name |
| Input | Type "My Template" in input field |
| Expected Output | Input value updates to "My Template" |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U26.3 |
| :---- | :---- |
| Feature | Cancel Button Click |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify onClose called when Cancel button is clicked |
| Input | Click Cancel button |
| Expected Output | onClose called |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U26.4 |
| :---- | :---- |
| Feature | X Button Click |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify onClose called when X button is clicked |
| Input | Click X button |
| Expected Output | onClose called |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U26.5 |
| :---- | :---- |
| Feature | Input Focus |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify input field receives focus when modal opens |
| Input | Render modal with isOpen: true |
| Expected Output | Input field is focused (document.activeElement) |
| Test Type | Unit Test |

**TC-UC4-U27 (Input to Template Component)**

| Test Case ID | TC-UC4-U27.1 |
| :---- | :---- |
| Feature | Template Name Submission |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify onSave called with trimmed template name when form is submitted |
| Input | Enter " My Template ", click Save Template button |
| Expected Output | onSave called with "My Template" (trimmed) |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U27.2 |
| :---- | :---- |
| Feature | Enter Key Submission |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify onSave called when form is submitted via Enter key |
| Input | Enter template name, press Enter key |
| Expected Output | onSave called with template name |
| Test Type | Unit Test |

| Test Case ID | TC-UC4-U27.3 |
| :---- | :---- |
| Feature | Input Clear After Save |
| Component | src/components/TemplateNameDialog.tsx |
| Test Description | Verify input field clears after successful save |
| Input | Enter template name, click Save |
| Expected Output | Input field value becomes empty string |
| Test Type | Unit Test |

