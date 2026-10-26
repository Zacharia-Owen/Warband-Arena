import { randomInt } from "node:crypto"
import { Router } from "express"
import { z } from 'zod'
import { MAX_TEAM_SIZE, simulate, type Loadout } from "@warband/core"
import { loadoutSchema } from "../schemas"

export const battleRouter = Router();

const teamSchema = z.array(loadoutSchema).min(1).max(MAX_TEAM_SIZE);

const simulateSchema = z.object({
    teamA: teamSchema,
    teamB: teamSchema,
    seed: z.number().int().min(0).max(0xffffffff).optional(),
});

battleRouter.post('/battles/simulate', (req, res) => {
    const body = simulateSchema.parse(req.body);

    const seed = body.seed ?? randomInt(0, 2 ** 32);

    res.json(simulate(body.teamA as Loadout[], body.teamB as Loadout[], seed));
});