### What is Software Testing?

**Software Testing** is formally defined as a process of evaluating and verifying that a software product or application performs its intended functions correctly. It is a methodical check to ensure the software is free of defects, meets its specified technical requirements, and fulfills user expectations in an efficient and effective manner.

To elaborate, the process of software testing can be broken down into two fundamental steps:

1. **Verification**: This step involves a review of the development process to ensure that the product is being built correctly. It addresses the question, "Are we building the product the right way?" During verification, we check documents, design, code, and program structure.
2. **Validation**: This step involves testing the actual software product to ensure that it meets the user's needs and requirements. It seeks to answer the question, "Are we building the right product?" Validation is a dynamic process of testing the real product.

In essence, software testing is an investigative process aimed at identifying any errors, bugs, or discrepancies in the software that could lead to performance issues or failure.

### Why is Software Testing Necessary?

To understand the critical importance of software testing, we must consider the consequences of its absence. Software defects, particularly in large-scale, mission-critical systems, can lead to catastrophic failures with significant monetary and even human costs.

History provides us with numerous sobering examples:

- In **1985**, a software bug in Canada's Therac-25 radiation therapy machine led to malfunctions, delivering lethal radiation doses to patients. This resulted in the deaths of three people and severe injuries to three others.
- In **1994**, a China Airlines Airbus A300 crashed due to a software bug, tragically killing all 264 people on board.
- In **1998**, NASA's Mars Climate Orbiter was lost in space. The failure was traced to a software error where one engineering team used English units while another used metric units for a critical calculation, leading to the loss of the $1.2 billion spacecraft.
- More recently, in **2015**, a software glitch in the F-35 fighter jet's systems prevented it from correctly detecting targets. In the same year, a software failure in Bloomberg terminals in London caused a widespread crash, affecting over 300,000 traders and forcing the UK government to postpone a £3 billion debt sale.

These examples starkly illustrate that rigorous software testing is not merely a quality assurance measure but a crucial process for preventing economic loss, ensuring safety, and maintaining operational integrity.

### The Anatomy of Software Testing

To conduct testing systematically, we must understand its basic components.

#### What is a Test?

A **test** is the act of exercising a software system with a set of inputs, known as test cases, to achieve two primary goals:

1. **To find faults:** The primary objective is to uncover defects or bugs in the software.
2. **To build confidence:** A test aims to demonstrate that the software behaves according to its specification, thereby increasing our confidence in its reliability and correctness.

The process of a test involves providing generated input to the software being tested (the **test subject**). The resulting output is then examined by a **test oracle**, which is often another program designed to verify the correctness of the output. The oracle returns a simple verdict: `Pass` or `Fail`.

#### What is a Test Case?

A **test case** is a formal, documented specification of a single test to be performed on the software. It is a structured entity that consists of several key components:

- **An identifier:** A unique name or number, often linked to a specific user requirement or use case, for tracking purposes.
- **A description:** A statement detailing the purpose of the test and the specific use case or functionality being examined.
- **A precondition:** The state that the system must be in before the test can be executed.
- **A set of inputs:** The specific data or actions that will be provided to the system during the test.
- **The expected output:** The result that the software is expected to produce based on the given inputs and preconditions.
- **The expected postcondition:** The state of the system after the test has been successfully executed.
- **The execution history:** A log of when the test was run and the results, which is useful for tracking and regression analysis.

### The Limitation of Software Testing

Despite its critical importance, it is imperative to understand the fundamental limitation of software testing. A failed test definitively proves the presence of a bug. However, a passed test only demonstrates that the software behaves as expected for that _specific_ set of inputs. It does not, and cannot, prove the absence of all bugs, especially when the domain of possible inputs is vast or infinite.

This concept was succinctly articulated by the eminent computer scientist Dijkstra, who stated:

> "Testing shows the presence, not the absence of bugs."

Therefore, while testing is an essential tool for fault detection and confidence-building, it is not a guarantee of absolute correctness.

### Testing a Node.js Application with Jest

We will now transition from the theoretical to the practical. There are numerous tools available for testing Node.js applications, and **Jest** is one of the most popular and widely used frameworks.

