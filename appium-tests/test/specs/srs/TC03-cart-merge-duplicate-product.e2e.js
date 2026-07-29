const {
  addFirstProduct,
  byTestId,
  dismissDialogIfPresent,
  openCart,
} = require("../../support/srs");

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
