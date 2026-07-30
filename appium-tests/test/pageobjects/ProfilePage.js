// Page Object — authenticated profile screen.
class ProfilePage {
  constructor(driver) {
    this.driver = driver;
  }

  get title() {
    return this.driver.$(
      'android=new UiSelector().text("Hồ sơ của bạn")',
    );
  }

  get nameInput() {
    return this.driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(1)',
    );
  }

  get phoneInput() {
    return this.driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(2)',
    );
  }

  get addressInput() {
    return this.driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(3)',
    );
  }

  get updateButton() {
    return this.driver.$('android=new UiSelector().text("Cập nhật")');
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

  async open(userName) {
    const greeting = await this.driver.$(
      `android=new UiSelector().text("Chào, ${userName}")`,
    );
    await greeting.waitForDisplayed({ timeout: 10000 });
    await greeting.click();
    await (await this.title).waitForDisplayed({ timeout: 10000 });
  }

  async update({ name, phone, address }) {
    await (await this.nameInput).setValue(name);
    await (await this.phoneInput).setValue(phone);
    await (await this.addressInput).setValue(address);
    await (await this.updateButton).click();
  }

  async dismissDialog() {
    const button = await this.dialogPositiveButton;
    await button.waitForDisplayed({ timeout: 10000 });
    await button.click();
  }
}

module.exports = ProfilePage;
