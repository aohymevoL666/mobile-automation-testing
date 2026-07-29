const base = require("../wdio.base.conf.js").config;

exports.config = {
  ...base,
  specs: ["./test/specs/native/login.e2e.js"],
};
