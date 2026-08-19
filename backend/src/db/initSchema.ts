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

export interface WeeklySchedule {
  id: number;
  store_id: number;
  day_code: 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';
  day_name: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  employee_name: string;
  start_time: string;
  end_time: string;
  task_note?: string;
}

export const memoryData = {
  stores: [
    { id: 1, company_id: 1, name: 'Málaga Beach Campsite Store', code: 'AGP-01', city: 'Málaga', address: 'Paseo Marítimo 42, Málaga', phone: '+34 952 112 233', is_active: true },
    { id: 2, company_id: 1, name: 'Torremolinos Central Hub', code: 'TOR-01', city: 'Torremolinos', address: 'Calle San Miguel 18, Torremolinos', phone: '+34 952 889 900', is_active: true },
    { id: 3, company_id: 1, name: 'Marbella Resort & Marina Store', code: 'MAR-01', city: 'Marbella', address: 'Puerto Banús Pier 7, Marbella', phone: '+34 952 774 411', is_active: true },
    { id: 4, company_id: 1, name: 'Nerja Coastal Depot', code: 'NER-01', city: 'Nerja', address: 'Plaza Balcón de Europa 3, Nerja', phone: '+34 952 520 099', is_active: true },
    { id: 5, company_id: 1, name: 'Fuengirola Promenade Hub', code: 'FUE-01', city: 'Fuengirola', address: 'Avenida Rey de España 102, Fuengirola', phone: '+34 952 471 200', is_active: true }
  ] as Store[],

  // Málaga Store Staff Accounts (Ahmet, Fran, Gustavo, Abdallah)
  users: [
    { id: 1, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'ADMIN', username: 'ahmet', email: 'ahmet@qqbikes.com', first_name: 'Ahmet', last_name: 'Manager', phone: '+34 600 111 222', is_active: true },
    { id: 2, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'fran', email: 'fran@qqbikes.com', first_name: 'Fran', last_name: 'Staff', phone: '+34 600 333 444', is_active: true },
    { id: 3, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'gustavo', email: 'gustavo@qqbikes.com', first_name: 'Gustavo', last_name: 'Staff', phone: '+34 600 555 666', is_active: true },
    { id: 4, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'abdallah', email: 'abdallah@qqbikes.com', first_name: 'Abdallah', last_name: 'Staff', phone: '+34 600 777 888', is_active: true }
  ] as User[],

  // Official Weekly Roster Schedule (Málaga Store)
  schedules: [
    // Lunes (Monday)
    { id: 1, store_id: 1, day_code: 'L', day_name: 'Lunes', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:30', task_note: 'Counter & Rentals' },
    { id: 2, store_id: 1, day_code: 'L', day_name: 'Lunes', employee_name: 'Fran', start_time: '17:00', end_time: '22:00', task_note: 'Evening Shift' },

    // Martes (Tuesday)
    { id: 3, store_id: 1, day_code: 'M', day_name: 'Martes', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:30', task_note: 'Morning Shift' },
    { id: 4, store_id: 1, day_code: 'M', day_name: 'Martes', employee_name: 'Ahmet', start_time: '17:00', end_time: '22:00', task_note: 'Evening Manager' },

    // Miércoles (Wednesday)
    { id: 5, store_id: 1, day_code: 'X', day_name: 'Miércoles', employee_name: 'Fran', start_time: '10:00', end_time: '14:00', task_note: 'Morning Counter' },
    { id: 6, store_id: 1, day_code: 'X', day_name: 'Miércoles', employee_name: 'Gustavo', start_time: '14:00', end_time: '22:00', task_note: 'Afternoon & Closing' },
    { id: 7, store_id: 1, day_code: 'X', day_name: 'Miércoles', employee_name: 'Gustavo', start_time: '10:00', end_time: '14:00', task_note: 'Fleet Maintenance' },

    // Jueves (Thursday)
    { id: 8, store_id: 1, day_code: 'J', day_name: 'Jueves', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:30', task_note: 'Morning Shift' },
    { id: 9, store_id: 1, day_code: 'J', day_name: 'Jueves', employee_name: 'Abdallah / Ahmet', start_time: '17:00', end_time: '22:00', task_note: 'Evening Shift' },

    // Viernes (Friday)
    { id: 10, store_id: 1, day_code: 'V', day_name: 'Viernes', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:00', task_note: 'Morning Shift' },
    { id: 11, store_id: 1, day_code: 'V', day_name: 'Viernes', employee_name: 'Abdallah', start_time: '17:00', end_time: '22:30', task_note: 'Weekend Launch Shift' },

    // Sábado (Saturday)
    { id: 12, store_id: 1, day_code: 'S', day_name: 'Sábado', employee_name: 'Fran', start_time: '10:00', end_time: '16:30', task_note: 'Weekend Morning' },
    { id: 13, store_id: 1, day_code: 'S', day_name: 'Sábado', employee_name: 'Ahmet', start_time: '16:00', end_time: '22:00', task_note: 'Peak Evening Shift' },

    // Domingo (Sunday)
    { id: 14, store_id: 1, day_code: 'D', day_name: 'Domingo', employee_name: 'Fran', start_time: '10:00', end_time: '16:30', task_note: 'Sunday Shift' },
    { id: 15, store_id: 1, day_code: 'D', day_name: 'Domingo', employee_name: 'Ahmet', start_time: '16:00', end_time: '22:00', task_note: 'Sunday Closing Shift' }
  ] as WeeklySchedule[],

  vehicles: [
    { id: 101, store_id: 1, category: 'E-Bike', qr_code: 'QQ-EB-101', frame_number: 'FR-99812', name: 'QQ Urban E-Cruiser Pro #1', status: 'AVAILABLE', hourly_rate: 8, daily_rate: 35, deposit_amount: 50, battery_level: 95 },
    { id: 102, store_id: 1, category: 'E-Bike', qr_code: 'QQ-EB-102', frame_number: 'FR-99813', name: 'QQ Urban E-Cruiser Pro #2', status: 'RENTED', hourly_rate: 8, daily_rate: 35, deposit_amount: 50, battery_level: 60 },
    { id: 103, store_id: 1, category: 'E-Scooter', qr_code: 'QQ-ES-201', frame_number: 'FR-44101', name: 'QQ Pro Scooter Turbo #1', status: 'AVAILABLE', hourly_rate: 6, daily_rate: 25, deposit_amount: 30, battery_level: 100 },
    { id: 104, store_id: 1, category: 'City Bike', qr_code: 'QQ-CB-301', frame_number: 'FR-11204', name: 'QQ Classic City Cruiser #1', status: 'AVAILABLE', hourly_rate: 4, daily_rate: 18, deposit_amount: 20 },
    { id: 105, store_id: 1, category: 'Mountain Bike', qr_code: 'QQ-MB-401', frame_number: 'FR-77631', name: 'QQ Trail Blazer MTB #1', status: 'MAINTENANCE', hourly_rate: 7, daily_rate: 30, deposit_amount: 40 },
    { id: 106, store_id: 1, category: 'E-Bike', qr_code: 'QQ-EB-103', frame_number: 'FR-99814', name: 'QQ Urban E-Cruiser Pro #3', status: 'AVAILABLE', hourly_rate: 8, daily_rate: 35, deposit_amount: 50, battery_level: 88 },
    { id: 107, store_id: 1, category: 'E-Scooter', qr_code: 'QQ-ES-202', frame_number: 'FR-44102', name: 'QQ Pro Scooter Turbo #2', status: 'RENTED', hourly_rate: 6, daily_rate: 25, deposit_amount: 30, battery_level: 45 },
    { id: 108, store_id: 1, category: 'Cargo Bike', qr_code: 'QQ-CG-501', frame_number: 'FR-88120', name: 'QQ Family Cargo E-Bike #1', status: 'AVAILABLE', hourly_rate: 12, daily_rate: 55, deposit_amount: 80, battery_level: 92 }
  ] as Vehicle[],

  contracts: [
    {
      id: 5001,
      contract_number: 'CTR-2026-0801',
      store_id: 1,
      employee_id: 3,
      employee_name: 'Gustavo',
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
    }
  ] as RentalContract[],

  shifts: [
    {
      id: 901,
      store_id: 1,
      employee_id: 3,
      employee_name: 'Gustavo',
      start_time: new Date(Date.now() - 3600000 * 6).toISOString(),
      opening_cash: 150,
      status: 'OPEN'
    }
  ] as Shift[]
};

export const initializeSchema = async () => {
  if (!isMySQLActive()) {
    console.log('⚡ Initialized QQBikes Málaga Staff Dataset (Ahmet, Fran, Gustavo, Abdallah) with official roster.');
    return;
  }
};
