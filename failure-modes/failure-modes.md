## Failure Mode 1 – Valid Passwords Rejected During Password Reset

| Field | Description |
|---|---|
| Failure Mode ID | FM-01 |
| Failure Mode | Password reset rejects valid passwords. |
| Related Requirement | FR19 |
| Description | During the password reset process, passwords that satisfy the documented password policy are rejected as being too weak. This behavior was reproduced using multiple valid passwords such as P@ssw0rd and P@ssw0rd!. |
| Steps to Reproduce | 1. Click "Quên Mật Khẩu".<br>2. Enter test@eshop.com.<br>3. Enter the OTP.<br>4. Enter a valid password (e.g., P@ssw0rd or P@ssw0rd!).<br>5. Click "Đổi lại mật khẩu". |
| Expected Result | Password is accepted and successfully reset. |
| Observed Failure | The system displays "Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT." |
| Impact | Users cannot reset their passwords even when they provide passwords that meet the documented requirements. |
| Environment | Web application |

## Failure Mode 2 – Password Reset Fails on Mobile Application

| Field | Description |
|---|---|
| Failure Mode ID | FM-02 |
| Failure Mode | Password reset cannot be completed on the mobile application. |
| Related Requirement | FR2 |
| Description | The mobile application fails during the password reset process and returns a JSON parsing error instead of proceeding normally. |
| Steps to Reproduce | 1. Click "Quên Mật Khẩu".<br>2. Enter test@eshop.com. |
| Expected Result | The password reset process proceeds normally. |
| Observed Failure | The application displays "JSON Parse Error: Unexpected character in number: -". |
| Impact | Mobile users are unable to use the password reset feature. |
| Environment | Mobile application |

## Failure Mode 3 – Administrator Can Delete Own Account

| Field | Description |
|---|---|
| Failure Mode ID | FM-03 |
| Failure Mode | Administrator account can delete itself. |
| Related Requirement | FR11 |
| Description | The system allows an administrator to delete their own account even though this action should be prohibited. |
| Steps to Reproduce | 1. Log in using an administrator account (admin@eshop.com / Admin123!).<br>2. Navigate to "Người Dùng".<br>3. Click "Xóa" on the currently logged-in administrator account. |
| Expected Result | The system prevents administrators from deleting their own account. |
| Observed Failure | The administrator account is deleted successfully. |
| Impact | The application may lose administrative access or allow accidental removal of privileged accounts. |
| Environment | Web application |

## Failure Mode 4 – Account Locked After Two Failed Logins Instead of Three

| Field | Description |
|---|---|
| Failure Mode ID | FM-04 |
| Failure Mode | The account lockout triggers one attempt too early. |
| Related Requirement | Login / account lockout policy (three failed attempts) |
| Description | The backend increments the failed-login counter by two on each failed attempt (`login_attempts + 2`) and locks at a threshold of three. The counter therefore jumps 0 → 2 → 4, crossing the threshold on the second failure. The account is locked after only two wrong passwords instead of three, and even the correct password is then rejected. Verified independently through the API and reproduced end-to-end with the Appium test `appium-tests/tests/native/bugs.e2e.js`. |
| Steps to Reproduce | 1. Register or use an existing account.<br>2. Open "Đăng nhập" and sign in with a wrong password.<br>3. Sign in with a wrong password again.<br>4. Sign in with the CORRECT password. |
| Expected Result | The correct password logs the user in (the policy allows three attempts before locking). |
| Observed Failure | The account is already locked after the second wrong attempt; the correct login is refused. The backend returns "Tài khoản đã bị khóa. Vui lòng thử lại sau.", though the app surfaces only a generic failure message. |
| Impact | Legitimate users are locked out and denied access after two mistyped passwords; the generic error also hides the lockout reason. |
| Environment | Mobile application (Appium / UiAutomator2) + Node.js backend (`src/eshop-sut/backend/server.js`, line 54) |
