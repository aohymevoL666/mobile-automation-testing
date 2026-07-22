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
