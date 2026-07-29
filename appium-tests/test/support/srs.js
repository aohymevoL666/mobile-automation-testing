const {
  byTextContains,
  relaunchApp,
} = require("./native");

const byTestId = (testId) =>
  $(
    `android=new UiSelector().resourceIdMatches(".*${testId.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    )}")`,
  );

async function waitForHome() {
  await relaunchApp();
  await (
    await byTextContains("Danh sách sản phẩm")
  ).waitForDisplayed({ timeout: 20_000 });
}

async function dismissDialogIfPresent(timeout = 2_000) {
  const positiveButton = await $(
    'android=new UiSelector().resourceId("android:id/button1")',
  );
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      if (await positiveButton.isDisplayed()) {
        await positiveButton.click();
        return true;
      }
    } catch (_) {}
    await driver.pause(100);
  }
  return false;
}

async function addFirstProduct() {
  await waitForHome();
  const addButtons = await $$(
    'android=new UiSelector().resourceIdMatches(".*add-to-cart-.*")',
  );
  expect(addButtons.length).toBeGreaterThan(0);

  const resourceId = await addButtons[0].getAttribute("resource-id");
  const productId = resourceId.replace(/^.*add-to-cart-/, "");
  await addButtons[0].click();
  await dismissDialogIfPresent();
  return productId;
}

async function openCart() {
  await (await byTestId("cart-nav")).click();
  await (
    await byTextContains("Giỏ Hàng")
  ).waitForDisplayed({ timeout: 10_000 });
}

module.exports = {
  addFirstProduct,
  byTestId,
  dismissDialogIfPresent,
  openCart,
  waitForHome,
};
