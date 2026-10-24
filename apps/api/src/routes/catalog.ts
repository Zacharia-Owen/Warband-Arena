import { Router } from 'express'
import { ITEMS, UNITS } from '@warband/core'

export const catalogRouter = Router();

catalogRouter.get('/units', (_req, res) => {
    res.json(Object.values(UNITS));
});

catalogRouter.get('/items', (_req, res) => {
    res.json(Object.values(ITEMS));
});