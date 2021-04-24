import { query } from 'express';
import mysql from 'mysql';
import config from './config';

const params = {
  user: config.mysql.user,
  password: config.mysql.password,
  host: config.mysql.host,
  database: config.mysql.database,
  port: config.mysql.port
};

console.log(params); // params {user: mysql: {host: process.env.MYSQL_HOST || 'localhost', user: MYSQL_USER = process.env.MYSQL_HOST || 'postgress'}}

const Connect = async () =>
  new Promise<mysql.Connection>((resolve, reject) => {
    const connection = mysql.createConnection(params);
    connection.connect((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(connection);
    });
  });

const Query = async <T>(connection: mysql.Connection, query: string) =>
  new Promise<T>((resolve, reject) => {
    connection.query(query, connection, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
      connection.end();
    });
  });

export { Connect, Query };
