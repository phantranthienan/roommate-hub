import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';

const sequelize = new Sequelize(env.DATABASE_URL, { dialect: 'postgres' });

export default sequelize;
