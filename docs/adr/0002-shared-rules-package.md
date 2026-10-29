# ADR 0002: Game rules live in a shared package

Status: accepted

## Context
The API, and the frontend and matchmaking should all agree upon what a legal loadout is preventing from each interpreting the rules differently. Re-implementing the rules in each place would cause them to drift apart.

## Decision
Loadout validation, stat computation, and the simulator live in `@warband/core`, a workspace package that has no dependencies on any framework. The API is importing it, loadouts are storing itemIds, not item objects, preventing clients from forging stats.

## Consequences
- (+) The UI and server cannot disagree about what a legal loadout is.
- (+) Core tests run fast because they involve no HTTP and no database.
- (+) Constants like `MAX_TEAM_SIZE` have one source of truth. The API imports them instead of repeating numbers or lists of unit classes.
- (-) The package's `main` points at TypeScript source. That is simple in development but needs a build step before deploying.
- (-) A monorepo is a bigger repository and needs a little more configuration than separate repos.

## Alternatives considered
- Separate repos with a published package: independent, but sharing rules means publishing and versioning a package for every change.
- Duplicating the rules in each app: simplest at first, but they drift apart.