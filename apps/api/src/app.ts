import express from 'express';
import { catalogRouter } from './routes/catalog';
import { loadoutsRouter } from './routes/loadouts';
import { errorHandler, notFoundHandler } from './errors';

export function createApp() {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: '10kb'})); // capping body size

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api', catalogRouter)
    app.use('/api', loadoutsRouter)

    app.use(notFoundHandler)
    app.use(errorHandler) // will always be registered last

    return app;
}