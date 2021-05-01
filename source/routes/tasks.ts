import express, { Request, Response, NextFunction } from 'express';
import extractJWT from '../middleware/exractJWT';
import IRequest from '../interfaces/index';
import connDB from '../config/knexPG';

const router = express.Router();

router.use(extractJWT);

//  Insert
router.post('/add', async (req: IRequest, res: Response) => {
  // assertIRequest(req);
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(404).json('Please typing smth');
    }

    const username = req.user.userName;
    const idUser = req.user.idUser;

    await connDB('todos').insert({ tasks: text, user_id: idUser });

    return res.status(200).json({
      message: `Text added to ${username}`,
      iat: req.user.iat,
      exp: req.user.exp
    });

  } catch (e) {
    console.log(e);
    res.status(500).send('Something broke');
  }
});

// Get All todos by user ${username}
router.get('/all', async (req: Request, res: Response) => {
  try {
    assertIRequest(req);

    const username = req.user.userName;
    const idUser = req.user.idUser;

    let todos = await connDB.select('*').from('todos').where('user_id', idUser);

    return res.status(200).json({
      message: true,
      user: username,
      tasks: todos
    });
  } catch (e) {
    console.log('asddas', e);
    res.status(500).send('Get all Something broke');
  }
});

router.get('/:id', async (req: IRequest, res: Response) => {
  try {
    const idTask = req.params.id;
    const idUser = req.user.idUser;
    const username = req.user.userName;

    const result = await connDB.select('*').from('todos').where('id', idTask);

    return res.status(200).json({
      message: true,
      user: username,
      result: result
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: 'Something broke'
    });
  }
});

router.post('/edit/:id', async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const idTask = req.params.id;
    const { text } = req.body;
    // user's
    const username = req.user.userName;
    const idUser = req.user.idUser;

    await connDB('todos').where('id', idTask).update('tasks', text);

    const result = await connDB.select('*').from('todos').where('id', idTask);

    return res.status(200).json({
      message: 'Updating accepted',
      result: result
    });

  } catch (e) {
    console.log(e);
    res.status(500).send('Something broke');
  }
});

router.post('/remove/:id', async (req: IRequest, res: Response) => {
  try {
    const idTask = req.params.id;
    const username = req.user.userName;
    const idUser = req.user.idUser;

    await connDB('todos').where('id', idTask).del();

    const result = await connDB.select('*').from('todos');

    return res.status(200).json({
      message: `Task by id ${idUser} deleted`,
      user: username,
      result: result
    });

  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: 'Something broke, Remove '
    });
  }
});

router.post('/mark/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertIRequest(req);

    let idTask = req.params.id;

    const username = req.user.userName;
    const idUser = req.user.idUser;

    const isDone: any = await connDB.select('is_completed').from('todos').where('id', idTask);
    let isComplete = isDone[0].is_completed;

    await connDB('todos').where('id', idTask).update('is_completed', !isComplete);
    const result = await connDB.select('*').from('todos').where('id', idTask);

    return res.status(200).json({
      message: `${result[0].tasks} Marked ✔`,
      user: username,
      result: result
    });

  } catch (e) {
    console.log(e);
    return res.status(200).json({
      message: 'Something broke Mark by id'
    });
  }
});

router.post('/mark/all', async (req: Request, res: Response, next: NextFunction) => {
  assertIRequest(req)
});


function assertIRequest(req: Request | IRequest): asserts req is IRequest {
  if (!req?.user?.idUser) throw new Error('Request was not an IRequest');
  if (!req?.user?.userName) throw new Error('Request was not an IRequest');
}

export = router;

// TODO
// add qilishi                 POST /api/v1/todo/add ✔DONE
// todo listini olib kelish    GET  /api/v1/todo/all ✔DONE
// todo edit                   POST /api/v1/todo/:id/edit ✔DONE
// todo remove qilish          POST /api/v1/todo/:id/remove ✔DONE
// todo description            GET  /api/v1/todo/:id ✔DONE
// todo remove all             POST /api/v1/todo/remove ✔DONE
// todo done/undone qilish     POST /api/v1/todo/mark/:id ✔DONE
// todo complete all           POST /api/v1/todo/mark/all

// ADD Role