# Hướng dẫn sử dụng SRS Test Generator Agents

Repo cung cấp hai agent skill để chuyển yêu cầu trong System Requirements
Specification (SRS) thành mobile UI automation test:

| Agent skill | Đầu ra chính | Framework |
|---|---|---|
| [`$appium-srs-test-generator`](skills/appium-srs-test-generator/SKILL.md) | JavaScript/WebdriverIO `*.e2e.js` | Appium |
| [`$maestro-srs-test-generator`](skills/maestro-srs-test-generator/SKILL.md) | Declarative flow `*.yaml` | Maestro |

Nguồn SRS hiện tại của EShop là
[`src/eshop-sut/README.md`](../src/eshop-sut/README.md).

## 1. Cách gọi agent skill

Gọi trực tiếp skill trong prompt và nêu requirement cần kiểm thử:

```text
Use $appium-srs-test-generator to generate Appium tests for FR-02 from
src/eshop-sut/README.md. Cover N-1 and N lockout boundaries and run the
smallest relevant validation.
```

```text
Use $maestro-srs-test-generator to generate Maestro YAML flows for FR-07 from
src/eshop-sut/README.md. Test duplicate products, quantity controls, and delete
confirmation.
```

Một yêu cầu tốt nên cung cấp:

- skill muốn dùng: Appium hoặc Maestro;
- đường dẫn SRS hoặc requirement ID, ví dụ `FR-07`;
- nền tảng/app cần chạy, ví dụ Android EShop mobile;
- phạm vi cần kiểm thử: happy path, negative, boundary, persistence;
- dữ liệu hoặc tài khoản test nếu repo chưa có fixture phù hợp;
- yêu cầu chỉ sinh script hay phải validate/chạy trên thiết bị.

Nếu chưa biết chọn framework, có thể yêu cầu agent phân tích trước:

```text
Đọc FR-03 trong src/eshop-sut/README.md, so sánh Appium và Maestro cho test
reset password hai bước, đề xuất framework phù hợp rồi mới viết test.
```

## 2. Chọn Appium hay Maestro

### Chọn Appium khi

- yêu cầu có nhiều boundary hoặc state transition;
- cần fixture qua API/database nhưng vẫn thao tác hành vi chính qua UI;
- cần kiểm tra giá trị, số lượng, phép tính hoặc nhiều forbidden side effects;
- cần page object, hook, debug log và kiểm soát WebDriver chi tiết;
- test cần mở rộng thành regression suite phức tạp.

Appium phù hợp hơn với các trường hợp như:

- khóa tài khoản đúng sau lần đăng nhập sai thứ ba;
- cùng một sản phẩm chỉ có một cart row và quantity tăng chính xác;
- coupon có nhiều điều kiện biên;
- state machine của đơn hàng;
- dữ liệu phải giữ nguyên sau thao tác không hợp lệ.

Đầu ra mặc định nằm theo convention hiện tại:

```text
appium-tests/test/specs/native/tc-<number>-<behavior>.e2e.js
```

Metadata traceability được đặt trên `describe`:

```javascript
/**
 * @requirement FR-07
 * @expected One cart row remains and its quantity becomes 2.
 * @detects Duplicate rows or a quantity that is not incremented.
 */
```

### Chọn Maestro khi

- cần flow YAML dễ đọc cho QA/manual tester;
- cần smoke test hoặc user journey ngắn;
- assertion chủ yếu dựa trên element visible/not visible hoặc state đơn giản;
- muốn tái sử dụng login/navigation bằng `runFlow`;
- muốn chạy và chỉnh flow trong Maestro Studio.

Maestro phù hợp hơn với các trường hợp như:

- đăng nhập thành công và mở danh sách sản phẩm;
- tìm kiếm rồi mở trang chi tiết;
- thêm sản phẩm và kiểm tra badge/toast;
- kiểm tra dialog xác nhận;
- điều hướng qua các màn hình chính.

Đầu ra nên nằm dưới:

```text
maestro/<feature>/tc-<number>-<behavior>.yaml
```

Metadata traceability dùng YAML comment để Maestro bỏ qua an toàn:

```yaml
# @requirement FR-07
# @expected One cart row remains and its quantity becomes 2.
# @detects Duplicate rows or a quantity that is not incremented.
```

### Quy tắc chọn nhanh

| Nhu cầu | Nên chọn |
|---|---|
| Smoke/happy-path UI ngắn | Maestro |
| Flow để QA dễ đọc và chỉnh sửa | Maestro |
| Boundary `N-1`, `N`, `N+1` | Appium |
| Assertion cardinality hoặc phép tính phức tạp | Appium |
| Fixture API và cleanup phức tạp | Appium |
| Kiểm tra toast, dialog, navigation đơn giản | Maestro |
| Regression dài, cần debug sâu | Appium |
| Cần cả readable flow và kiểm tra sâu | Dùng cả hai, nhưng không tạo hai test trùng oracle |

Không chọn framework chỉ vì test hiện tại đang pass. Expected result luôn phải
đến từ SRS; nếu ứng dụng sai thì assertion đúng phải tiếp tục fail.

## 3. Tính năng nào trong SRS phù hợp để kiểm thử

### Mobile và user-facing requirements

