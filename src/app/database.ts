import knex from 'knex';
import config from '../utils/config/config';

const createDbCon = () => {
  const connection = knex({
    client: 'mysql2',
    connection: {
      host: config.DB_HOST,
      port: parseInt(config.DB_PORT),
      user: config.DB_USER,
      password: config.DB_PASS,
      database: config.DB_NAME,
      dateStrings: true,
    },
    pool: { min: 0, max: 10000 },
  });

  console.log('Database connected..!');
  return connection;
};

export const db = createDbCon();
