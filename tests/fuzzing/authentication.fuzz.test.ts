import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  validateSignupForm,
  isValidEmail,
  getPasswordError,
  type SignupValidationData,
} from "../../src/utils/authentication";

// Helper arbitrary: realistic base valid payload that we will mutate in properties
const baseValidJobseeker: SignupValidationData = {
  email: "valid.user@example.com",
  password: "Abcdef",
  confirmPassword: "Abcdef",
  firstName: "Alice",
  lastName: "Smith",
  userType: "jobseeker",
  phoneNumber: "88888888",
  dateOfBirth: "2000-01-01",
  address: "123 Road Name",
  postalCode: "123456",
};

const arbitrarySignup = fc.record<SignupValidationData>({
  email: fc.string(),
  password: fc.string(),
  confirmPassword: fc.string(),
  firstName: fc.string(),
  lastName: fc.string(),
  userType: fc.constantFrom("jobseeker", "employer"),
  phoneNumber: fc.option(fc.string(), { nil: undefined }),
  dateOfBirth: fc.option(fc.string(), { nil: undefined }),
  address: fc.option(fc.string(), { nil: undefined }),
  postalCode: fc.option(fc.string(), { nil: undefined }),
  companyName: fc.option(fc.string(), { nil: undefined }),
  officeNumber: fc.option(fc.string(), { nil: undefined }),
});

describe("authentication utils fuzzing", () => {
  it("validateSignupForm never throws for arbitrary payloads", () => {
    fc.assert(
      fc.property(arbitrarySignup, (data) => {
        const errors = validateSignupForm(data);
        expect(Array.isArray(errors)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it("isValidEmail rejects clearly invalid emails", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // No @ at all
          fc.string().filter((s) => !s.includes("@")),
          // Strings composed only of problematic characters
          fc.array(fc.constantFrom(" ", "\"", "<", ">", "(", ")", ",", ";", ":"), { minLength: 1, maxLength: 50 }).map((a) => a.join("")),
          // Multiple @
          fc.tuple(fc.string(), fc.string(), fc.string()).map(([a, b, c]) => `${a}@${b}@${c}`)
        ),
        (email) => {
          expect(isValidEmail(email)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("getPasswordError flags short or no-uppercase passwords", () => {
    // Too short
    fc.assert(
      fc.property(fc.string({ maxLength: 5 }), (pwd) => {
        const msg = getPasswordError(pwd);
        expect(msg).toBeTruthy();
        expect(msg).toMatch(/6/);
      })
    );

    // At least 6 chars but all lowercase (no uppercase)
    fc.assert(
      fc.property(
        fc.string({ minLength: 6 }).filter((s) => s.length >= 6 && s.toLowerCase() === s && /[a-z]/.test(s)),
        (pwd) => {
          const msg = getPasswordError(pwd);
          expect(msg).toBeTruthy();
          expect(msg?.toLowerCase()).toMatch(/uppercase/);
        }
      )
    );
  });

  it("names with special characters are currently rejected (policy limitation demo)", () => {
    const nameArb = fc.oneof(
      fc.constant("O'Connor"),
      fc.constant("Jean-Luc"),
      fc.constant("María"),
      fc.constant("Anne-Marie"),
      fc.constant("D’Amico")
    );

    fc.assert(
      fc.property(nameArb, (firstName) => {
        const data: SignupValidationData = {
          ...baseValidJobseeker,
          firstName,
        };
        const errors = validateSignupForm(data);
        // Expect an error mentioning name for these realistic cases
        expect(errors.join(" ").toLowerCase()).toMatch(/name/);
      })
    );
  });

  it("postal code boundary behavior: only 6 digits accepted", () => {
    const pcArb = fc.oneof(
      fc.constant(""),
      fc.constant("12345"),
      fc.constant("123456"),
      fc.constant("1234567"),
      fc.constant("００００００"), // fullwidth digits (should be rejected)
      fc.string({ minLength: 1, maxLength: 10 })
    );

    fc.assert(
      fc.property(pcArb, (postalCode) => {
        const data: SignupValidationData = {
          ...baseValidJobseeker,
          postalCode,
        };
        const errors = validateSignupForm(data);
        if (postalCode === "123456") {
          // Should pass postal code check
          expect(errors.join(" ")).not.toMatch(/postal code must be 6 digits/i);
        } else {
          // Should flag as invalid when present but not 6 ASCII digits
          if (postalCode && postalCode.length > 0) {
            expect(errors.join(" ")).toMatch(/postal code/i);
          }
        }
      })
    );
  });

  it("missing required fields per role are detected", () => {
    // Jobseeker: require dateOfBirth, phoneNumber, address, postalCode
    const jsMissing = { ...baseValidJobseeker, dateOfBirth: "", phoneNumber: "", address: "", postalCode: "" };
    const jsErrors = validateSignupForm(jsMissing);
    expect(jsErrors.join(" ").toLowerCase()).toMatch(/date of birth|mobile number|residential address|postal code/);

    // Employer: require companyName
    const employerData: SignupValidationData = {
      email: "boss@example.com",
      password: "Abcdef",
      confirmPassword: "Abcdef",
      firstName: "Bob",
      lastName: "Boss",
      userType: "employer",
      companyName: "",
    };
    const empErrors = validateSignupForm(employerData);
    expect(empErrors.join(" ").toLowerCase()).toMatch(/company name/);
  });

  it("performance smoke: extremely long email regex does not hang", () => {
    const longEmail = "a".repeat(8000) + "@example.com";
    const ok = isValidEmail(longEmail);
    expect(typeof ok).toBe("boolean");
  });
});

