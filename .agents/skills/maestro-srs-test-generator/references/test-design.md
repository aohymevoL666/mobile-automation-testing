# Designing Maestro Flows That Detect SRS Violations

## Contents

1. Oracle rules
2. Translating contracts to Maestro
3. High-value patterns
4. Reliability and maintainability
5. Failure classification
6. Review checklist

## 1. Oracle rules

An oracle is the observable condition that decides whether the application
conforms to a requirement. Build it from normative SRS language.

| SRS wording | Maestro oracle |
|---|---|
| must display X | `assertVisible` with the required text, ID, and state |
| must not allow X | reject X and assert protected state remains unchanged |
| after N attempts | verify N-1 and N, not only one arbitrary attempt |
| remains until X | assert persistence before X and transition after X |
| exactly one | assert occurrence index 0 visible and index 1 not visible |
| is disabled until X | assert `enabled: false`, perform X, then assert `enabled: true` |
| value equals X | copy the displayed value and use a labeled, independent `assertTrue`, or assert exact text |
| within T seconds | use a requirement-derived timeout and assert the target state |

Prefer exact assertions. If the SRS requires quantity `2`, assert the quantity
element shows `2`; do not merely assert that the cart screen is visible.

Keep the oracle independent:

- Good: encode the SRS lockout threshold of three in the scenario.
- Bad: read the application's threshold and assert the application follows it.
- Good: compute a total from specified price and requested quantity.
- Bad: copy the displayed total twice and compare it with itself.

## 2. Translating contracts to Maestro

### Traceability metadata

Use YAML comments so Maestro ignores metadata safely:

```yaml
# @requirement FR-02
# @expected A correct password succeeds after two failed attempts.
# @detects Premature lockout after the second failed attempt.
```

Keep each value on one line so static tooling and reports can extract it.

### Flow header

Use a meaningful `name` and searchable tags:

```yaml
appId: ${APP_ID}
name: "FR-02 permits login before the lockout threshold"
tags:
  - srs
  - authentication
  - regression
---
```

Use `env` only for non-secret defaults. Inject credentials and
environment-specific values through Maestro parameters or Studio environments.

### Arrange, act, assert

Make phases visible with concise comments:

```yaml
# Arrange
- launchApp:
    clearState: true
- runFlow:
    file: ../../support/register-user.yaml
    env:
      EMAIL: ${TEST_EMAIL}

# Act
- runFlow:
    file: ../../support/login.yaml
    env:
      EMAIL: ${TEST_EMAIL}
      PASSWORD: ${CORRECT_PASSWORD}

# Assert
- assertVisible: "Product list"
- assertNotVisible: "Account locked"
```

Keep setup subflows reusable, but keep the decisive requirement assertions in
the top-level flow.

### Selector strategy

Prefer selectors in this order:

1. stable accessibility/resource `id`;
2. exact user-visible `text`;
3. scoped relational selectors such as `childOf` or `containsDescendants`;
4. `index` only for explicit position/cardinality cases;
5. `point` only when no accessible selector is possible, with a warning in the
   handoff.

Maestro treats `text` and `id` as regular expressions. Escape metacharacters
and avoid patterns like `.*` when a precise selector exists.

### Exact cardinality

When each row exposes the same stable ID pattern, prove exactly one:

```yaml
- assertVisible:
    id: "cart-item-42"
    index: 0
- assertNotVisible:
    id: "cart-item-42"
    index: 1
```

Do not use this pattern when the selector can also match descendants inside the
same row. First choose an ID that uniquely identifies the row container.

### Values and calculations

Use `copyTextFrom`, save the copied value immediately, and assert against an
SRS-derived value:

```yaml
- copyTextFrom:
    id: "cart-total"
- evalScript: ${output.actualTotal = maestro.copiedText}
- assertTrue:
    condition: ${output.actualTotal == EXPECTED_TOTAL}
    label: "Cart total equals the SRS-derived expected total"
```

Never compare a value to itself or calculate the expected value from the same
displayed output under test.

## 3. High-value patterns

### Boundary

Exercise N-1, N, and N+1 where meaningful. This catches off-by-one comparisons
and incorrect increments.

### State transition

Assert the starting state, trigger the transition, then assert the required new
state and absence of forbidden old or duplicate states.

### Negative behavior

Assert the prohibited operation did not change protected state. An error label
alone is insufficient if the forbidden operation still occurred.

### Persistence

Navigate away and back, or stop and relaunch the app when the SRS requires
persistence. Choose relaunch options that preserve the state being tested.

### Duplicate and idempotency

Repeat the same action, then assert cardinality and aggregate state. This
catches duplicate rows, double submission, and incorrect retry behavior.

### Counterfactual check

Before finalizing, mentally mutate the application:

- change `>= N` to `> N`;
- increment by two;
- remove validation;
- update only visible UI state without persistence;
- perform the operation twice;
- show a generic success or error without the required state change.

Keep the flow only if a relevant assertion fails for the non-conformance named
in `@detects`.

## 4. Reliability and maintainability

- Let `assertVisible` and `assertNotVisible` use their built-in retry behavior.
- Use `extendedWaitUntil` only when the system has a legitimately longer
  transition; derive the timeout from the requirement or known service bound.
- Do not add timing commands to conceal nondeterministic setup.
- Use `runFlow` to reuse navigation and setup, not to hide the oracle.
- Give each flow independent data and cleanup.
- Treat localization-sensitive text as an explicit environment concern; prefer
  stable IDs when the same flow runs across locales.
- Use `retryTapIfNoChange` only for a known UI responsiveness issue. It can
  repeat a non-idempotent action, so do not enable it blindly.
- Keep generated YAML UTF-8 and review non-ASCII labels visually.

## 5. Failure classification

### PRODUCT_DEFECT

Use only when preconditions were met, the user action occurred, the oracle is
traceable to an unambiguous requirement, and actual behavior reproducibly
contradicts it.

### TEST_DEFECT

Use for invalid YAML, wrong selectors, bad fixtures, a mistaken oracle,
incorrect flow composition, or race-prone test logic.

### ENVIRONMENT

Use for unavailable Maestro/backend/Metro, disconnected devices, build or
install failures, network problems, and missing environment parameters.

### INCONCLUSIVE

Use when evidence cannot distinguish the categories. Inspect Maestro debug
artifacts, screenshots, hierarchy, backend logs, and rerun the smallest flow.

## 6. Review checklist

- Is every top-level test linked to a requirement ID?
- Does `@expected` state an externally observable result?
- Does `@detects` name a concrete non-conforming behavior?
- Would an assertion actually fail for that behavior?
- Are forbidden side effects and boundaries asserted?
- Is state deterministic and independent of test order?
- Are selectors stable, scoped, and precise?
- Are credentials and environment data parameterized?
- Is the requirement oracle visible in the top-level flow?
- Is a known product bug left red rather than encoded as expected behavior?
- Can failures be separated from test and environment defects?
- Is the exact reproduction command documented?

## Official Maestro references

- Flows: <https://docs.maestro.dev/maestro-flows>
- Selectors: <https://docs.maestro.dev/api-reference/selectors>
- Parameters and constants:
  <https://docs.maestro.dev/advanced/parameters-and-constants>
- Test discovery and tags:
  <https://docs.maestro.dev/maestro-flows/workspace-management/test-discovery-and-tags>
