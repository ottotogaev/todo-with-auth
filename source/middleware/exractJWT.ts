import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logging from '../config/logging';
import config from '../config/config';

const NAMESPACE = 'Auth';

const extractJWT = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, 'Validating Token');

  let token = await req.headers.authorization?.split(' ')[1];
  console.log(token);

  // Verify token
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  jwt.verify(token, config.server.token.secret, (err, decoded) => {
    if (err) {
      return res.status(404).json({
        message: err.message,
        err
      });
    }
    res.locals.jwt = decoded;
    next()
  });

  // UnaAuthorized
};

export default extractJWT;
