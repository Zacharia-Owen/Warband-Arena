import { describe, expect, it } from 'vitest';
import { computeStats, validateLoadout, UNITS } from '../src';

describe('validateLoadout', () => {
    it('accepts a loadout exactly at the weight limit', () => {
        const r = validateLoadout({ unit: 'knight', itemIds: ['iron-sword', 'iron-armor', 'iron-shield'] })
        expect(r.valid).toBe(true);
        expect(r.totalWeight).toBe(20);
    });

    it('rejects a loadout exactly one point over the weight limit', () => {
        const r = validateLoadout({ unit: 'mage', itemIds: ['war-axe', 'maple-staff'] })
        expect(r.valid).toBe(false);
        expect(r.totalWeight).toBe(11);
        expect(r.errors.join()).toMatch(/Too heavy/);
    });

    it('rejects two items in the same slot', () => {
        const r = validateLoadout({ unit: 'knight', itemIds: ['war-axe', 'iron-sword'] })
        expect(r.valid).toBe(false);
        expect(r.errors.join()).toMatch(/Slot already filled: weapon/);
    });

    it('rejects unknown items and unknown unit classes', () => {
        expect(validateLoadout({ unit: 'knight', itemIds: ['apple-juice'] }).valid).toBe(false);
        // expected error as there is no ninja unit
        expect(validateLoadout({ unit: 'ninja' as never, itemIds: ['iron-sword'] }).valid).toBe(false);
    });

    it('does not treat objects.protoype keys as real items', () => {
        for (const id of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
            expect(validateLoadout({ unit: 'knight', itemIds: [id] }).valid).toBe(false);
        }
        // expected error as there is no constructor unit
        expect(validateLoadout({ unit: 'constructor' as never, itemIds: [] }).valid).toBe(false);
    });

    it('accepts an empty loadout', () => {
        expect(validateLoadout({ unit: 'knight', itemIds: [] }).valid).toBe(true);
    });
});

describe('computeStats', () => {
    it('returns base stats for an empty loudout', () => {
        expect(computeStats({ unit: 'knight', itemIds: [] })).toEqual(UNITS.knight.base);
    });

    it('adds item bonuses to base stats, including negative ones', () => {
        const s = computeStats({ unit: 'knight', itemIds: ['war-axe', 'iron-armor'] });
        expect(s).toEqual({ hp: 120, attack: 35, defense: 27, speed: 1 });
    });

    it('does not muutate the shared catalog', () => {
        const before = structuredClone(UNITS.knight.base);
        computeStats({ unit: 'knight', itemIds: ['war-axe'] });
        expect(UNITS.knight.base).toEqual(before);
    });

    it('throws and illegal loadout', () => {
        expect(() => computeStats({ unit: 'mage', itemIds: ['iron-armor', 'war-axe'] })).toThrow(/Invalid loadout/);
    })
})