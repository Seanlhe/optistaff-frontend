# UC5

sequenceDiagram
actor Jobseeker as Jobseeker
participant Dashboard as JSDashboard.tsx
participant AssignmentCard as JobseekerAssignmentCard.tsx
participant DetailModal as JobseekerAssignmentDetailModals.tsx
participant useAssignments as useAssignments Hook
participant Assignments as assignments
participant JobSeekers as job_seekers

    %% View assignments
    Jobseeker->>+Dashboard: navigate("/employee/dashboard")
    Dashboard->>+useAssignments: fetchAssignments()
    useAssignments->>+Assignments: get_assignments_by_jobseeker(user_id)
    Assignments-->>-useAssignments: all_assignment_list
    useAssignments-->>-Dashboard: assignments_data

    Dashboard->>+AssignmentCard: render(assignment_cards)
    AssignmentCard-->>-Dashboard: display(view_details_buttons)
    Dashboard-->>-Jobseeker: display(dashboard_with_assignments)

    %% View assignment details first to access cancel
    Jobseeker->>+Dashboard: click(view_details_button)
    Dashboard->>+DetailModal: open(assignment_details_modal)
    DetailModal-->>-Dashboard: display(assignment_details_with_cancel_button)
    Dashboard-->>-Jobseeker: show(assignment_info_and_cancel_option)

    %% Direct cancellation
    Jobseeker->>+Dashboard: click(cancel_assignment_button)
    Dashboard->>+DetailModal: handleCancelAssignment()
    DetailModal->>+useAssignments: updateAssignmentStatus(assignment_id, "CancelByEmployee")
    useAssignments->>+Assignments: update_assignment_status(assignment_id, "CancelByEmployee")
    Assignments-->>-useAssignments: cancellation_success
    useAssignments-->>-DetailModal: assignment_cancelled
    DetailModal->>Dashboard: onClose() modal
    Dashboard-->>-Jobseeker: display(updated_assignment_list)
