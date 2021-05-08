import express, { Request, Response, NextFunction } from 'express';
import extractJWT from '../middleware/exractJWT';
import IRequest from '../interfaces/index';
import connDB from '../config/knexPG';

const router = express.Router();

router.use(extractJWT);
/*
* api/v1/todo/all         GET
* api/v1/todo/add         POST
* api/v1/todo/:id         POST
* api/v1/todo/remove/:id  POST
* api/v1/todo/remove/all  POST
* api/v1/todo/remove/:id  POST
* api/v1/todo/mark/:id    POST
* api/v1/todo/mark/all    POST
* */

//  Insert
router.post('/add', async (req: IRequest, res: Response, next: NextFunction) => {
  assertIRequest(req);
  try {
    const { text, desc, date } = req.body;
    let dead_date = new Date(date * 1000);

    console.log(dead_date);

    if (!text || !dead_date) {
      return res.status(404).json('Please typing smth');
    }

    const username = req.user.username;
    const idUser = req.user.idUser;

    await connDB('todos').insert({ tasks: text, user_id: idUser, dead_date: dead_date, description: desc });

    return res.status(200).json({
      message: `Task added successfully to ${username}`,
      deadline: dead_date
    });

  } catch (e) {
    console.log(e);
    res.status(500).send('Something broke');
  }
});

// Get All todos by user ${username}
router.get('/all', async (req: IRequest, res: Response) => {
  assertIRequest(req);
  try {
    assertIRequest(req);

    const username = req.user.username;
    const idUser = req.user.idUser;

    let todos = await connDB.select('*').from('todos').where('user_id', idUser);

    return res.status(200).json({
      message: true,
      user: username,
      tasks: todos
    });
  } catch (e) {
    console.log(e);
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

    const result = await connDB.select('*').from('tod os').where('id', idTask);

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

router.post('/mark/:id', async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    // assertIRequest(req);
    let idTask = req.params.id;
    const username = req.user.userName;
    const idUser = req.user.idUser;
    const dateNow = new Date(Date.now());
    // Get dead_date
    const query = await connDB.select('is_completed', 'dead_date').from('todos').where('id', idTask);
    const dead_date = query[0].dead_date.getTime() / 1000;

    let alertMessage: string;

    if (Math.floor(dateNow.getTime() / 1000) > dead_date) {
      alertMessage = `Vazifa o'z vaqtida bajarilmadi :(`;
      console.log(alertMessage);
    } else {
      alertMessage = `Vazifa o'z vaqtida bajarildi`;
      console.log(alertMessage);
    }

    let isComplete = query[0].is_completed;
    console.log(`isComplete: `, isComplete);

    // Update
    await connDB('todos').where('id', idTask).update({ 'is_completed': !isComplete, complete_date: dateNow });
    const result = await connDB.select('*').from('todos').where('id', idTask);

    return res.status(200).json({
      message: `${result[0].tasks} Marked ✔`,
      isDone: `${alertMessage}`,
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

router.post('/mark/all', async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const username: string = req.user.userName;
    const idUser: number = req.user.idUser;

    await connDB('todos').where('id', idUser).update('is_completed', true);

    const result = await connDB.select('*').from('todos');

    return res.status(200).json({
      message: `All Marked ✔`,
      user: username,
      result: result
    });

  } catch (e) {
    console.log(e);
    return res.status(200).json({
      message: 'Something broke Mark all items'
    });
  }

});


function assertIRequest(req: Request | IRequest): asserts req is IRequest {
  if (!req?.user?.idUser) throw new Error('Request was not an IRequest');
  if (!req?.user?.userName) throw new Error('Request was not an IRequest');
}

export = router;

// TODO
// 1. add qilishi                 POST /api/v1/todo/add ✔DONE
// 2. todo listini olib kelish    GET  /api/v1/todo/all ✔DONE
// 3. todo edit                   POST /api/v1/todo/edit/:id ✔DONE
// 4. todo remove qilish          POST /api/v1/todo/remove/:id ✔DONE
// 5. todo description            GET  /api/v1/todo/:id ✔DONE
// 6. todo remove all             POST /api/v1/todo/remove
// 7. todo done/undone qilish     POST /api/v1/todo/mark/:id ✔DONE
// 8. todo complete all           POST /api/v1/todo/mark/all ✔DONE (help)

// ADD Role