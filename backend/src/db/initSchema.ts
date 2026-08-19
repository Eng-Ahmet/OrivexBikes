import { getPool, isMySQLActive } from '../config/database.js';

export interface User {
  id: number;
  company_id: number;
  store_id: number;
  store_name?: string;
  user_type: 'ADMIN' | 'EMPLOYEE';
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
}

export interface Store {
  id: number;
  company_id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  is_active: boolean;
}

export interface Vehicle {
  id: number;
  store_id: number;
  category: 'City Bike' | 'Mountain Bike' | 'E-Bike' | 'E-Scooter' | 'Cargo Bike';
  qr_code: string;
  frame_number: string;
  name: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  hourly_rate: number;
  daily_rate: number;
  deposit_amount: number;
  battery_level?: number;
}

export interface RentalContract {
  id: number;
  contract_number: string;
  store_id: number;
  employee_id: number;
  employee_name: string;
  customer_name: string;
  customer_passport: string;
  customer_phone: string;
  vehicle_id: number;
  vehicle_name: string;
  start_time: string;
  end_time: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  rental_fee: number;
  deposit_collected: number;
  deposit_refunded: number;
  extra_charges: number;
  payment_method: 'CASH' | 'CARD';
  created_at: string;
}

export interface Shift {
  id: number;
  store_id: number;
  employee_id: number;
  employee_name: string;
  start_time: string;
  end_time?: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  discrepancy?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

// Massive Production Pre-Seeded Memory Dataset
export const memoryData = {
  stores: [
    { id: 1, company_id: 1, name: 'Málaga Beach Campsite Store', code: 'AGP-01', city: 'Málaga', address: 'Paseo Marítimo 42, Málaga', phone: '+34 952 112 233', is_active: true },
    { id: 2, company_id: 1, name: 'Torremolinos Central Hub', code: 'TOR-01', city: 'Torremolinos', address: 'Calle San Miguel 18, Torremolinos', phone: '+34 952 889 900', is_active: true },
    { id: 3, company_id: 1, name: 'Marbella Resort & Marina Store', code: 'MAR-01', city: 'Marbella', address: 'Puerto Banús Pier 7, Marbella', phone: '+34 952 774 411', is_active: true },
    { id: 4, company_id: 1, name: 'Nerja Coastal Depot', code: 'NER-01', city: 'Nerja', address: 'Plaza Balcón de Europa 3, Nerja', phone: '+34 952 520 099', is_active: true },
    { id: 5, company_id: 1, name: 'Fuengirola Promenade Hub', code: 'FUE-01', city: 'Fuengirola', address: 'Avenida Rey de España 102, Fuengirola', phone: '+34 952 471 200', is_active: true }
  ] as Store[],

  users: [
    { id: 1, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'ADMIN', username: 'admin', email: 'admin@qqbikes.com', first_name: 'Carlos', last_name: 'Admin', phone: '+34 600 111 222', is_active: true },
    { id: 2, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'emp_malaga', email: 'malaga@qqbikes.com', first_name: 'Sofia', last_name: 'Employee', phone: '+34 600 333 444', is_active: true },
    { id: 3, company_id: 1, store_id: 2, store_name: 'Torremolinos Central Hub', user_type: 'EMPLOYEE', username: 'emp_torremolinos', email: 'torre@qqbikes.com', first_name: 'Mateo', last_name: 'Counter', phone: '+34 600 555 666', is_active: true },
    { id: 4, company_id: 1, store_id: 3, store_name: 'Marbella Resort & Marina Store', user_type: 'EMPLOYEE', username: 'emp_marbella', email: 'marbella@qqbikes.com', first_name: 'Lucia', last_name: 'Vega', phone: '+34 600 777 888', is_active: true },
    { id: 5, company_id: 1, store_id: 4, store_name: 'Nerja Coastal Depot', user_type: 'EMPLOYEE', username: 'emp_nerja', email: 'nerja@qqbikes.com', first_name: 'Alejandro', last_name: 'Rios', phone: '+34 600 999 000', is_active: true }
  ] as User[],

  vehicles: [
    // Málaga Store (Store 1)
    { id: 101, store_id: 1, category: 'E-Bike', qr_code: 'QQ-EB-101', frame_number: 'FR-99812', name: 'QQ Urban E-Cruiser Pro #1', status: 'AVAILABLE', hourly_rate: 8, daily_rate: 35, deposit_amount: 50, battery_level: 95 },
    { id: 102, store_id: 1, category: 'E-Bike', qr_code: 'QQ-EB-102', frame_number: 'FR-99813', name: 'QQ Urban E-Cruiser Pro #2', status: 'RENTED', hourly_rate: 8, daily_rate: 35, deposit_amount: 50, battery_level: 60 },
    { id: 103, store_id: 1, category: 'E-Scooter', qr_code: 'QQ-ES-201', frame_number: 'FR-44101', name: 'QQ Pro Scooter Turbo #1', status: 'AVAILABLE', hourly_rate: 6, daily_rate: 25, deposit_amount: 30, battery_level: 100 },
    { id: 104, store_id: 1, category: 'City Bike', qr_code: 'QQ-CB-301', frame_number: 'FR-11204', name: 'QQ Classic City Cruiser #1', status: 'AVAILABLE', hourly_rate: 4, daily_rate: 18, deposit_amount: 20 },
    { id: 105, store_id: 1, category: 'Mountain Bike', qr_code: 'QQ-MB-401', frame_number: 'FR-77631', name: 'QQ Trail Blazer MTB #1', status: 'MAINTENANCE', hourly_rate: 7, daily_rate: 30, deposit_amount: 40 },
    { id: 106, store_id: 1, category: 'E-Bike', qr_code: 'QQ-EB-103', frame_number: 'FR-99814', name: 'QQ Urban E-Cruiser Pro #3', status: 'AVAILABLE', hourly_rate: 8, daily_rate: 35, deposit_amount: 50, battery_level: 88 },
    { id: 107, store_id: 1, category: 'E-Scooter', qr_code: 'QQ-ES-202', frame_number: 'FR-44102', name: 'QQ Pro Scooter Turbo #2', status: 'RENTED', hourly_rate: 6, daily_rate: 25, deposit_amount: 30, battery_level: 45 },
    { id: 108, store_id: 1, category: 'Cargo Bike', qr_code: 'QQ-CG-501', frame_number: 'FR-88120', name: 'QQ Family Cargo E-Bike #1', status: 'AVAILABLE', hourly_rate: 12, daily_rate: 55, deposit_amount: 80, battery_level: 92 },

    // Torremolinos Store (Store 2)
    { id: 201, store_id: 2, category: 'E-Bike', qr_code: 'QQ-EB-201', frame_number: 'FR-99901', name: 'QQ Coast E-Cruiser #1', status: 'AVAILABLE', hourly_rate: 8, daily_rate: 35, deposit_amount: 50, battery_level: 88 },
    { id: 202, store_id: 2, category: 'E-Scooter', qr_code: 'QQ-ES-301', frame_number: 'FR-44301', name: 'QQ Pro Scooter #2', status: 'AVAILABLE', hourly_rate: 6, daily_rate: 25, deposit_amount: 30, battery_level: 90 },
    { id: 203, store_id: 2, category: 'Cargo Bike', qr_code: 'QQ-CG-502', frame_number: 'FR-88121', name: 'QQ Family Cargo E-Bike #2', status: 'RENTED', hourly_rate: 12, daily_rate: 55, deposit_amount: 80, battery_level: 75 },
    { id: 204, store_id: 2, category: 'City Bike', qr_code: 'QQ-CB-302', frame_number: 'FR-11205', name: 'QQ Classic City Cruiser #2', status: 'AVAILABLE', hourly_rate: 4, daily_rate: 18, deposit_amount: 20 },
    { id: 205, store_id: 2, category: 'Mountain Bike', qr_code: 'QQ-MB-402', frame_number: 'FR-77632', name: 'QQ Trail Blazer MTB #2', status: 'AVAILABLE', hourly_rate: 7, daily_rate: 30, deposit_amount: 40 },

    // Marbella Store (Store 3)
    { id: 301, store_id: 3, category: 'E-Bike', qr_code: 'QQ-EB-301', frame_number: 'FR-99920', name: 'QQ Luxury E-Cruiser #1', status: 'AVAILABLE', hourly_rate: 10, daily_rate: 45, deposit_amount: 70, battery_level: 99 },
    { id: 302, store_id: 3, category: 'E-Bike', qr_code: 'QQ-EB-302', frame_number: 'FR-99921', name: 'QQ Luxury E-Cruiser #2', status: 'RENTED', hourly_rate: 10, daily_rate: 45, deposit_amount: 70, battery_level: 50 },
    { id: 303, store_id: 3, category: 'E-Scooter', qr_code: 'QQ-ES-401', frame_number: 'FR-44501', name: 'QQ Ultra Scooter X #1', status: 'AVAILABLE', hourly_rate: 8, daily_rate: 35, deposit_amount: 40, battery_level: 94 },

    // Nerja Store (Store 4)
    { id: 401, store_id: 4, category: 'Mountain Bike', qr_code: 'QQ-MB-501', frame_number: 'FR-77801', name: 'QQ Cliff Rider MTB #1', status: 'AVAILABLE', hourly_rate: 7, daily_rate: 30, deposit_amount: 40 },
    { id: 402, store_id: 4, category: 'E-Bike', qr_code: 'QQ-EB-401', frame_number: 'FR-99930', name: 'QQ Canyon E-Explorer #1', status: 'AVAILABLE', hourly_rate: 9, daily_rate: 40, deposit_amount: 60, battery_level: 85 },

    // Fuengirola Store (Store 5)
    { id: 501, store_id: 5, category: 'E-Scooter', qr_code: 'QQ-ES-501', frame_number: 'FR-44601', name: 'QQ Promenade Scooter #1', status: 'AVAILABLE', hourly_rate: 6, daily_rate: 25, deposit_amount: 30, battery_level: 91 },
    { id: 502, store_id: 5, category: 'City Bike', qr_code: 'QQ-CB-401', frame_number: 'FR-11301', name: 'QQ Beach City Cruiser #1', status: 'AVAILABLE', hourly_rate: 4, daily_rate: 18, deposit_amount: 20 }
  ] as Vehicle[],

  contracts: [
    {
      id: 5001,
      contract_number: 'CTR-2026-0801',
      store_id: 1,
      employee_id: 2,
      employee_name: 'Sofia Employee',
      customer_name: 'Lucas Weber',
      customer_passport: 'X9812457A',
      customer_phone: '+49 171 998877',
      vehicle_id: 102,
      vehicle_name: 'QQ Urban E-Cruiser Pro #2',
      start_time: new Date(Date.now() - 3600000 * 3).toISOString(),
      end_time: new Date(Date.now() + 3600000 * 5).toISOString(),
      status: 'ACTIVE',
      rental_fee: 35,
      deposit_collected: 50,
      deposit_refunded: 0,
      extra_charges: 0,
      payment_method: 'CARD',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 5002,
      contract_number: 'CTR-2026-0802',
      store_id: 1,
      employee_id: 2,
      employee_name: 'Sofia Employee',
      customer_name: 'Emma Watson',
      customer_passport: 'GB-7712390',
      customer_phone: '+44 7700 900077',
      vehicle_id: 107,
      vehicle_name: 'QQ Pro Scooter Turbo #2',
      start_time: new Date(Date.now() - 3600000 * 2).toISOString(),
      end_time: new Date(Date.now() + 3600000 * 4).toISOString(),
      status: 'ACTIVE',
      rental_fee: 25,
      deposit_collected: 30,
      deposit_refunded: 0,
      extra_charges: 0,
      payment_method: 'CASH',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 5003,
      contract_number: 'CTR-2026-0799',
      store_id: 1,
      employee_id: 2,
      employee_name: 'Sofia Employee',
      customer_name: 'Antoine Dupont',
      customer_passport: 'FR-8899120',
      customer_phone: '+33 6 12 34 56 78',
      vehicle_id: 101,
      vehicle_name: 'QQ Urban E-Cruiser Pro #1',
      start_time: new Date(Date.now() - 3600000 * 24).toISOString(),
      end_time: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: 'COMPLETED',
      rental_fee: 35,
      deposit_collected: 50,
      deposit_refunded: 50,
      extra_charges: 0,
      payment_method: 'CARD',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 5004,
      contract_number: 'CTR-2026-0803',
      store_id: 2,
      employee_id: 3,
      employee_name: 'Mateo Counter',
      customer_name: 'Hans Müller',
      customer_passport: 'DE-4455112',
      customer_phone: '+49 160 887766',
      vehicle_id: 203,
      vehicle_name: 'QQ Family Cargo E-Bike #2',
      start_time: new Date(Date.now() - 3600000 * 4).toISOString(),
      end_time: new Date(Date.now() + 3600000 * 6).toISOString(),
      status: 'ACTIVE',
      rental_fee: 55,
      deposit_collected: 80,
      deposit_refunded: 0,
      extra_charges: 0,
      payment_method: 'CARD',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ] as RentalContract[],

  shifts: [
    {
      id: 901,
      store_id: 1,
      employee_id: 2,
      employee_name: 'Sofia Employee',
      start_time: new Date(Date.now() - 3600000 * 6).toISOString(),
      opening_cash: 150,
      status: 'OPEN'
    },
    {
      id: 902,
      store_id: 2,
      employee_id: 3,
      employee_name: 'Mateo Counter',
      start_time: new Date(Date.now() - 3600000 * 8).toISOString(),
      opening_cash: 200,
      status: 'OPEN'
    }
  ] as Shift[]
};

export const initializeSchema = async () => {
  if (!isMySQLActive()) {
    console.log('⚡ Initialized QQBikes extended multi-campsite dataset with 30+ vehicles & contracts.');
    return;
  }

  try {
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) NOT NULL,
        city VARCHAR(50),
        address VARCHAR(255),
        phone VARCHAR(30),
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        store_id INT NOT NULL,
        user_type ENUM('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        phone VARCHAR(30),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        qr_code VARCHAR(50) UNIQUE NOT NULL,
        frame_number VARCHAR(50),
        name VARCHAR(100) NOT NULL,
        status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE') DEFAULT 'AVAILABLE',
        hourly_rate DECIMAL(10,2) NOT NULL,
        daily_rate DECIMAL(10,2) NOT NULL,
        deposit_amount DECIMAL(10,2) NOT NULL,
        battery_level INT DEFAULT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rental_contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contract_number VARCHAR(50) UNIQUE NOT NULL,
        store_id INT NOT NULL,
        employee_id INT NOT NULL,
        employee_name VARCHAR(100),
        customer_name VARCHAR(100) NOT NULL,
        customer_passport VARCHAR(50) NOT NULL,
        customer_phone VARCHAR(30) NOT NULL,
        vehicle_id INT NOT NULL,
        vehicle_name VARCHAR(100),
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
        rental_fee DECIMAL(10,2) NOT NULL,
        deposit_collected DECIMAL(10,2) NOT NULL,
        deposit_refunded DECIMAL(10,2) DEFAULT 0,
        extra_charges DECIMAL(10,2) DEFAULT 0,
        payment_method ENUM('CASH', 'CARD') DEFAULT 'CARD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        employee_id INT NOT NULL,
        employee_name VARCHAR(100),
        start_time DATETIME NOT NULL,
        end_time DATETIME DEFAULT NULL,
        opening_cash DECIMAL(10,2) NOT NULL,
        closing_cash DECIMAL(10,2) DEFAULT NULL,
        expected_cash DECIMAL(10,2) DEFAULT NULL,
        discrepancy DECIMAL(10,2) DEFAULT NULL,
        status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
        notes TEXT
      );
    `);

    console.log('✅ MySQL schema synchronized successfully.');
  } catch (err: any) {
    console.error('⚠️ MySQL table creation failed:', err.message);
  }
};
