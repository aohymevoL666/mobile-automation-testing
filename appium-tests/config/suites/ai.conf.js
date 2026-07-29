const base = require("../wdio.base.conf.js").config;
// Round 1: the raw AI output (fails). Switch to round2_fixed.e2e.js to show the fix.
exports.config = {
  ...base,
  specs: ["./test/specs/ai/round1_raw.e2e.js"],
};
