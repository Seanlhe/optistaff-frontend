## Use Case 3: Set Preferences (Corrected)

### Components Involved:
- **UI**: `src/pages/employee/JSPref.tsx`
- **Components**: `src/components/PreferencesForm.tsx`, `src/components/PreferencesJobType.tsx`
- **Hook**: `src/hooks/usePreferencesForm.tsx`, `src/hooks/useJobTypes.tsx`
- **Database**: `preferences` table, `job_types` table

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Jobseeker as Jobseeker
    participant JSPref as JSPref.tsx
    participant PreferencesForm as PreferencesForm.tsx
    participant PreferencesJobType as PreferencesJobType.tsx
    participant usePreferencesForm as usePreferencesForm Hook
    participant useJobTypes as useJobTypes Hook
    participant DB as Database

    %% Navigate to preferences
    Jobseeker->>+JSPref: navigate("/employee/jspref")
    JSPref->>+PreferencesForm: render(preferences_form)
    PreferencesForm->>+usePreferencesForm: fetchPreferences()
    usePreferencesForm->>+DB: SELECT FROM preferences WHERE user_id
    DB-->>-usePreferencesForm: current_preferences
    usePreferencesForm-->>-PreferencesForm: preferences_data
    
    PreferencesForm->>+PreferencesJobType: render(job_type_preferences)
    PreferencesJobType->>+useJobTypes: fetchJobTypes()
    useJobTypes->>+DB: SELECT FROM job_types WHERE is_active
    DB-->>-useJobTypes: available_job_types
    useJobTypes-->>-PreferencesJobType: job_types_list
    
    PreferencesJobType-->>-PreferencesForm: display(job_type_options)
    PreferencesForm-->>-JSPref: display(complete_form)
    JSPref-->>-Jobseeker: display(preferences_page)

    %% User updates preferences
    Jobseeker->>+JSPref: update(min_pay_rate, max_travel_km, desired_roles)
    JSPref->>+PreferencesForm: validate_preferences()
    PreferencesForm->>+usePreferencesForm: savePreferences(preferences_data)
    usePreferencesForm->>+DB: CALL upsert_user_preferences(...)
    DB-->>-usePreferencesForm: save_success
    usePreferencesForm-->>-PreferencesForm: preferences_saved
    PreferencesForm-->>-JSPref: show_success_message
    JSPref-->>-Jobseeker: "Preferences saved successfully"
```

## Use Case 4: Indicate Availability (Complete Flow with Templates)

### Components Involved:
- **UI**: `src/pages/employee/JSPref.tsx`
- **Components**: `src/components/Availability.tsx`, `src/components/Calendar.tsx`
- **Hook**: `src/hooks/useAvailability.tsx`, `src/hooks/useAvailabilityTemplate.tsx`
- **Database**: `availability` table, `availability_templates` table

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Jobseeker as Jobseeker
    participant JSPref as JSPref.tsx
    participant Availability as Availability.tsx
    participant Calendar as Calendar.tsx
    participant useAvailability as useAvailability Hook
    participant useAvailabilityTemplate as useAvailabilityTemplate Hook
    participant DB as Database

    %% Navigate to availability and load calendar
    Jobseeker->>+JSPref: navigate("/employee/jspref") and click_availability_tab()
    Note over JSPref,Calendar: User clicks availability tab and interacts directly with Calendar.tsx
    JSPref->>+Calendar: render(calendar_with_availability_interface)
    Calendar->>+useAvailability: getAvailability(cycle)
    useAvailability->>+DB: SELECT FROM availability WHERE user_id AND submission_cycle
    DB-->>-useAvailability: current_availability
    useAvailability-->>-Calendar: availability_data
    Calendar-->>-JSPref: display(interactive_calendar)
    JSPref-->>-Jobseeker: show(availability_interface)

    %% Optional: Load existing template first (replaces any existing slots)
    opt Load Existing Template
        Jobseeker->>+Calendar: click(templates_button) [Direct interaction]
        Calendar->>+useAvailabilityTemplate: fetchAllTemplates()
        useAvailabilityTemplate->>+DB: SELECT FROM availability_templates WHERE user_id
        DB-->>-useAvailabilityTemplate: template_list
        useAvailabilityTemplate-->>-Calendar: available_templates
        Calendar-->>-Jobseeker: display(template_selection_dialog)
        
        Jobseeker->>+Calendar: select_template(template_id) [Direct interaction]
        Calendar->>+useAvailabilityTemplate: fetchTemplate(template_id)
        useAvailabilityTemplate->>+DB: SELECT FROM availability_templates WHERE template_id
        DB-->>-useAvailabilityTemplate: template_data
        useAvailabilityTemplate-->>-Calendar: template_timeblocks
        Calendar->>Calendar: apply_template_events() [Replaces existing slots]
        Calendar-->>-Jobseeker: display(calendar_with_template_slots)
    end

    %% Manual time slot creation/modification (individual interactions)
    Jobseeker->>+Calendar: double_click(day, hour) [Direct interaction - Create/Modify slots]
    Calendar->>Calendar: create_new_event(time_slot)
    Calendar-->>-Jobseeker: display(updated_slot)

    %% Optional: Save current schedule as template (can be empty or populated)
    opt Save Current Schedule as Template
        Jobseeker->>+Calendar: click(save_as_template) [Direct interaction]
        Calendar-->>-Jobseeker: display(template_name_form)
        
        Jobseeker->>+Calendar: input(template_name) [User provides name]
        Calendar->>+useAvailabilityTemplate: createTemplate(template_data)
        useAvailabilityTemplate->>+DB: INSERT INTO availability_templates
        DB-->>-useAvailabilityTemplate: template_created
        useAvailabilityTemplate-->>-Calendar: template_saved
        Calendar-->>-Jobseeker: "Template saved successfully"
    end

    %% Save availability (final step)
    Jobseeker->>+Calendar: click(save_availability) [Direct interaction]
    Calendar->>+useAvailability: setAvailability(timeBlocks, cycle)
    useAvailability->>+DB: DELETE + INSERT availability records
    DB-->>-useAvailability: save_success
    useAvailability-->>-Calendar: availability_saved
    Calendar-->>-Jobseeker: "Availability saved successfully"
```

