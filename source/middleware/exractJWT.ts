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

  try {
    // verify token
    const verifyToken: any = await jwt.verify(token, config.server.token.secret);

    // headerga quyilgan token kimga tegishli ekanligini tekshirish
    const idU = await connDB('tokens').first('user_id').where('jwt_token', token);
    const idUser = idU['user_id'];

    // id orqali username topish
    const userN = await connDB('users').first('username').where('id', idUser);
    const userName = userN['username'];

    const issuedAt = new Date(verifyToken.iat * 1000); //время создания токена
    const expTime = new Date(verifyToken.exp * 1000); // срок действия токена (interval)
    req.user = {
      token: token,
      idUser: idUser,
      userName: userName,
      iat: issuedAt,
      exp: expTime
    };
    next();
  } catch (e) {

    return res.status(404).json({
      error: e.message
    });

    console.log(e.message);
  }

  // UnaAuthorized

};

export default extractJWT;
