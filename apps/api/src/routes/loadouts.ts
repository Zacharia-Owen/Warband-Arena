import { Router } from 'express';
import { validateLoadout, type Loadout } from '@warband/core';
import { loadoutSchema } from '../schemas';

export const loadoutsRouter = Router();

loadoutsRouter.post('/loadouts/validate', (req, res) => {
    const loadout = loadoutSchema.parse(req.body);
    res.json(validateLoadout(loadout as Loadout));
});