---

## Updated Sequence Diagrams with Separate Databases

### Use Case 3: Set Preferences (With Separate Databases)

### Components Involved:
- **UI**: `src/pages/employee/JSPref.tsx`
- **Components**: `src/components/PreferencesForm.tsx`, `src/components/PreferencesJobType.tsx`
- **Hook**: `src/hooks/usePreferencesForm.tsx`, `src/hooks/useJobTypes.tsx`
- **Database**: `preferences_db`, `job_types_db`

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Jobseeker as Jobseeker
    participant JSPref as JSPref.tsx
    participant PreferencesForm as PreferencesForm.tsx
    participant PreferencesJobType as PreferencesJobType.tsx
    participant usePreferencesForm as usePreferencesForm Hook
    participant useJobTypes as useJobTypes Hook
    participant PreferencesDB as Preferences Database
    participant JobTypesDB as Job Types Database

    %% Navigate to preferences
    Jobseeker->>+JSPref: navigate("/employee/jspref")
    JSPref->>+PreferencesForm: render(preferences_form)
    PreferencesForm->>+usePreferencesForm: fetchPreferences()
    usePreferencesForm->>+PreferencesDB: SELECT FROM preferences WHERE user_id
    PreferencesDB-->>-usePreferencesForm: current_preferences
    usePreferencesForm-->>-PreferencesForm: preferences_data
    
    PreferencesForm->>+PreferencesJobType: render(job_type_preferences)
    PreferencesJobType->>+useJobTypes: fetchJobTypes()
    useJobTypes->>+JobTypesDB: SELECT FROM job_types WHERE is_active
    JobTypesDB-->>-useJobTypes: available_job_types
    useJobTypes-->>-PreferencesJobType: job_types_list
    
    PreferencesJobType-->>-PreferencesForm: display(job_type_options)
    PreferencesForm-->>-JSPref: display(complete_form)
    JSPref-->>-Jobseeker: display(preferences_page)

    %% User updates preferences
    Jobseeker->>+JSPref: update(min_pay_rate, max_travel_km, desired_roles)
    JSPref->>+PreferencesForm: validate_preferences()
    PreferencesForm->>+usePreferencesForm: savePreferences(preferences_data)
    usePreferencesForm->>+PreferencesDB: CALL upsert_user_preferences(...)
    PreferencesDB-->>-usePreferencesForm: save_success
    usePreferencesForm-->>-PreferencesForm: preferences_saved
    PreferencesForm-->>-JSPref: show_success_message
    JSPref-->>-Jobseeker: "Preferences saved successfully"
