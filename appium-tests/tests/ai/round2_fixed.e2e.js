// ============================================================================
// "APPIUM GPT" — HUMAN-FIXED (round 2).
//
// Same intent as the raw AI output, but corrected against the REAL app after
// reading App.js / the live UI tree:
//   - "Login"        -> "Đăng nhập"  (nav is Vietnamese, not English)
//   - guessed content-desc ids -> real EditText fields (no ids in this RN app)
//   - "Product List" -> the home screen already shows "Danh sách sản phẩm"
// Lesson: AI-generated flows must be verified against the actual application.
// ============================================================================
const { editText, tapText, waitTextContains, openLogin } = require("../native/helpers");

describe("EShop login and product list (AI-generated, fixed)", () => {
  it("logs in and shows the product list", async () => {
    await openLogin();                                 // Home -> "Đăng nhập"
    await (await editText(0)).setValue("test@eshop.com");
    await (await editText(1)).setValue("Test1234!");
    await tapText("Sign In");                           // real button label

    // After login the home screen IS the product list.
    const products = await waitTextContains("Danh sách sản phẩm");
    await expect(products).toBeDisplayed();
  });
});
