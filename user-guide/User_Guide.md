# T03 Mobile Automation Testing — User Guide

**Course:** CS423 / CSC15003 — Software Testing  
**Seminar topic:** T03 — Mobile Automation Testing  
**Team:** Team 10  
**Traditional tool:** Appium 2 with UiAutomator2  
**AI-augmented / low-code direction:** Maestro Studio / Mobile.dev  
**System under test:** React Native EShop mobile application  
**Document status:** Stage S4 working draft  
**Last updated:** 11 July 2026  

## Team members

| Student ID | Full name |
|---|---|
| 23127159 | Phạm Lê Thái Bảo |
| 23127176 | Huỳnh Lê Khương Duy |
| 23127183 | Phạm Vũ Ngọc Duy |
| 23127446 | Phạm Chí Bảo Ninh |
| 23127531 | Chu Quốc Anh Minh |

---

# 1. Introduction

## 1.1 Purpose

This guide explains how to configure and use **Appium 2** and **Maestro Studio** to automate an Android build of a React Native EShop application.

The two tools are applied to the same business flow:

```text
Launch application
→ Log in
→ Search for a product
→ Open product details
→ Add the product to the cart
→ Verify the cart
```

Using the same scenario makes it possible to compare:

- Environment setup effort
- Test-authoring effort
- Script readability
- Execution time
- Stability and flake rate
- Diagnostic quality
- Maintenance effort after a UI change
- The value and risks of AI-assisted flow generation or repair

## 1.2 Why Appium and Maestro are paired

### Appium 2

Appium is the team's traditional automation tool. The test client sends WebDriver commands to an Appium server, and the server uses the **UiAutomator2** driver to control Android.

The team's Stage 3 Appium report used:

- Eclipse Temurin JDK 17
- Android Studio and Android SDK
- A locally installed Appium 2 package
- UiAutomator2 driver `8.0.1`
- WebdriverIO as the JavaScript client
- VS Code as the development environment

Installing Appium locally inside the repository makes the version reproducible for other team members and later CI execution.

### Maestro Studio

Maestro uses readable YAML flows rather than a JavaScript WebDriver client. The team's Stage 3 path used the native Windows **Maestro Studio** application, which provides an editor, a device view, step execution, and result display in one interface.

The tested Maestro environment recorded in the progress report was:

- Windows 11
- Pixel 8 Android Emulator
- Android 14, API level 34
- Google Play Intel x86_64 system image
- Maestro Studio for Windows
- YAML test flows

The team successfully ran a Contacts smoke test in Maestro Studio and recorded both steps as passing in approximately seven seconds.

## 1.3 Important terminology

| Term | Meaning in this guide |
|---|---|
| SUT | System Under Test — the React Native EShop |
| AVD | Android Virtual Device |
| ADB | Android Debug Bridge |
| Capability | Appium session setting such as platform, device, package, or activity |
| Locator | A strategy used to identify a UI element |
| Flow | A Maestro YAML test file |
| Assertion | A check that verifies an expected result |
| Test ID | A stable identifier exposed by the React Native UI |
| Failure mode | A situation in which the tool produces a wrong, incomplete, or misleading result |

## 1.4 Verified progress and remaining work

| Area | Current evidence | Status |
|---|---|---|
| Android SDK and Platform-Tools | Configuration screenshots exist | Partially verified across team machines |
| Maestro Studio installation | Studio workspace created | Verified |
| Maestro–emulator connection | `emulator-5554` shown in Studio | Verified |
| Maestro smoke test | Contacts flow shows PASS | Verified |
| Appium local package | Installed inside project | Verified |
| UiAutomator2 | Driver `8.0.1` listed as installed | Verified |
| Appium server | Local server screenshot exists | Verified |
| Appium Calculator script | Script prepared in report | Prepared; rerun and attach final evidence |
| EShop Appium test | Requires final APK/build and locators | TODO |
| EShop Maestro test | Login flow verified against `host.exp.exponent`; genuine navigation-bar bug found (see `bug-report/bug-report.md`) | Verified |
| AI-assisted Maestro feature | MaestroGPT flow generated, audited for incorrect `appId`/labels/syntax, corrected, and re-run (see `bug-report/bug-report.md`) | Verified |

