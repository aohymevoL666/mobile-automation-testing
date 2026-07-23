const { byTextContains, relaunchApp } = require("./helpers");

describe("Cart", () => {
  beforeEach(async () => {
    await relaunchApp();
    await (await byTextContains("Danh s")).waitForDisplayed({ timeout: 20000 });
  });

  it("merges the same product into one cart row with quantity 2", async () => {
    const addButtons = await $$('android=new UiSelector().resourceIdMatches(".*add-to-cart-.*")');
    expect(addButtons.length).toBeGreaterThan(0);

    const productId = (await addButtons[0].getAttribute("resource-id"))
      .replace(/^.*add-to-cart-/, "");

    await addButtons[0].click();
    await driver.acceptAlert();
    await (
      await $(
        `android=new UiSelector().resourceIdMatches(".*add-to-cart-${productId}")`,
      )
    ).click();
    await driver.acceptAlert();

    await (
      await $('android=new UiSelector().resourceIdMatches(".*cart-nav")')
    ).click();

    const cartRows = await $$(
      `android=new UiSelector().resourceIdMatches(".*cart-item-${productId}")`,
    );
    expect(cartRows).toHaveLength(1);

    const quantity = await $(
      `android=new UiSelector().resourceIdMatches(".*cart-quantity-${productId}")`,
    );
    await quantity.waitForDisplayed({ timeout: 10000 });
    await expect(quantity).toHaveText("2");
  });
});
