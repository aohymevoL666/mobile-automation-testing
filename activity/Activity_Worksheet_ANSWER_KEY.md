# T03 – ĐÁP ÁN & HƯỚNG DẪN ĐIỀU PHỐI

> **CHỈ DÀNH CHO NHÓM 10 — KHÔNG PHÁT CHO KHÁN GIẢ.**
> Dùng kèm `Activity_Worksheet.md`.

**Seminar:** T03 — Mobile Automation Testing · Nhóm 10
**Thời lượng:** 20 phút (7 + 6 + 4 + 3)

---

## Phân bổ thời gian & lời dẫn

| Phút | Mục | Việc của người điều phối |
| :---- | :---- | :---- |
| 0–1 | Mở đầu | Phát phiếu. Nhấn mạnh: *"Hai đoạn này là output AI thật, cả hai đều fail. Đừng chạy — hãy đọc và bắt lỗi."* Chỉ cho khán giả Mục 0 là tài liệu tra cứu. |
| 1–8 | Mục 1 (Maestro) | Đi quanh, gợi ý nhóm nào bí: *"So `appId` với Mục 0 xem"*, *"Muốn gõ chữ vào ô thì trước đó phải làm gì?"* |
| 8–14 | Mục 2 (Appium) | Nhắc lại nghĩa của `~` và `*=` nếu nhóm chưa quen WebdriverIO. |
| 14–18 | Mục 3 (Thảo luận) | Cho 2–3 nhóm đọc to đáp án 3.1 — chốt được "AI bịa UI tiếng Anh + bịa id" là đạt. |
| 18–20 | Mục 4 (Quy tắc) | Gọi 2 nhóm đọc quy tắc, ghi lên bảng, chốt bài. |

**Thông điệp cần chốt cuối buổi:**
> AI sinh test rất nhanh, nhưng nó sinh ra thứ *trông có vẻ đúng* dựa trên app phổ biến nhất mà nó
> từng thấy — không phải app của bạn. Chi phí thật không nằm ở lúc sinh, mà nằm ở lúc **kiểm chứng**.

---

## ĐÁP ÁN MỤC 1 — Flow Maestro (MaestroGPT)

Có **6 lỗi**. Nhóm tìm được 4+ là tốt.

| # | Dòng | Lỗi | Sửa đúng |
| :---- | :---- | :---- | :---- |
| 1 | 2 | `appId: com.example.eshop` là **placeholder AI bịa ra**, không phải app thật. Chính AI cũng tự ghi chú "Replace with the actual app ID". | `appId: host.exp.exponent` |
| 2 | sau 7 | **Thiếu `- tapOn: "frontend-mobile"`**. App chạy qua Expo Go nên mở lên là màn "Recently opened", flow không bao giờ vào được EShop. | Thêm `- tapOn: "frontend-mobile"` ngay sau `launchApp` |
| 3 | sau 7 | **Thiếu hoàn toàn bước mở màn Login** (`tapOn: "Đăng nhập"`). AI tưởng app mở lên là đã ở màn đăng nhập. | Thêm `- tapOn: "Đăng nhập"` |
| 4 | 10, 12 | `inputText` **không có `tapOn` đứng trước** → Maestro gõ vào ô đang focus (hoặc không ô nào), không đảm bảo đúng ô Email/Mật khẩu. | `- tapOn: "Email"` trước dòng 10; `- tapOn: "Mật khẩu"` trước dòng 12 |
| 5 | 11, 13 | Dùng `pressKey: "Enter"` để submit, kèm comment **"(if necessary)"** — dấu hiệu chính AI cũng không chắc. App thật submit bằng nút. | `- tapOn: "Sign In"` |
| 6 | 16 | `tapOn: "Product List"` — **nhãn này KHÔNG TỒN TẠI** trong UI tiếng Việt. Và sau khi login thì Home đã là danh sách sản phẩm rồi, không cần tap. | Bỏ hẳn, thay bằng `- assertVisible: "Danh sách sản phẩm"` |
| 7 *(bonus)* | toàn bộ | **Không có `assertVisible` nào** → flow không xác nhận được điều gì, có thể "chạy xong" mà chưa hề đăng nhập. | Thêm assert sau mỗi bước đổi màn hình |

