import { describe, expect, it } from 'vitest';
import { InvalidBattleError, MAX_ROUNDS, simulate, type Loadout } from '../src';

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

describe('simulate: invariants(holding for every seed)', () => {
    const seeds = Array.from({ length: 200 }, (_, i) => i);

    it('always finishes within MAX_ROUNDS and HP will never be negative', () => {
        for (const seed of seeds) {
            const r = simulate([knight, mage, healer], [archer, assassin, knight], seed);
            expect(r.rounds).toBeLessThanOrEqual(MAX_ROUNDS);
            for (const e of r.log) {
                expect(e.targetHp).toBeGreaterThanOrEqual(0);
            }
        }
    });

    it('a winner has survirvors, and only their own side (or round cap ended)', () => {
        for (const seed of seeds) {
            const r = simulate([knight, mage], [archer, assassin], seed);
            if (r.rounds < MAX_ROUNDS && r.winner !== 'draw') {
                expect(r.survivors.length).toBeGreaterThan(0);
                expect(r.survivors.every((s) => s.id.startsWith(r.winner))).toBe(true);
            }
        }
    });

    it('dead units never act again', () => {
        for (const seed of seeds) {
            const dead = new Set<string>();
            for (const e of simulate([knight, mage], [archer, assassin], seed).log) {
                expect(dead.has(e.actor)).toBe(false);
                if (e.type === 'attack' && e.defeated) dead.add(e.target);
            }
        }
    });

    it('every attack does at least 1 damage', () => {
        for (const seed of seeds) {
            for (const e of simulate([knight], [assassin], seed).log) {
                if (e.type === 'attack') expect(e.damage).toBeGreaterThanOrEqual(1);
            }
        }
    });
})

describe('simulate: class rules', () => {
    it('the fastest unit acts first)', () => {
        for (let seed = 0; seed < 50; seed++) {
            const r = simulate([knight, mage], [assassin, healer], seed);
            expect(r.log[0]?.actor).toBe('B1-assassin');
        }
    });

    it('mage attacks ignore half of the target defense', () => {
        const tank: Loadout = { unit: 'knight', itemIds: ['iron-armor'] };
        const r = simulate([mage], [tank], 5);
        let mageHits = 0;
        for (const e of r.log) {
            if (e.type === 'attack' && e.actor.startsWith('A')) {
                mageHits++;
                expect(e.damage).toBeGreaterThanOrEqual(15);
            }
        }
        expect(mageHits).toBeGreaterThan(0);
    });
});

describe('simulate: damage variance', () => {
  it('varies between hits but stays within the 0-3 variance range', () => {
    const bareHealer: Loadout = { unit: 'healer', itemIds: [] };
    const damages = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      for (const e of simulate([knight], [bareHealer], seed).log) {
        // Knights never crit, and the target never changes, so every hit shares one base damage.
        if (e.type === 'attack' && e.actor.startsWith('A')) damages.add(e.damage);
      }
    }
    expect(damages.size).toBeGreaterThan(1);
    expect(Math.max(...damages) - Math.min(...damages)).toBeLessThanOrEqual(3);
  });
});

describe('simulate: regression snapshots', () => {
    it('matches snapshot for seed 42', () => {
        const r = simulate([knight], [assassin], 42);
        expect({ winner: r.winner, rounds: r.rounds, events: r.log.length, firstEvents: r.log.slice(0, 3) }).toMatchInlineSnapshot(`
          {
            "events": 10,
            "firstEvents": [
              {
                "actor": "B1-assassin",
                "crit": false,
                "damage": 4,
                "defeated": false,
                "round": 1,
                "target": "A1-knight",
                "targetHp": 116,
                "type": "attack",
              },
              {
                "actor": "A1-knight",
                "crit": false,
                "damage": 14,
                "defeated": false,
                "round": 1,
                "target": "B1-assassin",
                "targetHp": 56,
                "type": "attack",
              },
              {
                "actor": "B1-assassin",
                "crit": false,
                "damage": 4,
                "defeated": false,
                "round": 2,
                "target": "A1-knight",
                "targetHp": 112,
                "type": "attack",
              },
            ],
            "rounds": 5,
            "winner": "A",
          }
        `);
    });
});

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