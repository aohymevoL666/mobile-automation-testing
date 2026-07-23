# Bug Report

## BUG-01 — Account locked after 2 failed logins instead of 3

| Field | Description |
|---|---|
| Reporter | Huỳnh Lê Khương Duy (23127176) |
| Component | Authentication / login (mobile + backend) |
| Related failure mode | FM-04 |
| Severity | High |
| Tool | Appium + WebdriverIO (UiAutomator2) |

**Summary.** A user is locked out after only two wrong passwords instead of the
intended three, and is then refused even with the correct password.

**Root cause.** In `src/eshop-sut/backend/server.js` the failed-attempt counter
is incremented by two per failure and the lock triggers at `>= 3`:

```js
const newAttempts = user.login_attempts + 2;   // should be + 1
if (newAttempts >= 3) { /* lock for 3 minutes */ }
```

The step overshoots the threshold: `0 → 2 → 4`, crossing 3 on the **second**
failure. The intended `+ 1` would give `1 → 2 → 3` (three attempts). The
increment-then-check order is correct; only the step size is wrong.

**Steps to reproduce.**
1. Register/use an account.
2. Sign in with a wrong password (attempt 1) → "Invalid".
3. Sign in with a wrong password again (attempt 2) → "Invalid" (now locked).
4. Sign in with the CORRECT password (attempt 3).

**Expected.** Step 4 logs in (policy allows three attempts).
**Actual.** Step 4 is refused — backend returns "Tài khoản đã bị khóa…"; the app
shows only a generic failure message, hiding the lockout reason.

**Evidence.** Reproduced end-to-end by the Appium test
`appium-tests/tests/native/bugs.e2e.js`, which asserts a valid login succeeds
and therefore fails (red) on this defect. A clean first-attempt login passes,
confirming the failure is the bug and not the test.

**Suggested fix.** Increment by `1` (`user.login_attempts + 1`); optionally
surface the specific "account locked" message to the user.

---

## BUG-02 — Duplicate cart rows when adding the same product twice

| Field | Description |
|---|---|
| Reporter | Huỳnh Lê Khương Duy (23127176) |
| Component | Mobile application / shopping cart |
| Severity | Medium |
| Priority | High |
| Status | Fixed; regression test added |
| Tool | Appium + WebdriverIO (UiAutomator2) |
| Environment | Android mobile application |

**Summary.** Adding the same product to the cart twice creates two separate
cart rows. The cart should contain one row for that product with its quantity
increased to `2`.

**Preconditions.**

- The mobile application, backend, Appium server, and Android emulator are
  running.
- At least one product is available on the home screen.
- The cart is initially empty.

**Steps to reproduce.**

1. Open the EShop mobile application.
2. Locate any product on the home screen.
3. Tap **Add to cart** for that product.
4. Dismiss the success alert.
5. Tap **Add to cart** for the same product again.
6. Dismiss the success alert and open the cart.

**Expected result.**

- The cart displays one row for the selected product.
- The product quantity is `2`.
- The cart subtotal is the product price multiplied by `2`.

**Actual result.**

- The cart displays two separate rows for the same product.
- Each row has a quantity of `1`.
- The cart item counter incorrectly represents rows instead of distinct
  products.

**Impact.** Duplicate rows make the cart difficult to understand and manage.
They can also cause incorrect item counts and inconsistent checkout payloads,
particularly when a customer edits or removes only one of the duplicate rows.

**Root cause.** The add-to-cart operation appended a new cart item without
reliably updating the existing entry for the same product. State updates based
on a captured `cart` value could also use stale data when add actions occurred
close together.

**Resolution.** Update the cart through React's functional state setter. Find
an existing item by product ID and increase its quantity; append a new row only
when that product ID is not already present.

**Evidence and regression coverage.** The Appium regression test
`appium-tests/tests/native/cart.e2e.js` adds the same product twice and verifies
that exactly one cart row exists with quantity `2`. Run it with:

```powershell
cd appium-tests
npm run test:cart
```

---

## BUG-03 — Sign-up form is missing a confirm-password field

| Field | Description |
|---|---|
| Reporter | Huỳnh Lê Khương Duy (23127176) |
| Component | Mobile application / user registration |
| Severity | Medium |
| Priority | Medium |
| Status | Open |
| Environment | Android mobile application |

**Summary.** The sign-up interface provides only one password field. It does
not ask the user to re-enter the password before creating an account.

**Preconditions.**

- The EShop mobile application is running.
- The user is not signed in.

**Steps to reproduce.**

1. Open the EShop mobile application.
2. Tap **Sign in**.
3. Select the link to create a new account.
4. Review all fields displayed on the sign-up form.

**Expected result.**

- The form displays both **Password** and **Confirm password** fields.
- Both fields mask the entered text.
- Registration is allowed only when both password values match.
- If the values differ, the form remains open and displays a clear validation
  message such as “Passwords do not match.”