```

### Use Case 4: Indicate Availability (With Separate Databases)

### Components Involved:
- **UI**: `src/pages/employee/JSPref.tsx`
- **Components**: `src/components/Availability.tsx`, `src/components/Calendar.tsx`
- **Hook**: `src/hooks/useAvailability.tsx`, `src/hooks/useAvailabilityTemplate.tsx`
- **Database**: `availability_db`, `availability_template_db`

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Jobseeker as Jobseeker
    participant JSPref as JSPref.tsx
    participant Availability as Availability.tsx
    participant Calendar as Calendar.tsx
    participant useAvailability as useAvailability Hook
    participant useAvailabilityTemplate as useAvailabilityTemplate Hook
    participant AvailabilityDB as Availability Database
    participant TemplateDB as Availability Template Database

    %% Navigate to availability and load calendar
    Jobseeker->>+JSPref: navigate("/employee/jspref") and click_availability_tab()
    Note over JSPref,Calendar: User clicks availability tab and interacts directly with Calendar.tsx
    JSPref->>+Calendar: render(calendar_with_availability_interface)
    Calendar->>+useAvailability: getAvailability(cycle)
    useAvailability->>+AvailabilityDB: SELECT FROM availability WHERE user_id AND submission_cycle
    AvailabilityDB-->>-useAvailability: current_availability
    useAvailability-->>-Calendar: availability_data
    Calendar-->>-JSPref: display(interactive_calendar)
    JSPref-->>-Jobseeker: show(availability_interface)

    %% Optional: Load existing template first (replaces any existing slots)
    opt Load Existing Template
        Jobseeker->>+Calendar: click(templates_button) [Direct interaction]
        Calendar->>+useAvailabilityTemplate: fetchAllTemplates()
        useAvailabilityTemplate->>+TemplateDB: SELECT FROM availability_templates WHERE user_id
        TemplateDB-->>-useAvailabilityTemplate: template_list
        useAvailabilityTemplate-->>-Calendar: available_templates
        Calendar-->>-Jobseeker: display(template_selection_dialog)
        
        Jobseeker->>+Calendar: select_template(template_id) [Direct interaction]
        Calendar->>+useAvailabilityTemplate: fetchTemplate(template_id)
        useAvailabilityTemplate->>+TemplateDB: SELECT FROM availability_templates WHERE template_id
        TemplateDB-->>-useAvailabilityTemplate: template_data
        useAvailabilityTemplate-->>-Calendar: template_timeblocks
        Calendar->>Calendar: apply_template_events() [Replaces existing slots]
        Calendar-->>-Jobseeker: display(calendar_with_template_slots)
    end

    %% Manual time slot creation/modification (individual interactions)
    Jobseeker->>+Calendar: double_click(day, hour) [Direct interaction - Create/Modify slots]
    Calendar->>Calendar: create_new_event(time_slot)
    Calendar-->>-Jobseeker: display(updated_slot)

    %% Optional: Save current schedule as template
    opt Save Current Schedule as Template
        Jobseeker->>+Calendar: click(save_as_template) [Direct interaction]
        Calendar-->>-Jobseeker: display(template_name_form)
        
        Jobseeker->>+Calendar: input(template_name) [User provides name]
        Calendar->>+useAvailabilityTemplate: createTemplate(template_data)
        useAvailabilityTemplate->>+TemplateDB: INSERT INTO availability_templates
        TemplateDB-->>-useAvailabilityTemplate: template_created
        useAvailabilityTemplate-->>-Calendar: template_saved
        Calendar-->>-Jobseeker: "Template saved successfully"
    end

    %% Save availability (final step)
    Jobseeker->>+Calendar: click(save_availability) [Direct interaction]
    Calendar->>+useAvailability: setAvailability(timeBlocks, cycle)
    useAvailability->>+AvailabilityDB: DELETE + INSERT availability records
    AvailabilityDB-->>-useAvailability: save_success
    useAvailability-->>-Calendar: availability_saved
    Calendar-->>-Jobseeker: "Availability saved successfully"
```

---

## Use Case Tables

### Use Case 3: Set Preferences

| Field                | Description                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**               | UC3                                                                                                                                                     |
| **Name**             | Set Preferences                                                                                                                                         |
| **Description**      | Jobseeker sets preferences to be eligible for shifts                                                                                                    |
| **Actors**           | Jobseeker                                                                                                                                               |
| **Triggers**         | Navigates to "Preferences" section of JSPref page                                                                                                       |
| **Preconditions**    | Jobseeker is logged in and authenticated                                                                                                                |
| **Postconditions**   | Preferences saved to `preferences_db`; job types validated against `job_types_db`                                                                      |
| **Error States**     | Invalid job type selection; validation errors                                                                                                           |
| **Flow**             | 1. Enter preferences (pay rate, travel distance, max hours, job types)<br>2. System validates job types<br>3. Click "Save Preferences"<br>4. System confirms save |
| **Alternative Flow** | User can modify existing preferences                                                                                                                     |
| **Database Tables**  | `preferences_db` - stores user preference settings<br>`job_types_db` - validates available job categories                                              |

---

### Use Case 4: Indicate Availability

| Field                | Description                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**               | UC4                                                                                                                                                      |
| **Name**             | Indicate Availability                                                                                                                                    |
| **Description**      | Jobseeker specifies available days and times with optional template usage                                                                                |
| **Actors**           | Jobseeker                                                                                                                                                |
| **Triggers**         | Navigates to "Availability" tab in JSPref page                                                                                                           |
| **Preconditions**    | Jobseeker is logged in and authenticated                                                                                                                 |
| **Postconditions**   | Availability records saved to `availability_db`; optional templates saved to `availability_template_db`                                                |
| **Error States**     | Template loading failures; availability save conflicts                                                                                                   |
| **Flow**             | 1. Optional: Load existing template<br>2. Create/modify time slots<br>3. Optional: Save as template<br>4. Click "Save Availability"<br>5. System confirms save |
| **Alternative Flow** | Template workflow: Load template then manually add more slots                                                                                            |
| **Database Tables**  | `availability_db` - stores user time slot availability<br>`availability_template_db` - stores reusable availability templates                          |
