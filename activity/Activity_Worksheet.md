# T03 – ACTIVITY WORKSHEET

## "Bắt lỗi AI: Flow tự sinh có chạy được không?"

**Seminar:** T03 — Mobile Automation Testing · Nhóm 10
**SUT:** EShop Mobile (React Native + Expo) — luồng: Mở app → Đăng nhập → Xem danh sách sản phẩm
**Công cụ:** Maestro (YAML) và Appium 2 + WebdriverIO (JavaScript)
**Thời gian:** 20 phút

<br>

**Tên nhóm:** ..................................................................................................

<br>

**Thành viên:**

1. ..............................................................................................................

2. ..............................................................................................................

3. ..............................................................................................................

4. ..............................................................................................................

5. ..............................................................................................................

<br>

> **Bối cảnh.** Hai đoạn code dưới đây là **output thật, chưa chỉnh sửa** của AI — một cái do
> **MaestroGPT** sinh, một cái do **LLM (Appium GPT)** sinh. Cả hai được yêu cầu cùng một việc:
> *"đăng nhập vào EShop bằng test@eshop.com / Test1234!, rồi mở danh sách sản phẩm"*.
>
> Cả hai **đều fail ngay khi chạy**. Nhiệm vụ của nhóm: tìm ra lỗi **trước khi chạy**, chỉ bằng
> cách đối chiếu với UI thật ở Mục 0.

---

<br>

## 0. Tài liệu tham chiếu — UI THẬT của EShop

*(Cho sẵn để nhóm không phải mò. Dữ liệu lấy trực tiếp từ `App.js` và cây UI thật trên máy ảo.)*

**Cách app khởi động:**

```text
App chạy qua Expo Go, KHÔNG phải app độc lập.
  → appId thật là: host.exp.exponent
  → Mở lên luôn hiện màn "Recently opened" của Expo Go trước,
    phải bấm vào dự án tên "frontend-mobile" mới vào được EShop.
```

**Các nhãn hiển thị thật trên màn hình (toàn bộ UI là tiếng Việt):**

| Màn hình | Thành phần | Nhãn / đặc điểm thật |
| :---- | :---- | :---- |
| Navbar (chưa đăng nhập) | Link mở trang đăng nhập | `Đăng nhập` *(chữ **n** thường)* |
| Navbar | Link giỏ hàng | `Giỏ` |
| Login | Tiêu đề màn hình | `Đăng Nhập` *(chữ **N** HOA)* |
| Login | Ô nhập email | Placeholder `Email` — là `EditText`, **không có testID / accessibility id** |
| Login | Ô nhập mật khẩu | Placeholder `Mật khẩu` — là `EditText`, **không có testID / accessibility id** |
| Login | Nút bấm để đăng nhập | `Sign In` *(tiếng Anh, nằm giữa UI tiếng Việt)* |
| Home | Tiêu đề danh sách sản phẩm | `Danh sách sản phẩm` |
| Home | Lời chào sau khi đăng nhập | `Chào, ...` |
| Home | Ô tìm kiếm / nút tìm | `Tìm kiếm...` / `Tìm` |
| Thẻ sản phẩm | Nút thêm vào giỏ | `Thêm vào giỏ` |
| Chi tiết sản phẩm | Nút thêm vào giỏ | `Thêm vào giỏ hàng` *(khác màn trên!)* |

> **Lưu ý:** sau khi đăng nhập thành công, **màn hình Home CHÍNH LÀ danh sách sản phẩm** —
> không có nút hay màn hình riêng nào tên "Product List".

---

<br>

## 1. Bắt lỗi flow Maestro do MaestroGPT sinh

**Prompt đã đưa cho AI:** *"Open EShop app, login with email test@eshop.com and password Test1234!, then go to the product list."*

**Output thật của MaestroGPT (chưa sửa gì):**

```yaml
1   # Maestro Flow Script to login and navigate to product list in EShop app
2   appId: com.example.eshop  # Replace with the actual app ID
3
4   ---
5   # Launch the EShop application
6   - launchApp:
7       clearState: true  # Clear app state for consistent tests
8
9   # Input email and password to login
10  - inputText: "test@eshop.com"  # Input email
11  - pressKey: "Enter"  # Submit email (if necessary)
12  - inputText: "Test1234!"  # Input password
13  - pressKey: "Enter"  # Submit password (if necessary)
14
15  # Navigate to the product list
16  - tapOn: "Product List"  # Tap on the product list button or link
```

<br>

