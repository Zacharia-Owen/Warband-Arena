# Warband-Arena

A fantasy auto-battler where you assemble a team of units with different loadouts and watch two warbands fight. The game is deterministic, so you can replay a battle with the same seed and see the same outcome. Built as a full-stack portfolio project with testing as a first-class feature.

Status: core game logic and REST API are complete. Auth, a database, matchmaking, tournaments, and a frontend are planned but not yet implemented.

## What the project demonstrates
- Deterministic simulation: a battle is a pure function of its teams and a seed, so any fight can be replayed and snapshot-tested ([ADR 0001](docs/adr/0001-deterministic-simulator.md)).
- Shared game rules: one package (`@warband/core`) holds the rules. The API uses it today, and the planned frontend will too ([ADR 0002](docs/adr/0002-shared-rules-package.md)).
- A REST API that validates loadouts, simulates battles, and reports errors without leaking internals ([ADR 0003](docs/adr/0003-api-error-semantics.md)).
- A deliberate testing strategy:** boundary tests, invariants over many seeds, API contract tests, a regression snapshot, and manual mutation checks ([bug log](docs/bugs/README.md)).
- A team-style workflow:** tickets, branches, pull requests, and required CI checks.

## Layout
```
packages/core   Pure game logic: rules, stats, RNG, simulator (no framework dependencies)
apps/api        Express + TypeScript REST API (zod validation)
apps/web        React frontend (planned)
docs/adr        Architecture decision records: why things are built this way
docs/bugs       Break-and-fix log: injected bugs and what caught them
```

## Quick start
Requires Node 20 or newer.
```bash
git clone https://github.com/Zacharia-Owen/Warband-Arena
cd Warband-Arena
npm install
npm test            # all unit and API tests
npm run typecheck
npm run dev:api     # http://localhost:3000
```

Try a battle:
```bash
curl -X POST localhost:3000/api/battles/simulate -H 'Content-Type: application/json' -d '{"teamA":[{"unit":"knight","itemIds":["iron-sword"]}],"teamB":[{"unit":"assassin","itemIds":["iron-dagger"]}],"seed":42}'
```
Run it twice with the same seed and the result is identical. Omit `seed` and the server
picks one and returns it, so you can replay any fight.

## API
| Method and path | Purpose | Responses |
|---|---|---|
| `GET /health` | Liveness check | 200 |
| `GET /api/units` | List unit classes with base stats | 200 |
| `GET /api/items` | List items with slots, weights, and bonuses | 200 |
| `POST /api/loadouts/validate` | Check a loadout against the rules | 200 (`valid` true or false), 400, 413 |
| `POST /api/battles/simulate` | Run a battle (`teamA`, `teamB`, optional `seed`) | 200, 400, 413, 422 |

Unknown routes return a JSON 404, and unexpected errors return a generic 500.

## How battles work
[Edit this list to match your `simulator.ts`.]
- Units act in order of speed, fastest first, with ties broken by id.
- Each unit attacks a random living enemy for `attack - defense` (minimum 1) plus small random variance.
- [Class-specific rules: for example, mages ignore half of the target's defense, healers heal allies under 50% HP.]
- A fight ends when one team is wiped out, or after 50 rounds, when higher total HP wins.

Loadouts have a weight limit per unit and one item per slot. Loadouts store item IDs, never
item data, so clients cannot forge stats.

## Testing approach
| Kind | Example |
|---|---|
| Boundary tests | Exactly at and one over the weight limit |
| Data integrity | Every catalog key matches its own id |
| Property-style invariants | Across 200 seeds: HP never negative, dead units never act |
| Contract tests | The API returns exactly the documented fields |
| Regression snapshot | One known battle is pinned |
| Mutation checking | See [the bug log](docs/bugs/README.md): bugs injected on purpose, with what caught them |

## Roadmap
- [x] Core: units, loadout rules, seeded battle simulator
- [x] REST API with validation and error handling
- [x] CI on every PR
- [ ] Auth (JWT) and PostgreSQL persistence
- [ ] Crafting and inventory (transactions, race-condition tests)
- [ ] Matchmaking queue and ratings
- [ ] Tournament brackets
- [ ] Draft room (WebSockets)
- [ ] React frontend with a battle replay viewer
- [ ] End-to-end tests (Playwright)