import { describe, expect, it } from 'vitest';
import { computeStats, simulate, type Loadout } from '../src';

describe('simulate: damage floor', () => {
    it('a weak attacker never deals negative damage to a heavily armored target', () => {
        const weak: Loadout = { unit: 'healer', itemIds: [] };
        const tank: Loadout = { unit: 'knight', itemIds: ['iron-armor'] };

        // the floor only matters when attack - defense is lower than 0
        // if this fails its the scenario not the simulator 
        expect(computeStats(weak).attack - computeStats(tank).defense).toBeLessThan(0);

        let attacks = 0;
        for (let seed = 0; seed < 200; seed++) {
            for (const e of simulate([weak], [tank], seed).log){
                if (e.type === 'attack' && e.actor.startsWith('A')) {
                    attacks++;
                    expect(e.damage).toBeGreaterThanOrEqual(0);
                    expect(e.damage).toBeLessThanOrEqual(3);
                }
            }
        }
        expect(attacks).toBeGreaterThan(0);
    })
})