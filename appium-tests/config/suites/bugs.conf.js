const base = require("../wdio.base.conf.js").config;

exports.config = {
  ...base,
  specs: ["./test/specs/native/bugs.e2e.js"],
};
