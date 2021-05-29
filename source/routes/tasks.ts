import express, { Request, Response, NextFunction } from 'express';
import extractJWT from '../middleware/exractJWT';
import IRequest from '../interfaces/index';
import connDB from '../config/knexPG';
import IUser from '../interfaces/user';

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

// enum priority {
//   low = 1,
//   middle, // 2
//   high // 3
// }


//  Insert
router.post('/add', async (req: IRequest, res: Response, next: NextFunction) => {
  // assertIRequest(req);
  try {

    //* Dead line is UNIX_TIMESTAMP */

    // const { text, desc, dead_line, priority } = req.body;
    // console.log(text);

    // let dead_date = new Date(dead_line * 1000);
    // if (!text || !dead_date) {
    //   return res.status(404).json('Please typing smth');
    // }
    //

    const username = req.user.userName;
    const idUser = req.user.idUser;
    console.log();
    // Insert
    // await connDB('todos').insert({
    //   tasks: text,
    //   user_id: idUser,
    //   deadline_date: dead_date,
    //   description: desc,
    //   priority: priority
    // });

    // const result = connDB('todos').select('*').where({ user_id: idUser });
    const result = await connDB.select('*').from('todos').where('user_id', idUser);

    //  return res.status(200).json({
    //   message: `Task added successfully to ${username}`,
    //   result: result
    // });

    console.log(result);
    return res.status(200).json({
      userid: idUser,
      username: username,
      result: result
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: e
    })
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

router.post('/mark/:id', async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    // assertIRequest(req);
    let idTask = req.params.id;
    const username = req.user.userName;
    const idUser = req.user.idUser;
    const dateNow = new Date(Date.now());

    // Get dead_date
    // const query = await connDB.select('is_completed', 'deadline_date').from('todos').where('id', idTask);
    // const user: IUser = await connDB('users').first('*').where({ username: username }); // boolean

    const query = await connDB('todos').first('is_completed', 'deadline_date').where({ 'id': idTask });
    const dead_date = query.deadline_date.getTime() / 1000;

    let alertMessage: string;
    let isComplete = query.is_completed;
    console.log(`isComplete: `, isComplete);

    if (isComplete) {
      // Update
      alertMessage = 'Vazifa qaytadan quyildi';
      await connDB('todos').where('id', idTask).update({ 'is_completed': !isComplete, created_at: dateNow });
    } else {
      if (Math.floor(dateNow.getTime() / 1000) > dead_date) {
        alertMessage = `Vazifa o'z vaqtida bajarilmadi :(`;
        console.log(alertMessage);
      } else {
        alertMessage = `Vazifa o'z vaqtida bajarildi`;
        console.log(alertMessage);
      }
      // Update
      await connDB('todos').where('id', idTask).update({ 'is_completed': !isComplete, complete_date: dateNow });
    }

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


router.get('/getToday', async (req: IRequest, res: Response) => {
  try {
    // current date
    const currentDate = new Date();
    const current = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();

    console.log('dayToday:', currentDate.getFullYear());

    const username = req.user.username;
    const idUser = req.user.idUser;


    // select deadline_date from todos
    // where deadline_date::date = cast(current_date as Date) and user_id = ${idUser}

    const selectAll = await connDB.select('id', 'tasks', 'is_completed', 'deadline_date', 'created_at', 'description').from('todos').whereRaw(`deadline_date::date = current_date AND user_id = ${idUser}`);

    res.status(200).json({
      message: true,
      result: selectAll
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: false,
      error: e
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