import { Router } from 'express';
import { z } from 'zod';
import { validateLoadout, type Loadout } from '@warband/core';

export const loadoutsRouter = Router();

const loadoutSchema = z.object({
    unit: z.string().max(50),
    itemIds: z.array(z.string().max(50)).max(10),
});

loadoutsRouter.post('/loadouts/validate', (req, res) => {
    const loadout = loadoutSchema.parse(req.body);
    res.json(validateLoadout(loadout as Loadout));
});