## 1.5 EShop information

| Item | Project value |
|---|---|
| Repository | https://github.com/ttbhanh/eshop-sut |
| Framework | Expo |
| Test account | test@eshop.com / Test1234! |

---

# 2. Installation

## 2.1 Recommended repository structure

```text
T03-Mobile-Automation/
├── mobile-app/
├── appium-tests/
│   ├── tests/
│   ├── artifacts/
│   ├── package.json
│   └── package-lock.json
├── maestro/
│   ├── smoke/
│   ├── eshop/
│   └── common/
├── assets/
│   └── screenshots/
├── evidence/
│   ├── appium/
│   ├── maestro/
│   └── ui-change-experiment/
├── User_Guide.md
└── README.md
```

## 2.2 Install Java and Node.js

Install:

- Eclipse Temurin JDK 17
- A Node.js version compatible with the selected EShop
- Git

Verify:

```powershell
java -version
node --version
npm --version
git --version
```

The Appium team report used JDK 17 and configured `JAVA_HOME`.

## 2.3 Install Android Studio and SDK components

Install Android Studio using the standard setup wizard.

Open:

```text
Android Studio
→ More Actions
→ SDK Manager
```

Install or confirm:

- Android SDK Platform
- Android SDK Build-Tools
- Android SDK Platform-Tools
- Android SDK Command-line Tools (latest)
- Android Emulator

The team's Maestro environment used Android 14 / API 34. The final API level should match the selected EShop and the environment verified by the whole team.

![Open Android Studio More Actions](assets/screenshots/maestro-01-android-studio-more-actions.png)

*Figure 1. Opening Android Studio tools from the Welcome screen.*

## 2.4 Configure Android environment variables

Locate the Android SDK folder. A common Windows location is:

```text
C:\Users\<username>\AppData\Local\Android\Sdk
```

Create:

```text
ANDROID_HOME=C:\Users\<username>\AppData\Local\Android\Sdk
```

Add these entries to `Path`:

```text
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\cmdline-tools\latest\bin
```

The Appium progress report also recorded older `tools` paths. Prefer the directories that actually exist in the installed SDK.

![Windows Android environment variables](assets/screenshots/appium-01-windows-environment-variables.png)

*Figure 2. Example Android environment-variable configuration from the Appium setup report.*

Close all terminals, open a new PowerShell window, and verify:

```powershell
echo $env:ANDROID_HOME
adb version
```

### When `adb` is not recognized

Check whether the executable exists:

```powershell
$Sdk = "$env:LOCALAPPDATA\Android\Sdk"
Test-Path "$Sdk\platform-tools\adb.exe"
```

If the result is `True`, temporarily update the current terminal:

```powershell
$env:ANDROID_HOME = $Sdk
$env:Path += ";$Sdk\platform-tools;$Sdk\emulator;$Sdk\cmdline-tools\latest\bin"
adb version
```

Then configure the same paths permanently in Windows Environment Variables.

If the result is `False`, install **Android SDK Platform-Tools** from SDK Manager.

## 2.5 Create and start an Android emulator

Open:

```text
Android Studio
→ More Actions
→ Virtual Device Manager
```

If the device list is empty, select **Create virtual device**.

![Empty Device Manager](assets/screenshots/maestro-02-empty-device-manager.png)

*Figure 3. Device Manager before an AVD is created.*

The tested Maestro setup selected **Pixel 8**:

![Select Pixel 8](assets/screenshots/maestro-03-select-pixel-8.png)

*Figure 4. Pixel 8 hardware profile selected for the seminar environment.*

Select an Android 14 / API 34 Google Play x86_64 image when it is compatible with the host machine and the selected EShop:

![Select API 34 image](assets/screenshots/maestro-04-select-api-34-system-image.png)

*Figure 5. API 34 system image used in the Maestro progress report.*

The Appium report also recorded the system-image configuration screen:

![Appium AVD image selection](assets/screenshots/appium-04-avd-system-image-selection.png)

*Figure 6. AVD image-selection evidence from the Appium setup work.*

Start the emulator and verify:

```powershell
adb devices
```

Expected result:

```text
List of devices attached
emulator-5554    device
```

## 2.6 Install Appium locally

