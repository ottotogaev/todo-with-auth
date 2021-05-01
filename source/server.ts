import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import logging from './config/logging';
import config from './config/config';
import userRoutes from './routes/user';
import taskRoutes from './routes/tasks'

const NAMESPACE = 'Server.ts';

const app: Application = express();

/** Logging request */
app.use((req, res, next) => {
  logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

  res.on('finish', () => {
    logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
  }); // finish response ------------------ req.socket.remoteAddress

  next();
});

/** Parse request */
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

/** Rules of our API */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // --------------
  res.header('Access-Control-Allow-Origin', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // --------------

  if (req.method == 'options') {
    res.header('Access-Control');
    return res.status(200).json("options");
  }
  next();
});

/** Routes */
app.use('/api/v1/', userRoutes);
app.use('/api/v1/todo', taskRoutes)

/** Error Handling */
app.use((req: Request, res: Response, next: NextFunction) => {

  const error = new Error('not found'); // ----------
  return res.status(404).json({
    message: error.message,
    error: "Url not founded, please try again"
  });
  next();
});

app.listen(config.server.port, () => logging.info(NAMESPACE, `Server running on ${config.server.hostname}: ${config.server.port}`));
