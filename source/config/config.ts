import dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT || 5000;
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
// Token configs
const SERVER_TOKEN_EXPIRETIME = process.env.SERVER_TOKEN_EXPIRETIME || 3600;
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'coolIssuer';
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || 'secretKey';
// Database connection

// const knex = require('knex')({
//   client: 'pg',
//   version: '7.2',
//   connection: {
//     host: '127.0.0.1',
//     user: 'your_database_user',
//     password: 'your_database_password',
//     database: 'myapp_test'
//   }
// });

//
const PG_HOST = process.env.PG_HOST;
const PG_USER = process.env.PG_USER;
const PG_PASSWORD = process.env.PG_PASSWORD;
const PG_DB = process.env.PG_DB;
//
const knexPg = {
  host: PG_HOST,
  user: PG_USER,
  password: PG_PASSWORD,
  database: PG_DB
};

// MYSQL
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DB = process.env.MYSQL_DB || 'test';

//
const mysql = {
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB,
  port: 3307
};

//
const server = {
  hostname: SERVER_HOSTNAME,
  port: SERVER_PORT,
  token: {
    experTime: SERVER_TOKEN_EXPIRETIME,
    issuer: SERVER_TOKEN_ISSUER,
    secret: SERVER_TOKEN_SECRET
  }
};

const config = {
  knexDb: knexPg,
  mysql: mysql,
  server: server
};

export default config;

// config = {
//   server: {
//     hostname: 'localhost',
//     port: 5000,
//     token: { experTime: 3600, issuer: 'coolIssuer', secret: 'coolIssuer' }
//   }
// }
