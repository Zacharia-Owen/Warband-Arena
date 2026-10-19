import { describe, expect, it } from 'vitest';
import { InvalidBattleError, simulate, type Loadout } from '../src';

const knight: Loadout = { unit: 'knight', itemIds: ['iron-sword', 'iron-armor', 'iron-shield'] };
const cheater: Loadout = { unit: 'mage', itemIds: ['war-axe', 'iron-armor', 'iron-shield'] };

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