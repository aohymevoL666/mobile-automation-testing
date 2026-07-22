// ============================================================================
// APPIUM DEMO — EShop mobile (native Android, React Native)
//
// One end-to-end flow that exercises the whole Appium stack:
//   WebdriverIO (this script)
//        -> Appium server  :4723   (W3C WebDriver protocol over HTTP)
//        -> UiAutomator2 driver     (Google's Android UI automation framework)
//        -> the real app on the emulator  (com.eshop.mobile)
//
// FR20 — user registration. We drive the UI exactly like a human tester:
// open the register screen, submit a WEAK password (must be rejected), then a
// VALID one (must succeed). The app talks to the live backend on :3000.
//
// Each test relaunches to a fresh, EMPTY register screen (see openRegister) so
// the cases are independent — no shared input, no flaky clearValue().
// ============================================================================
const { editText, tapText, waitTextContains, openRegister } = require("./helpers");

// Unique email per registration (counter avoids same-millisecond collisions).
let seq = 0;
const uniqueEmail = (p) => `${p}_${Date.now()}_${seq++}@mail.com`;

describe("Appium demo — FR20 registration", () => {
  before(async () => {
    // Appium reports what it's driving; handy to show on camera.
    console.log("Session caps:", JSON.stringify(await driver.capabilities, null, 0).slice(0, 200));
  });

  it("opens the registration screen from home", async () => {
    // Home -> Login -> Register. Selectors are the real Vietnamese labels
    // read straight from the live UI tree (getPageSource).
    await openRegister();
    await waitTextContains("Đăng Ký Tài Khoản");
  });

  it("rejects a weak password (FR20 acceptance rule)", async () => {
    await openRegister();
    await (await editText(0)).setValue("Demo Tester");
    await (await editText(1)).setValue(uniqueEmail("weak"));
    await (await editText(2)).setValue("weak");        // fails the strength rule
    await tapText("Đăng Ký");

    // Client-side rule blocks it -> app surfaces the weak-password error.
    const err = await waitTextContains("Mật khẩu quá yếu");
    await expect(err).toBeDisplayed();
  });

  it("registers successfully with a strong password", async () => {
    await openRegister();                              // fresh, empty fields
    await (await editText(0)).setValue("Demo Tester");
    await (await editText(1)).setValue(uniqueEmail("demo"));
    await (await editText(2)).setValue("Valid1!@ok");  // meets the rule
    await tapText("Đăng Ký");

    // FR20 acceptance: a valid registration must visibly confirm success
    // ("Đăng ký tài khoản thành công."). If the app doesn't show it, this test
    // SHOULD go red — that red is Appium catching a real defect, which is the
    // whole point of automated UI testing.
    const ok = await waitTextContains("thành công", 25000);
    await expect(ok).toBeDisplayed();
  });
});
