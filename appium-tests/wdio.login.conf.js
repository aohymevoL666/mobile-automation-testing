const base = require("./wdio.native.conf.js").config;
exports.config = { ...base, specs: ["./tests/native/login.e2e.js"] };
