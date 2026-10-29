# ADR 0001: Battles are a pure seeded function

Status: accepted

## Context
Battles require some random elements like (damage variance, critical hits and so on). But it is also needed to be deterministic to reproduce bug reports, snapshot-testing combat, and eventually allow for replays to be shown.

## Decision
`simulate(teamA, teamB, seed)` is a pure function in `@warband/core`. All randomness comes from one seeded RNG (mulberry32), is consumed in a fixed order. No clock, no database and no `Math.random()` inside combat. The turn order is strictly determined by highest speed acts first and ties being broken by unit id. Inputs are never mutated.

## Consequences
- (+) Battles will be fully deterministic, allowing for reproducible results. Bug reports can be easily reproduced and fixed. Snapshot testing of combat scenarios will be possible. Replays can be generated and shown to users.
- (-) The seed must be generated unpredictably on the server side to avoid players being able to predict the outcome of battles.
- (-) Changing combat rules may alter the outcome of every old seed. Stored battles must keep their logs instead of re-simulating them or carry a rules version number to know which ruleset to use for re-simulation.

## Alternatives considered
- Using a non-deterministic approach with `Math.random()` or similar but would remove the ability to reproduce results and make testing more difficult.
- Using a different RNG algorithm, mulberry32 is not cryptographically secure which is fine for combat but the seed must come from a secure source.
- Randomizing turn order each round: still deterministic with a seeded RNG, but it would make the speed stat meaningless and add more RNG calls whose order has to stay fixed. A fixed order (speed, then id) is simpler to reason about and test.