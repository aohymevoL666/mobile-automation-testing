# Designing Appium Tests That Detect SRS Violations

## Contents

1. Oracle rules
2. High-value test patterns
3. Mobile implementation guidance
4. Failure classification
5. Review checklist

## 1. Oracle rules

An oracle is the observable condition that decides whether the implementation
conforms to a requirement.

Build the oracle from normative SRS language:

| SRS wording | Test oracle |
|---|---|
| must display X | X is visible with the required value |
| must not allow X | X is rejected and protected state is unchanged |
| after N attempts | verify behavior at N-1 and N, not only one value |
| remains until X | verify persistence before X and transition after X |
| exactly one | assert cardinality equals one, not merely greater than zero |
| within T seconds | measure the observable event against the stated bound |

Prefer exact assertions over weak substitutes. For example, if the SRS requires
quantity `2`, use `toHaveText("2")`; do not use `toExist()` or merely check that
the cart opened.

Keep the oracle independent:

- Good: expected lockout threshold is the SRS constant `3`.
- Bad: read the threshold from the application's configuration and assert that
  the application follows its own value.
- Good: expected total is calculated from specified price and requested
  quantity.
- Bad: compare the displayed total with the same displayed total parsed twice.

## 2. High-value test patterns

### Boundary

Exercise `N-1`, `N`, and `N+1` where valid. This catches off-by-one errors,
wrong comparison operators, and increments larger than one.

### State transition

Assert the state before the action, perform the trigger, then assert both the
new state and forbidden old/extra states. This catches premature transitions,
missing transitions, and duplicate records.

### Negative behavior

Verify that prohibited input is rejected and that protected data remains
unchanged. An error message alone is insufficient if the forbidden operation
still occurred.

### Persistence

After the UI reports success, navigate away and back or relaunch when the SRS
requires persistence. This catches UI-only state updates and failed storage.

### Duplicate/idempotency

Repeat the same action and assert cardinality plus aggregate state. This catches
duplicate rows, double submissions, and non-idempotent retries.

### Recovery

Interrupt or retry an operation when supported by the requirement. Assert that
the app recovers without partial or duplicated state.

### Counterfactual check

Before finalizing a test, mentally mutate the implementation:

- change `>= N` to `> N`;
- increment by two;
- remove validation;
- skip persistence;
- perform the action twice;
- show a generic success/error without changing state.

The test is valuable only if at least one relevant assertion fails under the
plausible mutation named by `@detects`.

## 3. Mobile implementation guidance

- Prefer stable accessibility IDs and resource IDs.
- Wait for a state or element, not for an arbitrary duration.
- Give each test unique accounts, products, or identifiers when possible.
- Reset state before the scenario; do not depend on test execution order.
- Assert user-visible behavior through Appium. APIs may arrange fixtures and
  independently verify side effects only when justified.
- Capture screenshots and page source after an assertion failure when the
  runner supports hooks.
- Keep selectors and navigation in support/page-object modules; keep the
  requirement oracle visible in the spec.

## 4. Failure classification

### PRODUCT_DEFECT

Use only when the required preconditions were met, the UI action occurred, the
oracle is traceable to an unambiguous requirement, and the actual behavior
contradicts that oracle reproducibly.

### TEST_DEFECT

Use for invalid selectors, wrong fixtures, a mistaken oracle, race-prone test
logic, or a failure introduced by the test itself.

### ENVIRONMENT

Use for unavailable Appium/backend/Metro, disconnected devices, build/install
failure, port problems, or missing dependencies.

### INCONCLUSIVE

Use when evidence cannot distinguish the categories above. Gather page source,
screenshots, server logs, and rerun the smallest scenario before escalating.

## 5. Review checklist

- Is every test linked to a requirement ID?
- Does `@expected` describe an externally observable result?
- Does `@detects` name a concrete non-conforming behavior?
- Would the test fail for that behavior?
- Are boundary and forbidden outcomes asserted where relevant?
- Is state deterministic and independent of prior tests?
- Are selectors stable and waits condition-based?
- Is a known bug left red rather than encoded as the expected behavior?
- Can the failure be distinguished from environment and test defects?
- Is the exact reproduction command documented?
