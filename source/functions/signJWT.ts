
import jwt from 'jsonwebtoken';
import logging from '../config/logging';
import config from '../config/config';
import IUser from '../interfaces/user';

const NAMESPACE = 'AUTH';

const signJWT = (user: IUser, callback: (error: Error | null, token: string | null) => void): void => {

  // const timeSinchEpoch = new Date().getTime();
  
  // const expirationTime = timeSinchEpoch + Number(config.server.token.experTime);

  // const expirationTime = timeSinchEpoch + Number(config.server.token.experTime) * 100000;
  
  // const expirationTimeInSeconds = Math.floor(expirationTime);
  
  logging.info(NAMESPACE, `Attempting to sign token for ${user.username}`); // Попытка подписать токен для user

  try {
    jwt.sign({username: user.username}, config.server.token.secret, {
      issuer: config.server.token.issuer,
      algorithm: 'HS256',
      expiresIn: '1h' // expire time 1 hour
    },
    (err, token) => {
      if(err) {
        callback(err, null)
      }
      else if (token) {
        callback(null, token);
      }
    })
  } catch (err) {
    logging.error(NAMESPACE, err.message);
    callback(err, null);
  }
};

export default signJWT;