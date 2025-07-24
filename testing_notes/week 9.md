
### Principles of Software Testing

Before we explore the types of testing, it is crucial to understand the guiding principles that underpin all testing activities. These principles help testers work effectively and efficiently.

1. **Testing shows the presence of defects**: As we discussed previously, testing can reveal that defects are present, but it cannot prove that there are no defects.
    
2. **Exhaustive testing is not possible**: Testing every possible input and every combination of conditions is infeasible for all but the simplest programs. Therefore, we must focus our efforts on the areas of highest risk.
    
3. **Early testing saves time and cost**: Defects found early in the development lifecycle are significantly cheaper and easier to fix than those discovered later, during system testing or after release.
    
4. **Defect clustering**: A small number of modules in a system usually contain most of the defects discovered. This is an application of the Pareto principle, suggesting that testing efforts should concentrate on these defect-prone areas.
    
5. **The pesticide paradox**: If the same set of tests is repeated over and over, it will eventually no longer find new bugs. To overcome this, test cases must be regularly reviewed and updated.
    
6. **Testing is context-dependent**: The approach to testing varies depending on the context of the software. For example, testing an e-commerce website is different from testing a safety-critical aviation system.
    
7. **Absence-of-errors fallacy**: Finding and fixing many defects does not guarantee a successful system. If the software is unusable or does not meet the user's needs, it will still fail, even if it is bug-free.
    

With these principles in mind, let us now examine the major categories of testing.

### Types of Testing

Depending on how test cases are identified and defined, we can distinguish between two primary types of testing.

#### Specification-based Testing (Black Box Testing)

In **specification-based testing**, the software being tested is treated as a black box. This means the tests are designed and executed without any knowledge of the internal implementation, code structure, or algorithms. The sole basis for creating test cases is the software's functional specification—what the system is _supposed_ to do.

The primary advantage of this approach is that it focuses the testing effort on the fulfillment of the specified requirements, thereby building confidence that the software behaves as expected. In some literature, this is also referred to as **functional testing**.

#### Code-based Testing (White Box Testing)

In contrast, **code-based testing** leverages knowledge of the internal structure and implementation of the software to define test cases. The tester has access to the source code and designs tests to exercise specific paths through the code, check internal data structures, and ensure that all parts of the code are executed.

The main advantage of this approach, also known as **white box testing** or **structural testing**, is its focus on fault finding by ensuring comprehensive code coverage.

### Levels of Testing

Software testing is not performed all at once. It is conducted at different levels of design abstraction as the system is developed.

- **Unit Testing**: This is testing at the smallest granularity, focusing on individual, self-contained components of the system, such as a single function or class.
    
- **Integration Testing**: At this level, previously tested units or subcomponents are combined and tested as a group to expose faults in their interactions.
    
- **System Testing**: This involves testing the entire, fully integrated system as a whole to verify that it meets all the specified user and system requirements.
    

### Specification-based Unit Testing Techniques

Our focus for the remainder of this lecture will be on techniques for **specification-based unit testing**. A unit is the smallest testable part of a system and can be a function, a class, a module, or even a UI component. We will now explore three systematic techniques for designing these tests.

#### 1. Boundary Value Testing (BVT)

The rationale behind **Boundary Value Testing** is the empirical observation that errors tend to occur near the extreme values of inputs. For instance, off-by-one errors in loops or incorrect handling of the first or last element in an array are common defects. BVT focuses test cases on and around the boundaries of the valid input ranges.

To apply BVT, we first identify the input variables and their valid ranges from the specification. For a function `f(x1, x2)` with input ranges `a <= x1 <= b` and `c <= x2 <= d`, we can apply several BVT strategies.

##### Normal Boundary Value Testing

This strategy assumes that errors are caused by a single input variable being at its extreme value, not by a combination of inputs. For each input variable, we select test cases at the minimum value, just above the minimum, a nominal value, just below the maximum, and the maximum value. For an input `x` in the range `[min, max]`, we would test the points: `min`, `min+`, `nominal`, `max-`, and `max`.

Example: tzconvert(h, stz, ttz)

Consider a function that converts time between timezones with the following input specifications:

- `h`: hour, in range `[0, 23]`
    
- `stz`: source timezone, in range `[-12, 14]`
    
- `ttz`: target timezone, in range `[-12, 14]`
    

Applying Normal BVT, we would generate the following test cases:

|Test Case ID|h|stz|ttz|Description|
|---|---|---|---|---|
|1|11.5|1|1|Nominal values|
|2|0|1|1|h at min|
|3|1|1|1|h at min+|
|4|22|1|1|h at max-|
|5|23|1|1|h at max|
|6|11.5|-12|1|stz at min|
|7|11.5|-11|1|stz at min+|
|8|11.5|13|1|stz at max-|
|9|11.5|14|1|stz at max|
|10|11.5|1|-12|ttz at min|
|11|11.5|1|-11|ttz at min+|
|12|11.5|1|13|ttz at max-|
|13|11.5|1|14|ttz at max|