The team chose a local installation to avoid changing the global Node.js environment and to keep the project version reproducible.

Create the test project:

```powershell
mkdir appium-tests
cd appium-tests
npm init -y
npm install appium --save-dev
npm install webdriverio --save-dev
```

Install UiAutomator2:

```powershell
npx appium driver install uiautomator2
```

List installed drivers:

```powershell
npx appium driver list --installed
```

The progress report recorded:

```text
uiautomator2@8.0.1 [installed (npm)]
```

![UiAutomator2 installed](assets/screenshots/appium-02-uiautomator2-driver-installed.png)

*Figure 7. UiAutomator2 listed as an installed Appium driver.*

Add scripts to `appium-tests/package.json`:

```json
{
  "scripts": {
    "appium": "appium",
    "test:smoke": "node tests/test_calculator.js",
    "test:eshop": "node tests/eshop_login_search.js"
  }
}
```

Start the local server:

```powershell
npm run appium
```

or:

```powershell
npx appium
```

Default server address:

```text
http://127.0.0.1:4723
```

![Local Appium server](assets/screenshots/appium-03-local-server-running.png)

*Figure 8. Appium server started locally inside the project.*

## 2.7 Install Maestro Studio

The team used the Windows desktop application rather than requiring every member to begin with a CLI workflow.

Installation procedure recorded by the team:

1. Download `MaestroStudio.exe` from the Maestro documentation site.
2. Run the installer.
3. Start the Android emulator first.
4. Open Maestro Studio.
5. Select **New workspace**.
6. Choose the folder in which YAML flows will be stored.

![Create Maestro workspace](assets/screenshots/maestro-05-create-workspace.png)

*Figure 9. Maestro Studio Get Started dialog.*

With the emulator already running, Maestro Studio should detect `emulator-5554` and display the device view:

![Maestro connected to emulator](assets/screenshots/maestro-06-emulator-connected.png)

*Figure 10. Maestro Studio connected to the Android emulator.*

> The team's report states that this Studio workflow did not require WSL or a separate command-line workflow. If the team later adds Maestro CLI for CI, document and verify its prerequisites separately instead of assuming they are identical to Maestro Studio.

## 2.8 Clone and run the React Native EShop

```powershell
git clone TODO_REPOSITORY_URL
cd TODO_PROJECT_FOLDER
npm install
```

Use the correct command for the project.

### Expo development build

```powershell
npx expo run:android
```

### Bare React Native

```powershell
npx react-native run-android
```

### Existing APK

```powershell
adb install -r .\path\to\eshop.apk
```

Confirm that Login, Search, Product Details, and Cart are usable before automating them.

## 2.9 Determine the package and activity

Open the EShop on the emulator and run:

```powershell
adb shell dumpsys window | Select-String "mCurrentFocus"
```

Alternative:

```powershell
adb shell dumpsys activity activities |
  Select-String "mResumedActivity"
```

Record:

```text
APP_PACKAGE=TODO
APP_ACTIVITY=TODO
```

## 2.10 Expose stable identifiers in React Native

Prefer stable accessibility identifiers instead of coordinates or long XPath expressions.

```tsx
<TextInput
  testID="email-input"
  accessibilityLabel="email-input"
  placeholder="Email"
/>

<Pressable
  testID="login-button"
  accessibilityLabel="login-button"
  onPress={handleLogin}
>
  <Text>Login</Text>
</Pressable>
```

Create an element map:

| Screen | Element | Test identifier |
|---|---|---|
| Login | Email field | `TODO` |
| Login | Password field | `TODO` |
| Login | Login button | `TODO` |
| Home | Search field | `TODO` |
| Search | First result | `TODO` |
| Product | Add-to-cart button | `TODO` |
| Cart | Cart content | `TODO` |

Use Appium Inspector or Maestro Studio's screen-inspection feature to confirm the identifiers exposed by the built application.

---

# 3. First Test

## 3.1 Maestro Studio smoke test — verified team example

Before using the EShop, the Maestro setup was validated against the Android Contacts application.

Create `maestro/smoke/test1.yaml`:

```yaml
appId: com.google.android.contacts
---
- launchApp
- assertVisible: "Contacts"
```

Important YAML rules:

