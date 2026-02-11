import * as functions from 'firebase-functions';
import next from 'next';
import { Request, Response } from 'express';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { distDir: '.next' } });
const handle = app.getRequestHandler();

export const nextApp = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    await app.prepare();
    return handle(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
