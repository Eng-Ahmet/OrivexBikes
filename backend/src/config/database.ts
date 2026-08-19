import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host?: string;
  user?: string;
  password?: string;
  database?: string;
  port?: number;
}

export const getDbConfig = (): DatabaseConfig => {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || (host === 'db' || process.env.NODE_ENV === 'production' ? 'qqbikes_secret' : '');
  const database = process.env.DB_NAME || 'qqbikes_db';
  const port = parseInt(process.env.DB_PORT || '3306');

  return { host, user, password, database, port };
};

let pool: mysql.Pool | null = null;
let isConnectedToMySQL = false;

export const getPool = () => {
  if (!pool) {
    const config = getDbConfig();
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const config = getDbConfig();
    console.log(`🔌 Attempting MySQL connection to [${config.user}@${config.host}:${config.port}/${config.database}]...`);
    const conn = await getPool().getConnection();
    await conn.ping();
    conn.release();
    isConnectedToMySQL = true;
    console.log('✅ Connected to MySQL database successfully.');
    return true;
  } catch (err: any) {
    isConnectedToMySQL = false;
    console.log(`ℹ️ MySQL connection unavailable (${err.message}). Operating with high-performance memory dataset.`);
    return false;
  }
};

export const isMySQLActive = () => isConnectedToMySQL;
