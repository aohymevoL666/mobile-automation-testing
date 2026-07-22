// Native Android config — WebdriverIO -> Appium :4723 -> UiAutomator2 -> emulator.
// App: com.eshop.mobile (dev build from `expo run:android`) on Small_Phone.
exports.config = {
  runner: "local",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  specs: ["./tests/native/**/*.e2e.js"],
  maxInstances: 1,

  capabilities: [{
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": "emulator-5554",
    "appium:appPackage": "com.eshop.mobile",
    "appium:appActivity": ".MainActivity",
    "appium:noReset": true,
    "appium:newCommandTimeout": 300,
    "appium:autoGrantPermissions": true,
  }],

  logLevel: "warn",
  waitforTimeout: 20000,
  connectionRetryTimeout: 180000,
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: { ui: "bdd", timeout: 120000 },
};