To incorporate Jest into a Node.js project, you would typically run a command to add it as a development dependency. In your project's `package.json` file, you would then modify the `"test"` script to execute Jest.

Let's consider a simple example. Suppose we have a file `src/mymath.js` with a function to be tested:

```javascript
// src/mymath.js
function sum(x, y) {
  return x + y;
}
module.exports = { sum };
```

To test this function, we would create a corresponding test file, `test/mymath.test.js`:

```javascript
// test/mymath.test.js
const mymath = require("../src/mymath.js");

describe("mymath sum test-suite", () => {
  test("summing of two positive numbers", () => {
    const result = mymath.sum(1, 2);
    expect(result).toBe(3);
  });
  test("summing of two negative numbers", () => {
    const result = mymath.sum(-3, -2);
    expect(result).toBe(-5);
  });
});
```

In this test file, the `describe()` function serves to group related tests into a **test suite**. Each individual test is defined by a call to the `test()` function, which takes a descriptive string and a function containing the test logic. Inside the test function, we execute the `sum()` function and then use Jest's `expect()` function in conjunction with a "matcher" function—in this case, `toBe()`—to assert that the actual result matches the expected result.

Executing this test suite would generate a report in the console indicating whether each test passed or failed.

### Testing Object-Oriented Programs

Jest can also be effectively used to test object-oriented code. Consider a class `FibSeq` in a file named `src/FibSeq.js` that generates a Fibonacci sequence:

```JavaScript
// src/FibSeq.js
class FibSeq {
    constructor() {
        this.prev = 0;
        this.curr = 1;
    }
    next() {
        let res = this.prev + this.curr;
        this.prev = this.curr;
        this.curr = res;
        return res;
    }
}
module.exports = FibSeq;
```

We can write a test suite for this class. However, a crucial consideration when testing objects is managing their state. If tests are run sequentially on the same object instance, the outcome of one test can affect the next. To ensure test independence, we should reset the object before each test. Jest provides setup and teardown functions for this purpose.

```JavaScript
// test/FibSeq.test.js
const FibSeq = require('../src/FibSeq.js');

describe("FibSeq class test with setup and tear down", () => {
    let fibSeq = null;

    beforeEach(() => {
        fibSeq = new FibSeq();
    });

    afterEach(() => {
        fibSeq = null;
    });

    test ("first fib num is 1 after reset", () => {
        const result = fibSeq.next();
        expect(result).toBe(1);
    });

    test ("second fib num is 1 after reset", () => {
        const result = fibSeq.next();
        expect(result).toBe(1);
    });
})
```

The `beforeEach()` function runs before every single test within the `describe` block, creating a new `FibSeq` instance. The `afterEach()` function runs after each test, clearing the instance. This ensures that each test begins with a fresh object, eliminating inter-test dependencies and leading to more reliable and predictable test results.

### Types and Levels of Software Testing

Software testing is not a monolithic activity. It comprises various types and levels, each designed to validate different aspects of the software.

The primary categorization of testing is based on the method of execution:

- **Manual Testing:** This is a technique where test cases are executed manually by a human tester without the use of any automation tools. The tester manually checks all the features of an application one by one to find defects.
- **Automation Testing:** In this technique, a tester writes scripts and uses specialized software tools to test the application. It automates the process of manual testing, allowing for the execution of repetitive tasks without human intervention.

Beyond this initial division, testing can be further classified based on the level of knowledge of the internal system structure:

- **White Box Testing:** This technique involves testing the internal structure and workings of a software application. The tester has access to the source code and uses this knowledge to design test cases that verify the correctness of the software at the code level.
- **Black Box Testing:** In this type of testing, the tester has no knowledge of the internal implementation details of the software. The focus is purely on validating the functionality based on the provided specifications and requirements, treating the software as a "black box."
- **Gray Box Testing:** This approach is a hybrid of white box and black box testing. The tester has partial knowledge of the internal structure, which can be used to design more effective test cases while still primarily focusing on the user's perspective.

Furthermore, testing is conducted at different levels of granularity throughout the software development lifecycle:

