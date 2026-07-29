const base = require("../wdio.base.conf.js").config;

exports.config = {
  ...base,
  specs: ["./test/specs/native/cart.e2e.js"],
};
