
### Use Case 3: Set Preferences (With Separate Databases)

### Components Involved:
- **UI**: `src/pages/employee/JSPref.tsx`
- **Components**: `src/components/PreferencesForm.tsx`, `src/components/PreferencesJobType.tsx`
- **Hook**: `src/hooks/usePreferencesForm.tsx`, `src/hooks/useJobTypes.tsx`
- **Database**: `preferences_db`, `job_types_db`

### Sequence Diagram:

```mermaid
sequenceDiagram
autonumber
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
