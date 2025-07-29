# Unit Test Cases Documentation

## Database Functions Testing

### Testing Strategy Overview

The unit tests for the 4 database functions employ different black-box testing strategies:

- **Equivalence Class Testing (ECT)**: Used for `create_default_preferences` and `get_user_location`
- **Boundary Value Testing (BVT)**: Used for `validate_job_names`
- **Simplified Functional Testing**: Used for `upsert_user_preferences`

---

## 1. create_default_preferences Function

**Function Purpose**: Creates default user preferences for new job seekers
**Testing Strategy**: Equivalence Class Testing (ECT)

| Test Case ID | Test Case Name            | Input Equivalence Class | Test Data                                           | Expected Result                                                                                    | Test Category |
| ------------ | ------------------------- | ----------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------- |
| CDP-ECT-01   | Valid UUID Input          | Valid Input Class       | `p_user_id: valid_job_seeker_uuid`                  | Success: Returns default preferences with correct values (min_pay_rate=15, max_travel_km=15, etc.) | Valid Input   |
| CDP-ECT-02   | Idempotent Operation      | Valid Input Class       | `p_user_id: existing_user_with_preferences`         | Success: Returns existing preferences without creating duplicates                                  | Valid Input   |
| CDP-ECT-03   | Default Values Structure  | Valid Input Class       | `p_user_id: valid_job_seeker_uuid`                  | Success: All required fields present with correct data types and business rule compliance          | Valid Input   |
| CDP-ECT-04   | Null User ID              | Invalid Input Class     | `p_user_id: null`                                   | Error: Function rejects null input                                                                 | Invalid Input |
| CDP-ECT-05   | Invalid UUID Format       | Invalid Input Class     | `p_user_id: "invalid-uuid-format"`                  | Error: UUID format validation fails                                                                | Invalid Input |
| CDP-ECT-06   | Non-existent User ID      | Invalid Input Class     | `p_user_id: "00000000-0000-0000-0000-000000000001"` | Error: Foreign key constraint violation (23503)                                                    | Invalid Input |
| CDP-ECT-07   | Empty String User ID      | Invalid Input Class     | `p_user_id: ""`                                     | Error: Invalid UUID format                                                                         | Invalid Input |
| CDP-ECT-08   | Direct Query Verification | Edge Case               | `p_user_id: valid_job_seeker_uuid`                  | Success: RPC result matches direct table query                                                     | Edge Case     |
| CDP-ECT-09   | Concurrent Creation       | Edge Case               | Multiple simultaneous calls with same user_id       | Success: Only one preference record created (idempotent)                                           | Edge Case     |

---

## 2. upsert_user_preferences Function

**Function Purpose**: Creates or updates user job preferences with validation
**Testing Strategy**: Simplified Functional Testing

| Test Case ID | Test Case Name                 | Input Category  | Test Data                                        | Expected Result                                                                            | Test Category  |
| ------------ | ------------------------------ | --------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------- |
| UUP-FUNC-01  | Create New Preferences         | Basic Function  | Valid user_id with complete preference data      | Success: New preferences created with validation_errors=[]                                 | Basic Function |
| UUP-FUNC-02  | Update Existing Preferences    | Basic Function  | Existing user_id with modified preference data   | Success: Preferences updated with new values                                               | Basic Function |
| UUP-FUNC-03  | Empty Desired Roles Validation | Validation Test | `p_desired_roles: []`                            | Success: Returns validation error "Please select at least one preferred job type"          | Validation     |
| UUP-FUNC-04  | Invalid Job Names Validation   | Validation Test | `p_desired_roles: ["NonExistentJob"]`            | Success: Returns validation error "One or more selected job types are invalid or inactive" | Validation     |
| UUP-FUNC-05  | Invalid UUID Format            | Edge Case       | `p_target_user_id: "invalid-uuid"`               | Error: UUID format validation fails                                                        | Edge Case      |
| UUP-FUNC-06  | Concurrent Upsert Operations   | Edge Case       | Multiple simultaneous upsert calls for same user | Success: Both operations succeed, last one wins                                            | Edge Case      |

---

## 3. validate_job_names Function

**Function Purpose**: Validates if job names exist and are active in the database
**Testing Strategy**: Boundary Value Testing (BVT)

