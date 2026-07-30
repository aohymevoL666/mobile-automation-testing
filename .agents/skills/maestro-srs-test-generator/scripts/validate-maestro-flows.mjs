#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const target = process.argv[2];

if (!target) {
  console.error(
    "Usage: node validate-maestro-flows.mjs <flow-file-or-directory>",
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
    return /\.ya?ml$/i.test(candidate) ? [candidate] : [];
  }

  return fs
    .readdirSync(candidate, { withFileTypes: true })
    .flatMap((entry) => collectFiles(path.join(candidate, entry.name)));
}

function lineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function addMatchWarnings(source, pattern, message, warnings) {
  for (const match of source.matchAll(pattern)) {
    warnings.push(`line ${lineNumber(source, match.index)}: ${message}`);
  }
}

const files = collectFiles(resolvedTarget).filter(
  (file) => !/^config\.ya?ml$/i.test(path.basename(file)),
);

if (files.length === 0) {
  console.error(`No Maestro *.yaml or *.yml flows found under: ${resolvedTarget}`);
  process.exit(2);
}

const assertionPattern =
  /^\s*-\s+(assertVisible|assertNotVisible|assertTrue|assertScreenshot)\s*:/m;
const actionPattern =
  /^\s*-\s+(tapOn|inputText|eraseText|pressKey|swipe|scroll|scrollUntilVisible|openLink|back|stopApp|killApp|runFlow)\b/m;

const results = [];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const errors = [];
  const warnings = [];
  const separator = source.search(/^---\s*$/m);
  const header = separator >= 0 ? source.slice(0, separator) : source;
  const commands = separator >= 0 ? source.slice(separator + 3) : "";
  const isTopLevel =
    separator >= 0 ||
    /^appId\s*:/m.test(source) ||
    /^#\s*@(?:requirement|expected|detects)\b/m.test(source);
  const commandSource = isTopLevel ? commands : source;

  if (isTopLevel) {
    if (!/^#\s*@requirement\s+\S.+$/m.test(header)) {
      errors.push("missing '# @requirement <ID>' traceability metadata");
    }
    if (!/^#\s*@expected\s+\S.+$/m.test(header)) {
      errors.push("missing '# @expected <observable result>' metadata");
    }
    if (!/^#\s*@detects\s+\S.+$/m.test(header)) {
      errors.push("missing '# @detects <non-conformance>' metadata");
    }
    if (!/^appId\s*:\s*\S.+$/m.test(header)) {
      errors.push("missing a non-empty appId in the flow configuration");
    }
    if (!/^name\s*:\s*\S.+$/m.test(header)) {
      errors.push("missing a descriptive flow name");
    }
    if (!/^tags\s*:\s*(?:\[.*\])?\s*$/m.test(header)) {
      warnings.push("flow has no tags; add searchable suite/feature tags");
    }
    if (separator < 0) {
      errors.push("missing YAML document separator '---'");
    }
    if (separator >= 0 && !/^\s*-\s+\S/m.test(commands)) {
      errors.push("commands section is empty or malformed");
    }
    if (!assertionPattern.test(commands)) {
      errors.push(
        "missing an explicit Maestro oracle (assertVisible/assertNotVisible/assertTrue/assertScreenshot)",
      );
    }
    if (!actionPattern.test(commands)) {
      warnings.push(
        "no user action found; confirm this is intentionally a startup/display requirement",
      );
    }
  } else if (!/^\s*-\s+\S/m.test(source)) {
    errors.push("commands-only subflow is empty or malformed");
  }

  if (
    /^\s*-\s+assertTrue\s*:\s*(?:\$\{\s*)?true(?:\s*\})?\s*$/im.test(
      commandSource,
    ) ||
    /^\s*condition\s*:\s*(?:\$\{\s*)?true(?:\s*\})?\s*$/im.test(commandSource)
  ) {
    errors.push("contains a tautological assertTrue condition");
  }
  if (/\t/.test(source)) {
    errors.push("contains tab indentation; YAML flow indentation must use spaces");
  }
  if (/\uFFFD/.test(source)) {
    errors.push("contains Unicode replacement characters; repair UTF-8 text");
  }

  addMatchWarnings(
    source,
    /^\s+point\s*:/gm,
    "uses a coordinate selector; prefer id, text, or relational selectors",
    warnings,
  );
  addMatchWarnings(
    source,
    /^\s+(?:text|id)\s*:\s*["']?\.\*["']?\s*$/gm,
    "uses an unscoped wildcard selector",
    warnings,
  );
  addMatchWarnings(
    source,
    /^\s+retryTapIfNoChange\s*:\s*true\s*$/gm,
    "retryTapIfNoChange may repeat a non-idempotent action",
    warnings,
  );
  addMatchWarnings(
    source,
    /(?:Ã.|Ä.|Â.)/g,
    "possible mojibake; verify the localized label is valid UTF-8",
    warnings,
  );

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
  `Checked ${results.length} flow(s): ${errorCount} error(s), ${warningCount} warning(s).`,
);
process.exit(errorCount === 0 ? 0 : 1);
