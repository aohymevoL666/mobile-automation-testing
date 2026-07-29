---
name: appium-srs-test-generator
description: Generate, review, and maintain Appium WebdriverIO test scripts directly from System Requirements Specifications (SRS), requirement IDs, acceptance criteria, or bug reports. Use when Codex must turn requirements into traceable mobile test cases, design assertions that fail when the app violates the specification, extend Appium regression coverage, or distinguish a product defect from a flaky test or environment failure.
---

# Appium SRS Test Generator

Create executable specification tests whose oracle comes from the SRS, not from
the current implementation.

## Workflow

### 1. Locate the specification and test architecture

1. Find SRS, requirements, acceptance criteria, API specifications, and bug
   reports with `rg`.
2. Read every requirement in scope, including definitions and cross-references.
3. Inspect the existing Appium configuration, package scripts, helpers, naming
   conventions, selectors, and nearby tests.
4. Reuse the repository's framework and support layer. Do not introduce a
   second Appium setup unless explicitly requested.

Treat application source as selector and fixture context only. Never copy the
implementation's behavior into the expected result when it conflicts with or
weakens the SRS.

### 2. Convert prose into testable contracts

For each requirement, record:

- requirement ID and exact normative statement;
- preconditions and required fixture data;
- user action or triggering event;
- externally observable expected result;
- boundary values and forbidden outcomes;
- state that must remain unchanged;
- ambiguity or missing acceptance criteria.

Do not invent a product rule when the SRS is ambiguous. Report the ambiguity
and test only the unambiguous portion, or ask for clarification if it changes
the expected behavior materially.

### 3. Design for defect detection

Read [references/test-design.md](references/test-design.md) before designing new
cases or reviewing whether a case can detect SRS violations.

For every test, name at least one plausible non-conforming implementation
(`detects`) and ensure an assertion would fail for it. Cover boundaries,
negative paths, state transitions, and persistence when the requirement
supports them.

Reject tests that only prove that:

- the app launched;
- an element exists before the action;
- a tap completed without an exception;
- the implementation returned the value it originally supplied;
- any error appeared when the SRS requires a specific outcome.

### 4. Implement the Appium spec

Follow the repository's naming and placement conventions. Otherwise use
`kebab-case.e2e.js` and keep requirement tests identifiable, for example
`tc-07-cart-maximum-quantity.e2e.js`.

Add this metadata immediately above the relevant `describe` block:

```javascript
/**
 * @requirement FR-07
 * @expected One cart row remains and its quantity becomes 2.
 * @detects Duplicate rows or a quantity that is not incremented.
 */
```

Implementation rules:

- Keep one requirement behavior per `it` block.
- Arrange deterministic state, act through the UI, then assert observable
  behavior.
- Use API/database access only to create or clean fixtures, never as a
  replacement for the UI behavior under test.
- Prefer accessibility IDs or stable resource IDs, then scoped UiSelector.
- Avoid coordinates, long XPath, arbitrary sleeps, and assertions on
  implementation details.
- Assert both the required change and important forbidden side effects.
- Use unique fixture data and reset state so reruns remain independent.
- Preserve an assertion that expresses correct SRS behavior even when the
  current application is known to fail. Do not weaken it to make the suite
  green.

### 5. Validate

1. Run the bundled static quality gate:

   ```powershell
   node .agents/skills/appium-srs-test-generator/scripts/validate-appium-specs.mjs <spec-file-or-directory>
   ```

2. Run JavaScript syntax checks and load the relevant WebdriverIO config.
3. Run the smallest relevant suite when Appium, the device, and dependencies
   are available.
4. For each failure, classify it using
   [references/test-design.md](references/test-design.md):
   `PRODUCT_DEFECT`, `TEST_DEFECT`, `ENVIRONMENT`, or `INCONCLUSIVE`.
5. Capture the assertion, expected result, actual result, requirement ID, and
   reproduction command. Never report a product bug from infrastructure
   failure alone.

### 6. Report the result

Return:

- created or changed spec files;
- a requirement-to-test traceability table;
- the defect each test is capable of detecting;
- commands run and validation results;
- known product failures separately from environment or test failures;
- uncovered or ambiguous requirements.

Do not claim that generated tests discover arbitrary unknown bugs. State the
specific classes of SRS non-conformance that their oracles can detect.
