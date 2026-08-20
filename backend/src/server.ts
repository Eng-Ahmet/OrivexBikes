import 'dotenv/config';
import { app } from './app.js';
import { checkDatabaseConnection } from './config/database.js';
import { initializeSchema } from './db/initSchema.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log(`🚀 Starting QQBikes Management Backend on PORT ${PORT}...`);
  await checkDatabaseConnection();
  await initializeSchema();

  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚲 QQBikes Rental & Store Management System Active`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
  });
};

startServer();