- `appId` declares the Android package.
- `---` separates configuration from commands.
- `launchApp` starts the application.
- `assertVisible` checks that the expected text appears.
- Top-level commands must be aligned correctly. Incorrect indentation can produce a parse error.

Run the flow by selecting **Run Test** in Maestro Studio.

![Maestro Contacts flow passed](assets/screenshots/maestro-07-contacts-flow-pass.png)

*Figure 11. The Contacts smoke test passed in Maestro Studio.*

## 3.2 Appium smoke-test template

Create `appium-tests/tests/test_calculator.js`:

```javascript
const { remote } = require("webdriverio");

const capabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Android Emulator",
  "appium:appPackage": "com.google.android.calculator",
  "appium:appActivity": "com.android.calculator2.Calculator"
};

const options = {
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  logLevel: "info",
  capabilities
};

async function runTest() {
  let driver;

  try {
    driver = await remote(options);
    console.log("PASS: Calculator application opened.");
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
```

Run Terminal 1:

```powershell
cd appium-tests
npm run appium
```

Run Terminal 2:

```powershell
cd appium-tests
npm run test:smoke
```

> The source progress report contained this test concept but also noted that emulator creation was still pending at that moment. The team must rerun it and insert final pass evidence before describing it as a completed result.

## 3.3 First EShop end-to-end scenario

The Stage S4 first test should remain within 15 steps:

1. Start the emulator.
2. Confirm the device with `adb devices`.
3. Install or launch the EShop.
4. Reset the application to the required precondition.
5. Open the Login screen.
6. Enter a valid email.
7. Enter a valid password.
8. Tap Login.
9. Verify the Home screen.
10. Open Search.
11. Enter a product keyword.
12. Verify at least one matching result.
13. Open the result.
14. Add it to the cart.
15. Verify the selected item in the cart.

## 3.4 Appium EShop template

Create `appium-tests/tests/eshop_login_search.js`:

```javascript
const assert = require("node:assert/strict");
const path = require("node:path");
const { remote } = require("webdriverio");

const config = {
  appPackage: process.env.APP_PACKAGE,
  appActivity: process.env.APP_ACTIVITY,
  email: process.env.TEST_EMAIL,
  password: process.env.TEST_PASSWORD,
  searchTerm: process.env.SEARCH_TERM || "backpack"
};

for (const [key, value] of Object.entries(config)) {
  if (!value) {
    throw new Error(`Missing required configuration: ${key}`);
  }
}

async function runTest() {
  const driver = await remote({
    hostname: "127.0.0.1",
    port: 4723,
    path: "/",
    logLevel: "info",
    capabilities: {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": "Android Emulator",
      "appium:appPackage": config.appPackage,
      "appium:appActivity": config.appActivity,
      "appium:noReset": false,
      "appium:newCommandTimeout": 120
    }
  });

  try {
    const email = await driver.$("~TODO_EMAIL_ID");
    await email.waitForDisplayed({ timeout: 15000 });
    await email.setValue(config.email);

    const password = await driver.$("~TODO_PASSWORD_ID");
    await password.setValue(config.password);

    await (await driver.$("~TODO_LOGIN_BUTTON_ID")).click();

    const home = await driver.$("~TODO_HOME_ID");
    await home.waitForDisplayed({ timeout: 15000 });
    assert.equal(await home.isDisplayed(), true);

    const search = await driver.$("~TODO_SEARCH_ID");
    await search.setValue(config.searchTerm);

    const result = await driver.$("~TODO_FIRST_RESULT_ID");
    await result.waitForDisplayed({ timeout: 15000 });
    await result.click();

    await (await driver.$("~TODO_ADD_TO_CART_ID")).click();
    await (await driver.$("~TODO_CART_ID")).click();

    const cartItem = await driver.$("~TODO_CART_ITEM_ID");
    await cartItem.waitForDisplayed({ timeout: 15000 });
    assert.equal(await cartItem.isDisplayed(), true);

    await driver.saveScreenshot(
      path.resolve(__dirname, "../artifacts/eshop-flow-pass.png")
    );

    console.log("PASS: EShop login, search, and cart flow.");
  } catch (error) {
    await driver.saveScreenshot(
      path.resolve(__dirname, "../artifacts/eshop-flow-fail.png")
    );
    throw error;
  } finally {
    await driver.deleteSession();
  }
}

runTest().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Create a local `.env` or set environment variables without committing real credentials.

## 3.5 Maestro Studio EShop template

Create `maestro/eshop/login-search-cart.yaml`:

```yaml
appId: TODO_APP_PACKAGE
name: EShop login, search, and cart
---
- launchApp:
    clearState: true

