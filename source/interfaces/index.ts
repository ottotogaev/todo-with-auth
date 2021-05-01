import { NextFunction, Request, Response } from 'express';

export default interface IRequest extends Request {
  user: any,
  headers: any
}