import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

const app = createApp();
const post = (body?: unknown) => request(app).post('/api/loadouts/validate').send(body as object);

describe('POST /loadouts/validate', () => {
    it('reports a legal loadout as valid', async () => {
        const res = await post({ unit: 'knight', itemIds: ['iron-sword', 'iron-armor']});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ valid: true, errors: [], totalWeight: expect.any(Number) });
    });

    it('reports a rules violation as valid:false with a 200, not an HTTP error', async () => {
        const res = await post({ unit: 'mage', itemIds: ['iron-armor', 'war-axe'] });
        expect(res.status).toBe(200);
        expect(res.body.valid).toBe(false);
        expect(res.body.errors.join()).toMatch(/Too heavy/);
    });

    it('lets core decide about unknown unit classes and item ids', async () => {
        const unit = await post({ unit: 'ninja', itemIds: [] });
        expect(unit.status).toBe(200);
        expect(unit.body.valid).toBe(false);

        const proto = await post({ unit: 'knight', itemIds: ['constructor'] });
        expect(unit.status).toBe(200);
        expect(unit.body.valid).toBe(false);
    });

    it('400s when the shape is wrong', async () => {
        const res = await post({ unit: '5', itemIds: 'nope' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Bad request')
        expect(res.body.issues.length).toBeGreaterThan(0);
    });

    it('400s when there is no body at all', async () => {
        const res = await request(app).post('/api/loadouts/validate');
        expect(res.status).toBe(400);
    });

    it('400s on malformed JSON', async () => {
        const res = await request(app)
        .post('/api/loadouts/validate')
        .set('Content-Type', 'application/json')
        .send('{not json}');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Malformed JSON');
    });

    it('400s when there too many items', async () => {
        const res = await post({ unit: 'knight', itemIds: Array(11).fill('iron-sword') });
        expect(res.status).toBe(400);
    });

    it('returns 413 for an oversized body', async () => {
        const res = await post({ unit: 'knight', itemIds: Array(2000).fill('iron-sword') });
        expect(res.status).toBe(413);
    });
});