import type { ErrorRequestHandler, RequestHandler } from 'express'
import { z } from 'zod'

export const notFoundHandler: RequestHandler = (_req, res) => {
    res.status(404).json({ error: 'Not found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'Bad request', issues: err.issues });
    } else if (err?.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'Malformed JSON' });
    } else if (err?.type === 'entity.too.large') {
        res.status(413).json({ error: 'Payload too large' });
    } else {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' }) // stops internal leaks
    }
};