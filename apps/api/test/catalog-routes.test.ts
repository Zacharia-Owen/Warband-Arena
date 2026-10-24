import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

const app = createApp();

describe('GET /api/units', () => {
    it('returns all five unit classes as JSON', async () => {
        const res = await request(app).get('/api/units');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/application\/json/);
        const classes = res.body.map((u: { class: string }) => u.class).sort();
        expect(classes).toEqual(['archer', 'assassin', 'healer', 'knight', 'mage'])
    });

    it('gives each unit exactly the fields clients rely on', async () => {
        const res = await request(app).get('/api/units');
        for (const unit of res.body) {
            expect(unit).toEqual({
                class: expect.any(String),
                name: expect.any(String),
                weightCapacity: expect.any(Number),
                base: {
                    hp: expect.any(Number),
                    attack: expect.any(Number),
                    defense: expect.any(Number),
                    speed: expect.any(Number),
                },
            });
        }
    });
});

describe('GET /api/items', () => {
    it('returns items covering every slot', async () => {
        const res = await request(app).get('/api/items');
        expect(res.status).toBe(200);
        const slots = new Set(res.body.map((i: { slot: string }) => i.slot))
        expect(slots).toEqual(new Set(['weapon', 'armor', 'keepsake']));
    });

    it('gives each item exactly the fields clients rely on', async () => {
        const res = await request(app).get('/api/items');
        for (const item of res.body) {
            expect(item).toEqual({
                id: expect.any(String),
                name: expect.any(String),
                slot: expect.stringMatching(/^(weapon|armor|keepsake)$/),
                weight: expect.any(Number),
                bonus: expect.any(Object)
            });
        }
    });

    it('has unique item ids', async () => {
        const res = await request(app).get('/api/items');
        const ids = res.body.map((i: { id: string }) => i.id);
        expect(new Set(ids).size).toBe(ids.length)
    });
});