import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host?: string;
  user?: string;
  password?: string;
  database?: string;
  port?: number;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qqbikes_db',
  port: parseInt(process.env.DB_PORT || '3306')
};

let pool: mysql.Pool | null = null;
let isConnectedToMySQL = false;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const conn = await getPool().getConnection();
    await conn.ping();
    conn.release();
    isConnectedToMySQL = true;
    console.log('✅ Connected to MySQL database successfully.');
    return true;
  } catch (err: any) {
    isConnectedToMySQL = false;
    console.log('ℹ️ MySQL database connection unavailable. Operating with high-performance memory dataset.');
    return false;
  }
};

export const isMySQLActive = () => isConnectedToMySQL;
