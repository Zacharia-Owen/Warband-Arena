# Break-and-fix log

Each round: create a branch `bug/<name>`, inject the bug, push, and watch CI. Then copy
`TEMPLATE.md` into this folder and answer three questions:
1. Did CI catch it? If not, which test was missing? (Add it.)
2. What was the root cause?
3. What was the fix, and how does the new test prevent a repeat?

## Bug menu

### Already caught (verified by mutation)
| Inject this | Caught by |
|---|---|
| Replace `Object.hasOwn(ITEMS, id)` with plain `ITEMS[id]` | core: "does not treat Object.prototype keys as real items" |
| Change `>` to `>=` in the weight check | core: "exactly at the weight limit" |
| Use `Math.random()` for the crit roll | core: determinism test and snapshot |
| Seed the RNG from `Date.now()` in the simulator | core: determinism test and snapshot |
| Sort an input team array in place | core: "does not mutate its inputs" |
| Remove the `{ ...base }` copy in `computeStats` | core: "does not mutate the shared catalog" |
| Remove the dead-actor guard in the battle loop | core: "dead units never act" |
| Remove the `InvalidBattleError` branch in the error handler | api: 422 test |
| Send `err.message` in the 500 response | api: "without leaking details" |
| Remove the body size limit | api: 413 test |
| Replace `z.string()` for `unit` with a hardcoded `z.enum` | api: "lets core decide about unknown unit classes" |
| Generate seeds from the clock instead of `crypto.randomInt` | api: battles-seed test (needs the crypto mock) |
| Swap `teamA` and `teamB` in the simulate route | api: "same as core" and 422 tests |

### Weakly caught (only the snapshot notices)
| Inject this | What to improve |
|---|---|
| Remove the `Math.max(1, ...)` minimum-damage floor | The "at least 1 damage" invariant uses a matchup where the floor is never needed. Use a weak attacker against a tanky target. |
| Disable the crit rule | No test checks crit behavior directly. Add one. |

### Not caught: write the test first, then fix
| Inject this | Why it slips through |
|---|---|
| Remove the `Math.min` cap on healing (overheal) | Nothing checks that HP stays at or below max after a heal |
| Change the healer's 50% threshold so it heals anyone | No test covers when a healer chooses to heal |
| Log the wrong `targetHp` on heal events | Heal log entries are never asserted on |
| Remove the `Math.max` stat floors in `computeStats` | No catalog item can trigger them. Test with a fake item or delete the code. |


## What this log taught me about my own tests
- A passing test can be testing nothing. My first reproducibility test passed even when the endpoint didn't exist, because two identical 404 bodies are equal. Fix: also assert the status code.
- Coverage is not protection. Line coverage on core reads 100%, yet four injected bugs still pass. The code runs, but nothing asserts on it.
- Test data has to be able to fail. My "does not mutate inputs" test used a team of one, so sorting it changed nothing. Fix: several units with different gear.
- Some properties can't be seen from outside. Whether a seed came from `crypto` or the clock needed a mock to prove.