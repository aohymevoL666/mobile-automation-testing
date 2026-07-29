// Page Object — Home (product list), search and product detail (User Guide §4.4).
class HomePage {
  constructor(driver) {
    this.driver = driver;
  }

  get headerTitle() {
    return this.driver.$('android=new UiSelector().textContains("Danh sách sản phẩm")');
  }

  // Only EditText on the home screen.
  get searchInput() {
    return this.driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(0)',
    );
  }

  get searchButton() {
    return this.driver.$('android=new UiSelector().text("Tìm")');
  }

  firstDetailButton() {
    return this.driver.$('android=new UiSelector().text("Xem chi tiết").instance(0)');
  }

  productByName(name) {
    return this.driver.$(`android=new UiSelector().textContains("${name}")`);
  }

  // "Thêm vào giỏ hàng" button on the product-detail screen.
  get detailAddToCartButton() {
    return this.driver.$('android=new UiSelector().text("Thêm vào giỏ hàng")');
  }

  async waitLoaded() {
    await (await this.headerTitle).waitForDisplayed({ timeout: 30000 });
  }

  async search(term) {
    const input = await this.searchInput;
    await input.waitForDisplayed({ timeout: 20000 });
    await input.setValue(term);
    await (await this.searchButton).click();
  }

  async openFirstResult() {
    const detail = await this.firstDetailButton();
    await detail.waitForDisplayed({ timeout: 20000 });
    await detail.click();
  }

  // Adds the open product to the cart and dismisses the success Alert.
  // RN's cross-platform Alert.alert() renders a standard AlertDialog, but
  // Appium's W3C acceptAlert() doesn't recognize it as a "native alert" here
  // (confirmed present on screen — evidence/appium/debug-addcart.png) — so
  // dismiss it by tapping its OK button like any other UI element instead.
  async addToCartFromDetail() {
    const add = await this.detailAddToCartButton;
    await add.waitForDisplayed({ timeout: 20000 });
    await add.click();

    const ok = await this.driver.$('android=new UiSelector().text("OK")');
    await ok.waitForDisplayed({ timeout: 10000 });
    await ok.click();
  }
}

module.exports = HomePage;
