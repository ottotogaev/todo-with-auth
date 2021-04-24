import knex from 'knex';
import config from './config';

const connDB = knex({
  client: 'pg',
  version: '7.2',
  connection: {
    host: config.knexDb.host || 'localhost',
    user: config.knexDb.user || 'postgres',
    password: config.knexDb.password || '789456',
    database: config.knexDb.database || 'todo'
  }
});

export default connDB;
// const params = {
//   user: config.knexPg.user,
//   password: config.
// }
