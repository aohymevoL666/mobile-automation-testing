# Bug Report — EShop Mobile (Maestro)

**Course:** Software Testing — Stage 4
**Author:** Phạm Vũ Ngọc Duy — 23127183
**Tool:** Maestro Studio
**Report date:** 2026-07-18
**Topic:** Failure modes found while automating the EShop mobile app with Maestro — recording a Maestro demo, including the real technical failures and the genuine application bug the tool exposed.

---

## I. Environment Setup and Test Case

The backend runs on Node.js (`npm install` → `node database.js` to seed sample
data → `node server.js`), serving a SQLite database on `localhost:3000`. The
mobile app is an Expo project run through **Expo Go** directly (no native debug
build) — confirmed via `adb shell dumpsys window` that the automation target's
real `appId` is `host.exp.exponent`, not a dedicated app package, since
`app.json` declares no `android.package`.

Because the emulator cannot reach the host's `localhost`, the backend API
address in `App.js` was changed to the host's LAN IP. `App.js` was read
directly to get the exact on-screen Vietnamese labels for each screen, rather
than guessing selectors — this also surfaced several inconsistent labels across
screens (e.g. the login submit button reads "Sign In" in English inside an
otherwise Vietnamese UI; the add-to-cart button reads "Thêm vào giỏ" on the
product list but "Thêm vào giỏ hàng" on the product detail screen).

**Test case — login.** A Maestro YAML flow: `launchApp` → tap the "frontend-mobile"
project card (Expo Go always cold-starts to its own "Recently opened" screen
first) → assert the "Đăng nhập" link is visible → open the login screen → enter
valid credentials → tap "Sign In" → assert the product list screen
("Danh sách sản phẩm") is shown. The flow ran green repeatedly before recording.

## II. List of Technical Failures Encountered

1. **Emulator stuck at "Starting up" indefinitely.**
   Free host RAM was critically low (at times under 2 GB) from running Android
   Studio, VS Code, Maestro Studio, the backend, Expo, and an unrelated SQL
   Server install auto-starting 17 background services.
   *Fix:* closed unnecessary applications and stopped the unused SQL Server
   services; one occurrence also required force-killing a stuck emulator
   process and a stale lock file before a clean restart.

2. **Expo Go repeatedly showed "isn't responding" (ANR).**
   Same root cause as above — confirmed by ANR entries hitting several
   unrelated apps (Contacts, Calendar, Chrome, Google Play services) in the same
   window, not just Expo Go, which pointed to system-wide RAM starvation rather
   than an app-specific issue.
   *Fix:* freed RAM before testing.

3. **Flaky test — `assertVisible` passes, but the immediately following
   `tapOn` on the same element intermittently fails ("Element not found").**
   *Root cause:* UI rendering lag under RAM pressure between the two steps, not
   a wrong locator (the element had just been confirmed visible).
   *Fix:* added `waitForAnimationToEnd` before the tap, and ensured sufficient
   free RAM before running.

4. **`adb`/Expo terminal reported the Android SDK path as non-existent, even
   though the printed path looked correct.**
   *Root cause:* the `ANDROID_HOME` environment variable had a trailing space
   (`"D:\Android\Sdk "`), so the string did not match the real path.
   *Fix:* corrected the variable — but the fix only took effect after fully
   closing and reopening the terminal-hosting application (VS Code), since a
   long-running process only reads environment variables once at its own
   startup, not from newly opened terminal tabs.

## III. Genuine Application Bug Found (Not a Tool Bug)

**Bug:** the "Đăng nhập" (Login) and "Giỏ" (Cart) links in the app's top
navigation bar are completely untappable on a Pixel 8 emulator profile — not
only through Maestro, but also through direct manual taps.

**Verification (via `adb`, independent of Maestro):** `adb input tap` at the
exact pixel coordinates of "Đăng nhập" produced no reaction at all, while a tap
on "Thêm vào giỏ" elsewhere on the same screen worked normally (confirmed by a
"Thành công" success dialog). `adb shell dumpsys window displays` showed the
system status bar occupying `y = 0–132px` — roughly double the standard ~63px —
because Pixel 8's centered camera cutout forces a taller reserved touch region,
and the app's entire navigation bar renders inside that reserved zone.

**Root cause in the code:** the app imports `SafeAreaView` from the core
`"react-native"` package, which does not apply safe-area insets on Android (it
is effectively iOS-only), combined with `"edgeToEdgeEnabled": true` in
`app.json` — so the header content is drawn directly under the system status
bar instead of being pushed below it.

**Severity:** high — the codebase provides no alternative path to the Login,
Cart, or Profile screens other than this navigation bar (confirmed by
inspecting every `setView("login")` / `setView("cart")` call site), so this
defect fully blocks those flows on the affected device profile.

*Handling:* documented as an application defect; not patched, since the app is
the system under test. Testing continued on a different emulator profile
(Nexus 5X, no camera cutout, ~63px status bar), where the same element becomes
tappable — showing that this defect's real-world severity is device-dependent.

## IV. Testing with AI (MaestroGPT)

I asked MaestroGPT (Maestro Studio's built-in AI) to generate a flow from the
same natural-language description (log in, then open the product list), and ran
the raw output **as-is** to expose the mistakes. Asking the identical prompt
more than once produced different wrong answers each time:
- one attempt used a placeholder `appId` (`com.example.eshop`) instead of the
  real one, and issued a tap on `"Product List"` — a label that does not exist
  anywhere in the Vietnamese UI (the real screen is titled
  "Danh sách sản phẩm");
- another attempt produced entirely invalid Maestro syntax (`steps:`, `tap:`,
  `type: ... into: ...`, `waitForElement:` — none of these are real Maestro
  commands; the real ones are `appId:`, `tapOn:`, `inputText:`,
  `assertVisible:`).

I corrected the `appId` and labels against the real app (read from source,
verified via `adb`), re-ran the corrected flow, and it passed. Both a raw AI
failure and the fix are shown in the demo video — the point being that
AI-generated flows must be verified against the actual application, and that
the same prompt can yield different, differently-wrong output on repeated asks.

## V. Results

Completed the demo video, containing: the hand-written login flow (passing), a
genuine application bug with technical evidence (the Pixel 8 navigation-bar
touch-target defect), and the MaestroGPT section including AI-error discovery
and correction before use. The automation is genuine Maestro end-to-end (YAML
flow → Maestro CLI/Studio → Expo Go → `host.exp.exponent` on a real emulator).
Every action in the video is real and unstaged.

---

## Summary

| # | Failure mode | Type | Severity |
|---|---|---|---|
| 1 | Login/Cart navigation links fully untappable on Pixel 8 due to a status-bar touch-target conflict | Genuine application bug (Android layout, device-dependent) | High |
| 2 | MaestroGPT invented a placeholder `appId` and a non-existent English label | AI-tool failure mode | Medium — caught before use |
| 3 | MaestroGPT produced entirely invalid command syntax on a repeated identical prompt | AI-tool failure mode (non-determinism) | Medium — caught before use |
| 4 | Test steps intermittently fail under host RAM pressure even with correct locators | Environment-induced flakiness | Low — mitigated with explicit waits |

Automation exposes real defects reliably, but only when it is built on
verified, real application behaviour — every selector, label, and
AI-generated suggestion was checked against the live app before being trusted.
