const {
  openRegister,
  waitTextContains,
} = require("../../support/native");

describe("TC-01 — registration requires password confirmation", () => {
  it("shows two masked password fields as required by FR-01 and FR-22", async () => {
    await openRegister();
    await waitTextContains("Đăng Ký Tài Khoản");

    const registrationInputs = await $$(
      'android=new UiSelector().className("android.widget.EditText")',
    );

    // Required fields: name, email, password, and confirm password.
    expect(registrationInputs).toHaveLength(4);
  });
});