- tapOn:
    id: "TODO_EMAIL_ID"
- inputText: "TODO_TEST_EMAIL"

- tapOn:
    id: "TODO_PASSWORD_ID"
- inputText: "TODO_TEST_PASSWORD"
- hideKeyboard

- tapOn:
    id: "TODO_LOGIN_BUTTON_ID"

- assertVisible:
    id: "TODO_HOME_ID"

- tapOn:
    id: "TODO_SEARCH_ID"
- inputText: "backpack"
- hideKeyboard

- assertVisible:
    id: "TODO_FIRST_RESULT_ID"
- tapOn:
    id: "TODO_FIRST_RESULT_ID"

- tapOn:
    id: "TODO_ADD_TO_CART_ID"

- tapOn:
    id: "TODO_CART_ID"

- assertVisible:
    id: "TODO_CART_ITEM_ID"
```

Run the flow in Maestro Studio and capture:

- The YAML file
- The connected emulator
- The step list
- The pass/fail result
- Total execution time

## 3.6 Result table

| Metric | Appium | Maestro Studio |
|---|---:|---:|
| Setup time | `TODO` | `TODO` |
| Authoring time | `TODO` | `TODO` |
| Non-empty test lines | `TODO` | `TODO` |
| Median runtime over 5 runs | `TODO` | `TODO` |
| Unexpected failures / total runs | `TODO` | `TODO` |
| Main setup issue | `TODO` | `TODO` |
| Main maintenance issue | `TODO` | `TODO` |

---

# 4. Advanced Usage

## 4.1 Appium architecture

```text
JavaScript test
→ WebdriverIO client
→ Appium server
→ UiAutomator2 driver
→ Android emulator/device
→ React Native EShop
```

This separation gives Appium broad flexibility, but it also means that failures can originate in multiple layers.

## 4.2 Appium capabilities

Common Android capabilities:

| Capability | Purpose |
|---|---|
| `platformName` | Selects Android |
| `appium:automationName` | Selects UiAutomator2 |
| `appium:deviceName` | Human-readable device name |
| `appium:udid` | Targets a specific device serial |
| `appium:appPackage` | Identifies the installed Android application |
| `appium:appActivity` | Identifies the entry activity |
| `appium:noReset` | Controls whether state is retained |
| `appium:newCommandTimeout` | Controls session inactivity timeout |

Keep capabilities in one configuration file instead of duplicating them across tests.

## 4.3 Appium Inspector and locator strategy

The next Appium milestone in the team report was to inspect the final APK and identify element IDs or XPath expressions.

Preferred order:

1. Accessibility ID / stable test ID
2. Resource ID
3. Short, well-scoped Android UIAutomator selector
4. Text selector when the text is stable
5. XPath only when a more stable option is unavailable
6. Coordinates only for temporary diagnosis

A long XPath may break after a harmless UI layout change.

## 4.4 Page Object pattern

```javascript
class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  get emailInput() {
    return this.driver.$("~TODO_EMAIL_ID");
  }

  get passwordInput() {
    return this.driver.$("~TODO_PASSWORD_ID");
  }

  get loginButton() {
    return this.driver.$("~TODO_LOGIN_BUTTON_ID");
  }

  async login(email, password) {
    await (await this.emailInput).setValue(email);
    await (await this.passwordInput).setValue(password);
    await (await this.loginButton).click();
  }
}

