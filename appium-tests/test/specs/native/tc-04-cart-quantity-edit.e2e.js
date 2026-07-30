const {
  addFirstProduct,
  byTestId,
  openCart,
} = require("../../support/srs");
const { byText } = require("../../support/native");

/**
 * @requirement FR-07
 * @expected The cart exposes +/- controls and plus increments quantity by one.
 * @detects Missing quantity controls or an incorrect increment transition.
 */
describe("TC-04 — edit cart quantity", () => {
  it("increments quantity through the required plus control (FR-07)", async () => {
    const productId = await addFirstProduct();
    await openCart();

    const quantity = await byTestId(`cart-quantity-${productId}`);
    await expect(quantity).toHaveText("1");

    const decrement = await byText("-");
    const increment = await byText("+");
    await expect(decrement).toBeDisplayed();
    await expect(increment).toBeDisplayed();
    await increment.click();

    await expect(quantity).toHaveText("2");

    const rows = await $$(
      `android=new UiSelector().resourceIdMatches(".*cart-item-${productId}")`,
    );
    expect(rows).toHaveLength(1);
  });
});
