import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { MAX_ROUNDS, simulate, type Loadout } from '@warband/core'
import { createApp } from '../src/app'

const app = createApp();
const post = (body?: unknown) => request(app).post('/api/battles/simulate').send(body as object);

const knight: Loadout = { unit: 'knight', itemIds: ['iron-sword', 'iron-armor'] };
const assassin: Loadout = { unit: 'assassin', itemIds: ['iron-dagger', 'leather-armor'] };
const cheater: Loadout = { unit: 'mage', itemIds: ['iron-armor', 'war-axe'] };

describe('POST /api/battles/simulate', () => {
    it('returns a complete battle result', async () => {
        const res = await post({ teamA: [knight], teamB: [assassin], seed: 42 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            seed: 42,
            winner: expect.stringMatching(/^(A|B|draw)$/),
            rounds: expect.any(Number),
            log: expect.any(Array),
            survivors: expect.any(Array),
        });
        expect(res.body.rounds).toBeLessThanOrEqual(MAX_ROUNDS);
    });

    it('returns exactly what the core simulator returns for the same input', async () => {
        const res = await post({ teamA: [knight], teamB: [assassin], seed: 42 });
        expect(res.body).toEqual(JSON.parse(JSON.stringify(simulate([knight], [assassin], 42 ))));
    });

    it('is reproductible when a seed is supplied', async () => {
        const body = { teamA: [knight], teamB: [assassin], seed: 7};
        const a = await post(body);
        const b = await post(body);
        expect(a.status).toBe(200);
        expect(b.status).toBe(200);
        expect(a.body).toEqual(b.body);
    });

    it('generates a seed when none is given, and that seed replays the same battle', async () =>{
        const first = await post({ teamA: [knight], teamB: [assassin] });
        expect(first.status).toBe(200);
        const seed: number = first.body.seed;
        expect(Number.isInteger(seed)).toBe(true);
        expect(seed).toBeGreaterThanOrEqual(0);
        expect(seed).toBeLessThan(2 ** 32);

        const replay = await post({ teamA: [knight], teamB: [assassin], seed });
        expect(replay.body).toEqual(first.body);
    });

    it('generates different seeds on dfifferent requests', async () => {
        const seeds = new Set<number>();
        for (let i = 0; i < 5; i++) {
            seeds.add((await post({ teamA: [knight], teamB: [assassin] })).body.seed);
        }
        expect(seeds.size).toBeGreaterThan(1);
    });

    it('422s on an illegal loadout and says which team and unit', async () => {
        const res = await post({ teamA: [knight], teamB: [cheater], seed: 1 });
        expect(res.status).toBe(422);
        expect(res.body.error).toBe('Invalid battle');
        expect(res.body.problems.join()).toMatch(/Team B unit 1: Too heavy/);
    });

    it('400s on a bad seed', async () => {
        for (const seed of [-1, 1.5, 2 ** 32, '42']) {
            const res = await post({ teamA: [knight], teamB: [assassin], seed });
            expect(res.status).toBe(400);
        }
    });

    it('400s on missing, empty, or oversized teams', async () => {
        expect((await post({ teamA: [knight] })).status).toBe(400);
        expect((await post({ teamA: [], teamB: [assassin] })).status).toBe(400);
        expect((await post({ teamA: [knight, knight, knight, knight, knight], teamB: [assassin] })).status).toBe(400);
    });
});