1. **Unit Testing:** This is the lowest level of testing, where individual components or units of the software are tested in isolation. It is typically performed by developers to ensure that each small part of the code functions correctly.
2. **Integration Testing:** At this level, individual units that have been tested are combined and tested as a group. The goal is to expose faults in the interaction between integrated components.
3. **System Testing:** This level involves testing the complete and fully integrated software system. The purpose is to evaluate the system's compliance with its specified requirements as a whole.
4. **Acceptance Testing:** This is the final level of testing, performed to ensure that the software meets the needs and requirements of the end-users. It is often conducted by the customers or users in a real-world environment to validate the software before its official release.

### Best Practices for Software Testing

To maximize the effectiveness of the testing process, certain best practices should be followed:

- **Continuous Testing:** Testing should not be a single phase but an ongoing activity. Project teams should test each new build as it becomes available to validate the software in real environments early in the development cycle.
- **Involve Users:** It is critical to involve end-users in the testing process. Their feedback helps ensure the software is developed from the customer's perspective and meets their actual needs.
- **Divide Tests into Smaller Parts:** Breaking down tests into smaller, more manageable fractions saves time and resources, especially in environments requiring frequent testing. This also facilitates better analysis of test results.
- **Utilize Metrics and Reporting:** The use of metrics allows teams to share goals and track progress. Advanced tools can integrate project metrics into a central dashboard for easy review of the project's overall health.
- **Do Not Skip Regression Testing:** Whenever a change is made to the code, regression testing must be performed to ensure that the new changes have not adversely affected existing functionalities.
- **Service Virtualization:** This practice involves simulating systems and services that are not yet developed or are otherwise unavailable. This reduces dependencies and allows testing to begin sooner in the development cycle.

### Benefits of Software Testing

The diligent application of software testing principles and practices yields numerous benefits:

- **Improved Product Quality:** By systematically identifying and fixing defects, testing directly contributes to the delivery of a high-quality product.
- **Increased Customer Satisfaction:** A well-tested application is more reliable, secure, and performs as expected, which leads to higher satisfaction and trust from customers.
- **Cost-Effectiveness:** Identifying and fixing bugs early in the development lifecycle is significantly less expensive than addressing them after the product has been deployed.
- **Enhanced Security:** Security testing specifically targets vulnerabilities, helping to protect the application and its data from internal and external threats.

### Summary

To reiterate, we have established that **Software Testing** is a fundamental process of verification and validation aimed at ensuring a software product functions as specified and meets user requirements. We have seen that the absence of thorough testing can lead to severe consequences, making it an indispensable part of the development lifecycle.

We defined a **test** as the execution of software with **test cases** to find faults and build confidence. We also detailed the formal structure of a test case.

We acknowledged the inherent limitation of testing—that it can show the presence of bugs but not their absence.

We then explored the practical application of testing using the **Jest framework** for Node.js applications, including how to structure test suites and manage state in object-oriented testing.

Finally, we classified the various types and levels of testing, from manual to automated, and from unit level to system-wide acceptance, and we reviewed the best practices that enhance the testing process and the significant benefits that result from it.

### Active Recall Questions

To help solidify your understanding of today's material, please consider the following questions:

1. What is the formal definition of Software Testing, and what are its two main steps?
2. Why is software testing considered a critical phase in the software development lifecycle? Provide a historical example to support your reasoning.
3. What are the essential components that constitute a formal test case?
4. Explain the meaning behind Edsger Dijkstra's statement, "Testing shows the presence, not the absence of bugs."
5. In the context of Jest, what is the purpose of the `describe()` function and the `test()` function?
6. Why is it important to use functions like `beforeEach()` when testing object-oriented code?
7. Distinguish between White Box, Black Box, and Gray Box testing.
8. Describe the four primary levels of software testing and their respective goals.

### Outlook

The principles and practices of software testing are foundational to modern software engineering. As systems become increasingly complex and integrated into every facet of our lives, the demand for robust, reliable, and secure software will only intensify. A comprehensive understanding of software testing is, therefore, not just an academic exercise but a professional necessity for anyone involved in the creation of software. In our upcoming lectures, we will delve deeper into specific testing techniques and methodologies. Thank you.