##### Robust Boundary Value Testing

This strategy extends Normal BVT by also testing values just outside the valid range, assuming that the programming language might not be strongly typed or that input validation is required. In addition to the normal boundary points, we also test `min-` and `max+`.

For the `tzconvert` example, this would add test cases such as `h = -1` and `h = 24`, or `stz = -13` and `stz = 15`.

#### 2. Equivalence Class Testing (ECT)

One drawback of Boundary Value Testing is that it can generate a large number of test cases, many of which may be redundant. **Equivalence Class Testing** addresses this by partitioning the input domain into a finite number of "equivalence classes". The assumption is that all data points within a single class are processed by the program in the same way, so testing one representative value from each class is sufficient to discover errors for that entire class.

An equivalence class is defined based on an equivalence relation from set theory, which is reflexive, symmetric, and transitive. For the `tzconvert` example, instead of testing five points for each variable, we could define one valid equivalence class (e.g., any value within the range) and two invalid equivalence classes (one below the minimum and one above the maximum) for each input.

For instance, for the variable `h` with range `[0, 23]`, we might define the partitions:

- `h < 0` (invalid)
    
- `0 <= h <= 23` (valid)
    
- `h > 23` (invalid)
    

By picking one value from each partition for each variable, we can significantly reduce the number of test cases while still achieving broad coverage based on the partitioning logic.

#### 3. Decision Table Testing

When there are logical dependencies among inputs and complex business rules, both BVT and ECT can be inadequate. **Decision Table Testing** is a systematic technique for handling such cases. It provides a tabular method for representing all possible combinations of conditions and the actions that result from each combination.

Consider a function `nextdate(d, m, y)` which calculates the next calendar day. The logic is complex due to the varying number of days in months and leap years.

To apply Decision Table Testing, we follow these steps:

1. **Identify Conditions**: List all input conditions that affect the outcome.
    
    - C1: month `m` is one of {Apr, Jun, Sep, Nov} (30 days)
        
    - C2: month `m` is one of {Jan, Mar, May, Jul, Aug, Oct} (31 days)
        
    - C3: month `m` is December (31 days, end of year)
        
    - C4: month `m` is February
        
    - C5: day `d` is in `[1, 27]`
        
    - C6: day `d` is `28`
        
    - C7: day `d` is `29`
        
    - C8: day `d` is `30`
        
    - C9: day `d` is `31`
        
    - C10: year `y` is a leap year
        
    - C11: year `y` is a common year
        
2. **Identify Actions**: List all possible outcomes or actions.
    
    - A1: Increment day `d`
        
    - A2: Reset day `d` to 1, increment month `m`
        
    - A3: Reset day `d` to 1, reset month `m` to 1, increment year `y`
        
    - A4: Impossible/Invalid date
        
3. **Create the Table**: Construct a table where each column represents a **rule**, which is a unique combination of condition values (`True`, `False`, or `Don't Care`), and the rows map these rules to their corresponding actions.
    

**Example Decision Table for `nextdate`**

|Conditions|Rule 1|Rule 2|Rule 3|Rule 4|...|
|---|---|---|---|---|---|
|C1: m in {30 day months}|T|F|F|F|...|
|C2: m in {31 day months}|F|T|F|F|...|
|C3: m is Dec|F|F|T|F|...|
|...|||||...|
|C8: d = 30|F|F|F|T|...|
|C9: d = 31|T|F|F|F|...|
|C10: y is leap|-|-|-|-|...|
|**Actions**|||||...|
|A1: day++|X||||...|
|A2: month++, day=1||X||X|...|
|A3: year++, month=1, day=1|||X||...|
|A4: Invalid|||||...|

Each column in this table now represents a specific scenario to be tested. We derive a test case for each rule by generating input values (`d`, `m`, `y`) that satisfy that rule's conditions. This ensures all logical business rules specified in the requirements are thoroughly tested.

### Summary

Today we have built upon our foundational knowledge by exploring the core principles that guide effective software testing. We have distinguished between **specification-based (black box)** and **code-based (white box)** testing, understanding their different goals and approaches. We have also situated testing within the development lifecycle by identifying the different levels: **unit, integration, and system**.

The main focus has been on three powerful, systematic techniques for designing specification-based unit tests:

- **Boundary Value Testing**, for targeting errors at the edges of input domains.
    
- **Equivalence Class Testing**, for efficiently covering input domains by partitioning them to reduce redundancy.
    
- **Decision Table Testing**, for handling complex logical conditions and business rules among inputs.
    

These techniques provide a structured and rigorous approach to ensure that individual software units conform to their specifications, which is the first and most fundamental step toward building a high-quality software system. Thank you.