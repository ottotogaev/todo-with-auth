import { NextFunction, Request, Response } from 'express';

export default interface IRequest extends Request {
  // user: {
  //   iat: any;
  //   exp: any;
  //   username: string;
  //   idUser: number;
  // },
  user: any
  headers: any
}