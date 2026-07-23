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