module.exports = LoginPage;
```

Benefits:

- One locator change can repair many tests.
- Test cases remain focused on user behavior.
- Repeated workflows are easier to maintain.

## 4.5 Explicit waits instead of fixed pauses

Avoid:

```javascript
await driver.pause(5000);
```

Prefer:

```javascript
const home = await driver.$("~TODO_HOME_ID");
await home.waitForDisplayed({ timeout: 15000 });
```

The five-second pause in the initial Calculator example is acceptable for visual observation during a smoke test, but it should not become the main synchronization strategy for the EShop suite.

## 4.6 Maestro Studio workflow

The team-observed operational workflow is:

1. Start the Pixel 8 emulator.
2. Wait until the Android Home screen is fully loaded.
3. Open Maestro Studio.
4. Confirm that the emulator has a green connected indicator.
5. Open or create a YAML flow.
6. Run the flow.
7. Inspect each step's pass/fail status and execution time.

Unlike the Appium workflow, Maestro Studio does not require the team to start a separate Appium server or create a WebDriver client.

## 4.7 Inspect Screen

Maestro Studio's **Inspect Screen** feature can help the tester select a visible element and generate or refine a command.

Use it to:

- Inspect text and identifiers
- Reduce coordinate-based actions
- Confirm which element a command will target
- Build the first draft of a flow

A generated selector must still be reviewed for uniqueness and stability.

## 4.8 MaestroGPT / AI-assisted flow creation

The source report identifies **MaestroGPT** as an AI-assisted capability for describing a scenario in natural language and generating a YAML flow.

Recommended audit workflow:

1. Save the natural-language request.
2. Save the generated YAML unchanged.
3. Mark all generated selectors and assertions.
4. Compare them with the actual EShop screen hierarchy.
5. Run the generated flow.
6. Check whether the business result is asserted.
7. Record rejected or corrected commands.
8. Store the final student-edited flow separately.

Do not label the entire Maestro CLI or every YAML command as AI. The AI contribution is the specific generated or repaired artifact.

## 4.9 Reusable Maestro flows

Example reusable login flow:

```yaml
appId: ${APP_ID}
---
- tapOn:
    id: "TODO_EMAIL_ID"
- inputText: ${TEST_EMAIL}

- tapOn:
    id: "TODO_PASSWORD_ID"
- inputText: ${TEST_PASSWORD}
- hideKeyboard

- tapOn:
    id: "TODO_LOGIN_BUTTON_ID"

- assertVisible:
    id: "TODO_HOME_ID"
```

Reuse it from another flow:

```yaml
appId: TODO_APP_PACKAGE
---
- launchApp:
    clearState: true

- runFlow:
    file: ../common/login.yaml
    env:
      APP_ID: "TODO_APP_PACKAGE"
      TEST_EMAIL: "TODO_TEST_EMAIL"
      TEST_PASSWORD: "TODO_TEST_PASSWORD"
