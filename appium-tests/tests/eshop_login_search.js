// E2E — EShop login -> search -> product detail -> add to cart -> verify cart.
// User Guide §3.3/§3.4, implemented with the Page Objects from §4.4.
//
//   WebdriverIO -> Appium :4723 -> UiAutomator2 -> com.eshop.mobile (emulator)
//
// Prerequisites: emulator running, dev build installed (expo run:android),
// backend on :3000 and Metro on :8081 reachable via `adb reverse`.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { remote } = require("webdriverio");

const LoginPage = require("../pages/LoginPage");
const HomePage = require("../pages/HomePage");
const CartPage = require("../pages/CartPage");

const config = {
  appPackage: process.env.APP_PACKAGE || "com.eshop.mobile",
  appActivity: process.env.APP_ACTIVITY || ".MainActivity",
  email: process.env.TEST_EMAIL || "test@eshop.com",
  password: process.env.TEST_PASSWORD || "Test1234!",
  searchTerm: process.env.SEARCH_TERM || "iPhone",
  // Seeded product: id 1 = "iPhone 15 Pro Max" (backend/database.js).
  productId: process.env.PRODUCT_ID || "1",
  productName: process.env.PRODUCT_NAME || "iPhone 15 Pro Max",
};

// Expo Dev Client cold-starts into its own launcher screen (pick a dev
// server) and then shows a one-time "developer menu" bottom sheet on top of
// the freshly loaded bundle. This is Expo tooling chrome, not EShop UI, so it
// is handled here rather than in a Page Object.
async function isDisplayed(driver, selector) {
  return driver
    .$(selector)
    .then((el) => el.isDisplayed())
    .catch(() => false);
}

async function ensureDevClientLoaded(driver, homeHeaderSelector) {
  const devServerRowSelector =
    'android=new UiSelector().textContains("10.0.2.2:8081")';
  // Distinctive text unique to the one-time developer-menu bottom sheet.
  // BACK is only safe to send when this specific overlay is confirmed present
  // — pressing BACK on the bare Home screen backgrounds the whole app instead.
  const devMenuMarkerSelector =
    'android=new UiSelector().textContains("developer menu")';
  const deadline = Date.now() + 60000;
  let tappedServerRow = false;

  while (Date.now() < deadline) {
    if (await isDisplayed(driver, homeHeaderSelector)) return;

    if (!tappedServerRow && (await isDisplayed(driver, devServerRowSelector))) {
      await (await driver.$(devServerRowSelector)).click();
      tappedServerRow = true;
    } else if (await isDisplayed(driver, devMenuMarkerSelector)) {
      await driver.pressKeyCode(4); // KEYCODE_BACK — dismiss the dev menu only
    }
    // Otherwise: bundle is loaded but the header hasn't hit the accessibility
    // tree yet (it lags the FlatList body by a few seconds) — just wait.
    await driver.pause(1500);
  }
  throw new Error("Dev client did not reach the EShop home screen in time");
}

async function runTest() {
  const driver = await remote({
    hostname: "127.0.0.1",
    port: 4723,
    path: "/",
    logLevel: "warn",
    capabilities: {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": "Android Emulator",
      "appium:appPackage": config.appPackage,
      "appium:appActivity": config.appActivity,
      // Cart and session live in component state, so a relaunch (below) is a
      // full reset; reinstalling via noReset:false is unnecessary.
      "appium:noReset": true,
      "appium:newCommandTimeout": 120,
    },
  });

  const artifactsDir = path.resolve(__dirname, "../artifacts");
  fs.mkdirSync(artifactsDir, { recursive: true });

  const login = new LoginPage(driver);
  const home = new HomePage(driver);
  const cart = new CartPage(driver);

  try {
    // Clean state: relaunch clears in-memory cart and session.
    await driver.execute("mobile: terminateApp", { appId: config.appPackage });
    await driver.execute("mobile: activateApp", { appId: config.appPackage });
    await ensureDevClientLoaded(driver, 'android=new UiSelector().textContains("Danh sách sản phẩm")');
    await home.waitLoaded();

    // Login
    await login.open();
    await login.login(config.email, config.password);
    await home.waitLoaded();

    // Search
    await home.search(config.searchTerm);
    const result = await home.productByName(config.productName);
    await result.waitForDisplayed({ timeout: 20000 });

    // Product detail -> add to cart
    await home.openFirstResult();
    await home.addToCartFromDetail();

    // Cart verification: right product, quantity 1.
    await cart.open();
    const item = await cart.cartItem(config.productId);
    await item.waitForDisplayed({ timeout: 20000 });
    assert.equal(await item.isDisplayed(), true);

    const name = await cart.itemByName(config.productName);
    assert.equal(await name.isDisplayed(), true);

    const quantity = await cart.quantityInput(config.productId);
    assert.equal(await quantity.getText(), "1");

    await driver.saveScreenshot(path.join(artifactsDir, "eshop-flow-pass.png"));
    console.log("PASS: EShop login, search, and cart flow.");
  } catch (error) {
    await driver.saveScreenshot(path.join(artifactsDir, "eshop-flow-fail.png"));
    throw error;
  } finally {
    await driver.deleteSession();
  }
}

runTest().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
