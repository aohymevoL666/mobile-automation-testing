# EShop mobile — Appium SRS bug report

## BUG-SRS-01 — registration has no confirm-password field

| Field | Value |
|---|---|
| Requirement | FR-01, FR-22 |
| Severity | Medium |
| Status | Open |
| Test | `TC01-registration-confirm-password.e2e.js` |

**Steps:** Open the app, tap **Đăng nhập**, tap **Đăng ký ngay**, and inspect
the registration fields.

**Expected:** Separate masked **Mật khẩu** and **Xác nhận mật khẩu** fields are
shown, and mismatched values block submission.

**Actual:** Only one masked password field is shown. The user can submit
without confirming it.

**Cause:** `App.js` defines only `registerPassword`; there is no confirmation
state, input, or equality validation in `handleRegister`.

## BUG-SRS-02 — account locks after two failures instead of three

| Field | Value |
|---|---|
| Requirement | FR-02 |
| Severity | High |
| Status | Open |
| Test | `TC02-login-lockout-threshold.e2e.js` |

**Steps:** For a fresh account, enter a wrong password twice, relaunch the app,
then enter the correct password.

**Expected:** The correct password succeeds because only two consecutive
failures have occurred.

**Actual:** The backend rejects the correct password because the account is
already locked.

**Cause:** `server.js` calculates `user.login_attempts + 2`, so the counter
moves `0 → 2 → 4` and reaches the `>= 3` threshold on the second failure. It
also locks for 180 seconds although FR-02 specifies 30 seconds.

## BUG-SRS-03 — editing quantity adds one to the entered value

| Field | Value |
|---|---|
| Requirement | FR-07 |
| Severity | High |
| Status | Open |
| Test | `TC04-cart-quantity-edit.e2e.js` |

**Steps:** Add one product, open the cart, and type `2` after the initial
quantity `1`.

**Expected:** The field and cart calculations use the entered quantity `12`.

**Actual:** The field changes to `13`; totals are consequently calculated for
thirteen units.

**Cause:** The cart input handler assigns `parsed + 1` instead of `parsed`.

## BUG-SRS-04 — cart item is deleted without confirmation

| Field | Value |
|---|---|
| Requirement | FR-07 |
| Severity | Medium |
| Status | Open |
| Test | `TC05-cart-delete-confirmation.e2e.js` |

**Steps:** Add a product, open the cart, and tap **Xóa**.

**Expected:** A confirmation dialog appears. The row remains until the user
explicitly confirms deletion.

**Actual:** The row is removed immediately and cannot be restored from the cart
screen.

**Cause:** The **Xóa** control calls `removeFromCart(index)` directly without
an `Alert` confirmation step.
