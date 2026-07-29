// Page Object — Login screen (User Guide §4.4).
// The RN login form exposes no testIDs, so fields are located by EditText
// order and buttons by their visible label (see helpers.js for rationale).
class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  get emailInput() {
    return this.driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(0)',
    );
  }

  get passwordInput() {
    return this.driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(1)',
    );
  }

  get signInButton() {
    return this.driver.$('android=new UiSelector().text("Sign In")');
  }

  // Header link shown while logged out; navigates Home -> Login.
  get navLoginLink() {
    return this.driver.$('android=new UiSelector().textContains("Đăng nhập")');
  }

  async open() {
    const link = await this.navLoginLink;
    await link.waitForDisplayed({ timeout: 20000 });
    await link.click();
    await (await this.passwordInput).waitForDisplayed({ timeout: 20000 });
  }

  async login(email, password) {
    await (await this.emailInput).setValue(email);
    await (await this.passwordInput).setValue(password);
    await (await this.signInButton).click();
  }
}

module.exports = LoginPage;