| Requirement | Tính năng | Gợi ý framework |
|---|---|---|
| FR-01 | Đăng ký tài khoản | Appium cho validation/boundary; Maestro cho happy path |
| FR-02 | Đăng nhập và khóa tài khoản | Appium |
| FR-03 | Quên/đặt lại mật khẩu hai bước | Appium |
| FR-04 | Quản lý hồ sơ | Cả hai |
| FR-05 | Danh sách và tìm kiếm sản phẩm | Maestro cho journey; Appium cho boundary/filter |
| FR-06 | Chi tiết sản phẩm | Maestro |
| FR-07 | Giỏ hàng | Appium cho quantity/cardinality; Maestro cho UI flow |
| FR-08 | Thanh toán | Appium |
| FR-09 | Mã giảm giá | Appium |
| FR-10 | State machine đơn hàng | Appium |
| FR-11 | Lịch sử đơn hàng | Cả hai |
| FR-20 | Bộ tính năng mobile | Chia thành các requirement nhỏ rồi dùng cả hai |
| FR-21 | Tiêu chuẩn giao diện | Maestro visual flow hoặc Appium attribute; có thể cần visual/manual test |
| FR-22 | Quy tắc form | Appium |
| FR-23 | Navigation, badge, breadcrumb | Maestro cho navigation; Appium cho state/badge chi tiết |
| FR-24 | Feedback, dialog, empty state | Maestro; Appium nếu cần kiểm tra state không đổi |

### Admin và backend-heavy requirements

FR-12 đến FR-19 chủ yếu thuộc web admin, API, authorization và transaction:

- FR-12: access control;
- FR-13: dashboard;
- FR-14: category CRUD;
- FR-15: product CRUD;
- FR-16: CSV import và rollback;
- FR-17: coupon CRUD;
- FR-18: admin order management;
- FR-19: user management.

Hai skill trong thư mục này được tối ưu cho mobile UI. Không nên dùng chúng làm
thay thế cho API/integration tests của authorization, transaction hoặc database
invariant. Chỉ dùng Appium/Maestro cho FR-12 đến FR-19 khi chức năng tương ứng
thực sự được mở qua UI trong phạm vi test.

## 4. Coverage hiện có trong repo

### Appium

| Test | Requirement | Phạm vi assertion hiện có | Coverage |
|---|---|---|---|
| `TC-01` | FR-01 | Required fields, email, password boundary, uniqueness, confirmation, redirect | Một phần lớn FR-01 |
| `TC-02` | FR-02 | Correct password vẫn đăng nhập được sau hai lần sai | Boundary trước ngưỡng; chưa phủ toàn bộ FR-02 |
| `TC-03` | FR-07 | Thêm trùng sản phẩm tạo một row, quantity bằng 2 | Một phần FR-07 |
| `TC-04` | FR-07 | Có nút `+/-`, tăng quantity từ 1 lên 2, vẫn một row | Một phần FR-07 |
| `TC-05` | FR-07 | Có dialog xác nhận và item chưa bị xóa trước confirm | Một phần FR-07 |

Chạy toàn bộ Appium SRS suite:

```powershell
npm run test:srs
```

Chạy một spec:

```powershell
Push-Location appium-tests
.\node_modules\.bin\wdio.cmd run .\config\suites\srs.conf.js `
  --spec .\test\specs\native\tc-03-cart-merge-duplicate-product.e2e.js
Pop-Location
```

Static validation:

```powershell
node .agents/skills/appium-srs-test-generator/scripts/validate-appium-specs.mjs `
  appium-tests/test/specs/native
```

### Maestro

Các flow hiện có dưới `maestro/eshop` minh họa:

- login và điều hướng tới danh sách sản phẩm;
- thêm sản phẩm và mở giỏ hàng;
- flow AI trước/sau chỉnh sửa.

Các flow này chưa có đầy đủ `@requirement`, `@expected`, `@detects`, tên và tags
theo chuẩn của skill mới. Vì vậy chúng chỉ là ví dụ flow, chưa được xem là
formal SRS coverage.

Static validation:

```powershell
node .agents/skills/maestro-srs-test-generator/scripts/validate-maestro-flows.mjs `
  maestro
```

Chạy một Maestro flow khi đã cài CLI và có device:

```powershell
maestro test maestro/eshop/<flow>.yaml
```

## 5. Yêu cầu đầu ra từ agent

Khi sinh hoặc review test, yêu cầu agent trả về:

- file test đã tạo hoặc thay đổi;
- bảng traceability từ requirement tới test;
- expected result lấy từ câu nào trong SRS;
- lỗi cụ thể mà mỗi test có thể phát hiện;
- command validation và kết quả;
- phân loại failure:
  `PRODUCT_DEFECT`, `TEST_DEFECT`, `ENVIRONMENT`, hoặc `INCONCLUSIVE`;
- requirement còn thiếu hoặc mơ hồ.

Ví dụ prompt đầy đủ:

```text
Use $appium-srs-test-generator.

SRS: src/eshop-sut/README.md
Scope: FR-03 password reset
Platform: Android EShop mobile
Coverage: valid flow, invalid OTP, OTP bound to another email, password
boundary, mismatched confirmation, and successful redirect
Output: appium-tests/test/specs/native
Validation: static validation and the smallest runnable WebdriverIO spec
Report: requirement traceability and failure classification
```

```text
Use $maestro-srs-test-generator.

SRS: src/eshop-sut/README.md
Scope: FR-24 add-to-cart feedback and empty-cart state
Platform: Android EShop mobile
Output: maestro/eshop/feedback
Requirements: stable IDs, parameterized credentials, reusable login subflow,
and top-level SRS assertions
Validation: static validator; run Maestro only if CLI and device are available
```
