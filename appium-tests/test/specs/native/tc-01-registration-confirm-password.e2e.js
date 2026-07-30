const LoginPage = require("../../pageobjects/LoginPage");
const { relaunchApp } = require("../../support/native");

let sequence = 0;
const uniqueEmail = (label) =>
  `fr01.${label}.${Date.now()}.${sequence++}@example.com`;

const validRegistration = (label) => ({
  name: "FR-01 Test User",
  email: uniqueEmail(label),
  password: "Valid1!a",
  confirmPassword: "Valid1!a",
});

/**
 * @requirement FR-01
 * @expected Registration enforces all required fields, email and password
 * rules, matching password confirmation, email uniqueness, and redirects a
 * successfully registered user to Login.
 * @detects Missing required inputs; acceptance of invalid or duplicate email;
 * weak, unsupported-special-character, or mismatched passwords; and a missing
 * post-registration redirect.
 */
describe("TC-01 — FR-01 account registration", () => {
  let registration;

  beforeEach(async () => {
    await relaunchApp();
    registration = new LoginPage(driver);
    await registration.openRegistration();
  });

  it("provides name, email, password, and confirm-password inputs", async () => {
    const inputs = await registration.registrationInputs;
    expect(inputs).toHaveLength(4);
  });

  it("rejects registration when any required value is blank", async () => {
    const cases = [
      { field: "name", value: "" },
      { field: "email", value: "" },
      { field: "password", value: "" },
      { field: "confirmPassword", value: "" },
    ];

    for (const testCase of cases) {
      const data = validRegistration(`required-${testCase.field}`);
      data[testCase.field] = testCase.value;
      data.requireConfirmation = testCase.field === "confirmPassword";

      await registration.fillRegistration(data);
      await registration.submitRegistration();
      await expect(await registration.registrationTitle).toBeDisplayed();

      if (testCase !== cases.at(-1)) {
        await relaunchApp();
        registration = new LoginPage(driver);
        await registration.openRegistration();
      }
    }
  });

  it("rejects an email that is not in user@domain.com format", async () => {
    await registration.fillRegistration({
      ...validRegistration("invalid-email"),
      email: "not-an-email",
      requireConfirmation: false,
    });
    await registration.submitRegistration();

    await expect(await registration.registrationTitle).toBeDisplayed();
  });

  it("rejects an email that already belongs to an account", async () => {
    const data = validRegistration("duplicate");
    const response = await fetch("http://127.0.0.1:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Could not create FR-01 duplicate-email fixture: ${response.status} ${await response.text()}`,
      );
    }

    await registration.fillRegistration({
      ...data,
      requireConfirmation: false,
    });
    await registration.submitRegistration();

    await expect(await registration.registrationTitle).toBeDisplayed();
  });

  it("rejects passwords outside the exact FR-01 strength boundary", async () => {
    const invalidPasswords = [
      "Valid1!", // Seven characters.
      "valid1!a", // No uppercase letter.
      "VALID1!A", // No lowercase letter.
      "Valid!!a", // No digit.
      "Valid123", // No special character.
      "Valid1#a", // # is not one of @ $ ! % * ? &.
    ];

    for (const password of invalidPasswords) {
      const data = {
        ...validRegistration("weak-password"),
        password,
        confirmPassword: password,
        requireConfirmation: false,
      };

      await registration.fillRegistration(data);
      await registration.submitRegistration();
      await expect(await registration.registrationTitle).toBeDisplayed();

      if (password !== invalidPasswords.at(-1)) {
        await relaunchApp();
        registration = new LoginPage(driver);
        await registration.openRegistration();
      }
    }
  });

  it("rejects registration when password confirmation does not match", async () => {
    await registration.fillRegistration({
      ...validRegistration("mismatch"),
      confirmPassword: "Different1!",
    });
    await registration.submitRegistration();

    await expect(await registration.registrationTitle).toBeDisplayed();
  });

  it("accepts an eight-character strong password and redirects to Login", async () => {
    await registration.fillRegistration({
      ...validRegistration("success"),
      requireConfirmation: false,
    });
    await registration.submitRegistration();

    await expect(await registration.dialogMessage).toHaveText(
      "Đăng ký tài khoản thành công.",
    );
    await registration.dismissDialog();
    await expect(await registration.passwordInput).toBeDisplayed();
    await expect(await registration.registrationTitle).not.toBeDisplayed();
  });
});