| Test Case ID | Test Case Name               | Boundary Category     | Test Data                                                     | Expected Result                                                | Test Category  |
| ------------ | ---------------------------- | --------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- | -------------- |
| VJN-BVT-01   | Empty Array (Minimum)        | Array Length Boundary | `job_names: []`                                               | Success: Returns null (PostgreSQL limitation)                  | Boundary Value |
| VJN-BVT-02   | Single Job Name (Minimum+)   | Array Length Boundary | `job_names: ["Test Server"]`                                  | Success: Returns true for valid job                            | Boundary Value |
| VJN-BVT-03   | Multiple Job Names (Nominal) | Array Length Boundary | `job_names: ["Waiter/Waitress", "Kitchen Helper", "Cashier"]` | Success: Returns true for all valid jobs                       | Boundary Value |
| VJN-BVT-04   | Large Array (Maximum-)       | Array Length Boundary | `job_names: [10 valid job names]`                             | Success: Returns true, completes efficiently                   | Boundary Value |
| VJN-BVT-05   | Mixed Valid/Invalid          | Job Validity Boundary | `job_names: ["Waiter/Waitress", "NonExistentJob"]`            | Success: Returns false (all must be valid)                     | Boundary Value |
| VJN-BVT-06   | Single Invalid Job           | Job Validity Boundary | `job_names: ["NonExistentJob"]`                               | Success: Returns false                                         | Boundary Value |
| VJN-BVT-07   | Inactive Job Names           | Job Validity Boundary | `job_names: ["Inactive Job"]`                                 | Success: Returns false (must be active)                        | Boundary Value |
| VJN-BVT-08   | Mixed Active/Inactive        | Job Validity Boundary | `job_names: ["Active Job", "Inactive Job"]`                   | Success: Returns false (all must be active)                    | Boundary Value |
| VJN-BVT-09   | Case Sensitivity             | Job Validity Boundary | `job_names: ["CaseSensitiveJob"]` vs `["casesensitivejob"]`   | Success: Exact case returns true, different case returns false | Boundary Value |
| VJN-EDGE-01  | Null Input                   | Edge Case             | `job_names: null`                                             | Success: Returns true (treated as empty)                       | Edge Case      |
| VJN-EDGE-02  | Empty String Names           | Edge Case             | `job_names: ["", "Waiter/Waitress"]`                          | Success: Returns false (empty strings invalid)                 | Edge Case      |
| VJN-EDGE-03  | Duplicate Job Names          | Edge Case             | `job_names: ["Waiter/Waitress", "Waiter/Waitress"]`           | Success: Returns true (duplicates allowed)                     | Edge Case      |
| VJN-EDGE-04  | Concurrent Validation        | Edge Case             | Multiple simultaneous validation calls                        | Success: All requests succeed independently                    | Edge Case      |

---

## 4. get_user_location Function

**Function Purpose**: Retrieves and formats user location data with coordinate parsing
**Testing Strategy**: Equivalence Class Testing (ECT)

| Test Case ID | Test Case Name                 | Input Equivalence Class | Test Data                                           | Expected Result                                              | Test Category      |
| ------------ | ------------------------------ | ----------------------- | --------------------------------------------------- | ------------------------------------------------------------ | ------------------ |
| GUL-ECT-01   | Complete Location Info         | Valid Input Class       | User with address, postal_code, and coordinates     | Success: Returns formatted location with parsed coordinates  | Valid Input        |
| GUL-ECT-02   | Partial Location (Postal Only) | Valid Input Class       | User with postal_code only                          | Success: Returns formatted address "Singapore {postal_code}" | Valid Input        |
| GUL-ECT-03   | Address Without Coordinates    | Valid Input Class       | User with address and postal_code, no coordinates   | Success: Returns formatted address, null coordinates         | Valid Input        |
| GUL-ECT-04   | All Fields Null                | Valid Input Class       | User with no location data                          | Success: Returns user_id with all location fields null       | Valid Input        |
| GUL-ECT-05   | Non-existent User              | Invalid Input Class     | `p_user_id: "00000000-0000-0000-0000-000000000001"` | Success: Returns empty array []                              | Invalid Input      |
| GUL-ECT-06   | Null User ID                   | Invalid Input Class     | `p_user_id: null`                                   | Success: Returns empty array []                              | Invalid Input      |
| GUL-ECT-07   | Invalid UUID Format            | Invalid Input Class     | `p_user_id: "invalid-uuid"`                         | Error: UUID format validation fails                          | Invalid Input      |
| GUL-COORD-01 | Valid Coordinate String        | Coordinate Parsing      | `address_coordinates: "1.2966,103.7764"`            | Success: Parses to lat=1.2966, lng=103.7764                  | Coordinate Parsing |
| GUL-COORD-02 | Negative Coordinates           | Coordinate Parsing      | `address_coordinates: "-1.2966,103.7764"`           | Success: Parses negative latitude correctly                  | Coordinate Parsing |
| GUL-COORD-03 | Invalid Coordinate Format      | Coordinate Parsing      | `address_coordinates: "1.2966103.7764"` (no comma)  | Success: Returns null coordinates (graceful handling)        | Coordinate Parsing |
| GUL-ADDR-01  | Address Only (No Postal)       | Address Formatting      | `address: "123 Main Street"`                        | Success: Formats as "123 Main Street, Singapore"             | Address Formatting |
| GUL-PERF-01  | Concurrent Requests            | Performance Test        | 5 simultaneous requests for same user               | Success: All requests return consistent data                 | Performance        |

---

## Testing Strategy Summary

### 1. Equivalence Class Testing (ECT)

- **Used for**: `create_default_preferences`, `get_user_location`
- **Approach**: Divides input domain into valid and invalid equivalence classes
- **Benefits**: Ensures comprehensive coverage of different input types
- **Classes Identified**: Valid inputs, invalid inputs, edge cases

### 2. Boundary Value Testing (BVT)

- **Used for**: `validate_job_names`
- **Approach**: Tests values at boundaries of input domains
- **Benefits**: Catches errors at boundary conditions
- **Boundaries Tested**: Array length (empty, single, multiple, large), job validity (valid/invalid), edge cases

### 3. Simplified Functional Testing

- **Used for**: `upsert_user_preferences`
- **Approach**: Tests core functionality with essential scenarios
- **Benefits**: Focuses on primary use cases and validation logic
- **Coverage**: Basic operations, validation scenarios, edge cases

### Test Execution Results

- **Total Test Cases**: 40 tests across 4 functions (optimized from 49)
- **Execution Time**: ~7 seconds (sequential execution)
- **Success Rate**: 100% (all tests passing)
- **Test Isolation**: Sequential execution prevents race conditions
