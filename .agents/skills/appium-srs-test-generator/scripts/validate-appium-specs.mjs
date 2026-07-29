#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const target = process.argv[2];

if (!target) {
  console.error(
    "Usage: node validate-appium-specs.mjs <spec-file-or-directory>",
  );
  process.exit(2);
}

const resolvedTarget = path.resolve(target);

if (!fs.existsSync(resolvedTarget)) {
  console.error(`Target does not exist: ${resolvedTarget}`);
  process.exit(2);
}

function collectFiles(candidate) {
  const stat = fs.statSync(candidate);
  if (stat.isFile()) {
    return candidate.endsWith(".e2e.js") ? [candidate] : [];
  }

  return fs
    .readdirSync(candidate, { withFileTypes: true })
    .flatMap((entry) => {
      const child = path.join(candidate, entry.name);
      return entry.isDirectory() ? collectFiles(child) : collectFiles(child);
    });
}

const files = collectFiles(resolvedTarget);

if (files.length === 0) {
  console.error(`No *.e2e.js files found under: ${resolvedTarget}`);
  process.exit(2);
}

const results = [];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const errors = [];
  const warnings = [];

  if (!/@requirement\s+\S+/.test(source)) {
    errors.push("missing @requirement metadata");
  }
  if (!/@expected\s+\S+/.test(source)) {
    errors.push("missing @expected metadata");
  }
  if (!/@detects\s+\S+/.test(source)) {
    errors.push("missing @detects metadata");
  }
  if (!/\bdescribe\s*\(/.test(source) || !/\bit\s*\(/.test(source)) {
    errors.push("missing describe()/it() test structure");
  }
  if (!/\bexpect\s*\(/.test(source)) {
    errors.push("missing an explicit expectation");
  }
  if (
    /expect\s*\(\s*true\s*\)\s*\.\s*toBe\s*\(\s*true\s*\)/.test(source) ||
    /expect\s*\(\s*1\s*\)\s*\.\s*toBe\s*\(\s*1\s*\)/.test(source)
  ) {
    errors.push("contains a tautological expectation");
  }
  if (/driver\.pause\s*\(/.test(source)) {
    warnings.push("uses driver.pause(); prefer a condition-based wait");
  }
  if (/\$\(\s*["'`]\/\//.test(source)) {
    warnings.push("uses XPath; prefer accessibility/resource IDs");
  }

  results.push({ file, errors, warnings });
}

for (const result of results) {
  const relative = path.relative(process.cwd(), result.file);
  const status = result.errors.length === 0 ? "PASS" : "FAIL";
  console.log(`${status} ${relative}`);
  for (const error of result.errors) console.log(`  error: ${error}`);
  for (const warning of result.warnings) console.log(`  warning: ${warning}`);
}

const errorCount = results.reduce(
  (total, result) => total + result.errors.length,
  0,
);
const warningCount = results.reduce(
  (total, result) => total + result.warnings.length,
  0,
);

console.log(
  `Checked ${results.length} file(s): ${errorCount} error(s), ${warningCount} warning(s).`,
);
process.exit(errorCount === 0 ? 0 : 1);
