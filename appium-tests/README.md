# Appium tests — EShop mobile

Author: Huỳnh Lê Khương Duy (23127176)

Bộ kiểm thử Android native dùng WebdriverIO, Appium và UiAutomator2 cho ứng
dụng EShop (`com.eshop.mobile`).

```text
WebdriverIO -> Appium :4723 -> UiAutomator2 -> com.eshop.mobile
```

## Cấu trúc

```text
appium-tests/
├── config/
│   ├── wdio.base.conf.js       # capabilities và thiết lập dùng chung
│   └── suites/                 # config cho từng nhóm test
├── test/
│   ├── specs/
│   │   ├── native/             # các luồng native viết thủ công
│   │   ├── srs/                # test đối chiếu yêu cầu SRS
│   │   └── ai/                 # test sinh bởi AI và bản đã sửa
│   ├── support/                # selector/helper dùng chung
│   ├── pageobjects/            # Page Objects cho standalone flow
│   └── standalone/             # script chạy trực tiếp bằng Node.js
├── artifacts/screenshots/      # ảnh kết quả
└── docs/                       # tài liệu riêng của bộ test
```

Mỗi loại file chỉ có một nơi chứa: config không nằm lẫn với source test,
helper không nằm lẫn với spec và tài liệu không nằm ở thư mục gốc.

## Chuẩn bị

1. Cài Android SDK, tạo AVD và cài native debug build:
   `src/eshop-sut/frontend-mobile` → `npx expo run:android`.
2. Chạy backend và Metro.
3. Chuyển tiếp các cổng cần thiết:

   ```powershell
   adb reverse tcp:3000 tcp:3000
   adb reverse tcp:8081 tcp:8081
   ```

4. Trong `appium-tests`, cài dependency và chạy Appium:

   ```powershell
   npm install
   npm run appium -- --port 4723
   ```

## Chạy test

Có thể chạy từ thư mục project:

```powershell
npm test
npm run test:login
npm run test:cart
npm run test:bugs
npm run test:srs
npm run test:ai
```

Hoặc từ `appium-tests` bằng các lệnh cùng tên. Chạy trực tiếp một suite/spec:

```powershell
npm run wdio -- run ./config/suites/login.conf.js
npm run wdio -- run ./config/suites/srs.conf.js --spec ./test/specs/srs/TC03-cart-merge-duplicate-product.e2e.js
```

Các script standalone cũ vẫn được giữ lại:

```powershell
npm run test:smoke
npm run test:eshop
```

`test:bugs`, test AI thô và một số test SRS chủ đích phát hiện hành vi sai nên
có thể trả về trạng thái failed khi lỗi ứng dụng chưa được sửa. Xem thêm
[`docs/SRS-TEST-CASES.md`](./docs/SRS-TEST-CASES.md) và
[`../failure-modes/failure-modes.md`](../failure-modes/failure-modes.md).
