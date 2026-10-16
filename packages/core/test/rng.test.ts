import { describe, expect, it } from "vitest";
import { createRng } from "../src";

describe('createRng', () => {
    it('produces the same sequence for the same seed', () => {
        const a = createRng(123);
        const b = createRng(123);
        expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
    });

    it('produces different sequences for different seeds', () => {
        expect(createRng(1).next()).not.toEqual(createRng(2).next());
    });

    it('int() stays within inclusive bounds', () => {
        const rng = createRng(7);
        for (let i= 0; i < 1000; i++) {
            const n = rng.int(3, 6);
            expect(n).toBeGreaterThanOrEqual(3);
            expect(n).toBeLessThanOrEqual(6);
        }
    });

    it('int() eventually hits both endpoints', () => {
        const rng = createRng(99);
        const seen = new Set<number>();
        for (let i = 0; i < 500; i++) seen.add(rng.int(0, 3));
        expect(seen).toEqual(new Set([0, 1, 2, 3]));
    });
});