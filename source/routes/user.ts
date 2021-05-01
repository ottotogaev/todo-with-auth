import express from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/exractJWT';
import { check } from 'express-validator';

const router = express.Router();

// users router

router.get('/validate', extractJWT, controller.validateToken);
router.post('/signup', [
  check('username', 'Username don\'t must empty').notEmpty(),
  check('password', 'Password mini 4, max 12').isLength({ min: 4, max: 12 })
], controller.register);
router.get('/login', controller.login);
router.get('/users', controller.getAllUsers);

export = router;