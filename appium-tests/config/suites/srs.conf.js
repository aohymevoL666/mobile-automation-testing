const base = require("../wdio.base.conf.js").config;

exports.config = {
  ...base,
  specs: ["./test/specs/srs/TC*.e2e.js"],
};
