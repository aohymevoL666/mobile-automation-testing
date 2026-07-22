// ============================================================================
// "APPIUM GPT" — RAW AI OUTPUT (round 1), UNEDITED.
//
// Prompt given to the LLM:
//   "Write an Appium WebdriverIO test that logs into the EShop app and opens
//    the product list. Username test@eshop.com, password Test1234!."
//
// This is what the model produced with no knowledge of the real app. We run it
// AS-IS to expose the mistakes (English labels, guessed accessibility ids) — the
// app's UI is in Vietnamese, so these selectors don't exist.
// ============================================================================
describe("EShop login and product list (AI-generated, raw)", () => {
  it("logs in and opens the product list", async () => {
    // AI assumed English UI and accessibility ids that aren't in the app.
    await $("~Login").click();
    await $('//android.widget.EditText[@content-desc="Username"]').setValue("test@eshop.com");
    await $('//android.widget.EditText[@content-desc="Password"]').setValue("Test1234!");
    await $("~Sign In").click();

    await $("*=Product List").click();
    await expect($("*=Products")).toBeDisplayed();
  });
});
