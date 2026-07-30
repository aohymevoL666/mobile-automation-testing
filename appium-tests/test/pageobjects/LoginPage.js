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

  get registerLink() {
    return this.driver.$(
      'android=new UiSelector().textContains("Đăng ký ngay")',
    );
  }

  get registrationTitle() {
    return this.driver.$(
      'android=new UiSelector().text("Đăng Ký Tài Khoản")',
    );
  }

  get registrationInputs() {
    return this.driver.$$(
      'android=new UiSelector().className("android.widget.EditText")',
    );
  }

  registrationInput(index) {
    return this.driver.$(
      `android=new UiSelector().className("android.widget.EditText").instance(${index})`,
    );
  }

  get registerButton() {
    return this.driver.$('android=new UiSelector().text("Đăng Ký")');
  }

  get dialogMessage() {
    return this.driver.$(
      'android=new UiSelector().resourceId("android:id/message")',
    );
  }

  get dialogPositiveButton() {
    return this.driver.$(
      'android=new UiSelector().resourceId("android:id/button1")',
    );
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

  async openRegistration() {
    await this.open();
    const link = await this.registerLink;
    await link.waitForDisplayed({ timeout: 20000 });
    await link.click();
    await (await this.registrationTitle).waitForDisplayed({ timeout: 20000 });
  }

  async fillRegistration({
    name,
    email,
    password,
    confirmPassword,
    requireConfirmation = true,
  }) {
    await (await this.registrationInput(0)).setValue(name);
    await (await this.registrationInput(1)).setValue(email);
    await (await this.registrationInput(2)).setValue(password);

    if (confirmPassword !== undefined) {
      const confirmation = await this.registrationInput(3);
      if (requireConfirmation) {
        await confirmation.waitForExist({ timeout: 5000 });
        await confirmation.setValue(confirmPassword);
      } else if (await confirmation.isExisting()) {
        await confirmation.setValue(confirmPassword);
      }
    }
  }

  async submitRegistration() {
    await (await this.registerButton).click();
  }

  async dismissDialog() {
    const button = await this.dialogPositiveButton;
    await button.waitForDisplayed({ timeout: 10000 });
    await button.click();
  }

  async login(email, password) {
    await (await this.emailInput).setValue(email);
    await (await this.passwordInput).setValue(password);
    await (await this.signInButton).click();
  }
}

module.exports = LoginPage;
