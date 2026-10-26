import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

vi.mock('node:crypto', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:crypto')>();
    return{ ...actual, randomInt: vi.fn(() => 123456) };
});

import { randomInt } from 'node:crypto'
import { createApp } from '../src/app'

describe('server-generated seeds', async () => {
    it('come from crypto.randomInt over the full 32-bit range', async () => {
        const res = await request(createApp())
        .post('/api/battles/simulate')
        .send({
            teamA: [{ unit: 'knight', itemIds: [] }],
            teamB: [{ unit: 'assassin', itemIds: [] }],
        });
        expect(res.status).toBe(200);
        expect(res.body.seed).toBe(123456);
        expect(randomInt).toHaveBeenCalledWith(0, 2 ** 32)
    })
})
