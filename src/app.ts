import * as dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
dotenv.config();

const app: Express = express();
const port: number = Number(process.env.PORT);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
