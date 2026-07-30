---
name: maestro-srs-test-generator
description: Generate, review, and maintain Maestro YAML mobile UI test flows directly from System Requirements Specifications (SRS), requirement IDs, acceptance criteria, or bug reports. Use when Codex must turn requirements into traceable Maestro test cases, create YAML flows whose assertions fail on specification violations, extend Maestro regression coverage, or distinguish a product defect from a test or device/environment failure.
---

# Maestro SRS Test Generator

Create executable Maestro specification tests whose oracle comes from the SRS,
not from the application's current behavior.

## Workflow

### 1. Locate the specification and Maestro architecture

1. Find SRS files, requirement IDs, acceptance criteria, API specifications,
   and bug reports with `rg`.
2. Read every requirement in scope, including definitions and cross-references.
3. Inspect existing Maestro flows, `config.yaml`, subflows, tags, environment
   variables, app IDs, naming conventions, and nearby selectors.
4. Reuse the repository's workspace and support flows. Do not introduce a
   second Maestro layout unless explicitly requested.

Treat application source as selector and fixture context only. Never derive the
expected result from implementation behavior when it conflicts with or weakens
the SRS.

### 2. Convert prose into testable contracts

For each requirement, record:

- requirement ID and exact normative statement;
- preconditions and required fixture data;
- user action or triggering event;
- externally observable expected result;
- boundary values and forbidden outcomes;
- state that must remain unchanged;
- ambiguity or missing acceptance criteria.

Do not invent product rules. Report material ambiguity and test only the
unambiguous portion until clarification is available.

### 3. Design for defect detection

Read [references/test-design.md](references/test-design.md) before creating or
reviewing flows.

For every flow, name at least one plausible non-conforming implementation in
`@detects`. Ensure a Maestro assertion would fail for it. Cover boundaries,
negative paths, state transitions, cardinality, and persistence when supported
by the requirement.

Reject flows that only prove that:

- the app launched;
- an element existed before the action;
- a tap or input command completed;
- the application returned a value copied from the same UI;
- any error appeared when the SRS requires a specific outcome.

### 4. Implement the Maestro YAML flow

Follow repository placement and naming conventions. Otherwise, use
`tc-<number>-<behavior>.yaml`, one independently runnable requirement behavior
per top-level flow.

Place traceability comments before the configuration block:

```yaml
# @requirement FR-07
# @expected One cart row remains and its quantity becomes 2.
# @detects Duplicate rows or a quantity that is not incremented.
appId: ${APP_ID}
name: "FR-07 increments an existing cart row"
tags:
  - srs
  - regression
---
```

Use comments for traceability; do not add unknown keys to Maestro's
configuration block.

Implementation rules:

- Arrange deterministic state, act through the UI, then assert observable
  behavior.
- Use `launchApp: { clearState: true }` only when clearing local app state is
  compatible with the preconditions.
- Use `runFlow` for reusable setup such as login, but keep the requirement
  oracle visible in the top-level test flow.
- Use API or JavaScript setup only for fixtures and cleanup, never as a
  replacement for the UI behavior under test.
- Prefer `id`, then visible `text`, then relational selectors. Avoid `point`,
  broad regexes, and fragile `index` selectors unless the requirement itself
  concerns occurrence or order.
- Use Maestro's retrying assertions. Use `extendedWaitUntil` for genuinely long
  asynchronous transitions instead of timing assumptions.
- Assert both the required change and important forbidden side effects with
  `assertVisible`, `assertNotVisible`, or a non-tautological `assertTrue`.
- For exact-one cardinality, assert index `0` is visible and index `1` is not
  visible for a selector that uniquely identifies the row.
- Parameterize credentials, environment-specific IDs, and mutable test data.
  Do not commit secrets.
- Use unique fixture data and reset state so flows do not depend on execution
  order.
- Preserve an SRS-correct assertion even when the current application fails.
  Do not weaken or make it optional to keep the suite green.
- Quote strings that contain YAML-sensitive characters or values that could be
  coerced to booleans or numbers.
- Preserve UTF-8 text; do not replace localized labels with mojibake.

### 5. Validate

1. Run the bundled static quality gate:

   ```powershell
   node .agents/skills/maestro-srs-test-generator/scripts/validate-maestro-flows.mjs <flow-file-or-directory>
   ```

2. Run the smallest relevant Maestro flow when the CLI, application, backend,
   and device are available:

   ```powershell
   maestro test <flow.yaml>
   ```

3. When a workspace config is used, pass it explicitly and verify test
   discovery:

   ```powershell
   maestro test --config <config.yaml> <flow-or-directory>
   ```

4. Classify every execution failure using
   [references/test-design.md](references/test-design.md):
   `PRODUCT_DEFECT`, `TEST_DEFECT`, `ENVIRONMENT`, or `INCONCLUSIVE`.
5. Capture the failed command/assertion, expected and actual results,
   requirement ID, screenshots/debug artifacts, and exact reproduction command.
   Never report a product defect from infrastructure failure alone.

If Maestro is unavailable, complete static validation and state clearly that
the flow was not executed.

### 6. Report

Return:

- created or changed YAML flows and reusable subflows;
- a requirement-to-flow traceability table;
- the non-conformance each flow can detect;
- commands run and validation results;
- product failures separately from test and environment failures;
- uncovered or ambiguous requirements.

Do not claim generated flows detect arbitrary unknown bugs. State the specific
classes of SRS non-conformance their independent oracles can detect.
