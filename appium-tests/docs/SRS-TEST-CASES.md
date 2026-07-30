# EShop mobile — five Appium SRS test cases

These WebdriverIO/Appium scripts exercise the Android UI of
`src/eshop-sut/frontend-mobile` against the requirements in
`src/eshop-sut/README.md`.

| ID | Requirement | Scenario | Expected result | Current result |
|---|---|---|---|---|
| TC-01 | FR-01, FR-22 | Open registration and inspect masked inputs | Password and confirm-password fields are present | Fails: confirmation field is absent |
| TC-02 | FR-02 | Two invalid logins, then the correct password | Correct password still logs in; lock starts after the third failure | Fails: account is locked after two failures |
| TC-03 | FR-07 | Add the same product twice | One cart row has quantity `2` | Passes |
| TC-04 | FR-07 | Use the required `+` quantity control | Quantity changes from `1` to `2` and the cart keeps one row | Fails: the app exposes a text input instead of the required `+/-` controls |
| TC-05 | FR-07 | Tap **Xóa** on a cart row | Confirmation dialog appears before removal | Fails: row is deleted immediately |

## Run

Prerequisites:

1. Start the backend from `src/eshop-sut/backend` with `node server.js`.
2. Start the Expo development server and install/open the Android development
   build (`com.eshop.mobile`) on `emulator-5554`.
3. Start Appium on `127.0.0.1:4723` with the UiAutomator2 driver installed.
4. From `appium-tests`, run:

```powershell
npm run test:srs
```

Run one test independently by overriding the spec:

```powershell
npm run wdio -- run .\config\suites\srs.conf.js --spec .\test\specs\native\tc-03-cart-merge-duplicate-product.e2e.js
```

The assertions always express the SRS-compliant behavior. A failing result for
TC-01, TC-02, TC-04, or TC-05 is therefore the expected defect signal until
the corresponding application bug is fixed.
