import express from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/exractJWT';
import { check } from 'express-validator';

const router = express.Router();

// users router
/*
* Edit user
* Remove user id
* Add role
* */

router.get('/validate', extractJWT, controller.validateToken);
router.post('/signup', [
  check('username', 'Username don\'t must empty').notEmpty(),
  check('password', 'Password mini 4, max 12').isLength({ min: 4, max: 12 })
], controller.register);
router.post('/login',[
  check('username', 'Username don\'t must empty').notEmpty(),
], controller.login);
router.get('/all', controller.getAllUsers);
router.get('/logout', extractJWT, controller.logout);


export = router;