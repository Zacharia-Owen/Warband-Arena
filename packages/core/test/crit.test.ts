import { describe, expect, it } from 'vitest';
import { computeStats, simulate, type Loadout} from '../src';

const CRIT_CLASS = 'assassin';
const attacker: Loadout = { unit: CRIT_CLASS, itemIds: [] };
const noCritAttacker: Loadout = { unit: 'knight', itemIds: [] };
const target: Loadout = { unit: 'knight', itemIds:[] }; // the fixed target so damage test is the same

// all attack events by team A across seed battles
function attacksBy(unit: Loadout) {
    const attacks: { damage: number; crit: boolean }[] = [];
    for (let seed = 0; seed < 200; seed++) {
        for (const e of simulate([unit], [target], seed).log) {
            if (e.type === 'attack' && e.actor.startsWith('A')) attacks.push({ damage: e.damage, crit: e.crit });
        }
    }
    return attacks;
}

describe('simulate: crit rule', () => {
    it('the crit class crits about 25% of the time', () => {
        const attacks = attacksBy(attacker);
        const rate = attacks.filter((a) => a.crit).length / attacks.length;
        expect(attacks.length).toBeGreaterThan(500);
        expect(rate).toBeGreaterThan(0.2);
        expect(rate).toBeLessThan(0.3);
    });

    it('a crit does double damage', () => {
        const attacks = attacksBy(attacker);
        const normal = attacks.filter((a) => !a.crit).map((a) => a.damage);
        const crits = attacks.filter((a) => a.crit).map((a) => a.damage);
        expect(crits.length).toBeGreaterThan(0);
        // Normal hits are base + variance. Crits are double that, so they live in exactly twice the range.
        expect(Math.min(...crits)).toBeGreaterThanOrEqual(2 * Math.min(...normal))
        expect(Math.min(...crits)).toBeLessThanOrEqual(2 * Math.min(...normal))
        expect(Math.min(...crits)).toBeGreaterThan(Math.min(...normal))
    });

    it('classes without the crit rule never crit', () => {
        const attacks = attacksBy(noCritAttacker);
        expect(attacks.length).toBeGreaterThan(0);
        expect(attacks.filter((a) => a.crit)).toEqual([]);
    })
})