```

Confirm the exact syntax in the installed Maestro version before submission.

## 4.10 Controlled UI-change experiment

Perform each change in a separate Git commit.

### Change A — visible text

```text
"Add to Cart" → "Add item"
```

Check whether text-based Appium or Maestro selectors fail.

### Change B — identifier

```text
add-to-cart-button → product-add-button
```

Measure:

- Number of files affected
- Error-message quality
- Repair time
- Whether the test still verifies the same intent

### Change C — delayed search response

Add a controlled delay before product results appear.

Compare:

- Appium explicit waits
- Maestro retry/wait behavior
- False-failure rate

### Change D — AI-generated repair

Use MaestroGPT or an approved AI repair feature on one intentionally broken flow.

Record:

- Original failing flow
- AI output
- Student review
- Final corrected flow
- Whether the repair preserved the requirement

## 4.11 Metrics

Run the same build on the same emulator when possible.

```text
Flake rate =
unexpected failures / repeated executions × 100%
```

Collect:

- Setup time
- Authoring time
- Runtime over at least five runs
- Lines of code
- Flake rate
- Repair time after each change
- Number of changed files
- Number of assertions
- AI suggestions accepted, edited, and rejected

---

# 5. Failure Modes

Replace the examples below with evidence from real team experiments before submission.

## 5.1 Unstable locator causes a false failure

**Trigger:** Text, hierarchy, or identifier changes.

**Symptom:** Element-not-found error although the business function still works.

**Detection:**

- Inspect the current hierarchy.
- Compare selector matches.
- Review the screenshot at failure time.

**Mitigation:**

- Add stable React Native test IDs.
- Prefer accessibility or resource IDs.
- Avoid long XPath expressions and coordinates.

## 5.2 Weak assertion causes a false pass

**Trigger:** The test verifies only that a screen opened.

**Example:** Add-to-cart is tapped, but the test never checks the selected product, quantity, or subtotal.

**Mitigation:**

- Assert business state after every state-changing action.
- Include negative controls.
- Deliberately inject a defect and verify that the test detects it.

## 5.3 Application state leaks between tests

**Trigger:**

- Existing login session
- Cart items from a prior run
- Cached product data
- Incorrect `noReset` or `clearState` use

**Mitigation:**

- Define test preconditions.
- Use dedicated accounts.
- Reset only the state that should be isolated.
- Add cleanup flows.

## 5.4 Timing and network variability cause flaky results

**Trigger:** Slow emulator, API delay, animation, or network failure.

**Mitigation:**

- Use explicit conditions.
- Capture timestamps and logs.
- Avoid fixed sleeps as the default strategy.
- Separate application defects from test-environment failures.

## 5.5 AI-generated flow changes the test intent

**Trigger:** MaestroGPT or another AI feature generates or repairs a step.

**Risk examples:**

- It selects a different product with similar text.
- It removes an assertion.
- It replaces an identifier with a coordinate.
- It skips an important step.

**Mitigation:**

- Require human review.
- Keep generated and edited versions.
- Run a negative-control test.
- Link each assertion to the original requirement.

## 5.6 Tool reports success without meaningful validation

A smoke test that only launches an application proves that the environment can create a session. It does not prove that Login, Search, or Cart works.

The final seminar demo must include functional assertions on EShop behavior rather than only successful tool startup.

---

# 6. Troubleshooting

## 6.1 `adb` is not recognized

Error example:

```text
adb : The term 'adb' is not recognized as the name of a cmdlet...
```

Fix:

1. Install Android SDK Platform-Tools.
2. Set `ANDROID_HOME`.
3. Add `%ANDROID_HOME%\platform-tools` to `Path`.
4. Close and reopen the terminal.
5. Run:

```powershell
adb version
adb devices
```

## 6.2 Maestro Studio shows `No device connected`

The team observed that this commonly happened when Studio was opened before the emulator had fully started.

Fix:

1. Close Maestro Studio.
2. Wait until the emulator reaches the Android Home screen.
3. Run:

```powershell
adb devices
```

4. Reopen Maestro Studio.

If it still fails:

```powershell
adb kill-server
adb start-server
adb devices
```

If necessary, stop stale `adb.exe` processes in Task Manager first.

## 6.3 Maestro YAML parse error

Check:

- `---` is present after the flow configuration.
- List commands begin with `-`.
- Top-level lines use consistent indentation.
- Tabs were not mixed with spaces.
- Quotes are balanced.

Minimal valid example:

```yaml
appId: com.google.android.contacts
---
- launchApp
- assertVisible: "Contacts"
```

## 6.4 Appium installation fails with `ECONNRESET`

This was recorded during the local Appium setup and normally indicates interrupted package download.

Try:

```powershell
npm cache verify
npm install appium --save-dev
```

If necessary, use a stable network and retry. Do not claim the environment is complete until `npx appium --version` and the driver-list command succeed.

## 6.5 Appium installation fails with `EBUSY`

This may happen when a file or directory is locked.

Actions:

1. Stop Appium and Node.js processes.
2. Close terminals or editors using the directory.
3. Remove the incomplete dependency installation if safe:

```powershell
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force .\package-lock.json
npm cache verify
npm install
```

4. Retry the driver installation.

Preserve `package-lock.json` in the final working repository. Delete it only while repairing an incomplete local installation and regenerate it afterward.

## 6.6 UiAutomator2 is not installed

```powershell
npx appium driver list --installed
```

If missing:

```powershell
npx appium driver install uiautomator2
```

## 6.7 Appium cannot create a session

Check:

- The Appium server is running.
- Port `4723` is correct.
- `adb devices` lists a device.
- Package and activity values are correct.
- UiAutomator2 is installed.
- Capability names use the `appium:` prefix.

Find the foreground activity again:

```powershell
adb shell dumpsys activity activities |
  Select-String "mResumedActivity"
