const {
  addFirstProduct,
  byTestId,
  openCart,
} = require("../../support/srs");

describe("TC-04 — edit cart quantity", () => {
  it("keeps the exact positive integer entered by the user (FR-07)", async () => {
    const productId = await addFirstProduct();
    await openCart();

    const quantity = await byTestId(`cart-quantity-${productId}`);
    // The field starts at "1". Appending "2" is a deterministic native user
    // action and should produce the valid positive integer "12".
    await quantity.addValue("2");

    await expect(quantity).toHaveText("12");
  });
});
