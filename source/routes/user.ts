import express from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/exractJWT'

const router = express.Router();

router.get('/validate', extractJWT, controller.validateToken);
router.post('/register', controller.register);
router.get('/login', controller.login);
router.get('/get/all', controller.getAllusers);

export = router;
