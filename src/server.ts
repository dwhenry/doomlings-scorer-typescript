import express, { Application, Request, Response } from 'express';
import { Scorer } from './scorer';

const app: Application = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

app.get('/', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({ message: 'Hell Yeah!' });
});

app.get('/score', async (req: Request, res: Response): Promise<Response> => {
  const scorer = new Scorer([{'name': 'ACROBATIC' }]);
  const scores = scorer.scores();
  let message = '';
  for (const p of scores.getPlayerScores()) {
    message = `${message}Player ${p}: ${p.total}\n`;
  }

  return res.status(200).send({ message });
});

try {
  app.listen(port, (): void => {
    console.log(`Connected succesfully on port: ${port}`);
  });
} catch (err) {
  console.error(getErrorMessage(err));
}
