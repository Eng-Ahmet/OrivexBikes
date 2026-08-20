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
  pin_hash?: string;
}

export interface Store {
  id: number;
  company_id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  operating_hours?: string;
  currency?: string;
  manager_user_id?: number | null;
  manager_employee_id?: number | null;
  is_active: boolean;
  initial_cash_float?: number;
  timezone?: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface UserStoreAssignment {
  id: number;
  company_id: number;
  user_id: number;
  store_id: number;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'VIEW_ONLY';
  permissions: string[];
  created_at: string;
}

export interface EmployeeStoreHistory {
  id: number;
  company_id: number;
  employee_id: number;
  store_id: number;
  effective_start: string; // ISO 8601 timestamp
  effective_end: string | null; // ISO 8601 timestamp
  reason: string;
  transferred_by: number;
  created_at: string;
}

export interface FleetLocationHistory {
  id: number;
  company_id: number;
  vehicle_id: number;
  store_id: number;
  effective_start: string; // ISO 8601 timestamp
  effective_end: string | null; // ISO 8601 timestamp
  reason: string;
  transferred_by: number;
  created_at: string;
}

export interface Vehicle {
  id: number;
  store_id: number;
  home_store_id?: number;
  current_store_id?: number;
  category: string;
  qr_code: string;
  frame_number: string;
  name: string;
  status: 'AVAILABLE' | 'RENTED' | 'RESERVED' | 'MAINTENANCE' | 'DAMAGED' | 'LOST' | 'RETIRED' | 'TRANSFER_PENDING';
  deposit_amount: number;
  hourly_rate?: number;
  daily_rate?: number;
  rate_20m?: number;
  rate_30m?: number;
  rate_1h: number;
  rate_2h?: number;
  rate_5h?: number;
  rate_1d: number;
  rate_3d?: number;
  rate_1w?: number;
  rate_2w?: number;
  battery_level?: number;
  item_owner?: 'STORE' | 'NEIGHBOR';
  neighbor_name?: string;
}

export interface ContractExtension {
  id: number;
  extended_by: string;
  additional_duration: string;
  additional_fee: number;
  created_at: string;
}

export interface RentalContract {
  id: number;
  contract_number: string;
  store_id: number;
  pickup_store_id?: number;
  return_store_id?: number;
  revenue_store_id?: number;
  employee_id: number;
  employee_name: string;
  customer_name: string;
  customer_passport: string;
  customer_phone: string;
  vehicle_id: number;
  vehicle_name: string;
  start_time: string;
  end_time: string;
  expected_end_time?: string;
  actual_return_at?: string;
  status: 'DRAFT' | 'CONFIRMED' | 'ACTIVE' | 'RETURN_PENDING' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  payment_status?: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
  deposit_status?: 'NOT_COLLECTED' | 'COLLECTED' | 'RELEASED' | 'FORFEITED';
  booking_channel?: 'STORE_COUNTER' | 'PUBLIC_WEB';
  daily_rate_snapshot?: number;
  hourly_rate_snapshot?: number;
  deposit_snapshot?: number;
  total_amount_snapshot?: number;
  expires_at?: string;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  terms_version?: string;
  privacy_version?: string;
  rental_fee: number;
  deposit_collected: number;
  deposit_refunded: number;
  deposit_retained?: number;
  extra_charges: number;
  payment_method: 'CASH' | 'CARD';
  card_guarantee_mode?: 'REFERENCE_ONLY' | 'EXTERNAL_AUTHORIZATION' | 'PRE_AUTHORIZATION';
  card_last4?: string;
  card_expiry?: string;
  created_at: string;
  updated_at?: string;
  cancelled_at?: string;
  cancelled_by?: number;
  cancellation_reason?: string;
  item_owner?: 'STORE' | 'NEIGHBOR';
  neighbor_name?: string;
  store_commission?: number;
  neighbor_payout?: number;
  extensions?: ContractExtension[];
}

export interface Expense {
  id: number;
  company_id: number;
  store_id: number;
  category: 'ELECTRICITY' | 'RENT' | 'MAINTENANCE' | 'SUPPLIES' | 'INTERNET' | 'OTHER';
  amount: number;
  date: string;
  payment_method: 'CASH' | 'CARD' | 'BANK_TRANSFER';
  description: string;
  status: 'ACTIVE' | 'VOIDED';
  created_by: number;
  created_at: string;
  voided_by: number | null;
  voided_at: string | null;
  void_reason: string | null;
}

export interface FinancialAudit {
  id: number;
  company_id: number;
  store_id: number;
  entity_type: 'EXPENSE' | 'PAYMENT' | 'PAYROLL' | 'CASH_MOVEMENT' | 'RENTAL';
  entity_id: number;
  action: 'CREATE' | 'UPDATE' | 'VOID' | 'REVERSAL';
  amount: number;
  performed_by: number;
  performed_at: string;
  notes: string;
  metadata?: Record<string, unknown>;
}

export interface CashRegister {
  id: number;
  company_id: number;
  store_id: number;
  name: string;
  is_active: boolean;
}

export interface CashShift {
  id: number;
  company_id: number;
  store_id: number;
  cash_register_id: number;
  opened_by: number;
  closed_by: number | null;
  opened_at: string;
  closed_at: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
  actual_balance: number | null;
  discrepancy: number | null;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}


export interface FinancialEvent {
  id: number;
  company_id: number;
  store_id: number;
  source_type: 'CONTRACT' | 'REPAIR';
  source_id: number;
  type: 'RENTAL_PAYMENT' | 'REPAIR_PAYMENT' | 'DEPOSIT_COLLECTED' | 'DEPOSIT_APPLIED_TO_CHARGE' | 'DEPOSIT_REFUNDED' | 'DAMAGE_CHARGE' | 'LATE_FEE' | 'OTHER_CHARGE';
  amount: number;
  direction: 'IN' | 'OUT' | 'NONE';
  payment_method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DEPOSIT_TRANSFER';
  reference_id?: string;
  created_by: number;
  request_id: string;
  idempotency_key?: string;
  created_at: string;
}

export interface NeighborSettlement {
  id: number;
  vehicle_id: number;
  contract_id: number;
  neighbor_name: string;
  gross_rental_amount: number;
  store_commission: number;
  neighbor_share: number;
  amount_paid: number;
  payment_method?: 'CASH' | 'CARD' | 'BANK_TRANSFER';
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paid_at?: string;
  paid_by?: number;
  created_at: string;
  updated_at?: string;
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
  total_cash_rentals?: number;
  total_workshop_income?: number;
  total_withdrawals?: number;
  expected_cash?: number;
  discrepancy?: number;
  status: 'OPEN' | 'CLOSED' | 'REVIEW_REQUIRED';
  notes?: string;
  cash_movements?: CashMovement[];
}

export interface CashMovement {
  id: number;
  shift_id: number;
  type: 'WITHDRAWAL' | 'ADDITION' | 'RENTAL_PAYMENT' | 'DEPOSIT_COLLECTED' | 'DEPOSIT_REFUNDED' | 'NEIGHBOR_PAYOUT';
  amount: number;
  reason: string;
  performed_by: string;
  created_by?: number;
  request_id?: string;
  idempotency_key?: string;
  created_at: string;
}

export interface IdempotencyKey {
  id: number;
  key: string;
  user_id: number;
  request_id: string;
  endpoint: string;
  request_hash: string;
  response_status?: number;
  response_body?: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  expires_at: string;
  created_at: string;
}

export interface Setting {
  id: number;
  store_id?: number;
  key: string;
  value: string;
  value_type: 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'JSON';
  description?: string;
  updated_by: number;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  company_id: number;
  store_id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  old_values?: string;
  new_values?: string;
  request_id: string;
  idempotency_key?: string;
  ip_address?: string;
  created_at: string;
}

export interface HistoricalCashLog {
  id: number;
  store_id: number;
  amount: number;
  date: string;
  category: string;
  description: string;
  recorded_by: string;
  created_at: string;
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

export interface RepairPart {
  id: number;
  name: string;
  pvp_part_only: number;
  pvp_with_labor: number;
  stock_quantity: number;
  min_stock?: number;
  category: 'Scooter' | 'Bicycle' | 'General';
}

export interface Tour {
  id: number;
  title: string;
  category: string;
  duration_hours: number;
  price_per_person: number;
  rating: number;
  review_count: number;
  location: string;
  description: string;
  image_url: string;
  highlights: string[];
  available_times: string[];
  max_capacity: number;
}

export interface ScheduleSlot {
  id: number;
  store_id: number;
  day_code: string;
  employee_name: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'TOUR_GUIDE';
  type: 'STORE_COUNTER' | 'GUIDED_TOUR' | 'MAINTENANCE';
  title: string;
  start_time: string;
  end_time: string;
  status: 'CONFIRMED' | 'PENDING';
}

export interface Employee {
  id: number;
  user_id?: number;
  company_id: number;
  store_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  employment_status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'ON_LEAVE';
  contract_type: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'FREELANCE';
  start_date: string;
  end_date?: string;
  hourly_rate: number;
  overtime_rate: number;
  weekend_rate: number;
  holiday_rate: number;
  standard_weekly_hours: number;
  standard_daily_hours: number;
  payment_method: 'BANK_TRANSFER' | 'CASH' | 'CHECK';
  notes?: string;
}

export interface EmployeeRateHistory {
  id: number;
  employee_id: number;
  hourly_rate: number;
  overtime_rate: number;
  weekend_rate: number;
  holiday_rate: number;
  effective_start: string;
  effective_end?: string;
  created_by: number;
  created_at: string;
}

export interface ShiftDefinition {
  id: number;
  store_id: number;
  name: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  working_days: string[];
  location: string;
  required_headcount: number;
  color_code?: string;
  notes?: string;
}

export interface EmployeeShiftAssignment {
  id: number;
  shift_id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  status: 'ASSIGNED' | 'SWAPPED' | 'CANCELLED';
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  shift_assignment_id?: number;
  date: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_clock_in?: string;
  actual_clock_out?: string;
  break_minutes: number;
  total_worked_hours: number;
  regular_hours: number;
  overtime_hours: number;
  late_minutes: number;
  early_departure_minutes: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'SICK_LEAVE' | 'VACATION' | 'UNPAID_LEAVE' | 'HOLIDAY' | 'MANUALLY_ADJUSTED';
  admin_adjusted: boolean;
  notes?: string;
}

export interface OvertimeRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  attendance_id: number;
  date: string;
  regular_hours: number;
  overtime_hours: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  reason?: string;
  approved_by?: number;
  approved_at?: string;
  notes?: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  leave_type: 'ANNUAL' | 'SICK' | 'UNPAID' | 'PERSONAL' | 'EMERGENCY';
  start_date: string;
  end_date: string;
  days_count: number;
  hours_count: number;
  is_paid: boolean;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
}

export interface ShiftSwapRequest {
  id: number;
  requester_employee_id: number;
  requester_name: string;
  target_employee_id: number;
  target_name: string;
  original_shift_id: number;
  target_shift_id: number;
  shift_date: string;
  reason: string;
  status: 'PENDING_EMPLOYEE' | 'ACCEPTED_EMPLOYEE' | 'REJECTED_EMPLOYEE' | 'PENDING_MANAGER' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  accepted_by_employee_at?: string;
  approved_by_manager_id?: number;
  approved_by_manager_at?: string;
  created_at: string;
}

export interface PayrollPeriod {
  id: number;
  store_id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  status: 'DRAFT' | 'CALCULATING' | 'PENDING_REVIEW' | 'APPROVED' | 'PAID' | 'LOCKED';
  created_at: string;
}

export interface PayrollItem {
  id: number;
  payroll_record_id: number;
  item_type: 'REGULAR_HOURS' | 'OVERTIME_HOURS' | 'WEEKEND_HOURS' | 'HOLIDAY_HOURS' | 'PAID_LEAVE' | 'UNPAID_LEAVE';
  hours_or_qty: number;
  unit_rate: number;
  total_amount: number;
  description: string;
}

export interface PayrollAdjustment {
  id: number;
  payroll_record_id: number;
  type: 'BONUS' | 'DEDUCTION' | 'ADVANCE' | 'CORRECTION';
  amount: number;
  reason: string;
  created_by: number;
  created_at: string;
}

export interface PayrollRecord {
  id: number;
  payroll_period_id: number;
  employee_id: number;
  employee_name: string;
  snapshot_hourly_rate: number;
  snapshot_overtime_rate: number;
  total_regular_hours: number;
  total_overtime_hours: number;
  total_weekend_hours: number;
  total_paid_leave_hours: number;
  gross_regular_pay: number;
  gross_overtime_pay: number;
  total_adjustments_bonuses: number;
  total_adjustments_deductions: number;
  gross_pay: number;
  net_pay: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'LOCKED';
  paid_at?: string;
  payment_method: 'BANK_TRANSFER' | 'CASH' | 'CHECK';
  transaction_ref?: string;
  items?: PayrollItem[];
  adjustments?: PayrollAdjustment[];
}


export interface PublicBooking {
  id: number;
  booking_code: string;
  type: 'TOUR' | 'FLEET';
  item_id: number;
  item_name: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  duration_days?: number;
  duration_hours?: number;
  quantity_or_participants: number;
  total_price: number;
  payment_status: 'PAY_AT_STORE' | 'PAID';
  payment_method: 'CASH' | 'CARD';
  status: 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  qr_code_payload: string;
  created_at: string;
}

export interface CustomerReview {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: number | null;
  approved_at?: string | null;
  rejected_by?: number | null;
  rejected_at?: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  ticket_code: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  staff_notes?: string;
  created_at: string;
}

export interface TourBooking {
  id: number;
  booking_code: string;
  tour_id: number;
  tour_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  participants: number;
  price_per_person: number;
  total_amount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  payment_status: 'PAY_AT_STORE' | 'PAID';
  created_at: string;
}

export interface NotificationOutbox {
  id: number;
  type: 'EMAIL_CONFIRMATION' | 'SUPPORT_NOTIFICATION';
  recipient: string;
  payload: any;
  status: 'PENDING' | 'SENT' | 'FAILED';
  attempts: number;
  last_error?: string;
  created_at: string;
  processed_at?: string;
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  is_active: boolean;
  order_num: number;
}

export interface RepairTicketPart {
  id: number;
  repair_order_id: number;
  part_id: number;
  part_name: string;
  quantity: number;
  unit_cost: number;
  selling_price: number;
  total: number;
}

export interface RepairService {
  id: number;
  name: string;
  price: number;
  category: 'Bicycle' | 'Labor';
}

export interface RepairWorkOrder {
  id: number;
  ticket_number: string;
  store_id: number;
  customer_name: string;
  customer_phone: string;
  device_model: string;
  issue_description: string;
  parts_used?: string;
  parts?: RepairTicketPart[];
  parts_cost: number;
  labor_cost: number;
  total_price: number;
  status: 'RECEIVED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED_PAID' | 'CANCELLED';
  created_at: string;
  updated_at?: string;
}

// Generate exact 53 Malaga physical inventory units based on handwritten sheet
const generateMalagaInventory = (): Vehicle[] => {
  const units: Vehicle[] = [];
  let currentId = 101;

  // 1. Patinetes Etwow (4 units)
  for (let i = 1; i <= 4; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Scooters',
      qr_code: `QQ-ETW-${String(i).padStart(2, '0')}`,
      frame_number: `FR-ETW-${100 + i}`,
      name: `Patinete Etwow #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 50,
      rate_30m: 10,
      rate_1h: 15,
      rate_2h: 20,
      rate_1d: 40,
      rate_3d: 30,
      rate_1w: 25,
      rate_2w: 20,
      battery_level: 90 + i,
      item_owner: 'STORE'
    });
  }

  // 2. Patinetes Ninebot (4 units)
  for (let i = 1; i <= 4; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Scooters',
      qr_code: `QQ-NIN-${String(i).padStart(2, '0')}`,
      frame_number: `FR-NIN-${200 + i}`,
      name: `Patinete Ninebot #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 50,
      rate_30m: 10,
      rate_1h: 15,
      rate_2h: 20,
      rate_1d: 40,
      rate_3d: 30,
      rate_1w: 25,
      rate_2w: 20,
      battery_level: 85 + i,
      item_owner: 'STORE'
    });
  }

  // 3. E-Bikes (VISA) (8 units)
  for (let i = 1; i <= 8; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'E-Bikes (VISA)',
      qr_code: `QQ-EB-${String(i).padStart(2, '0')}`,
      frame_number: `FR-EB-${300 + i}`,
      name: `E-Bike City Cruiser #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 100,
      rate_1h: 15,
      rate_2h: 20,
      rate_5h: 25,
      rate_1d: 40,
      rate_3d: 30,
      rate_1w: 25,
      rate_2w: 20,
      battery_level: 90 + i,
      item_owner: 'STORE'
    });
  }

  // 4. Quads (4 units)
  for (let i = 1; i <= 4; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'S cars/Quads',
      qr_code: `QQ-QD-${String(i).padStart(2, '0')}`,
      frame_number: `FR-QD-${400 + i}`,
      name: `Quad S-Car #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 20,
      rate_20m: 10,
      rate_30m: 15,
      rate_1h: 25,
      rate_1d: 50,
      item_owner: 'STORE'
    });
  }

  // 5. XL Cars (5 units)
  for (let i = 1; i <= 5; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'XL Cars',
      qr_code: `QQ-XL-${String(i).padStart(2, '0')}`,
      frame_number: `FR-XL-${500 + i}`,
      name: `XL Car #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 20,
      rate_20m: 15,
      rate_30m: 20,
      rate_1h: 30,
      rate_1d: 60,
      item_owner: 'STORE'
    });
  }

  // 6. Jeep (1 unit)
  units.push({
    id: currentId++,
    store_id: 1,
    category: 'XL Cars',
    qr_code: 'QQ-JEP-01',
    frame_number: 'FR-JEP-601',
    name: 'Jeep Off-Road #1',
    status: 'AVAILABLE',
    deposit_amount: 20,
    rate_20m: 15,
    rate_30m: 20,
    rate_1h: 30,
    rate_1d: 60,
    item_owner: 'STORE'
  });

  // 7. Buggys In. Azules (2 units)
  for (let i = 1; i <= 2; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: "Buggy's",
      qr_code: `QQ-BUG-AZ${i}`,
      frame_number: `FR-BUG-70${i}`,
      name: `Buggy Azul #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 20,
      rate_30m: 5,
      rate_1h: 25,
      rate_1d: 50,
      item_owner: 'STORE'
    });
  }

  // 8. Buggys D. Rojo y Naranja (2 units)
  for (let i = 1; i <= 2; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: "Buggy's",
      qr_code: `QQ-BUG-RJ${i}`,
      frame_number: `FR-BUG-71${i}`,
      name: `Buggy Rojo/Naranja #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 20,
      rate_30m: 5,
      rate_1h: 25,
      rate_1d: 50,
      item_owner: 'STORE'
    });
  }

  // 9. Bicis Niño (2 units)
  for (let i = 1; i <= 2; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Bikes',
      qr_code: `QQ-BCN-${String(i).padStart(2, '0')}`,
      frame_number: `FR-BCN-80${i}`,
      name: `Bici Niño #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 30,
      rate_1h: 5,
      rate_5h: 15,
      rate_1d: 20,
      rate_3d: 15,
      rate_1w: 10,
      rate_2w: 8,
      item_owner: 'STORE'
    });
  }

  // 10. Quert Bicycles (10 units)
  for (let i = 1; i <= 10; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Bikes',
      qr_code: `QQ-QRT-${String(i).padStart(2, '0')}`,
      frame_number: `FR-QRT-${900 + i}`,
      name: `Bicicleta Quert #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 30,
      rate_1h: 5,
      rate_5h: 15,
      rate_1d: 20,
      rate_3d: 15,
      rate_1w: 10,
      rate_2w: 8,
      item_owner: 'STORE'
    });
  }

  // 11. Altec Bicycles (8 units)
  for (let i = 1; i <= 8; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Bikes',
      qr_code: `QQ-ALT-${String(i).padStart(2, '0')}`,
      frame_number: `FR-ALT-${950 + i}`,
      name: `Bicicleta Altec #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 30,
      rate_1h: 5,
      rate_5h: 15,
      rate_1d: 20,
      rate_3d: 15,
      rate_1w: 10,
      rate_2w: 8,
      item_owner: 'STORE'
    });
  }

  // 12. Mountain Bikes BH (3 units)
  for (let i = 1; i <= 3; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Bikes',
      qr_code: `QQ-MTB-${String(i).padStart(2, '0')}`,
      frame_number: `FR-MTB-${980 + i}`,
      name: `Bicicleta MTB BH #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 30,
      rate_1h: 5,
      rate_5h: 15,
      rate_1d: 20,
      rate_3d: 15,
      rate_1w: 10,
      rate_2w: 8,
      item_owner: 'STORE'
    });
  }

  // 13. Neighbor Equipment Partner Items
  units.push({
    id: 991,
    store_id: 1,
    category: 'Accessories / Shoes',
    qr_code: 'QQ-NGH-SH01',
    frame_number: 'NEIGHBOR-SHOE-01',
    name: 'Specialized Cycling Shoes (Pepe Partner)',
    status: 'AVAILABLE',
    deposit_amount: 20,
    rate_1h: 5,
    rate_1d: 15,
    item_owner: 'NEIGHBOR',
    neighbor_name: 'Pepe Neighbor Shop'
  });

  return units;
};

export const memoryData = {
  stores: [
    { id: 1, company_id: 1, name: 'Málaga Beach Campsite Store', code: 'AGP-01', city: 'Málaga', address: 'Paseo Marítimo 42, Málaga', phone: '+34 952 112 233', email: 'malaga@qqbikes.com', operating_hours: '09:00 - 22:00', currency: 'EUR', manager_user_id: 1, manager_employee_id: 1, is_active: true, initial_cash_float: 150.00, created_at: '2025-01-01T00:00:00.000Z', updated_at: null },
    { id: 2, company_id: 1, name: 'Torremolinos Central Hub', code: 'TOR-01', city: 'Torremolinos', address: 'Calle San Miguel 18, Torremolinos', phone: '+34 952 889 900', email: 'torremolinos@qqbikes.com', operating_hours: '09:30 - 21:30', currency: 'EUR', manager_user_id: 2, manager_employee_id: 2, is_active: true, initial_cash_float: 150.00, created_at: '2025-02-01T00:00:00.000Z', updated_at: null },
    { id: 3, company_id: 1, name: 'Marbella Port & Marina Hub', code: 'MAR-01', city: 'Marbella', address: 'Puerto Banús Local 5, Marbella', phone: '+34 952 777 555', email: 'marbella@qqbikes.com', operating_hours: '10:00 - 23:00', currency: 'EUR', manager_user_id: 1, manager_employee_id: 3, is_active: true, initial_cash_float: 200.00, created_at: '2025-05-01T00:00:00.000Z', updated_at: null }
  ] as Store[],

  user_store_assignments: [
    { id: 1, company_id: 1, user_id: 1, store_id: 1, role: 'ADMIN', permissions: ['stores.view', 'stores.create', 'stores.update', 'stores.activate', 'stores.manage_assignments', 'employees.view', 'employees.transfer', 'fleet.view', 'fleet.transfer', 'rentals.create', 'expenses.manage', 'cash.manage', 'payroll.view', 'payroll.manage'], created_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, company_id: 1, user_id: 1, store_id: 2, role: 'ADMIN', permissions: ['stores.view', 'stores.update', 'employees.view', 'employees.transfer', 'fleet.view', 'fleet.transfer', 'rentals.create', 'expenses.manage', 'cash.manage', 'payroll.view'], created_at: '2025-01-01T00:00:00.000Z' },
    { id: 3, company_id: 1, user_id: 1, store_id: 3, role: 'ADMIN', permissions: ['stores.view', 'stores.update', 'employees.view', 'employees.transfer', 'fleet.view', 'fleet.transfer', 'rentals.create', 'expenses.manage', 'cash.manage', 'payroll.view'], created_at: '2025-05-01T00:00:00.000Z' },
    { id: 4, company_id: 1, user_id: 2, store_id: 2, role: 'MANAGER', permissions: ['stores.view', 'employees.view', 'fleet.view', 'rentals.create', 'expenses.manage', 'cash.manage'], created_at: '2025-02-01T00:00:00.000Z' },
    { id: 5, company_id: 1, user_id: 3, store_id: 1, role: 'EMPLOYEE', permissions: ['rentals.create', 'attendance.clock', 'cash.manage'], created_at: '2025-01-15T00:00:00.000Z' },
    { id: 6, company_id: 1, user_id: 4, store_id: 1, role: 'EMPLOYEE', permissions: ['rentals.create', 'attendance.clock'], created_at: '2025-02-01T00:00:00.000Z' }
  ] as UserStoreAssignment[],

  employee_store_history: [
    { id: 1, company_id: 1, employee_id: 1, store_id: 1, effective_start: '2025-01-15T09:00:00.000Z', effective_end: null, reason: 'Initial hire at Malaga Beach', transferred_by: 1, created_at: '2025-01-15T09:00:00.000Z' },
    { id: 2, company_id: 1, employee_id: 2, store_id: 1, effective_start: '2025-02-01T09:00:00.000Z', effective_end: null, reason: 'Initial hire at Malaga Beach', transferred_by: 1, created_at: '2025-02-01T09:00:00.000Z' }
  ] as EmployeeStoreHistory[],

  fleet_location_history: [
    { id: 1, company_id: 1, vehicle_id: 1, store_id: 1, effective_start: '2025-01-01T00:00:00.000Z', effective_end: null, reason: 'Initial fleet deployment', transferred_by: 1, created_at: '2025-01-01T00:00:00.000Z' }
  ] as FleetLocationHistory[],

  expenses: [
    { id: 1, company_id: 1, store_id: 1, category: 'RENT', amount: 1800.00, date: '2026-08-01', payment_method: 'BANK_TRANSFER', description: 'Monthly store premise rent', status: 'ACTIVE', created_by: 1, created_at: '2026-08-01T10:00:00.000Z', voided_by: null, voided_at: null, void_reason: null },
    { id: 2, company_id: 1, store_id: 1, category: 'ELECTRICITY', amount: 320.50, date: '2026-08-05', payment_method: 'BANK_TRANSFER', description: 'Summer air conditioning & e-bike charging electricity bill', status: 'ACTIVE', created_by: 1, created_at: '2026-08-05T14:30:00.000Z', voided_by: null, voided_at: null, void_reason: null },
    { id: 3, company_id: 1, store_id: 1, category: 'SUPPLIES', amount: 150.00, date: '2026-08-10', payment_method: 'CASH', description: 'Store cleaning supplies and water bottles for clients', status: 'ACTIVE', created_by: 1, created_at: '2026-08-10T11:15:00.000Z', voided_by: null, voided_at: null, void_reason: null }
  ] as Expense[],

  financial_audits: [
    { id: 1, company_id: 1, store_id: 1, entity_type: 'EXPENSE', entity_id: 1, action: 'CREATE', amount: 1800.00, performed_by: 1, performed_at: '2026-08-01T10:00:00.000Z', notes: 'Created monthly store rent expense entry', metadata: { category: 'RENT', payment_method: 'BANK_TRANSFER' } }
  ] as FinancialAudit[],

  cash_registers: [
    { id: 1, company_id: 1, store_id: 1, name: 'Main Counter Register #1', is_active: true },
    { id: 2, company_id: 1, store_id: 2, name: 'Torremolinos Till #1', is_active: true },
    { id: 3, company_id: 1, store_id: 3, name: 'Marbella Port Till #1', is_active: true }
  ] as CashRegister[],

  cash_shifts: [
    { id: 1, company_id: 1, store_id: 1, cash_register_id: 1, opened_by: 3, closed_by: null, opened_at: '2026-08-20T08:30:00.000Z', closed_at: null, opening_balance: 150.00, closing_balance: null, expected_balance: 450.00, actual_balance: null, discrepancy: null, status: 'OPEN', notes: 'Active morning cash shift' }
  ] as CashShift[],

  users: [
    { id: 1, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'ADMIN', username: 'miguel', email: 'miguel@qqbikes.com', first_name: 'Miguel', last_name: 'Manager', phone: '+34 600 111 000', is_active: true, pin_hash: '1111' },
    { id: 2, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'ADMIN', username: 'quique', email: 'quique@qqbikes.com', first_name: 'Quique', last_name: 'Manager', phone: '+34 600 222 000', is_active: true, pin_hash: '1111' },
    { id: 3, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'ahmet', email: 'ahmet@qqbikes.com', first_name: 'Ahmet', last_name: 'Staff', phone: '+34 600 333 111', is_active: true, pin_hash: '3333' },
    { id: 4, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'fran', email: 'fran@qqbikes.com', first_name: 'Fran', last_name: 'Staff', phone: '+34 600 333 444', is_active: true, pin_hash: '2222' },
    { id: 5, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'gustavo', email: 'gustavo@qqbikes.com', first_name: 'Gustavo', last_name: 'Staff', phone: '+34 600 555 666', is_active: true, pin_hash: '1234' },
    { id: 6, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'abdallah', email: 'abdallah@qqbikes.com', first_name: 'Abdallah', last_name: 'Staff', phone: '+34 600 777 888', is_active: true, pin_hash: '4444' }
  ] as User[],


  schedules: [
    { id: 101, store_id: 1, day_code: 'L', employee_name: 'Gus', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Mañana', start_time: '10:00', end_time: '17:30', status: 'CONFIRMED' },
    { id: 102, store_id: 1, day_code: 'L', employee_name: 'Fran', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Tarde', start_time: '17:00', end_time: '22:00', status: 'CONFIRMED' },
    { id: 103, store_id: 1, day_code: 'M', employee_name: 'Gus', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Mañana', start_time: '10:00', end_time: '17:30', status: 'CONFIRMED' },
    { id: 104, store_id: 1, day_code: 'M', employee_name: 'Ahmet', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Tarde', start_time: '17:00', end_time: '22:00', status: 'CONFIRMED' },
    { id: 105, store_id: 1, day_code: 'X', employee_name: 'Fran', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Mostrador Mañana', start_time: '10:00', end_time: '14:00', status: 'CONFIRMED' },
    { id: 106, store_id: 1, day_code: 'X', employee_name: 'Gus', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Mostrador Tarde', start_time: '14:00', end_time: '22:00', status: 'CONFIRMED' },
    { id: 107, store_id: 1, day_code: 'X', employee_name: 'Gus (Mant.)', role: 'EMPLOYEE', type: 'MAINTENANCE', title: 'Mantenimiento Flota', start_time: '10:00', end_time: '14:00', status: 'CONFIRMED' },
    { id: 108, store_id: 1, day_code: 'J', employee_name: 'Gus', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Mañana', start_time: '10:00', end_time: '17:30', status: 'CONFIRMED' },
    { id: 109, store_id: 1, day_code: 'J', employee_name: 'Abdallah / Ahmet', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Tarde', start_time: '17:00', end_time: '22:00', status: 'CONFIRMED' },
    { id: 110, store_id: 1, day_code: 'V', employee_name: 'Gus', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Mañana', start_time: '10:00', end_time: '17:00', status: 'CONFIRMED' },
    { id: 111, store_id: 1, day_code: 'V', employee_name: 'Abdallah', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Tarde & Cierre', start_time: '17:00', end_time: '22:30', status: 'CONFIRMED' },
    { id: 112, store_id: 1, day_code: 'S', employee_name: 'Fran', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Finde Mañana', start_time: '10:00', end_time: '16:30', status: 'CONFIRMED' },
    { id: 113, store_id: 1, day_code: 'S', employee_name: 'Ahmet', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Finde Tarde', start_time: '16:00', end_time: '22:00', status: 'CONFIRMED' },
    { id: 114, store_id: 1, day_code: 'D', employee_name: 'Fran', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Domingo Mañana', start_time: '10:00', end_time: '16:30', status: 'CONFIRMED' },
    { id: 115, store_id: 1, day_code: 'D', employee_name: 'Ahmet', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Turno Domingo Cierre', start_time: '16:00', end_time: '22:00', status: 'CONFIRMED' },
    
    { id: 201, store_id: 2, day_code: 'L', employee_name: 'Carlos Mijas', role: 'EMPLOYEE', type: 'STORE_COUNTER', title: 'Resort Morning Shift', start_time: '09:00', end_time: '15:00', status: 'CONFIRMED' },
    { id: 202, store_id: 2, day_code: 'M', employee_name: 'Elena Mijas', role: 'TOUR_GUIDE', type: 'GUIDED_TOUR', title: 'Mijas Trail Safari', start_time: '10:00', end_time: '13:00', status: 'CONFIRMED' }
  ] as ScheduleSlot[],

  vehicles: generateMalagaInventory(),

  contracts: [] as RentalContract[],

  historical_cash_logs: [] as HistoricalCashLog[],

  shifts: [
    {
      id: 901,
      store_id: 1,
      employee_id: 3,
      employee_name: 'Ahmet',
      start_time: new Date().toISOString(),
      opening_cash: 150,
      status: 'OPEN'
    }
  ] as Shift[],

  repair_parts: [
    { id: 1, name: 'Cubierta maciza agujereada 8,5"', pvp_part_only: 18.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 2, name: 'Cubierta normal Xiaomi 8,5" (cámara no incluida)', pvp_part_only: 15.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 3, name: 'Cubierta normal Xiaomi 8,5" (cámara incluida)', pvp_part_only: 20.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 4, name: 'Cámara 8,5 Xiaomi Reforzada', pvp_part_only: 10.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 5, name: 'Kit 10" para Xiaomi', pvp_part_only: 50.00, pvp_with_labor: 70.00, category: 'Scooter' },
    { id: 6, name: 'Llanta reforzada para Xiaomi', pvp_part_only: 10.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 7, name: 'Caballete para Xiaomi', pvp_part_only: 7.00, pvp_with_labor: 15.00, category: 'Scooter' },
    { id: 8, name: 'Disco freno para Xiaomi 110mm', pvp_part_only: 10.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 9, name: 'Disco freno para Xiaomi 120mm', pvp_part_only: 7.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 10, name: 'Disco freno para Xiaomi 135mm', pvp_part_only: 20.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 11, name: 'Maneta freno para Xiaomi', pvp_part_only: 15.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 12, name: 'Guardabarros trasero Xiaomi m365 normal (no incluye luz)', pvp_part_only: 12.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 13, name: 'Luz trasera para Xiaomi m365 (no incluye conector hasta batería)', pvp_part_only: 7.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 14, name: 'Conector luz trasera hasta batería Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 15, name: 'Guardabarros trasero completo con luz trasera y conector Xiaomi m365', pvp_part_only: 22.00, pvp_with_labor: 50.00, category: 'Scooter' },
    { id: 16, name: 'Aro cierre para Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 17, name: 'Pantalla original + tapa para Xiaomi m365', pvp_part_only: 45.00, pvp_with_labor: 65.00, category: 'Scooter' },
    { id: 18, name: 'Pantalla original para Xiaomi m365 Pro (sin tapa)', pvp_part_only: 55.00, pvp_with_labor: 75.00, category: 'Scooter' },
    { id: 19, name: 'Acelerador compatible para Xiaomi m365', pvp_part_only: 15.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 20, name: 'Eje leva para Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 21, name: 'Tornillo pasador Negro o plateado para Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 22, name: 'Controladora original para Xiaomi m365', pvp_part_only: 100.00, pvp_with_labor: 125.00, category: 'Scooter' },
    { id: 23, name: 'Controladora V3 compatible para Xiaomi m365', pvp_part_only: 70.00, pvp_with_labor: 95.00, category: 'Scooter' },
    { id: 24, name: 'Placa BMS para Xiaomi m365', pvp_part_only: 70.00, pvp_with_labor: 95.00, category: 'Scooter' },
    { id: 25, name: 'Juego pastillas de freno Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 26, name: 'Pinza Xtech para Xiaomi m365 (no incluye pastillas)', pvp_part_only: 40.00, pvp_with_labor: 55.00, category: 'Scooter' },
    { id: 27, name: 'Cable de freno para Xiaomi m365 (incluye funda)', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 28, name: 'Cable Motor para Xiaomi m365', pvp_part_only: 15.00, pvp_with_labor: 50.00, category: 'Scooter' },
    { id: 29, name: 'Motor para Xiaomi m365/Pro 350W (incluye neumático inflado)', pvp_part_only: 155.00, pvp_with_labor: 185.00, category: 'Scooter' }
  ] as RepairPart[],

  repair_services: [
    { id: 1, name: 'Pinchazo bicicleta normal', price: 10.00, category: 'Bicycle' },
    { id: 2, name: 'Revisión básica', price: 10.00, category: 'Bicycle' },
    { id: 3, name: 'Revisión completa', price: 15.00, category: 'Bicycle' },
    { id: 4, name: 'Arreglo/ajuste express', price: 5.00, category: 'Bicycle' },
    { id: 5, name: 'Pinchazo e-bike', price: 12.00, category: 'Bicycle' },
    { id: 6, name: 'Revisión completa + limpieza', price: 25.00, category: 'Bicycle' },
    { id: 7, name: 'Venta cámara 20", 24", 26", 27,5" o 700 (29")', price: 5.00, category: 'Bicycle' },
    { id: 8, name: 'Cambio freno juego Zapatas', price: 10.00, category: 'Bicycle' },
    { id: 9, name: 'Cambio pastillas (por cada par)', price: 25.00, category: 'Bicycle' }
  ] as RepairService[],

  repair_work_orders: [
    {
      id: 501,
      ticket_number: 'REP-2026-001',
      store_id: 1,
      customer_name: 'Carlos Fernandez',
      customer_phone: '+34 655 443 221',
      device_model: 'Xiaomi m365 Pro (Customer Bike)',
      issue_description: 'Rear tire puncture & brake pad wear adjustment',
      parts_used: 'Cubierta maciza agujereada 8,5"',
      parts_cost: 18.00,
      labor_cost: 17.00,
      total_price: 35.00,
      status: 'IN_PROGRESS',
      created_at: new Date().toISOString()
    }
  ] as RepairWorkOrder[],

  financial_events: [] as FinancialEvent[],
  cash_movements: [] as CashMovement[],
  neighbor_settlements: [] as NeighborSettlement[],
  idempotency_keys: [] as IdempotencyKey[],
  settings: [
    { id: 1, store_id: 1, key: 'GRACE_PERIOD_MINUTES', value: '15', value_type: 'INTEGER', description: 'Grace period minutes before extra hour fee', updated_by: 1, updated_at: new Date().toISOString() },
    { id: 2, store_id: 1, key: 'CARD_GUARANTEE_MODE', value: 'REFERENCE_ONLY', value_type: 'STRING', description: 'Default credit card guarantee mode', updated_by: 1, updated_at: new Date().toISOString() }
  ] as Setting[],
  tours: [
    {
      id: 1,
      title: 'Sunset Coast Bike Tour',
      category: 'Guided Tour',
      duration_hours: 2,
      price_per_person: 35,
      rating: 4.9,
      review_count: 128,
      location: 'Málaga Beach Promenade',
      description: 'Explore the stunning Mediterranean coastline during the golden hour with an expert local guide. Includes premium e-bike and helmet.',
      image_url: '/assets/screenshot-desktop.png',
      highlights: ['Scenic Coastal Promenade', 'Historic Port of Málaga', 'Sunset Viewpoint Stop', 'Complimentary Drink'],
      available_times: ['10:00', '14:00', '18:00'],
      max_capacity: 12
    },
    {
      id: 2,
      title: 'Historic Old Town & Alcazaba E-Safari',
      category: 'E-Bike Safari',
      duration_hours: 3,
      price_per_person: 45,
      rating: 4.8,
      review_count: 94,
      location: 'Málaga Historic Center',
      description: 'Effortlessly climb up to Gibralfaro Castle and ride through Roman Theatre and Alcazaba fortress trails.',
      image_url: '/assets/screenshot-mobile.png',
      highlights: ['Gibralfaro Panoramic Overlook', 'Alcazaba Fortress Trails', 'Roman Amphitheatre', 'Local Tapas Tasting'],
      available_times: ['10:30', '15:00', '17:30'],
      max_capacity: 10
    },
    {
      id: 3,
      title: 'Costa del Sol Countryside Trail',
      category: 'Adventure Tour',
      duration_hours: 4,
      price_per_person: 55,
      rating: 5.0,
      review_count: 67,
      location: 'Mijas & Coastal Mountain Trail',
      description: 'Ride through pine forests, avocado groves, and coastal hills with high-performance all-terrain e-mountain bikes.',
      image_url: '/assets/screenshot-desktop.png',
      highlights: ['Pine Forest Trails', 'Mijas Mountain Views', 'All-Terrain E-MTB', 'Organic Fruit Refreshments'],
      available_times: ['09:30', '14:30'],
      max_capacity: 8
    }
  ] as Tour[],
  public_bookings: [] as PublicBooking[],
  customer_reviews: [
    { id: 1, customer_name: 'Sofia Martinez', rating: 5, comment: 'Renting the e-bike for a day along Malaga promenade was the highlight of our vacation! Super smooth bikes and great service.', status: 'APPROVED', approved_by: 1, approved_at: '2026-08-10T10:00:00.000Z', created_at: '2026-08-09T14:20:00.000Z' },
    { id: 2, customer_name: 'Lucas Weber', rating: 5, comment: 'Patinete Ninebot was in pristine condition. Easy online booking, quick pick up at Málaga Beach store.', status: 'APPROVED', approved_by: 1, approved_at: '2026-08-12T11:00:00.000Z', created_at: '2026-08-11T16:45:00.000Z' },
    { id: 3, customer_name: 'David Smith', rating: 4, comment: 'Great sunset tour experience. Highly recommended for couples visiting Malaga!', status: 'APPROVED', approved_by: 1, approved_at: '2026-08-15T09:30:00.000Z', created_at: '2026-08-14T18:10:00.000Z' }
  ] as CustomerReview[],
  support_tickets: [] as SupportTicket[],
  tour_bookings: [] as TourBooking[],
  notification_outbox: [] as NotificationOutbox[],
  faqs: [
    { id: 1, category: 'Rental Requirements', question: 'What do I need to rent a bike or scooter?', answer: 'You need a valid passport or government ID card, a contact phone number, and a security deposit (cash or credit card guarantee).', is_active: true, order_num: 1 },
    { id: 2, category: 'Deposits & Liability', question: 'How does the security deposit work?', answer: 'A security deposit (e.g. €30 - €100 depending on vehicle category) is pre-authorized or collected at pickup and fully released upon safe, undamaged return.', is_active: true, order_num: 2 },
    { id: 3, category: 'Booking & Payment', question: 'Can I pay at the store?', answer: 'Yes! You can reserve your bike online with zero upfront charge ("Pay at Store") or complete payment online.', is_active: true, order_num: 3 },
    { id: 4, category: 'Late Returns & Extensions', question: 'What happens if I return the bike late?', answer: 'We offer a 15-minute grace period. Beyond that, additional hourly rates apply as specified in your rental agreement.', is_active: true, order_num: 4 },
    { id: 5, category: 'Guided Tours', question: 'Are helmets and gear included in guided tours?', answer: 'Yes, all guided tours include a high-quality helmet, e-bike/scooter rental, lock, and expert local guide.', is_active: true, order_num: 5 }
  ] as FaqItem[],
  audit_logs: [] as AuditLog[],

  employees: [
    {
      id: 1,
      user_id: 3,
      company_id: 1,
      store_id: 1,
      employee_code: 'EMP-101',
      first_name: 'Ahmet',
      last_name: 'Staff',
      email: 'ahmet@qqbikes.com',
      phone: '+34 600 333 111',
      job_title: 'Store Specialist & Rental Operator',
      department: 'Store Operations',
      employment_status: 'ACTIVE',
      contract_type: 'FULL_TIME',
      start_date: '2025-01-15',
      hourly_rate: 12.00,
      overtime_rate: 18.00,
      weekend_rate: 15.00,
      holiday_rate: 24.00,
      standard_weekly_hours: 40,
      standard_daily_hours: 8,
      payment_method: 'BANK_TRANSFER',
      notes: 'Lead counter specialist for Malaga Beach location'
    },
    {
      id: 2,
      user_id: 4,
      company_id: 1,
      store_id: 1,
      employee_code: 'EMP-102',
      first_name: 'Fran',
      last_name: 'Staff',
      email: 'fran@qqbikes.com',
      phone: '+34 600 333 444',
      job_title: 'Senior Rental Specialist',
      department: 'Store Operations',
      employment_status: 'ACTIVE',
      contract_type: 'FULL_TIME',
      start_date: '2025-02-01',
      hourly_rate: 11.50,
      overtime_rate: 17.25,
      weekend_rate: 14.50,
      holiday_rate: 23.00,
      standard_weekly_hours: 40,
      standard_daily_hours: 8,
      payment_method: 'BANK_TRANSFER',
      notes: 'Shift manager for evening counter operations'
    },
    {
      id: 3,
      user_id: 5,
      company_id: 1,
      store_id: 1,
      employee_code: 'EMP-103',
      first_name: 'Gustavo',
      last_name: 'Staff',
      email: 'gustavo@qqbikes.com',
      phone: '+34 600 555 666',
      job_title: 'Fleet Maintenance & Logistics Specialist',
      department: 'Maintenance & Workshop',
      employment_status: 'ACTIVE',
      contract_type: 'FULL_TIME',
      start_date: '2024-11-10',
      hourly_rate: 13.00,
      overtime_rate: 19.50,
      weekend_rate: 16.00,
      holiday_rate: 26.00,
      standard_weekly_hours: 40,
      standard_daily_hours: 8,
      payment_method: 'BANK_TRANSFER',
      notes: 'Certified e-scooter and e-bike technician'
    },
    {
      id: 4,
      user_id: 6,
      company_id: 1,
      store_id: 1,
      employee_code: 'EMP-104',
      first_name: 'Abdallah',
      last_name: 'Staff',
      email: 'abdallah@qqbikes.com',
      phone: '+34 600 777 888',
      job_title: 'Customer Service & Rental Operator',
      department: 'Store Operations',
      employment_status: 'ACTIVE',
      contract_type: 'PART_TIME',
      start_date: '2025-05-01',
      hourly_rate: 10.50,
      overtime_rate: 15.75,
      weekend_rate: 13.00,
      holiday_rate: 21.00,
      standard_weekly_hours: 24,
      standard_daily_hours: 6,
      payment_method: 'CASH',
      notes: 'Weekend and peak afternoon shift operator'
    }
  ] as Employee[],

  employee_rate_history: [
    {
      id: 1,
      employee_id: 1,
      hourly_rate: 10.00,
      overtime_rate: 15.00,
      weekend_rate: 12.50,
      holiday_rate: 20.00,
      effective_start: '2025-01-15',
      effective_end: '2026-06-30',
      created_by: 1,
      created_at: '2025-01-15T09:00:00.000Z'
    },
    {
      id: 2,
      employee_id: 1,
      hourly_rate: 12.00,
      overtime_rate: 18.00,
      weekend_rate: 15.00,
      holiday_rate: 24.00,
      effective_start: '2026-07-01',
      created_by: 1,
      created_at: '2026-07-01T09:00:00.000Z'
    }
  ] as EmployeeRateHistory[],

  shift_definitions: [
    {
      id: 1,
      store_id: 1,
      name: 'Turno Mañana (Morning Shift)',
      start_time: '09:00',
      end_time: '17:00',
      break_duration_minutes: 60,
      working_days: ['L', 'M', 'X', 'J', 'V'],
      location: 'Málaga Beach Campsite Store',
      required_headcount: 2,
      color_code: '#38bdf8',
      notes: 'Morning shift including morning inventory check and customer dispatch'
    },
    {
      id: 2,
      store_id: 1,
      name: 'Turno Tarde (Evening Shift)',
      start_time: '14:00',
      end_time: '22:00',
      break_duration_minutes: 60,
      working_days: ['L', 'M', 'X', 'J', 'V'],
      location: 'Málaga Beach Campsite Store',
      required_headcount: 2,
      color_code: '#a855f7',
      notes: 'Afternoon & evening returns, daily till closing'
    },
    {
      id: 3,
      store_id: 1,
      name: 'Turno Fin de Semana (Weekend Shift)',
      start_time: '10:00',
      end_time: '18:00',
      break_duration_minutes: 60,
      working_days: ['S', 'D'],
      location: 'Málaga Beach Campsite Store',
      required_headcount: 2,
      color_code: '#22c55e',
      notes: 'Weekend high-volume customer rentals and guided tours'
    }
  ] as ShiftDefinition[],

  employee_shift_assignments: [
    {
      id: 1,
      shift_id: 1,
      employee_id: 1,
      employee_name: 'Ahmet Staff',
      date: '2026-08-03',
      start_time: '09:00',
      end_time: '17:00',
      break_duration_minutes: 60,
      status: 'ASSIGNED'
    },
    {
      id: 2,
      shift_id: 2,
      employee_id: 2,
      employee_name: 'Fran Staff',
      date: '2026-08-03',
      start_time: '14:00',
      end_time: '22:00',
      break_duration_minutes: 60,
      status: 'ASSIGNED'
    }
  ] as EmployeeShiftAssignment[],

  attendance_records: [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'Ahmet Staff',
      shift_assignment_id: 1,
      date: '2026-08-03',
      scheduled_start: '09:00',
      scheduled_end: '17:00',
      actual_clock_in: '2026-08-03T08:58:00.000Z',
      actual_clock_out: '2026-08-03T19:30:00.000Z',
      break_minutes: 60,
      total_worked_hours: 9.5,
      regular_hours: 7.0,
      overtime_hours: 2.5,
      late_minutes: 0,
      early_departure_minutes: 0,
      status: 'PRESENT',
      admin_adjusted: false,
      notes: 'Stayed 2.5h late to handle high volume weekend returns'
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: 'Fran Staff',
      shift_assignment_id: 2,
      date: '2026-08-03',
      scheduled_start: '14:00',
      scheduled_end: '22:00',
      actual_clock_in: '2026-08-03T14:05:00.000Z',
      actual_clock_out: '2026-08-03T22:00:00.000Z',
      break_minutes: 60,
      total_worked_hours: 7.0,
      regular_hours: 7.0,
      overtime_hours: 0,
      late_minutes: 5,
      early_departure_minutes: 0,
      status: 'LATE',
      admin_adjusted: false,
      notes: 'Arrived 5 mins late due to traffic'
    }
  ] as AttendanceRecord[],

  overtime_records: [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'Ahmet Staff',
      attendance_id: 1,
      date: '2026-08-03',
      regular_hours: 7.0,
      overtime_hours: 2.5,
      status: 'APPROVED',
      reason: 'Assisted peak evening returns and workshop maintenance',
      approved_by: 1,
      approved_at: '2026-08-04T09:00:00.000Z',
      notes: 'Manager approved 2.5h payable overtime'
    }
  ] as OvertimeRecord[],

  leave_requests: [
    {
      id: 1,
      employee_id: 2,
      employee_name: 'Fran Staff',
      leave_type: 'ANNUAL',
      start_date: '2026-08-25',
      end_date: '2026-08-28',
      days_count: 4,
      hours_count: 28,
      is_paid: true,
      reason: 'Summer vacation holiday request',
      status: 'APPROVED',
      reviewed_by: 1,
      reviewed_at: '2026-08-10T11:00:00.000Z',
      created_at: '2026-08-08T15:30:00.000Z'
    }
  ] as LeaveRequest[],

  shift_swap_requests: [
    {
      id: 1,
      requester_employee_id: 1,
      requester_name: 'Ahmet Staff',
      target_employee_id: 2,
      target_name: 'Fran Staff',
      original_shift_id: 1,
      target_shift_id: 2,
      shift_date: '2026-08-12',
      reason: 'Personal medical appointment in the morning',
      status: 'APPROVED',
      accepted_by_employee_at: '2026-08-10T14:00:00.000Z',
      approved_by_manager_id: 1,
      approved_by_manager_at: '2026-08-10T16:00:00.000Z',
      created_at: '2026-08-10T10:00:00.000Z'
    }
  ] as ShiftSwapRequest[],

  payroll_periods: [
    {
      id: 1,
      store_id: 1,
      period_name: 'July 2026 Payroll',
      start_date: '2026-07-01',
      end_date: '2026-07-31',
      status: 'PAID',
      created_at: '2026-08-01T09:00:00.000Z'
    },
    {
      id: 2,
      store_id: 1,
      period_name: 'August 2026 Payroll',
      start_date: '2026-08-01',
      end_date: '2026-08-31',
      status: 'PENDING_REVIEW',
      created_at: '2026-08-20T10:00:00.000Z'
    }
  ] as PayrollPeriod[],

  payroll_records: [
    {
      id: 101,
      payroll_period_id: 2,
      employee_id: 1,
      employee_name: 'Ahmet Staff',
      snapshot_hourly_rate: 12.00,
      snapshot_overtime_rate: 18.00,
      total_regular_hours: 160,
      total_overtime_hours: 10,
      total_weekend_hours: 16,
      total_paid_leave_hours: 0,
      gross_regular_pay: 1920.00,
      gross_overtime_pay: 180.00,
      total_adjustments_bonuses: 50.00,
      total_adjustments_deductions: 0.00,
      gross_pay: 2150.00,
      net_pay: 2150.00,
      status: 'PENDING',
      payment_method: 'BANK_TRANSFER'
    },
    {
      id: 102,
      payroll_period_id: 2,
      employee_id: 2,
      employee_name: 'Fran Staff',
      snapshot_hourly_rate: 11.50,
      snapshot_overtime_rate: 17.25,
      total_regular_hours: 140,
      total_overtime_hours: 4,
      total_weekend_hours: 16,
      total_paid_leave_hours: 28,
      gross_regular_pay: 1610.00,
      gross_overtime_pay: 69.00,
      total_adjustments_bonuses: 0.00,
      total_adjustments_deductions: 20.00,
      gross_pay: 1679.00,
      net_pay: 1659.00,
      status: 'PENDING',
      payment_method: 'BANK_TRANSFER'
    }
  ] as PayrollRecord[],

  payroll_items: [
    {
      id: 1,
      payroll_record_id: 101,
      item_type: 'REGULAR_HOURS',
      hours_or_qty: 160,
      unit_rate: 12.00,
      total_amount: 1920.00,
      description: '160 Regular Approved Working Hours'
    },
    {
      id: 2,
      payroll_record_id: 101,
      item_type: 'OVERTIME_HOURS',
      hours_or_qty: 10,
      unit_rate: 18.00,
      total_amount: 180.00,
      description: '10 Approved Overtime Hours (@1.5x rate)'
    }
  ] as PayrollItem[],

  payroll_adjustments: [
    {
      id: 1,
      payroll_record_id: 101,
      type: 'BONUS',
      amount: 50.00,
      reason: 'Monthly peak summer sales & fleet maintenance bonus',
      created_by: 1,
      created_at: '2026-08-20T10:30:00.000Z'
    }
  ] as PayrollAdjustment[]

};

export const initializeSchema = async () => {
  if (!isMySQLActive()) {
    console.log(`⚡ Initialized exact Málaga physical inventory (53 units across 12 categories), SSOT financial events, idempotency, & neighbor settlements.`);
    return;
  }
};
