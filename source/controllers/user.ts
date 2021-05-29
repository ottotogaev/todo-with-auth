import { NextFunction, Request, Response } from 'express';
import logging from '../config/logging';
import bcryptjs from 'bcryptjs';
import signJWT from '../functions/signJWT';
import IUser from '../interfaces/user';
import { validationResult } from 'express-validator';
import IRequest from '../interfaces/index';


import connDB from '../config/knexPG';

interface IdUser {
  id: number
}

const NAMESPACE = 'controller users';

const validateToken = async (req: IRequest, res: Response, next: NextFunction) => {

  logging.info(NAMESPACE, 'Token validated, user authorized');
  const dateNow = (new Date(Date.now())).toISOString();

  return res.status(200).json({
    message: 'Token(s) validated',
    dateNow: dateNow,
    user: req.user
  });
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Error on registration', errors });
    }

    const { username, password } = req.body;
    const user: IUser = await connDB('users').first('*').where({ username: username }); // boolean
    if (user) {
      return res.status(400).json({ message: 'User with the same name already exists, please try another username' });
    }

    const hash = await bcryptjs.hash(password, 10);

    await connDB('users').insert({ username: username, password: hash });
    res.status(200).json({
      message: 'user success created'
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Something error');
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Error on registration', errors });
    }

    let { username, password } = req.body;
    const user: IUser = await connDB('users').first('*').where({ username: username });

    // passwordni tekshirish
    if (user) {
      let validPass = await bcryptjs.compare(password, user.password); // false, true
      if (!validPass) {
        console.log('UnValid password :(');
        return res.status(401).json({
          message: 'UnValid password :('
        });
      }

      signJWT(user, async (_err, token) => {
        if (_err) {
          // Unauthorized
          return res.status(401).json({
            message: 'Unable to sign JWT',
            error: _err
          });
        }
        if (!token) {
          return res.status(404).json({
            message: 'Token not found'
          });
        }

        const idUser: IdUser[] = await connDB.select('id').from('users').where('username', username);
        await connDB('tokens').insert({ jwt_token: token, user_id: idUser[0].id });

        return res.status(200).json({
          message: 'Auth successfully',
          token: token,
          user: user
        });
      });

    } else {
      return res.status(404).json('USER NOT FOUND');
    }

  } catch (e) {
    console.log(e);
    res.status(500).send('SOMETHING BROKE');
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await connDB.from('users').select('*');
    res.status(200).json({
      message: 'All users',
      users: users
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('SOMETHING BROKE in get all users');
  }
};

const logout = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    console.log(req.user.token);
    // jwt.destroy()
  } catch (e) {
    console.log(e);
    res.status(500).send('SOMETHING BROKE in logout user');
  }
};

export default { validateToken, register, login, getAllUsers, logout };
