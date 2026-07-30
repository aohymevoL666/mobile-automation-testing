const {
  byText,
} = require("../../support/native");
const {
  addFirstProduct,
  byTestId,
  openCart,
} = require("../../support/srs");

/**
 * @requirement FR-07
 * @expected A confirmation dialog appears and the item remains before confirmation.
 * @detects Immediate cart-item deletion without user confirmation.
 */
describe("TC-05 — confirm removal from cart", () => {
  it("asks for confirmation and keeps the item until the user confirms (FR-07)", async () => {
    const productId = await addFirstProduct();
    await openCart();

    await (await byText("Xóa")).click();

    const confirmButton = await $(
      'android=new UiSelector().resourceId("android:id/button1")',
    );
    await confirmButton.waitForDisplayed({ timeout: 2_000 });
    await expect(await byTestId(`cart-item-${productId}`)).toBeDisplayed();
  });
});
