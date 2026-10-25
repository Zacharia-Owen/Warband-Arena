import express from 'express'
import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app'
import { errorHandler } from '../src/errors'

afterEach(() => vi.restoreAllMocks());

describe('error handling', () => {
    it('returns a JSON 404 for unknown routes', async () => {
        const res = await request(createApp()).get('/api/nope')
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Not found' });
    });

    it('turns unexpected errors into a 500 without leaking details', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});  // keeping test output quiet
        const app = express();
        app.get('/boom', () => {
            throw new Error('secret database password')
        });
        app.use(errorHandler);

        const res = await request(app).get('/boom');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Internal server error '});
        expect(JSON.stringify(res.body)).not.toContain('secret');
    });
});