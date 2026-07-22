// ============================================================================
// APPIUM DEMO — manual login flow (the hand-written test that passes).
// Equivalent of the reference report's 01_login.yaml, but in Appium/WebdriverIO.
//
//   WebdriverIO -> Appium :4723 -> UiAutomator2 -> com.eshop.mobile (emulator)
//
// Flow: Home -> "Đăng nhập" -> enter valid credentials -> "Sign In"
//       -> logged in, product list ("Danh sách sản phẩm") is shown.
// ============================================================================
const { editText, tapText, waitTextContains, byTextContains, openLogin } = require("./helpers");

describe("Appium demo — login", () => {
  const EMAIL = "test@eshop.com";      // seeded user
  const PASS = "Test1234!";

  before(async () => {
    console.log("Session caps:", JSON.stringify(await driver.capabilities, null, 0).slice(0, 200));
  });

  it("opens the login screen from home", async () => {
    await openLogin();                                 // Home -> "Đăng nhập"
    await waitTextContains("Đăng Nhập");
  });

  it("logs in with valid credentials and shows the product list", async () => {
    await openLogin();
    await (await editText(0)).setValue(EMAIL);
    await (await editText(1)).setValue(PASS);
    await tapText("Sign In");

    // Logged in: header greets the user AND the product list is visible.
    await expect(await byTextContains("Chào")).toBeDisplayed({ wait: 10000 });
    await expect(await waitTextContains("Danh sách sản phẩm")).toBeDisplayed();
  });
});
