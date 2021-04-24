import { NextFunction, Request, Response } from 'express';
import logging from '../config/logging';
import bcryptjs from 'bcryptjs';
import signJWT from '../functions/signJWT';
import { Query, Connect } from '../config/mysql';
import IUser from '../interfaces/user';
import IMySQLResult from '../interfaces/result';
import connDB from '../config/knexPG';

// const connDB = knex({
//   client: 'pg',
//   version: '7.2',
//   connection: {
//     host: 'localhost',
//     user: 'postgres',
//     password: '789456',
//     database: 'todo'
//   }
// });
// console.log(connDB);

const NAMESPACE = 'Users';

const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, 'Token validated, user authorized');
  console.log(res.locals);
  return res.status(200).json({
    message: 'Token(s) validated'
  });
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const hash = await bcryptjs.hash(password, 10);

    await connDB('users').insert({ username: username, password: hash });
    res.status(200).json({
      message: 'user succes created'
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Something error');
  }

  // crypto password

  // bcryptjs.hash(password, 10, (hashError, hash) => {
  //   if (hashError) {
  //     return res.status(401).json({
  //       message: hashError.message + ' Register error',
  //       error: hashError
  //     });
  //   }

  // TODO add user
  // let query = `INSERT INTO users (username, password) VALUES ("${username}", "${hash}")`;

  // Connect()
  //   .then((conn) => {
  //     return Query<IMySQLResult>(conn, query);
  //   })
  //   .then((result) => {
  //     logging.info(NAMESPACE, `User with id ${result.insertId} inserted.`);
  //     return res.status(200).json(result);
  //   })
  //   .catch((error) => {
  //     logging.error(NAMESPACE, error.message, error);
  //     return res.status(500).json({
  //       message: error.message,
  //       error
  //     });
  //   });
  // });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    let { username, password } = req.body;

    const user: IUser = await connDB('users').first('*').where({ username: username });

    if (user) {
      let validPass = await bcryptjs.compare(password, user.password);
      if (!validPass) {
        return res.status(401).json({
          message: 'UnValid password :('
        });
      }

      signJWT(user, (_err, token) => {
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
        
        
        return res.status(200).json({
          message: 'Auth succesfully',
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

  // crypto password

  // TODO add user
  // let query = `SELECT * FROM users WHERE username = "${username}"`;

  // Connect()
  //   .then((conn) => {
  //     let queConn = Query<IUser[]>(conn, query); // Connection
  //     return queConn;
  //   })
  //   .then((users) => {
  //     console.log(users);

  //     console.log(bcryptjs.compareSync(password, users[0].password));

  //     bcryptjs.compare(password, users[0].password, (err, result) => {
  //       // const passwordIsValid = bcryptjs.compareSync(req.body.password, users[0].password);
  //       if (err) {
  //         return res.status(401).json({
  //           message: err.message + ' bcryptjs compare',
  //           err
  //         });
  //       }

  //       if (!result) {
  //         return res.status(401).json({
  //           message: 'Compare is not accessing'
  //         });
  //       }
  //       signJWT(users[0], (_err, token) => {
  //         if (_err) {
  //           // Unauthorized
  //           return res.status(401).json({
  //             message: 'Unable to sign JWT',
  //             error: _err
  //           });
  //         } else if (token) {
  //           return res.status(200).json({
  //             message: 'Auth Successful',
  //             token,
  //             user: users[0]
  //           });
  //         }
  //       });
  //     });
  //   })
  //   .catch((error) => {
  //     logging.error(NAMESPACE, error.message, error);
  //     return res.status(500).json({
  //       message: error.message,
  //       error
  //     });
  //   });
};

const getAllusers = async (req: Request, res: Response, next: NextFunction) => {
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

  // Connect()
  //   .then((conn) => {
  //     return Query<IUser[]>(conn, query);
  //   })
  //   .then((users) => {
  //     return res.status(200).json({
  //       users,
  //       count: users.length
  //     });
  //   })
  //   .catch((err) => {
  //     logging.error(NAMESPACE, err.message, err);
  //     return res.status(500).json({
  //       message: err.message,
  //       err
  //     });
  //   });
};

export default { validateToken, register, login, getAllusers };