```

## 6.8 Appium cannot find an element

Check:

- The app is on the expected screen.
- The locator is not a placeholder.
- The element is visible and enabled.
- The identifier was exposed in the built React Native app.
- A loading overlay is not blocking input.

Use Appium Inspector and compare the actual hierarchy instead of only increasing the timeout.

## 6.9 Emulator is offline

```powershell
adb kill-server
adb start-server
adb devices
```

If still offline:

- Cold boot the AVD.
- Restart Android Studio.
- Verify virtualization support.
- Wipe AVD data only after confirming that no required test state will be lost.

## 6.10 Port 4723 is already in use

```powershell
netstat -ano | Select-String ":4723"
```

Stop the previous process or use another port:

```powershell
npx appium --port 4725
```

Update the WebdriverIO connection to the same port.

## 6.11 The EShop runs in Expo Go but is difficult to identify

Build a dedicated Android development build:

```powershell
npx expo run:android
```

Then identify the package and activity of that build rather than automating the Expo Go host package.

---

# 7. References

## 7.1 Team source material

1. `Appium Guide.docx.md` — Team member Stage 3 Appium environment report, 03 July 2026.
2. `Maestro_Guide.docx.md` — Team member Stage 3 Maestro Studio environment report, 03 July 2026.
3. `Tool_survey_proposal.md` — Team 10 T03 tool survey and selected pairing.
4. `T03_Mobile_Automation_Testing.docx.md` — Topic brief.
5. `Seminar_Workflow_Briefing.pptx.pdf` — Stage S4 structure and grading requirements.

## 7.2 Official technical references to verify before submission

- Appium documentation: https://appium.io/docs/
- Appium UiAutomator2 driver documentation: https://github.com/appium/appium-uiautomator2-driver
- WebdriverIO documentation: https://webdriver.io/
- Maestro documentation: https://docs.maestro.dev/
- Android Studio documentation: https://developer.android.com/studio
- Android Platform-Tools: https://developer.android.com/tools/releases/platform-tools
- React Native environment setup: https://reactnative.dev/docs/set-up-your-environment

Add the official repository and setup documentation of the selected EShop:

```text
TODO: EShop repository
TODO: EShop setup guide
```

> AI use must be documented in the AI Audit and Disclosure. AI output is not an original technical source.

---

# Appendix A — Minimum test set

| ID | Scenario | Expected result | Appium | Maestro |
|---|---|---|---|---|
| TC-01 | Launch EShop | Initial screen appears | TODO | TODO |
| TC-02 | Valid login | Home screen appears | TODO | TODO |
| TC-03 | Invalid login | Error shown; user remains logged out | TODO | TODO |
| TC-04 | Search product | Matching result appears | TODO | TODO |
| TC-05 | Open product | Correct details appear | TODO | TODO |
| TC-06 | Add to cart | Correct item appears in cart | TODO | TODO |
| TC-07 | Update quantity | Quantity and subtotal change | TODO | TODO |
| TC-08 | Remove product | Product disappears | TODO | TODO |
| TC-09 | Logout | Login screen appears | TODO | TODO |

# Appendix B — Evidence checklist

## Environment evidence

- [ ] JDK and Node.js versions
- [ ] Android SDK and Platform-Tools
- [ ] `adb devices`
- [ ] AVD configuration
- [ ] Appium local version
- [ ] UiAutomator2 installed
- [ ] Appium server running
- [ ] Maestro Studio installed
- [ ] Maestro connected to emulator

## Functional evidence

- [ ] Maestro Contacts smoke-test pass
- [ ] Appium Calculator smoke-test pass
- [ ] Appium EShop flow pass
- [ ] Maestro EShop flow pass
- [ ] Failure screenshot and log for each reproduced failure mode
- [ ] Five-run runtime table
- [ ] Flake-rate calculation
- [ ] UI-change repair-time evidence
- [ ] AI-generated flow and student-edited flow

## Final review

- [ ] Every `TODO` is replaced or explicitly marked out of scope
- [ ] All test IDs match the final build
- [ ] No passwords, tokens, or student private data appear
- [ ] Every screenshot has a caption
- [ ] Every pass/fail statement has evidence
- [ ] Another team member followed the First Test section unaided
- [ ] AI-generated material was reviewed and disclosed
