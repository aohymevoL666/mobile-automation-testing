// Page Object — Cart screen (User Guide §4.4).
// The cart is the only mobile screen with real RN testIDs, which surface as
// resource-ids in the UiAutomator2 hierarchy: cart-nav, cart-item-<id>,
// cart-quantity-<id> (App.js).
class CartPage {
  constructor(driver) {
    this.driver = driver;
  }

  get cartNav() {
    return this.driver.$('android=new UiSelector().resourceIdMatches(".*cart-nav")');
  }

  cartItem(productId) {
    return this.driver.$(
      `android=new UiSelector().resourceIdMatches(".*cart-item-${productId}")`,
    );
  }

  anyCartItem() {
    return this.driver.$('android=new UiSelector().resourceIdMatches(".*cart-item-\\d+")');
  }

  quantityInput(productId) {
    return this.driver.$(
      `android=new UiSelector().resourceIdMatches(".*cart-quantity-${productId}")`,
    );
  }

  itemByName(name) {
    return this.driver.$(`android=new UiSelector().textContains("${name}")`);
  }

  async open() {
    const nav = await this.cartNav;
    await nav.waitForDisplayed({ timeout: 20000 });
    await nav.click();
  }
}

module.exports = CartPage;
