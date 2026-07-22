// Shared UiAutomator2 selector helpers for the EShop native tests.
// RN renders Text as android.widget.TextView and TouchableOpacity as
// android.view.ViewGroup, so we locate by visible text / text-contains.

const byText = (t) =>
  $(`android=new UiSelector().text("${t}")`);

const byTextContains = (t) =>
  $(`android=new UiSelector().textContains("${t}")`);

// Nth EditText on the screen (0-based), in layout order.
const editText = (i) =>
  $(`android=new UiSelector().className("android.widget.EditText").instance(${i})`);

// Tap the clickable ancestor of a text node (RN buttons are ViewGroups whose
// child TextView holds the label). Tapping the text usually bubbles fine.
async function tapText(t) {
  const el = await byText(t);
  await el.waitForDisplayed({ timeout: 20000 });
  await el.click();
}

// RN often merges nested <Text> into one node ("Chưa có tài khoản? Đăng ký
// ngay"), so exact match misses. Tap by substring instead.
async function tapTextContains(t) {
  const el = await byTextContains(t);
  await el.waitForDisplayed({ timeout: 20000 });
  await el.click();
}

async function waitText(t, timeout = 20000) {
  const el = await byText(t);
  await el.waitForDisplayed({ timeout });
  return el;
}

async function waitTextContains(t, timeout = 20000) {
  const el = await byTextContains(t);
  await el.waitForDisplayed({ timeout });
  return el;
}

// Return to the app's home screen regardless of current view.
async function goHome() {
  // "EShop Mobile" brand is a home link in the header on most screens.
  try {
    const brand = await byText("EShop Mobile");
    if (await brand.isDisplayed()) await brand.click();
  } catch (_) {}
}

const APP_ID = "com.eshop.mobile";

// Relaunch the app so every test starts from a known, EMPTY state.
// This is what kills the flakiness: no leftover input from a prior test,
// so we never depend on clearValue() (unreliable on RN Android EditText).
async function relaunchApp() {
  await driver.execute("mobile: terminateApp", { appId: APP_ID });
  await driver.execute("mobile: activateApp", { appId: APP_ID });
  await driver.pause(2500);
}

// Fresh launch -> Login -> Register. Fields are guaranteed blank.
async function openRegister() {
  await relaunchApp();
  await tapText("Đăng nhập");
  await tapTextContains("Đăng ký ngay");
  await waitTextContains("Đăng Ký Tài Khoản");
}

// Fresh launch -> Login screen. Fields are guaranteed blank.
async function openLogin() {
  await relaunchApp();
  await tapText("Đăng nhập");
  await waitTextContains("Đăng Nhập");
}

module.exports = {
  byText,
  byTextContains,
  editText,
  tapText,
  tapTextContains,
  waitText,
  waitTextContains,
  goHome,
  relaunchApp,
  openRegister,
  openLogin,
};
