import { describe, expect, it } from 'vitest';
import { InvalidBattleError, simulate, type Loadout } from '../src';

const knight: Loadout = { unit: 'knight', itemIds: ['iron-sword', 'iron-armor', 'iron-shield'] };
const archer: Loadout = { unit: 'archer', itemIds: ['short-maple-bow', 'leather-armor'] };
const mage: Loadout = { unit: 'mage', itemIds: ['maple-staff', 'cloth-robe'] };
const assassin: Loadout = { unit: 'assassin', itemIds: ['iron-dagger', 'leather-armor', 'swiftness-boots'] };
const healer: Loadout = { unit: 'healer', itemIds: ['maple-staff', 'cloth-robe', 'healing-talisman'] };
const cheater: Loadout = { unit: 'mage', itemIds: ['war-axe', 'iron-armor', 'iron-shield'] };

describe('simulate: determinism', () => {
    it('returns identical results for identical inputs and seed', () => {
        const a = simulate([knight, archer], [mage, healer], 42);
        const b = simulate([knight, archer], [mage, healer], 42);
        expect(a).toEqual(b);
    });

    it('does not mutate its inputs', () => {
        const teamA: Loadout[] = [{ unit: 'assassin', itemIds: [] }, knight, mage];
        const teamB: Loadout[] = [healer, {unit: 'assassin', itemIds: []}];
        const teamACopy = [...teamA];
        const teamBCopy = [...teamB];
        simulate(teamA, teamB, 1);
        expect(teamA).toEqual(teamACopy);
        expect(teamB).toEqual(teamBCopy);
    });

    it('different seeds can produce different results', () => {
        const logs = new Set<string>();
        for (let seed = 0; seed < 20; seed++) {
            logs.add(JSON.stringify(simulate([knight, archer], [mage, healer], seed)));
        }
        expect(logs.size).toBeGreaterThan(1);
    })
})

describe('simulate: validation', () => {
    it('rejects empty teams and oversized teams', () => {
        expect(() => simulate([], [knight], 1)).toThrow(InvalidBattleError);
        expect(() => simulate([knight], [], 1)).toThrow(InvalidBattleError);
    });

    it('rejects illegal loadouts before any combat begins', () => {
        expect(() => simulate([cheater], [knight], 1)).toThrow(/Too heavy/);
    });

    it('reports problems for both teams at once', () => {
        let error: unknown;
        try {
            simulate([cheater], [cheater], 1);
        } catch (e) {
            error = e;
        }
        expect(error).toBeInstanceOf(InvalidBattleError);
        expect((error as InvalidBattleError).problems).toHaveLength(2);
    });
});