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

## BUG-04 — Mobile app calls every backend endpoint without the `/api` prefix

| Field | Description |
|---|---|
| Reporter | Appium automation session, 23 Jul 2026 |
| Component | Mobile application / networking (all screens) |
| Severity | Critical |
| Priority | High |
| Status | Patched locally for the Appium demo (see below); needs an official fix in the upstream SUT |
| Environment | Android mobile application (`com.eshop.mobile`), dev build via `expo run:android` |

**Summary.** Every network call in the mobile app is missing the `/api` prefix
that the backend actually serves under, so no screen can reach the API: the
product list stays empty, login fails, and so on — with no visible error,
because the failure path silently falls through to an empty state.

**Root cause.** `src/eshop-sut/frontend-mobile/App.js` defined:

```js
const API_URL = "http://10.0.2.2:3000";
```

and every call is built as `` `${API_URL}/products` ``, `` `${API_URL}/login` ``,
etc. (13 call sites). The backend (`src/eshop-sut/backend/server.js`) registers
every route under `/api/...` (`app.get("/api/products", ...)`,
`app.post("/api/login", ...)`, and so on) — confirmed by contrast with
`frontend-web`, whose equivalent calls correctly use
`http://localhost:3000/api/products` etc. So every mobile request hits a route
that does not exist and gets Express's default 404 HTML page back.

**Why it fails silently.** `fetchProducts` in `App.js` only shows an error box
when the 404 body contains the literal string `<h1>`; Express's default 404
page uses `<pre>`, not `<h1>`, so the check never triggers. `JSON.parse` throws,
the code falls through to `setProducts(Array.isArray(data) ? data : [])`, and
`data` (a string) becomes `[]` — a fully empty, error-free product list.

**Steps to reproduce.**
1. Start backend + Metro + emulator, install the mobile dev build.
2. Open the app to the Home screen.
3. Observe the product list stays empty (no loading spinner, no error message)
   even though `GET http://localhost:3000/api/products` returns 5 seeded
   products directly.

**Expected.** The Home screen lists the 5 seeded products; login, search, and
cart all work against the backend.
**Actual.** No mobile screen that depends on the backend functions at all.

**Evidence.** `evidence/appium/eshop-home-screen-final6.png` (empty product
list on the unpatched build, backend confirmed reachable and returning data).

**Local workaround (for the Appium demonstration only).** `API_URL` changed to
`"http://10.0.2.2:3000/api"` in the local working copy so the required
login → search → cart Appium flow (User Guide §3.3/§3.4) can be demonstrated
end to end. **This is a demo patch, not an accepted fix** — the upstream EShop
SUT repository still has the bug and should be corrected there (either fix
`API_URL` or, more robustly, extract every literal endpoint path into one
constant to prevent this class of drift).

**Suggested fix.** Append `/api` to `API_URL`, or centralize all 13 fetch call
sites behind a small API client module so the base path can't drift out of
sync with the backend again.

---

## BUG-05 — Header nav (Login / Cart) is untappable on Android: renders under the status bar

| Field | Description |
|---|---|
| Reporter | Appium automation session, 23 Jul 2026 |
| Component | Mobile application / navigation header (all screens) |
| Severity | Critical |
| Priority | High |
| Status | Patched locally for the Appium demo (see below); needs an official fix in the upstream SUT |
| Environment | Android mobile application, Pixel 8 AVD, Android 14 / API 34, `com.eshop.mobile` |

**Summary.** The top navigation bar — brand link, "Đăng nhập" (or the greeting
once signed in), and the cart link — is not tappable on Android. It renders
underneath the transparent system status bar, and that region does not
deliver touches to the app on this device/OS combination. This affects real
finger taps, not just automated ones: a raw `adb shell input tap` at the
button's own reported coordinates (confirmed via `uiautomator dump`,
`bounds="[720,47][896,98]"` for "Đăng nhập") produces no reaction, while the
identical tap technique on the search box a few rows down works immediately.

**Root cause.** `App.js` wraps every screen in React Native's **core**
`SafeAreaView` (`import { SafeAreaView } from "react-native"`), not
`react-native-safe-area-context`'s version. RN's built-in `SafeAreaView` only
applies safe-area insets on iOS — on Android it behaves as a plain `View` and
contributes no top padding. Combined with `app.json`'s
`android.edgeToEdgeEnabled: true` (which makes the app draw its content behind
the system bars), the header ends up drawn at `y=0`, directly under the
status bar, with no compensating inset. On this Android build, the status bar
band still claims touch input in that area (as it does for the notification
pull-down gesture) even though the app's own (untouchable) content is visible
through it.

**Steps to reproduce.**
1. Launch the EShop mobile app dev build (`expo run:android`) on an Android
   14 emulator with edge-to-edge enabled.
2. From the Home screen, tap **"Đăng nhập"** in the top-right of the header.
3. Tap **"Giỏ (N)"** next to it.

**Expected.** Either tap navigates to the Login screen / Cart screen
respectively.
**Actual.** Neither tap has any effect. No screen change, no visual feedback.
Confirmed with three independent input methods: Appium's W3C Actions pointer
tap, Appium's `mobile: clickGesture`, and a raw `adb shell input tap` at the
exact coordinates `uiautomator dump` reports for the element.

**Evidence.** `evidence/appium/debug-tap-cart.png` and
`debug-tap-offset.png` (before/after taps at the reported button coordinates
— no change), contrasted with `debug-tap-control.png` (identical tap
technique on the search box, which works immediately).

**Local workaround (for the Appium demonstration only).** Added
`paddingTop: 14 + (RNStatusBar.currentHeight || 0)` to `styles.navBar` so the
header is pushed below the actual status bar height on Android. **This is a
demo patch, not an accepted fix** — the correct fix belongs in the upstream
EShop SUT.

**Suggested fix.** Replace the `react-native` core `SafeAreaView` import with
`react-native-safe-area-context`'s `SafeAreaView` (or a `useSafeAreaInsets()`
hook applied to the header), which correctly reports Android status-bar
insets under edge-to-edge. This is the standard, device-independent fix
(unlike the local `StatusBar.currentHeight` patch above, which is Android-only
and doesn't generalize to notches/cutouts on all devices).
