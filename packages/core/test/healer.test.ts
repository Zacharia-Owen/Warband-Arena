import { describe, expect, it } from 'vitest';
import { computeStats, simulate, type Loadout} from '../src';

const knight: Loadout = { unit: 'knight', itemIds: ['iron-sword', 'iron-armor'] };
const bareKnight: Loadout = { unit: 'knight', itemIds: [] };
const assassin: Loadout = { unit: 'assassin', itemIds: ['leather-armor', 'swiftness-boots'] };
const healer: Loadout = { unit: 'healer', itemIds: ['cloth-robe', 'amulet-of-protection'] };
const bareHealer: Loadout = { unit: 'healer', itemIds: [] };



function loadoutById(teamA: Loadout[], teamB: Loadout[]) {
    const map = new Map<string, Loadout>();
    teamA.forEach((l, i) => map.set(`A${i + 1}-${l.unit}`, l)); 
    teamB.forEach((l, i) => map.set(`B${i + 1}-${l.unit}`, l));
    return map;
}


describe('simulate: healer behavior', () => {
    it('never heals when nobody is below half HP', () => {
        for (let seed = 0; seed < 200; seed++) {
            const r = simulate([knight, healer], [bareHealer], seed);
            expect(r.log.filter((e) => e.type === 'heal' && e.actor.startsWith('A'))).toEqual([]);
        }
    });

    it('heals allies who are below half HP, and only them', () => {
        const teamA = [bareKnight, healer];
        const teamB = [assassin, assassin];
        const loadouts = loadoutById(teamA, teamB);
        let heals = 0;
        for (let seed = 0; seed < 200; seed++) {
            for (const e of simulate(teamA, teamB, seed).log) {
                if (e.type !== 'heal') continue;
                heals++;
                const maxHp = computeStats(loadouts.get(e.target)!).hp;
                const hpBefore = e.targetHp - e.amount;
                expect(hpBefore).toBeLessThan(maxHp * 0.5);
                expect(e.amount).toBeGreaterThan(0);
            }
        }
        expect(heals).toBeGreaterThan(0);
    });
});

describe('simulate: healer decision rule (replayed from the log)', () => {
    it('heals the most hurt ally below half HP whenever there is one, and attacks otherwise', () => {
        const teamA = [bareKnight, healer];
        const teamB = [assassin, assassin];
        const loadouts = loadoutById(teamA, teamB);
        const maxHp = (id: string) => computeStats(loadouts.get(id)!).hp;
        let healsChecked = 0;
        let attacksChecked = 0;

        for (let seed = 0; seed < 200; seed++) {
            const r = simulate(teamA, teamB, seed);
            const hp = new Map<string, number>([...loadouts.keys()].map((id) => [id, maxHp(id)]));

            for (const e of r.log) {
                if (e.actor.endsWith('-healer')) {
                    const side = e.actor[0];
                    const eligible = [...hp.entries()].filter(([id, h]) => id[0] === side && h > 0 && h < maxHp(id) * 0.5);
                    if (eligible.length > 0) {
                        expect(e.type).toBe('heal');
                        const ratios = eligible.map(([id, h]) => h / maxHp(id));
                        const chosen = hp.get(e.target)! / maxHp(e.target);
                        expect(chosen).toBeCloseTo(Math.min(...ratios), 10);
                        healsChecked++;
                    } else {
                        expect(e.type).toBe('attack');
                        attacksChecked++
                    }
                }
                hp.set(e.target, e.targetHp);
            }
        }
        expect(healsChecked).toBeGreaterThan(0);
        expect(attacksChecked).toBeGreaterThan(0);
    });
});