**Bước fail đầu tiên:** dòng **6–7** (`launchApp`). Vì `appId` sai, Maestro không mở được app
`com.example.eshop` (không tồn tại trên máy). Nếu sửa mỗi `appId` thì fail tiếp ở dòng 10.

**Có xác nhận login thành công không?** → **Không.** Không có `assertVisible` nào trong toàn flow.
Đây chính là *false pass* — lỗi §5.2 trong User Guide.

**Bản sửa đúng (đối chiếu `01_login.yaml`):**

```yaml
appId: host.exp.exponent
---
- launchApp
- tapOn: "frontend-mobile"
- assertVisible: "Đăng nhập"
- waitForAnimationToEnd
- tapOn: "Đăng nhập"
- assertVisible: "Đăng Nhập"
- tapOn: "Email"
- inputText: "test@eshop.com"
- tapOn: "Mật khẩu"
- inputText: "Test1234!"
- hideKeyboard
- tapOn: "Sign In"
- assertVisible: "Danh sách sản phẩm"
```

---

## ĐÁP ÁN MỤC 2 — Test Appium (AI / Appium GPT)

| # | Dòng | Selector AI dùng | Vì sao sai | Đúng phải là |
| :---- | :---- | :---- | :---- | :---- |
| 1 | 3 | `$("~Login")` | `~` = accessibility id. App **không có** acc id nào tên `Login`, và nhãn thật là tiếng Việt. | `text("Đăng nhập")` |
| 2 | 4 | `content-desc="Username"` | App **không gắn `content-desc`** cho ô nhập; nhãn thật là `Email` chứ không phải `Username`. | `className("android.widget.EditText").instance(0)` |
| 3 | 5 | `content-desc="Password"` | Tương tự — không có `content-desc`; nhãn thật là `Mật khẩu`. | `className("android.widget.EditText").instance(1)` |
| 4 | 6 | `$("~Sign In")` | Nhãn `Sign In` **có tồn tại**, nhưng nó là **text**, không phải accessibility id → dùng `~` là sai loại selector. | `text("Sign In")` |
| 5 | 8 | `$("*=Product List")` | Nhãn tiếng Anh **không tồn tại**; màn thật tên `Danh sách sản phẩm`. | `textContains("Danh sách sản phẩm")` |
| 6 | 9 | `$("*=Products")` | Cũng là nhãn bịa, không có trong UI. | `textContains("Danh sách sản phẩm")` |

**Lỗi logic ở dòng 8:** sau khi đăng nhập, **màn Home CHÍNH LÀ danh sách sản phẩm**. Không có nút
"Product List" nào để bấm cả. AI tự nghĩ ra một bước điều hướng **thừa** — kể cả nếu selector đúng
thì bước này vẫn sai về nghiệp vụ. Ở bản sửa, dòng 8 bị **xoá**, chỉ còn assert.

**Lỗi thật khi chạy:**
```
Can't call click on element with selector "~Login" because element wasn't found
```
→ Fail ngay dòng 3, tức **dòng lệnh đầu tiên**.

**Bản sửa đúng (đối chiếu `round2_fixed.e2e.js`):**

```javascript
await openLogin();                                  // Home -> "Đăng nhập"
await (await editText(0)).setValue("test@eshop.com");
await (await editText(1)).setValue("Test1234!");
await tapText("Sign In");
const products = await waitTextContains("Danh sách sản phẩm");
await expect(products).toBeDisplayed();
```

---

## ĐÁP ÁN MỤC 3 — Thảo luận

**3.1 — Kiểu lỗi gốc chung của cả hai AI:**

