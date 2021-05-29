import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logging from '../config/logging';
import config from '../config/config';
import IRequest from '../interfaces/index';
import connDB from '../config/knexPG';

const NAMESPACE = 'Destroy auth';

// exports.destroyJWT = async (req: Request, res: Response, next: NextFunction) => {
//
// }