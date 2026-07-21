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