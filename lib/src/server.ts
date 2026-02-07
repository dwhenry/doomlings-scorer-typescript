import express, { Application, Request, Response } from 'express';
import path from 'path';
import { Scorer } from './scorer';

const app: Application = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the Vite-built frontend
const webDistPath = path.resolve(__dirname, '..', '..', 'web', 'dist');
app.use(express.static(webDistPath));

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// API routes
app.get(
  '/api/health',
  async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({ message: 'OK' });
  }
);

app.get(
  '/api/score',
  async (req: Request, res: Response): Promise<Response> => {
    const scorer = new Scorer([{ name: 'ACROBATIC' }]);
    const scores = scorer.scores();
    let message = '';
    for (const p of scores.getPlayerScores()) {
      message = `${message}Player ${p}: ${p.total}\n`;
    }

    return res.status(200).send({ message });
  }
);

// Fallback: serve index.html for client-side routing
app.get('*', (req: Request, res: Response): void => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

try {
  app.listen(port, (): void => {
    console.log(`Server running on port: ${port}`);
  });
} catch (err) {
  console.error(getErrorMessage(err));
}
