import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { routes } from '@/routes/main';

const server = express();
server.use(cors());
server.use(express.static('public'));
server.use('/webhook/stripe', express.raw({ type: 'application/json' }));
server.use(express.json());

server.use(routes);

server.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(500).json({ error: 'Ocorreu algum erro' });
});

server.listen(4000, () => {
    console.log('PHstore backend running...');
});