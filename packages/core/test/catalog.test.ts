import { describe, it, expect } from 'vitest';
import { ITEMS, UNITS } from '../src';

describe('UNITS catalog', () => {
    it.each(Object.entries(UNITS))('%s: key matches its class and numbers are sane', (key, unit) => {
        expect(unit.class).toBe(key);
        expect(unit.base.hp).toBeGreaterThan(0);
        expect(unit.weightCapacity).toBeGreaterThan(0);
    });
});

describe('ITEMS catalog', () => {
    it.each(Object.entries(ITEMS))('%s: key matches its id and weight is positive', (key, item) => {
        expect(item.id).toBe(key);
        expect(item.weight).toBeGreaterThan(0);
    });

    it('every item is light enough for at least one unit to carry', () => {
        const maxCapacity = Math.max(...Object.values(UNITS).map((u) => u.weightCapacity));
        for (const item of Object.values(ITEMS)) {
            expect(item.weight).toBeLessThanOrEqual(maxCapacity);
        }
    });

    it('every slot has at least one item available', () => {
        const slots = new Set(Object.values(ITEMS).map((i) => i.slot));
        expect(slots).toEqual(new Set(['weapon', 'armor', 'keepsake']));
    })
})