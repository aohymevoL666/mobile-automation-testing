// ============================================================================
// APPIUM DEMO — bug hunting (native Android, React Native)
//
// This spec exists to DEMONSTRATE that the framework catches real defects:
// the assertion encodes the CORRECT behaviour, so a genuine bug turns the test
// RED. That red is Appium doing its job.
//
// BUG (login lockout): the backend increments failed attempts by TWO per try
// (server.js: `login_attempts + 2`) and locks at >= 3. So an account is locked
// after just 2 wrong passwords instead of 3 — and then even the CORRECT
// password is rejected. Verified independently with curl.
// ============================================================================
const http = require("http");
const { editText, tapText, waitTextContains, openLogin, byTextContains } = require("./helpers");

// Register a fresh user straight against the backend (test fixture setup).
function apiRegister(name, email, password) {
  const body = JSON.stringify({ name, email, password });
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "localhost", port: 3000, path: "/api/register", method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function typeLogin(email, password) {
  await (await editText(0)).setValue(email);
  await (await editText(1)).setValue(password);
  await tapText("Sign In");
  await driver.pause(2500); // let the request finish and UI settle
}

describe("Appium demo — real bug: premature account lockout", () => {
  const email = `lock_${Date.now()}@mail.com`;
  const GOOD = "Valid1!@ok";
  const BAD = "wrongpass";

  before(async () => {
    await apiRegister("Lock Test", email, GOOD); // fresh, unlocked account
  });

  it("locks the account after only 2 wrong attempts, then rejects the CORRECT password", async () => {
    // Two failed logins — the app just shows a generic failure each time.
    await openLogin();
    await typeLogin(email, BAD);                       // attempt 1
    await tapText("Sign In");                          // attempt 2 (same bad pw)
    await driver.pause(2500);

    // Fresh screen, now sign in with the CORRECT password.
    await openLogin();
    await typeLogin(email, GOOD);

    // CORRECT behaviour: we should be logged in — the header greets the user
    // ("Chào, Lock Test"). This assertion is what SHOULD hold.
    const greeting = await byTextContains("Chào");
    // BUG: the account is already locked after 2 tries, so the correct password
    // is refused and this greeting never appears -> the test goes RED,
    // surfacing the defect on camera.
    await expect(greeting).toBeDisplayed({ wait: 8000 });
  });
});
