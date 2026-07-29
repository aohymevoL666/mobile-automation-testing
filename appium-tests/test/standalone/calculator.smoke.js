// Smoke test — User Guide §3.2.
// Opens the Calculator app through Appium to prove the whole chain works:
//   WebdriverIO -> Appium :4723 -> UiAutomator2 -> emulator.
// Google-API emulator images may ship the Google Calculator or none at all;
// override APP_PACKAGE / APP_ACTIVITY if the default package is missing
// (e.g. APP_PACKAGE=com.android.settings APP_ACTIVITY=.Settings).
const { remote } = require("webdriverio");

const capabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Android Emulator",
  "appium:appPackage": process.env.APP_PACKAGE || "com.google.android.calculator",
  "appium:appActivity": process.env.APP_ACTIVITY || "com.android.calculator2.Calculator",
};

const options = {
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  logLevel: "warn",
  capabilities,
};

async function runTest() {
  let driver;

  try {
    driver = await remote(options);
    console.log(
      `PASS: ${capabilities["appium:appPackage"]} application opened.`,
    );
  } catch (error) {
    console.error("FAIL: Appium smoke test failed.", error);
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
}

runTest();
