import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import videoRoutes from './routes/videoRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import { connectDatabase } from './utils/db.js';
import { errorHandler, notFoundHandler } from './utils/errorHandlers.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', videoRoutes);
app.use('/api/history', historyRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
