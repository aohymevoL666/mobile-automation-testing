const base = require("./wdio.native.conf.js").config;
exports.config = { ...base, specs: ["./tests/native/bugs.e2e.js"] };
