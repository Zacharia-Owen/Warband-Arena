# ADR 0003: How the API reports problems, and who picks the seed

Status: accepted

## Context
The API has to answer questions like "is the following loadout legal?" and "simulate the battle", and it has to handle unexpected situations like a malformed request, a missing body, or a bug in the server code. The API must never leak internal details in its responses, but it must still be possible to reproduce any battle.

## Decision
Validation happens in two layers: zod checks the shape of a request, and core checks the game rules. All errors are mapped to responses in one error handler.

| Situation | Response |
|---|---|
| Valid loadout, or a rules violation on `POST /api/loadouts/validate` | 200, with `valid` true or false |
| Wrong shape, missing body, bad seed, malformed JSON | 400 |
| Body over the size limit | 413 |
| Well-formed battle request with an illegal loadout | 422 |
| Unknown route | 404 (JSON) |
| Anything unexpected | 500 with a generic message, and the details logged server-side |

Seeds are generated on the server with `crypto.randomInt` when the client does not
supply one, and the seed used is always returned so any battle can be replayed.

## Consequences
- (+) The validate endpoint answers its question successfully either way. The simulate endpoint refuses to perform an illegal request, hence 422.
- (+) Core stays the single source of truth for which units and items exist, so the API does not duplicate those lists in its schemas.
- (+) 500 responses cannot leak internals such as paths, SQL, or secrets.
- (-) Clients may choose their own seed. That is useful for replays and testing, but ranked matches must use server-chosen seeds only, or a player could search for a winning seed.
- (-) The source of a seed (crypto vs clock) cannot be observed from outside, so a test mocks `crypto.randomInt` to prove it is used.

## Alternatives considered
- Returning 4xx for an illegal loadout on the validate endpoint: it would make "is this legal?" look like a failed request when it is a successful answer.
- `z.enum` of unit classes in the API schema: stricter, but duplicates the catalog and breaks the moment a class is added.