**Hãy tìm càng nhiều lỗi càng tốt** *(gợi ý: có ít nhất 5 lỗi)*

| # | Dòng số | Lỗi là gì? | Phải sửa thành gì? |
| :----: | :----: | :---- | :---- |
| **1** | <br><br> | <br><br> | <br><br> |
| **2** | <br><br> | <br><br> | <br><br> |
| **3** | <br><br> | <br><br> | <br><br> |
| **4** | <br><br> | <br><br> | <br><br> |
| **5** | <br><br> | <br><br> | <br><br> |
| **6** | <br><br> | <br><br> | <br><br> |

<br>

**Nếu chạy flow này, bước nào sẽ fail ĐẦU TIÊN?** *(ghi số dòng và lý do)*

..................................................................................................................

..................................................................................................................

<br>

**Có bước nào trong flow này *xác nhận* được là đã đăng nhập thành công không?**

..................................................................................................................

..................................................................................................................

---

<br>

## 2. Bắt lỗi test Appium do AI sinh

**Prompt đã đưa cho AI:** *"Write an Appium WebdriverIO test that logs into the EShop app and opens the product list. Username test@eshop.com, password Test1234!."*

**Output thật của AI (chưa sửa gì):**

```javascript
1   describe("EShop login and product list (AI-generated, raw)", () => {
2     it("logs in and opens the product list", async () => {
3       await $("~Login").click();
4       await $('//android.widget.EditText[@content-desc="Username"]').setValue("test@eshop.com");
5       await $('//android.widget.EditText[@content-desc="Password"]').setValue("Test1234!");
6       await $("~Sign In").click();
7
8       await $("*=Product List").click();
9       await expect($("*=Products")).toBeDisplayed();
10    });
11  });
```

> Nhắc lại cú pháp WebdriverIO: `~abc` = tìm theo **accessibility id** · `*=abc` = tìm phần tử có **text chứa** chuỗi `abc`

<br>

| # | Dòng số | Vì sao selector đó sai? | Selector đúng nên là gì? |
| :----: | :----: | :---- | :---- |
| **1** | <br><br> | <br><br> | <br><br> |
| **2** | <br><br> | <br><br> | <br><br> |
| **3** | <br><br> | <br><br> | <br><br> |
| **4** | <br><br> | <br><br> | <br><br> |
| **5** | <br><br> | <br><br> | <br><br> |
| **6** | <br><br> | <br><br> | <br><br> |

<br>

**Ngoài chuyện selector sai, dòng 8 còn sai về mặt *logic nghiệp vụ*. Sai chỗ nào?**

..................................................................................................................

..................................................................................................................

---

<br>

## 3. So sánh & thảo luận

**3.1 —** Hai AI khác nhau, hai công cụ khác nhau, nhưng mắc **chung một kiểu lỗi gốc**. Kiểu lỗi đó là gì?

..................................................................................................................

..................................................................................................................

..................................................................................................................

<br>

**3.2 —** Nhóm 10 hỏi lại MaestroGPT **đúng y nguyên prompt cũ** vào một lần khác, và nhận được kết quả
**sai theo một kiểu hoàn toàn khác** — lần này AI sinh ra cú pháp không hề tồn tại (`steps:`, `tap:`,
`type: ... into: ...`, `waitForElement:`).

| Câu hỏi | Trả lời của nhóm |
| :---- | :---- |
| Có thể tin *"lần trước AI sinh đúng nên lần này cũng đúng"* không? Vì sao? | <br><br><br> |
| Nếu một flow AI sinh ra chạy mà **không báo lỗi**, đã đủ tin chưa? Vì sao? | <br><br><br> |

<br>

**3.3 —** Giả sử nhóm **không có** Mục 0 (không biết trước UI thật). Nhóm sẽ làm gì để kiểm chứng
output của AI trước khi tin nó? Kể **2 cách**:

..................................................................................................................

..................................................................................................................

..................................................................................................................

---

<br>

## 4. Quy tắc cuối cùng

Viết **một quy tắc** cho việc dùng AI sinh test tự động. Quy tắc phải nêu rõ:

- **Được dùng AI vào việc gì** (và không được dùng vào việc gì).
- **Phải kiểm chứng những gì** trước khi chấp nhận output của AI.
- **Phải lưu lại gì** để người khác kiểm tra được.

<br>

> **Quy tắc của nhóm:**
>
> ..............................................................................................................
>
> ..............................................................................................................
>
> ..............................................................................................................
>
> ..............................................................................................................
