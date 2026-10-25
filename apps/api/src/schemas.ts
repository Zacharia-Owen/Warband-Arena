import { z } from 'zod'

export const loadoutSchema = z.object({
    unit: z.string().max(50),
    itemIds: z.array(z.string().max(50)).max(10),
});