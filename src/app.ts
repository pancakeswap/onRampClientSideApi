import express from 'express';
import cors from 'cors';
import { config as _c } from 'dotenv';
import errorHandler from './middleware/errorHandlingMiddleware';
import router from './api/router';

const app = express();

app.use(express.json());
app.set("trust proxy", true);
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.status(200).send({ result: 'ok' });
});
app.use('/', router)
app.use(errorHandler);

app.get('/ip', (req, res) => {
  const ip = 
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress || ''
  res.send(ip)
})

export default app