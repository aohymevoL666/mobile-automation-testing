# appium-tests — EShop mobile (Appium + WebdriverIO)

Author: Huỳnh Lê Khương Duy (23127176)

Native Android UI tests for the EShop mobile app driven through Appium's
UiAutomator2 driver. Layout follows the User Guide §2.1.

```
WebdriverIO  ->  Appium server :4723  ->  UiAutomator2  ->  com.eshop.mobile
```

## Layout

| Path | What |
|---|---|
| `wdio.native.conf.js` | Base capabilities (Android, UiAutomator2, `com.eshop.mobile`) |
| `wdio.login.conf.js` | Login flow — passing |
| `wdio.bugs.conf.js` | Account-lockout bug — **intentionally failing** (see FM-04) |
| `wdio.ai.conf.js` | AI-generated test (`round1_raw` fails → `round2_fixed` passes) |
| `tests/native/login.e2e.js` | Hand-written login flow |
| `tests/native/bugs.e2e.js` | Premature account-lockout bug |
| `tests/native/demo.e2e.js` | Registration flow (extra) |
| `tests/native/helpers.js` | UiAutomator2 selector helpers + clean relaunch |
| `tests/ai/round1_raw.e2e.js` | Raw LLM output (wrong selectors) |
| `tests/ai/round2_fixed.e2e.js` | Human-corrected version |

## Run

```bash
npm install
adb reverse tcp:3000 tcp:3000   # backend
adb reverse tcp:8081 tcp:8081   # metro
npx appium --port 4723          # separate terminal

npx wdio run ./wdio.login.conf.js   # login    -> passing
npx wdio run ./wdio.bugs.conf.js    # bug      -> 1 failing (FM-04)
npx wdio run ./wdio.ai.conf.js      # AI test  -> round1_raw (red) / round2_fixed (green)
```

Prerequisites: Android SDK + AVD, the native debug build installed
(`mobile-app` / `frontend-mobile`: `npx expo run:android`), the `uiautomator2`
Appium driver, and the backend + Metro running. See User Guide §2.

`wdio.bugs.conf.js` is meant to fail — it asserts the correct behaviour while the
app locks an account after 2 wrong attempts instead of 3. See
`failure-modes/failure-modes.md` (FM-04).
