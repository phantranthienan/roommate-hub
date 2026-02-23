import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import { sequelize } from './db/index.js';
import { seedDatabase } from './db/seed.js';

const PORT = env.PORT;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
