const {
  addFirstProduct,
  byTestId,
  dismissDialogIfPresent,
  openCart,
} = require("../../support/srs");

/**
 * @requirement FR-07
 * @expected The same product occupies one cart row with quantity two.
 * @detects Duplicate cart rows or a quantity that is not incremented.
 */
describe("TC-03 — duplicate product cart behavior", () => {
  it("merges the same product into one row with quantity two (FR-07)", async () => {
    const productId = await addFirstProduct();

    await (await byTestId(`add-to-cart-${productId}`)).click();
    await dismissDialogIfPresent();
    await openCart();

    const rows = await $$(
      `android=new UiSelector().resourceIdMatches(".*cart-item-${productId}")`,
    );
    expect(rows).toHaveLength(1);

    const quantity = await byTestId(`cart-quantity-${productId}`);
    await expect(quantity).toHaveText("2");
  });
});
