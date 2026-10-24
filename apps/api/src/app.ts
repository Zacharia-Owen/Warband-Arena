import express from 'express';
import { catalogRouter } from './routes/catalog';

export function createApp() {
    const app = express();
    app.disable('x-powered-by');

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api', catalogRouter)

    return app;
}