**Actual result.**

- The form displays only one **Password** field.
- The user cannot verify the password before submitting the form.
- An account can be created with an accidentally mistyped password, provided
  that the password otherwise passes strength validation.

**Impact.** A typing mistake may create an account with a password the user
does not know. The user may then be unable to sign in and must use the password
reset process, increasing frustration and support effort.

**Technical observation.** The registration screen in
`src/eshop-sut/frontend-mobile/App.js` stores only `registerPassword` and sends
it directly to the registration API. There is no confirm-password state,
input, or equality validation in `handleRegister`.

**Suggested fix.**

1. Add a masked **Confirm password** input to the sign-up form.
2. Store its value separately, for example in `registerConfirmPassword`.
3. Before calling the registration API, verify that both values are identical.
4. Display an inline error and prevent submission when they do not match.

**Acceptance criteria.**

- The sign-up form contains two masked password inputs.
- Matching valid passwords allow registration to proceed.
- Non-matching passwords prevent the API request and show a validation error.
- Empty confirmation is treated as invalid.
- Automated UI tests cover matching, non-matching, and empty confirmation
  values.

---

## BUG-04 — Top navigation links are untappable on Pixel 8

| Field | Description |
|---|---|
| Reporter | Phạm Vũ Ngọc Duy (23127183) |
| Component | Mobile application / Android header navigation |
| Severity | High |
| Priority | High |
| Status | Open |
| Tool | Maestro Studio, ADB, and manual testing |
| Environment | Expo Go on a Pixel 8 Android emulator |
| Device dependency | Reproduced on Pixel 8; not reproduced on Nexus 5X |

**Summary.** The **Login** and **Cart** links in the application's top
navigation bar cannot be tapped on a Pixel 8 emulator. The same area also
contains the **Profile** link after login, so all header-navigation flows are
affected.

**Preconditions.**

- Run the mobile application through Expo Go on a Pixel 8 emulator.
- Android edge-to-edge rendering is enabled.
- Open the EShop product-list screen.

**Steps to reproduce.**

1. Launch Expo Go on a Pixel 8 emulator.
2. Open the `frontend-mobile` project.
3. Wait for the product-list screen to appear.
4. Tap the **Login** link in the top navigation bar.
5. Tap the **Cart** link in the same navigation bar.

**Expected result.**

- Tapping **Login** opens the login screen.
- Tapping **Cart** opens the shopping-cart screen.
- All header controls render below the Android system status bar and remain
  reachable on devices with display cutouts.

**Actual result.**

- Tapping **Login** or **Cart** produces no response.
- The links render inside the system status-bar region and do not receive touch
  events.
- The user cannot reach the Login, Cart, or Profile screens because the
  application provides no alternative navigation path.

**Evidence.**

- The issue occurs with both Maestro actions and direct manual taps.
- An independent `adb input tap` at the exact link coordinates also produces
  no response.
- A control tap on **Add to cart** elsewhere on the screen works and opens the
  success dialog.
- `adb shell dumpsys window displays` reports a status-bar region of
  approximately `y = 0–132 px` on the Pixel 8 profile.
- The defect is not reproduced on a Nexus 5X profile with a shorter status-bar
  region, confirming that it depends on the device layout.

**Root cause.** `src/eshop-sut/frontend-mobile/App.js` imports `SafeAreaView`
from the core `react-native` package. This component does not apply Android
safe-area insets. In combination with `"edgeToEdgeEnabled": true` in
`src/eshop-sut/frontend-mobile/app.json`, the navigation bar is drawn beneath
the Android status bar and Pixel 8 camera-cutout area.

**Impact.** This is a blocking navigation defect on affected devices. Users
cannot sign in, view the cart, access their profile, or complete flows that
depend on those screens.

**Workaround.** Use an emulator or device without the affected camera-cutout
layout, such as the Nexus 5X profile. This is suitable only as a testing
workaround and does not resolve the production defect.

**Suggested fix.**

1. Install and configure `react-native-safe-area-context`.
2. Wrap the application in `SafeAreaProvider`.
3. Apply Android safe-area insets to the header or use the library's
   `SafeAreaView`.
4. Verify the header on devices with camera cutouts and with edge-to-edge
   rendering enabled.

**Acceptance criteria.**

- Login, Cart, and Profile links are visible below the system status bar.
- Each link responds to both manual and automated taps on Pixel 8.
- Header navigation remains functional on devices with and without display
  cutouts.
- Maestro tests can open Login and Cart without coordinate-based workarounds.

**Source.** Adapted from the Maestro investigation in
`C:\Users\aohymevol\Documents\class-material\SoftwareTesting\t03-automation-mobile\bug-report-maestro.md`.
