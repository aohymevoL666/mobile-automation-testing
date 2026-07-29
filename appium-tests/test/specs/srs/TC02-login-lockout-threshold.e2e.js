const {
  byTextContains,
  editText,
  openLogin,
  tapText,
} = require("../../support/native");

describe("TC-02 — account lockout threshold", () => {
  const password = "Valid1!Pass";
  const badPassword = "Wrong1!Pass";
  const email = `appium.lockout.${Date.now()}@example.com`;

  before(async () => {
    const response = await fetch("http://127.0.0.1:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Appium Lockout User",
        email,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Could not create lockout fixture: ${response.status} ${await response.text()}`,
      );
    }
  });

  it("still permits the correct password after only two failed attempts (FR-02)", async () => {
    await openLogin();
    await (await editText(0)).setValue(email);
    await (await editText(1)).setValue(badPassword);

    await tapText("Sign In");
    await (
      await byTextContains("Đăng nhập thất bại")
    ).waitForDisplayed({ timeout: 10_000 });

    await tapText("Sign In");
    await driver.pause(1_000);

    await openLogin();
    await (await editText(0)).setValue(email);
    await (await editText(1)).setValue(password);
    await tapText("Sign In");

    const greeting = await byTextContains("Chào, Appium Lockout User");
    await greeting.waitForDisplayed({ timeout: 10_000 });
    await expect(greeting).toBeDisplayed();
  });
});
