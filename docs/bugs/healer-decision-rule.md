# Bug: Healer waited until allies were nearly dead to heal

- Branch: bug/healer-decision-rule
- Layer: core
- Caught by CI? no

## Symptom
Healers were healing far too late. Nothing failed

## Root cause
Injected an artificial error to simulate the bug so the healer was healing when an ally was at 10% and not 50% HP.

## Fix
Put it back to a 0.5 threshold

## Regression test
`healer.test.ts` replays each battle log. At every healer turn it checks the rule: if any living ally is below 50% HP, the healer must heal the most hurt one, and otherwise it must attack. Against the 10% threshold it failed, because the healer attacked while an ally was between 10% and 50%.


## What would have caught this sooner?
A test of the healer's decision rule itself. General invariants can't see this, since they hold whether or not the healer makes good decisions.