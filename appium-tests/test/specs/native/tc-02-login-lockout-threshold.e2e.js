const LoginPage = require("../../pageobjects/LoginPage");
const ProfilePage = require("../../pageobjects/ProfilePage");
const { relaunchApp } = require("../../support/native");

// npx wdio run ./config/suites/srs.conf.js --spec ./test/specs/native/tc-02-login-lockout-threshold.e2e.js

const PASSWORD = "Valid1!Pass";
const BAD_PASSWORD = "Wrong1!Pass";
const GENERIC_ERROR = "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
let sequence = 0;

const uniqueUser = (label) => {
  const suffix = `${Date.now()}.${sequence++}`;
  return {
    name: `FR02 ${label} ${suffix}`,
    email: `fr02.${label}.${suffix}@example.com`,
    password: PASSWORD,
  };
};

async function registerFixture(user) {
  const response = await fetch("http://127.0.0.1:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(
      `Could not create FR-02 fixture: ${response.status} ${await response.text()}`,
    );
  }
}

async function openFreshLogin() {
  await relaunchApp();
  const login = new LoginPage(driver);
  await login.open();
  return login;
}

async function failLogin(email, password = BAD_PASSWORD) {
  const login = await openFreshLogin();
  await login.login(email, password);
  await (await login.loginError).waitForDisplayed({ timeout: 10000 });
  return login;
}

async function failLoginTimes(email, count) {
  for (let attempt = 0; attempt < count; attempt += 1) {
    await failLogin(email);
  }
}

async function loginSuccessfully(user) {
  const login = await openFreshLogin();
  await login.login(user.email, user.password);
  const greeting = await login.greeting(user.name);
  await greeting.waitForDisplayed({ timeout: 10000 });
  return { greeting, login };
}

async function waitUntilElapsed(startedAt, milliseconds) {
  await driver.waitUntil(
    async () => Date.now() - startedAt >= milliseconds,
    {
      timeout: milliseconds + 2000,
      interval: 100,
      timeoutMsg: `Expected ${milliseconds} ms to elapse`,
    },
  );
}

/**
 * @requirement FR-02
 * @expected Each failed login increments the counter by exactly one; the third
 * consecutive failure locks the account for 30 seconds with a non-disclosing
 * error; successful authentication retains credentials for authenticated
 * requests.
 * @detects Counter increments larger than one, early or late lockout, missing
 * lockout, information-disclosing errors, discarded login credentials, or
 * omitted credentials on an authenticated request.
 */
describe("TC-02 — FR-02 login and temporary lockout", () => {
  it("accepts the correct password after exactly two consecutive failures", async () => {
    const user = uniqueUser("counter");
    await registerFixture(user);

    await failLoginTimes(user.email, 2);
    const { greeting } = await loginSuccessfully(user);

    await expect(greeting).toBeDisplayed();
  });

  it("locks the account on the third consecutive failed login", async () => {
    const user = uniqueUser("threshold");
    await registerFixture(user);

    await failLoginTimes(user.email, 3);
    const login = await openFreshLogin();
    await login.login(user.email, user.password);

    await expect(await login.loginError).toHaveText(GENERIC_ERROR);
    await expect(await login.greeting(user.name)).not.toBeDisplayed();
  });

  it("keeps the account locked before 30 seconds and unlocks it after 30 seconds", async () => {
    const user = uniqueUser("duration");
    await registerFixture(user);

    await failLoginTimes(user.email, 3);
    const lockedAt = Date.now();

    await waitUntilElapsed(lockedAt, 28000);
    let login = await openFreshLogin();
    await login.login(user.email, user.password);
    await expect(await login.loginError).toHaveText(GENERIC_ERROR);
    await expect(await login.greeting(user.name)).not.toBeDisplayed();

    await waitUntilElapsed(lockedAt, 30500);
    login = await openFreshLogin();
    await login.login(user.email, user.password);
    const greeting = await login.greeting(user.name);
    await greeting.waitForDisplayed({ timeout: 10000 });
    await expect(greeting).toBeDisplayed();
  });

  it("shows the same non-disclosing error for an unknown email and a wrong password", async () => {
    const user = uniqueUser("generic-error");
    await registerFixture(user);

    let login = await failLogin(user.email);
    const wrongPasswordMessage = await (await login.loginError).getText();

    login = await failLogin(uniqueUser("unknown").email);
    const unknownEmailMessage = await (await login.loginError).getText();

    expect(wrongPasswordMessage).toBe(GENERIC_ERROR);
    expect(unknownEmailMessage).toBe(wrongPasswordMessage);
    expect(unknownEmailMessage.toLowerCase()).not.toMatch(
      /user not found|unknown email|password incorrect|email không tồn tại|sai mật khẩu/,
    );
  });

  it("retains successful-login credentials for an authenticated request", async () => {
    const user = uniqueUser("authenticated-request");
    await registerFixture(user);
    await loginSuccessfully(user);

    const profile = new ProfilePage(driver);
    await profile.open(user.name);
    const updatedName = `${user.name} Updated`;
    await profile.update({
      name: updatedName,
      phone: "123456789",
      address: "FR-02 authenticated request address",
    });

    await expect(await profile.dialogMessage).toHaveText(
      "Cập nhật thành công!",
    );
    await profile.dismissDialog();
    await expect(await new LoginPage(driver).greeting(updatedName)).toBeDisplayed();
  });
});
