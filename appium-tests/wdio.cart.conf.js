const base = require("./wdio.native.conf.js").config;

exports.config = {
  ...base,
  specs: ["./tests/native/cart.e2e.js"],
};