AI **giả định một app "chuẩn" nói tiếng Anh, có sẵn id ổn định** — vì đó là thứ nó gặp nhiều nhất
trong dữ liệu huấn luyện. Cụ thể cả hai đều:
- Bịa nhãn tiếng Anh (`Product List`, `Products`, `Username`, `Password`) trong khi UI thật là tiếng Việt.
- Bịa định danh không tồn tại (`com.example.eshop`, `~Login`, `content-desc="Username"`).
- Bỏ qua đặc thù thật của app (Expo Go phải chọn dự án trước; app không có testID).
- Thiếu/yếu assertion → không phát hiện được là mình đã sai.

> Chốt: **AI không sai vì "ngu" — nó sai vì nó không nhìn thấy app của bạn.** Nó nội suy từ app phổ biến.

**3.2 —**

| Câu hỏi | Đáp án mong đợi |
| :---- | :---- |
| Tin "lần trước đúng nên lần này đúng"? | **Không.** Output AI **không tất định** — cùng prompt, lần 2 sinh ra cú pháp Maestro hoàn toàn không tồn tại. Phải kiểm chứng **từng lần sinh**, không kiểm chứng một lần rồi tin mãi. |
| Flow AI chạy không báo lỗi = đủ tin? | **Chưa.** Xem chính flow Mục 1: không có `assertVisible` nào. Một flow chỉ mở app rồi kết thúc vẫn "xanh" mà chẳng chứng minh được gì. Không lỗi ≠ đã kiểm thử. |

**3.3 — Cách kiểm chứng khi không có sẵn bản đồ UI (chấp nhận 2 trong số):**
- Đọc source của app (`App.js`) để lấy nhãn thật.
- Dùng **Maestro Studio Inspect Screen** hoặc **Appium Inspector** để xem cây UI thật đang chạy.
- Dùng `adb shell uiautomator dump` để lấy hierarchy.
- Chạy thử từng bước một (step-by-step) thay vì chạy cả flow.
- Cố tình phá 1 chỗ (negative control) xem test có bắt được không.

---

## ĐÁP ÁN MỤC 4 — Quy tắc (mẫu tham khảo)

Quy tắc đạt yêu cầu cần có **đủ 3 vế**. Ví dụ:

> **Được dùng AI để sinh *bản nháp đầu tiên* của flow, không được dùng làm bản cuối.** Trước khi
> chấp nhận, phải đối chiếu **từng `appId`, từng selector và từng nhãn** với UI thật (đọc source
> hoặc Inspect Screen), và phải bổ sung **ít nhất một assertion xác nhận kết quả nghiệp vụ** —
> vì output AI không tất định và có thể sai khác nhau qua mỗi lần sinh. Phải **lưu lại cả bản AI
> sinh (raw) lẫn bản người sửa** thành hai file riêng để người khác kiểm chứng được phần nào do
> AI làm.

**Thang chấm nhanh:**

| Mức | Biểu hiện |
| :---- | :---- |
| Tốt | Nêu đủ 3 vế; có nhắc tới assertion **và** tính không tất định của AI |
| Đạt | Nêu được "phải verify với app thật trước khi dùng" |
| Chưa đạt | Chỉ nói chung chung "phải kiểm tra kỹ" mà không nói kiểm tra **cái gì** |

---

## Nguồn bằng chứng (nếu khán giả hỏi)

| Nội dung | File thật |
| :---- | :---- |
| YAML Mục 1 | `maestro/eshop/03_ai_generated_before.yaml` → `03_ai_generated_after.yaml` |
| Flow chuẩn | `maestro/eshop/01_login.yaml` (13/13 bước pass, Nexus 5X, 1:28) |
| JS Mục 2 | `appium-tests/tests/ai/round1_raw.e2e.js` → `round2_fixed.e2e.js` |
| FM-03 (AI không tất định) | `failure-modes/failure-modes.md` |
| FM-05 (selector AI sai) | `failure-modes/failure-modes.md` |
| Video demo | https://youtu.be/7_-sTxwdQvI |
