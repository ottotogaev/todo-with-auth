import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logging from '../config/logging';
import config from '../config/config';
import IRequest from '../interfaces/index';
import connDB from '../config/knexPG';

const NAMESPACE = 'Auth';

const extractJWT = async (req: IRequest, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, 'Validating Token');

  let token = req.headers.authorization?.split(' ')[1];

  // Verify token
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized, token not found'
    });
  }

  // headerga quyilgan token kimga tegishli ekanligini tekshirish
  const idU = await connDB('tokens').first('user_id').where('jwt_token', token);
  const idUser = idU['user_id'];

  // id orqali username topish
  const userN = await connDB('users').first('username').where('id', idUser);
  const userName = userN['username'];

  await jwt.verify(token, config.server.token.secret, (err, decoded) => {

    if (err) {
      return res.status(404).json({
        message: err.message + 'ERROR in verify jwt',
        err
      });
    }

    const issuedAt = new Date(decoded.iat * 1000); //время создания токена
    const expTime = new Date(decoded.exp * 1000); // срок действия токена (interval)

    req.user = {
      idUser: idUser,
      userName: userName,

      iat: issuedAt,
      exp: expTime
    };

    next();
  });

  // UnaAuthorized
};

export default extractJWT;
