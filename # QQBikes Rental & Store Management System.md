# QQBikes Rental & Store Management System

## 1. Purpose

This project replaces the current Excel/paper-based workflow used by QQBikes with a centralized rental, point-of-sale, customer, vehicle, deposit, repair, employee, shift, payment, and financial-management system.

The system must support multiple physical stores, starting with:

- MÃ¡laga
- Torremolinos

It must be designed so that additional stores can be created later without changing the database structure.

The system is not only a "rental application". It is a small multi-store business management system with a rental/POS core.

---

# 2. Main Business Concepts

The system is based on these core concepts:

1. A company can have multiple stores.
2. Every employee belongs to one or more stores.
3. Every rentable vehicle belongs to one store at a time.
4. Vehicles have categories such as:
   - Bike
   - E-Bike
   - Scooter
   - XL Car
   - S Car / Quad
   - Buggy
5. Rental prices are configurable and can differ by store, vehicle category, season, duration, or special agreement.
6. A rental creates a contractual snapshot of the price used at that moment.
7. The current price must never overwrite the historical price of an existing rental.
8. Every rental can have one or more rented items.
9. Every rental can have a deposit.
10. Deposits are financial liabilities/held amounts, not revenue until part of the deposit is legitimately retained.
11. A customer can have many rentals.
12. A customer can make multiple payments.
13. A payment can be Cash or Card initially, with the architecture ready for additional methods later.
14. Additional charges can be added to a rental:
    - Damage
    - Late return
    - Lost item
    - Cleaning
    - Missing accessory
    - Extra rental time
    - Repair
    - Other custom charges
15. Deposits can be:
    - Fully refunded
    - Partially retained
    - Fully retained
16. Repairs have their own catalog of labor and replacement parts.
17. Employees work shifts, and the system records opening/closing cash and shift revenue.
18. Management needs reports by store, employee, date, payment method, rental category, repairs, deposits, and expenses.
19. Every important financial or administrative operation must have an audit trail.

---

# 3. Recommended Technology Stack

## Backend

Recommended:

- Node.js
- TypeScript
- Fastify or Express
- Prisma ORM
- MySQL 8+
- Zod for request validation
- JWT + refresh tokens for authentication
- bcrypt/argon2 for password hashing
- OpenAPI/Swagger for API documentation

### Why MySQL instead of MongoDB?

For this project, MySQL is strongly recommended.

The system contains many strongly related entities:

- Customers
- Rentals
- Rental items
- Vehicles
- Deposits
- Payments
- Employees
- Stores
- Shifts
- Repairs
- Parts
- Expenses
- Price rules

Financial transactions and historical records benefit from:

- Foreign keys
- Transactions
- Unique constraints
- ACID consistency
- Referential integrity
- Aggregations
- Reliable reporting

MongoDB can work, but it provides less benefit here than a relational database.

Recommended combination:

**Node.js + TypeScript + Fastify + Prisma + MySQL**

---

# 4. Frontend

The application should have a responsive interface that works on:

- Desktop
- Tablet
- Mobile

If React Native is already preferred, Expo + React Native Web can be used.

For a counter/POS-heavy application, a React/Next.js web frontend is also a strong option.

The backend must remain independent from the frontend.

Recommended separation:

```text
frontend/
backend/
database/
docs/
```

The frontend must never directly access MySQL.

---

# 5. User Roles

The system uses a simple 2-role model. Each user belongs to a primary store/campsite (`store_id` / `campsite_id`).

## ADMIN

Facility / Store Administrator.

Can:

- Create and manage stores / campsites
- Manage prices, rate plans, and discount rules
- Manage vehicles and categories
- Manage employees and user accounts
- View financial reports and daily sales summaries
- Review closed shifts and cash reconciliation
- View audit logs and approve sensitive operations

## EMPLOYEE

Counter / Front-desk employee assigned to a store.

Can:

- Create and manage customers
- Create rental contracts (contracts)
- Receive payments (cash / card) and issue receipts
- Collect deposits and process deposit returns/retentions
- Return rentals and register extra charges
- Open and close assigned shifts with cash count
- Register vehicle repairs and status updates

Cannot:

- Modify global prices or rate rules without admin approval
- Delete financial transactions or contracts
- Access or modify other stores unless granted access

---

# 6. Multi-Store Architecture

A store is a first-class entity.

Example:

```text
Company
 â”œâ”€â”€ MÃ¡laga Store
 â”‚    â”œâ”€â”€ Employees
 â”‚    â”œâ”€â”€ Vehicles
 â”‚    â”œâ”€â”€ Rentals
 â”‚    â”œâ”€â”€ Repairs
 â”‚    â””â”€â”€ Shifts
 â”‚
 â””â”€â”€ Torremolinos Store
      â”œâ”€â”€ Employees
      â”œâ”€â”€ Vehicles
      â”œâ”€â”€ Rentals
      â”œâ”€â”€ Repairs
      â””â”€â”€ Shifts
```

Every operational record must contain `store_id` directly or through a mandatory parent relationship.

This makes reporting and permissions much easier.

---

# 7. Database Naming Convention

Use:

- snake_case for database tables and columns
- singular model names in Prisma where appropriate
- plural table names if using explicit `@@map`
- UUID for primary keys
- UTC timestamps in the database
- `created_at`
- `updated_at`

Example:

```text
customers
rental_contracts
rental_items
payments
payment_allocations
deposits
deposit_transactions
vehicles
vehicle_categories
stores
employees
employee_shifts
repair_orders
repair_order_items
expenses
```

Money must NOT be stored as floating point.

Use:

```text
DECIMAL(12,2)
```

Example:

```text
50.00
1350.00
831.88
```

---

# 8. Core Database Tables

## 8.1 companies

Represents the business.

Fields:

```text
id
legal_name
commercial_name
tax_id
email
phone
address
city
country
currency
timezone
is_active
created_at
updated_at
```

---

## 8.2 stores

Represents MÃ¡laga, Torremolinos, or future locations.

Fields:

```text
id
company_id
name
code
address
city
postal_code
country
phone
email
timezone
opening_time
closing_time
is_active
created_at
updated_at
```

Example:

```text
MALAGA
TORREMOLINOS
```

`code` must be unique inside the company.

---

# 9. Authentication and Users

## 9.1 users

Authentication account with direct role assignment (`ADMIN` or `EMPLOYEE`) and primary store/campsite linkage.

Fields:

```text
id
company_id
store_id (campsite_id)
user_type (enum: 'ADMIN', 'EMPLOYEE')
email
username
password_hash
first_name
last_name
phone
is_active
last_login_at
created_at
updated_at
```

Do not store plaintext passwords.

---

## 9.2 user_store_access

Defines additional store permissions if a user requires multi-store access.

```text
id
user_id
store_id
is_primary
created_at
```

This is important because a manager may eventually manage multiple stores.

---

# 10. Employees

## 10.1 employees

Business employee profile.

```text
id
user_id
employee_code
store_id
first_name
last_name
dni
phone
email
job_title
employment_type
hire_date
termination_date
hourly_rate
is_active
created_at
updated_at
```

`hourly_rate` is the base rate used for payroll/shift calculations if required.

Employment types can include:

```text
FULL_TIME
PART_TIME
TEMPORARY
FREELANCE
OTHER
```

---

# 11. Employee Schedules

## 11.1 employee_schedules

```text
id
employee_id
store_id
day_of_week
start_time
end_time
valid_from
valid_until
is_active
```

This defines planned schedules.

It must not be confused with actual attendance.

---

# 12. Employee Attendance

## 12.1 attendance_records

```text
id
employee_id
store_id
work_date
clock_in_at
clock_out_at
break_minutes
status
notes
created_at
updated_at
```

Possible statuses:

```text
PRESENT
ABSENT
LATE
SICK
HOLIDAY
LEAVE
OTHER
```

---

# 13. Shifts

A shift represents the operational cash/register session.

## 13.1 employee_shifts

```text
id
store_id
employee_id
opened_at
closed_at
opening_cash
closing_cash
expected_cash
cash_difference
total_cash_sales
total_card_sales
total_sales
total_refunds
status
notes
created_at
updated_at
```

Statuses:

```text
OPEN
CLOSED
REVIEW_REQUIRED
```

Important:

The employee who opens the shift must be recorded.

A manager must be able to review a shift.

---

# 14. Vehicles

The word `vehicle` should represent any rentable physical unit.

## 14.1 vehicle_categories

```text
id
company_id
name
code
description
deposit_default
is_rentable
is_active
created_at
updated_at
```

Initial categories:

```text
BIKE
E_BIKE
SCOOTER
XL_CAR
S_CAR
QUAD
BUGGY
```

Do not hardcode these categories in the application.

Managers should be able to add categories later.

---

## 14.2 vehicles

Each physical bike/scooter/car must have its own record.

```text
id
store_id
category_id
vehicle_code
serial_number
registration_number
brand
model
color
purchase_date
purchase_price
current_status
condition
odometer
battery_level
notes
is_active
created_at
updated_at
```

Statuses:

```text
AVAILABLE
RENTED
RESERVED
MAINTENANCE
DAMAGED
LOST
RETIRED
TRANSFER_PENDING
```

---

# 15. Vehicle History

Do not simply overwrite vehicle status without history.

## 15.1 vehicle_status_history

```text
id
vehicle_id
store_id
old_status
new_status
reason
reference_type
reference_id
changed_by_user_id
created_at
```

This makes it possible to answer:

- When was the vehicle rented?
- Who changed its status?
- Why was it sent to maintenance?
- When did it return to available status?

---

# 16. Vehicle Transfers Between Stores

## 16.1 vehicle_transfers

```text
id
vehicle_id
from_store_id
to_store_id
requested_by_user_id
approved_by_user_id
requested_at
approved_at
completed_at
status
notes
```

Statuses:

```text
REQUESTED
APPROVED
IN_TRANSIT
COMPLETED
CANCELLED
```

This is important for MÃ¡laga â†” Torremolinos.

---

# 17. Pricing System

Pricing must be configurable.

Do not put prices directly inside the vehicle table.

---

## 17.1 rental_rate_plans

Represents a price plan.

```text
id
company_id
store_id
vehicle_category_id
name
code
currency
deposit_amount
is_default
valid_from
valid_until
is_active
created_at
updated_at
```

Examples:

```text
STANDARD
SUMMER
WINTER
PROMOTION
GROUP
SPECIAL
```

---

## 17.2 rental_rate_rules

Defines the price for a duration.

```text
id
rate_plan_id
duration_unit
duration_value
price
min_quantity
max_quantity
created_at
updated_at
```

Examples:

```text
1 HOUR = 15 â‚¬
2 HOURS = 20 â‚¬
5 HOURS = 25 â‚¬
1 DAY = 40 â‚¬
1 WEEK = 25 â‚¬/DAY
2 WEEKS = 20 â‚¬/DAY
```

The actual prices shown in the supplied photos should be imported as initial configuration after verification.

The database should never assume that today's paper price is permanently correct.

---

# 18. Flexible Pricing / Manual Override

This is critical.

The employee must be able to use the standard price and then manually adjust it when authorized.

Example:

```text
Standard price: 50 â‚¬
Group price: 100 â‚¬
Manual agreed price: 90 â‚¬
```

The system should record:

```text
original_price
discount_amount
final_price
override_reason
override_by_user_id
```

Never modify the price catalog simply because one customer received a special price.

---

# 19. Rental Contracts

The rental contract is the central business document.

## 19.1 rental_contracts

```text
id
store_id
customer_id
contract_number
employee_id
status
started_at
expected_return_at
actual_return_at
subtotal
discount_total
extra_charges_total
deposit_required
deposit_held
deposit_retained
refund_amount
total_amount
amount_paid
amount_due
currency
notes
created_at
updated_at
```

Statuses:

```text
DRAFT
ACTIVE
RETURN_PENDING
COMPLETED
CANCELLED
OVERDUE
```

---

# 20. Rental Items

A contract can contain multiple vehicles.

## 20.1 rental_items

```text
id
rental_contract_id
vehicle_id
vehicle_category_id
quantity
rate_plan_id
rate_rule_id
start_at
expected_return_at
actual_return_at
unit_price
quantity_price
discount_amount
final_price
deposit_amount
condition_out
condition_in
notes
created_at
updated_at
```

The price must be copied into the rental item when the rental is created.

This creates a historical snapshot.

If the price changes tomorrow, yesterday's rental remains unchanged.

---

# 21. Customer Database

## 21.1 customers

```text
id
first_name
last_name
full_name
dni
passport_number
nationality
date_of_birth
phone
email
address
city
postal_code
country
preferred_language
notes
is_blocked
blocked_reason
created_at
updated_at
```

Do not create duplicate customers unnecessarily.

Use searchable identifiers such as:

- DNI
- Passport
- Phone
- Email

---

# 22. Customer Documents

Because the paper contract contains identity information, documents should be handled separately.

## 22.1 customer_documents

```text
id
customer_id
document_type
document_number
country
issue_date
expiry_date
file_url
verified
verified_by_user_id
verified_at
created_at
```

Possible types:

```text
DNI
PASSPORT
DRIVING_LICENSE
OTHER
```

Sensitive document files must not be public.

---

# 23. Rental Contract Snapshot

The contract should preserve what was agreed at the time.

Do not rely only on current customer information.

Important snapshot fields can include:

```text
customer_name_snapshot
customer_document_type_snapshot
customer_document_number_snapshot
customer_phone_snapshot
store_name_snapshot
employee_name_snapshot
terms_version
```

This prevents historical documents from changing if the customer's profile changes later.

---

# 24. Deposits / Fianzas

The deposit is one of the most important financial concepts.

A deposit is NOT automatically revenue.

Example:

```text
Rental = 40 â‚¬
Deposit = 50 â‚¬
Customer pays = 90 â‚¬
```

At return:

```text
Rental = 40 â‚¬
Deposit = 50 â‚¬
Refund = 50 â‚¬
```

If the customer caused 20 â‚¬ damage:

```text
Rental = 40 â‚¬
Deposit = 50 â‚¬
Damage = 20 â‚¬
Deposit retained = 20 â‚¬
Deposit refund = 30 â‚¬
```

---

## 24.1 deposits

```text
id
rental_contract_id
customer_id
store_id
amount_required
amount_received
amount_held
amount_retained
amount_refunded
status
created_at
updated_at
```

Statuses:

```text
PENDING
HELD
PARTIALLY_REFUNDED
REFUNDED
PARTIALLY_RETAINED
FULLY_RETAINED
CANCELLED
```

---

## 24.2 deposit_transactions

Every movement must be recorded.

```text
id
deposit_id
transaction_type
amount
payment_method
reference
reason
created_by_user_id
created_at
```

Types:

```text
RECEIVED
REFUNDED
RETAINED
ADJUSTED
```

Never update the deposit balance without recording a transaction.

---

# 25. Extra Charges

Extra charges are required for real-world rental operations.

## 25.1 charge_types

```text
id
company_id
name
code
description
default_price
requires_approval
is_active
created_at
updated_at
```

Examples:

```text
DAMAGE
LATE_RETURN
LOST_VEHICLE
LOST_KEY
LOST_LOCK
CLEANING
MISSING_ACCESSORY
EXTRA_HOUR
EXTRA_DAY
OTHER
```

---

## 25.2 rental_charges

```text
id
rental_contract_id
rental_item_id
charge_type_id
description
quantity
unit_price
total_amount
is_deposit_deduction
approved_by_user_id
created_by_user_id
created_at
```

This allows the employee to say:

```text
Damage: 25 â‚¬
Lost lock: 10 â‚¬
Late return: 15 â‚¬
```

---

# 26. Payment System

Payments must be independent from rentals.

## 26.1 payments

```text
id
store_id
customer_id
rental_contract_id
shift_id
payment_number
payment_method
amount
currency
status
external_reference
notes
received_by_user_id
paid_at
created_at
updated_at
```

Payment methods:

```text
CASH
CARD
BANK_TRANSFER
OTHER
```

Initially the UI can expose only:

```text
CASH
CARD
```

---

# 27. Payment Allocations

A payment can cover different financial components.

## 27.1 payment_allocations

```text
id
payment_id
rental_contract_id
allocation_type
amount
created_at
```

Types:

```text
RENTAL
EXTRA_CHARGE
DEPOSIT
REFUND
OTHER
```

This prevents accounting ambiguity.

---

# 28. Refunds

Refunds must be separate records.

## 28.1 refunds

```text
id
store_id
payment_id
rental_contract_id
deposit_id
amount
payment_method
reason
status
created_by_user_id
approved_by_user_id
processed_at
created_at
```

Statuses:

```text
PENDING
APPROVED
COMPLETED
REJECTED
```

---

# 29. Repairs

The photos show a repair-price catalog containing parts and labor.

The system should convert that paper list into a configurable repair catalog.

---

# 30. Repair Categories

## 30.1 repair_categories

```text
id
company_id
name
code
description
is_active
created_at
updated_at
```

Examples:

```text
BRAKES
WHEELS
BATTERY
MOTOR
ELECTRICAL
BODY
GENERAL
```

---

# 31. Repair Parts

## 31.1 repair_parts

```text
id
company_id
name
code
description
vehicle_category_id
supplier
cost_price
sale_price
stock_quantity
minimum_stock
is_active
created_at
updated_at
```

Examples from the photographed list include items such as:

- Brake cable
- Brake disc
- Brake pads
- Handlebar
- Lights
- Charger
- Battery
- Motor
- Controller
- Display
- Chain
- Tire
- Inner tube
- Pedals
- Kickstand

The exact catalog should be entered after manually verifying the photographed sheet.

---

# 32. Repair Labor

## 32.1 repair_labor_rates

```text
id
company_id
name
code
description
vehicle_category_id
hourly_rate
fixed_price
pricing_type
is_active
created_at
updated_at
```

Possible pricing types:

```text
HOURLY
FIXED
```

The photographed sheet contains labor rates such as mechanical and electrical labor. These should become configuration, not hardcoded application logic.

---

# 33. Repair Orders

## 33.1 repair_orders

```text
id
store_id
vehicle_id
customer_id
repair_number
status
priority
reported_at
started_at
completed_at
estimated_total
final_total
notes
created_by_user_id
assigned_employee_id
created_at
updated_at
```

Statuses:

```text
OPEN
DIAGNOSING
WAITING_PARTS
IN_PROGRESS
READY
COMPLETED
CANCELLED
```

---

# 34. Repair Order Items

## 34.1 repair_order_items

```text
id
repair_order_id
item_type
repair_part_id
repair_labor_rate_id
description
quantity
unit_price
total_amount
created_at
```

Types:

```text
PART
LABOR
OTHER
```

This supports:

```text
Part: Brake pad = 10 â‚¬
Labor: 30 minutes = 7.50 â‚¬
Total = 17.50 â‚¬
```

---

# 35. Inventory

If parts are sold/consumed, inventory should be tracked.

## 35.1 inventory_items

```text
id
store_id
repair_part_id
quantity_on_hand
reserved_quantity
minimum_quantity
updated_at
```

---

## 35.2 inventory_movements

```text
id
store_id
repair_part_id
movement_type
quantity
reference_type
reference_id
reason
created_by_user_id
created_at
```

Types:

```text
PURCHASE
REPAIR_USAGE
SALE
ADJUSTMENT_IN
ADJUSTMENT_OUT
TRANSFER_IN
TRANSFER_OUT
```

---

# 36. Expenses

The Excel image shows expenses such as Visa/card-related amounts, commissions, equipment, and other outgoings.

These must become structured records.

## 36.1 expense_categories

```text
id
company_id
name
code
description
is_active
```

Examples:

```text
BANK_FEES
CARD_FEES
RENT
UTILITIES
EQUIPMENT
REPAIRS
SUPPLIES
SALARIES
TRANSPORT
OTHER
```

---

## 36.2 expenses

```text
id
store_id
expense_category_id
employee_id
supplier_name
description
amount
tax_amount
payment_method
expense_date
receipt_number
receipt_file_url
status
created_by_user_id
approved_by_user_id
created_at
updated_at
```

---

# 37. Revenue / Financial Ledger

Do not rely on a single "income" field like the Excel sheet.

Instead, create immutable financial entries.

## 37.1 financial_transactions

```text
id
company_id
store_id
transaction_type
reference_type
reference_id
amount
currency
payment_method
transaction_date
description
created_by_user_id
created_at
```

Types:

```text
RENTAL_REVENUE
REPAIR_REVENUE
EXTRA_CHARGE_REVENUE
DEPOSIT_RECEIVED
DEPOSIT_REFUND
DEPOSIT_RETAINED
EXPENSE
REFUND
OTHER_INCOME
OTHER_EXPENSE
```

Important:

A received deposit should not be treated as normal revenue.

---

# 38. Cash Register

For cash payments, the system needs a cash movement ledger.

## 38.1 cash_movements

```text
id
store_id
shift_id
movement_type
amount
payment_id
expense_id
refund_id
description
created_by_user_id
created_at
```

Types:

```text
OPENING_BALANCE
SALE
EXPENSE
REFUND
DEPOSIT
DEPOSIT_REFUND
CASH_IN
CASH_OUT
CLOSING_ADJUSTMENT
```

This allows the manager to compare:

```text
Expected cash
vs
Actual cash
```

---

# 39. Rental Lifecycle

The normal process should be:

```text
Customer arrives
      â†“
Search customer
      â†“
Create/select customer
      â†“
Select vehicle category
      â†“
Select available vehicles
      â†“
Choose duration
      â†“
System calculates price
      â†“
Employee optionally applies authorized discount
      â†“
System calculates deposit
      â†“
Customer confirms contract
      â†“
Payment received
      â†“
Vehicle status = RENTED
      â†“
Contract status = ACTIVE
      â†“
Customer returns vehicle
      â†“
Employee inspects vehicle
      â†“
Add extra charges if necessary
      â†“
Calculate deposit retention/refund
      â†“
Refund deposit
      â†“
Vehicle status = AVAILABLE or MAINTENANCE
      â†“
Contract status = COMPLETED
```

---

# 40. Rental Creation Screen

The employee needs a fast POS-style screen.

Sections:

## Customer

Search:

- Name
- DNI
- Passport
- Phone

Buttons:

```text
Search Customer
Create Customer
```

---

## Rental

Select:

```text
Category
Vehicle
Start time
Expected return
Duration
```

---

## Price

Display:

```text
Base price
Discount
Manual adjustment
Final rental price
Deposit
Total due
```

---

## Payment

Select:

```text
Cash
Card
```

Display:

```text
Rental: 40 â‚¬
Deposit: 50 â‚¬
Total: 90 â‚¬
Paid: 90 â‚¬
Remaining: 0 â‚¬
```

---

# 41. Multiple Vehicles in One Rental

Example:

Customer rents:

```text
2 Bikes
1 Scooter
```

One contract:

```text
Contract #MAL-2026-000123

Item 1:
Bike #B-001
Price: 20 â‚¬

Item 2:
Bike #B-002
Price: 20 â‚¬

Item 3:
Scooter #S-014
Price: 40 â‚¬

Group discount:
-10 â‚¬

Rental subtotal:
70 â‚¬

Deposit:
100 â‚¬

Total received:
170 â‚¬
```

This is why `rental_contracts` and `rental_items` must be separate.

---

# 42. Return Screen

The return screen must show:

```text
Contract
Customer
Vehicles
Expected return
Actual return
Late duration
Original price
Deposit
Vehicle condition
```

Employee can select:

```text
No problem
Damage
Missing accessory
Late
Lost
Other
```

Then the system creates the corresponding `rental_charges`.

---

# 43. Deposit Return Screen

Example:

```text
Deposit received: 100 â‚¬

Charges:
Damage: 25 â‚¬
Lost lock: 10 â‚¬

Total retained: 35 â‚¬

Refund to customer: 65 â‚¬
```

The employee must not manually edit the final balance without creating a reason.

Sensitive deposit retention may require manager approval.

---

# 44. Customer Page

Customer profile should contain:

## Basic information

```text
Name
DNI/Passport
Phone
Email
Country
```

## Rental history

```text
Contract number
Store
Date
Vehicles
Total
Payment status
```

## Financial history

```text
Payments
Refunds
Deposits
Retained deposits
Extra charges
```

## Notes

Examples:

```text
Customer frequently rents bikes.
```

---

# 45. Store Dashboard

Each store manager needs a dashboard.

Show:

```text
Today's revenue
Cash revenue
Card revenue
Active rentals
Overdue rentals
Available vehicles
Vehicles in maintenance
Deposits currently held
Deposits awaiting refund
Today's expenses
Open shift
Employees currently working
```

---

# 46. Global Dashboard

Owner/Admin dashboard:

```text
Total revenue
MÃ¡laga revenue
Torremolinos revenue
Cash revenue
Card revenue
Rental revenue
Repair revenue
Expenses
Net operational result
Active rentals
Fleet utilization
Deposit liability
```

Date filters:

```text
Today
Yesterday
This week
This month
Custom range
```

---

# 47. Rental Reports

Reports:

## Daily Rentals

```text
Date
Store
Contract
Customer
Employee
Vehicles
Rental amount
Deposit
Payment
Status
```

## Vehicle Utilization

```text
Vehicle
Category
Store
Hours rented
Days rented
Utilization %
Revenue
```

## Category Revenue

```text
Bike
E-Bike
Scooter
XL Car
S Car
Quad
Buggy
```

---

# 48. Payment Reports

Filter by:

```text
Store
Employee
Date
Payment method
```

Display:

```text
Cash
Card
Total
Refunds
Net
```

This should replace the manual Excel income/expense calculations.

---

# 49. Shift Report

At shift closing:

```text
Opening cash
Cash sales
Cash expenses
Cash refunds
Expected cash
Actual cash
Difference
Card sales
Total sales
```

Example:

```text
Opening:        100 â‚¬
Cash sales:     450 â‚¬
Cash expenses:   20 â‚¬
Refunds:         30 â‚¬

Expected:       500 â‚¬
Actual:         500 â‚¬
Difference:       0 â‚¬
```

If difference exists:

```text
Expected: 500 â‚¬
Actual: 490 â‚¬
Difference: -10 â‚¬
```

The system must require a note or manager review.

---

# 50. Price Management

Managers need:

```text
Settings
 â†’ Rental Pricing
```

They can create:

```text
Vehicle Category
Rate Plan
Duration
Price
Deposit
Valid From
Valid Until
```

Example:

```text
Scooter
Standard
1 hour
15 â‚¬

Scooter
Standard
1 day
40 â‚¬

Scooter
Standard
1 week
25 â‚¬/day
```

---

# 51. Pricing History

Never delete or overwrite old prices.

When a price changes:

```text
Old rule:
40 â‚¬

New rule:
45 â‚¬

Valid from:
2026-09-01
```

Existing rentals retain 40 â‚¬.

New rentals after 2026-09-01 use 45 â‚¬.

---

# 52. Discounts

Create:

## discount_rules

```text
id
company_id
name
code
discount_type
value
max_discount
requires_approval
valid_from
valid_until
is_active
```

Types:

```text
FIXED
PERCENTAGE
```

Manual discounts should record:

```text
requested_by
approved_by
reason
original_amount
discount_amount
final_amount
```

---

# 53. Reservation System

The system should be prepared for reservations even if reservations are not implemented initially.

## 53.1 reservations

```text
id
store_id
customer_id
reservation_number
status
start_at
end_at
notes
created_by_user_id
created_at
updated_at
```

Statuses:

```text
PENDING
CONFIRMED
CANCELLED
CONVERTED
NO_SHOW
```

---

# 54. Vehicle Availability

Availability must be calculated from:

- Current status
- Active rentals
- Reservations
- Maintenance
- Transfers

The frontend must not decide availability independently.

Backend endpoint:

```text
GET /stores/:storeId/vehicles/availability
```

---

# 55. Audit Log

Every sensitive operation should be recorded.

## 55.1 audit_logs

```text
id
company_id
store_id
user_id
action
entity_type
entity_id
old_values
new_values
ip_address
user_agent
created_at
```

Actions:

```text
CREATE
UPDATE
DELETE
APPROVE
CANCEL
REFUND
DEPOSIT_RETAIN
PRICE_OVERRIDE
SHIFT_CLOSE
LOGIN
LOGOUT
```

Do not allow normal users to delete audit logs.

---

# 56. Soft Delete

Financial and contractual records should generally not be physically deleted.

Use:

```text
deleted_at
deleted_by_user_id
```

or status-based cancellation.

For example:

A wrong rental should become:

```text
CANCELLED
```

rather than being deleted from the database.

---

# 57. Important Financial Rule

Never use:

```text
float
double
```

for money.

Use:

```text
DECIMAL(12,2)
```

and always store:

```text
currency
```

Even if the company currently uses only EUR.

---

# 58. Database Relationship Overview

```text
companies
  |
  +-- stores
  |     |
  |     +-- employees
  |     +-- employee_schedules
  |     +-- attendance_records
  |     +-- employee_shifts
  |     +-- vehicles
  |     +-- rental_contracts
  |     +-- repair_orders
  |     +-- expenses
  |     +-- payments
  |
  +-- vehicle_categories
  +-- rental_rate_plans
  +-- rental_rate_rules
  +-- repair_parts
  +-- repair_labor_rates
  +-- charge_types
  +-- discount_rules

customers
  |
  +-- customer_documents
  +-- rental_contracts
  +-- payments

rental_contracts
  |
  +-- rental_items
  +-- rental_charges
  +-- payments
  +-- deposits
  +-- refunds

vehicles
  |
  +-- vehicle_status_history
  +-- vehicle_transfers
  +-- rental_items
  +-- repair_orders

repair_orders
  |
  +-- repair_order_items
```

---

# 59. Frontend Pages

## Authentication

```text
/login
/forgot-password
/reset-password
```

## Main

```text
/dashboard
```

## POS / Counter

```text
/rentals/new
/rentals/active
/rentals/overdue
/rentals/:id
/rentals/:id/return
```

## Customers

```text
/customers
/customers/new
/customers/:id
/customers/:id/rentals
/customers/:id/payments
```

## Vehicles

```text
/vehicles
/vehicles/new
/vehicles/:id
/vehicles/:id/history
/vehicles/transfers
```

## Repairs

```text
/repairs
/repairs/new
/repairs/:id
/repairs/parts
/repairs/labor
```

## Employees

```text
/employees
/employees/:id
/employees/schedules
/employees/attendance
/employees/shifts
```

## Financial

```text
/finance/payments
/finance/refunds
/finance/deposits
/finance/expenses
/finance/cash
```

## Reports

```text
/reports
/reports/sales
/reports/rentals
/reports/vehicles
/reports/payments
/reports/deposits
/reports/expenses
/reports/shifts
/reports/repairs
```

## Settings

```text
/settings/company
/settings/stores
/settings/users
/settings/roles
/settings/pricing
/settings/vehicle-categories
/settings/charge-types
/settings/discounts
/settings/payment-methods
/settings/repair-catalog
```

---

# 60. Employee UI

Employee dashboard should be intentionally simple.

Main buttons:

```text
New Rental
Active Rentals
Return Vehicle
Customers
Vehicles
My Shift
Payments
```

The employee should not be overwhelmed by administration features.

---

# 61. Manager UI

Manager dashboard:

```text
Today's Sales
Active Rentals
Fleet
Employees
Shifts
Repairs
Expenses
Deposits
Reports
Settings
```

---

# 62. Owner/Admin UI

Owner dashboard:

```text
All Stores
All Revenue
Financial Reports
Fleet
Employees
Pricing
Expenses
Audit Logs
System Settings
```

---

# 63. API Structure

Recommended API:

```text
/api/v1
```

## Auth

```text
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

## Stores

```text
GET    /stores
POST   /stores
GET    /stores/:id
PATCH  /stores/:id
```

## Customers

```text
GET    /customers
POST   /customers
GET    /customers/:id
PATCH  /customers/:id
GET    /customers/:id/rentals
GET    /customers/:id/payments
```

## Vehicles

```text
GET    /vehicles
POST   /vehicles
GET    /vehicles/:id
PATCH  /vehicles/:id
GET    /vehicles/:id/history
POST   /vehicles/:id/transfer
```

## Rentals

```text
GET    /rentals
POST   /rentals
GET    /rentals/:id
PATCH  /rentals/:id
POST   /rentals/:id/return
POST   /rentals/:id/charges
```

## Payments

```text
GET    /payments
POST   /payments
GET    /payments/:id
POST   /payments/:id/refund
```

## Deposits

```text
GET    /deposits
GET    /deposits/:id
POST   /deposits/:id/refund
POST   /deposits/:id/retain
```

## Shifts

```text
POST   /shifts/open
GET    /shifts/current
POST   /shifts/:id/close
GET    /shifts/:id/report
```

## Repairs

```text
GET    /repairs
POST   /repairs
GET    /repairs/:id
PATCH  /repairs/:id
POST   /repairs/:id/items
POST   /repairs/:id/complete
```

---

# 64. Backend Folder Structure

Recommended:

```text
backend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app.ts
â”‚   â”œâ”€â”€ server.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ config/
â”‚   â”‚
â”‚   â”œâ”€â”€ modules/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ users/
â”‚   â”‚   â”œâ”€â”€ stores/
â”‚   â”‚   â”œâ”€â”€ employees/
â”‚   â”‚   â”œâ”€â”€ customers/
â”‚   â”‚   â”œâ”€â”€ vehicles/
â”‚   â”‚   â”œâ”€â”€ pricing/
â”‚   â”‚   â”œâ”€â”€ rentals/
â”‚   â”‚   â”œâ”€â”€ payments/
â”‚   â”‚   â”œâ”€â”€ deposits/
â”‚   â”‚   â”œâ”€â”€ repairs/
â”‚   â”‚   â”œâ”€â”€ inventory/
â”‚   â”‚   â”œâ”€â”€ expenses/
â”‚   â”‚   â”œâ”€â”€ shifts/
â”‚   â”‚   â”œâ”€â”€ reports/
â”‚   â”‚   â””â”€â”€ audit/
â”‚   â”‚
â”‚   â”œâ”€â”€ middleware/
â”‚   â”œâ”€â”€ plugins/
â”‚   â”œâ”€â”€ utils/
â”‚   â””â”€â”€ types/
â”‚
â”œâ”€â”€ prisma/
â”‚   â”œâ”€â”€ schema.prisma
â”‚   â”œâ”€â”€ migrations/
â”‚   â””â”€â”€ seed.ts
â”‚
â”œâ”€â”€ tests/
â”œâ”€â”€ package.json
â””â”€â”€ .env
```

---

# 65. Frontend Folder Structure

```text
frontend/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ auth/
â”‚   â”œâ”€â”€ dashboard/
â”‚   â”œâ”€â”€ rentals/
â”‚   â”œâ”€â”€ customers/
â”‚   â”œâ”€â”€ vehicles/
â”‚   â”œâ”€â”€ repairs/
â”‚   â”œâ”€â”€ employees/
â”‚   â”œâ”€â”€ finance/
â”‚   â”œâ”€â”€ reports/
â”‚   â””â”€â”€ settings/
â”‚
â”œâ”€â”€ components/
â”œâ”€â”€ features/
â”œâ”€â”€ hooks/
â”œâ”€â”€ services/
â”œâ”€â”€ stores/
â”œâ”€â”€ utils/
â””â”€â”€ types/
```

---

# 66. Important Business Rules

## Rule 1

A vehicle cannot be rented if:

```text
status != AVAILABLE
```

unless an authorized override exists.

## Rule 2

A completed rental cannot have its original price changed.

## Rule 3

A completed payment cannot be edited.

It can only be refunded or reversed using a separate transaction.

## Rule 4

A deposit refund must create a `deposit_transaction`.

## Rule 5

A deposit retention must have a reason.

## Rule 6

Manual price changes must be auditable.

## Rule 7

Changing a global price must not change existing contracts.

## Rule 8

An employee can access only assigned stores unless their role allows cross-store access.

## Rule 9

A shift must be open before a normal cash sale can be recorded.

## Rule 10

A vehicle returning with serious damage can automatically become:

```text
MAINTENANCE
```

and create a repair order.

---

# 67. Rental Price Calculation

The price engine should work approximately as follows:

```text
Input:
store
vehicle category
quantity
start
end
rate plan
customer/group discount
manual override
```

Then:

```text
duration
    â†“
matching rate rule
    â†“
base price
    â†“
quantity calculation
    â†“
discount
    â†“
authorized manual adjustment
    â†“
final price
```

The backend must calculate the final amount.

The frontend only displays the calculation.

---

# 68. Example Rental Calculation

Customer rents:

```text
2 scooters
1 day
40 â‚¬ each
```

Base:

```text
2 Ã— 40 = 80 â‚¬
```

Group discount:

```text
-10 â‚¬
```

Final rental:

```text
70 â‚¬
```

Deposit:

```text
100 â‚¬
```

Total amount to collect:

```text
170 â‚¬
```

Payment:

```text
Cash 100 â‚¬
Card 70 â‚¬
```

The system should allow split payments even if the normal operation initially uses one method.

---

# 69. Split Payments

Although the current process may be Cash/Card, implement the database so that one contract can have multiple payments.

Example:

```text
Total = 170 â‚¬

Cash = 100 â‚¬
Card = 70 â‚¬
```

This avoids future database redesign.

---

# 70. Offline Consideration

Because the system operates at physical rental counters, network failure must be considered.

Recommended initial strategy:

- Backend hosted centrally
- Frontend detects network loss
- Show clear offline warning
- Never silently create financial transactions while disconnected

A future phase can introduce controlled offline POS synchronization.

Do not build complex offline synchronization in version 1 unless the stores have unreliable internet.

---

# 71. Security

Sensitive information includes:

- DNI
- Passport
- Customer documents
- Payment references
- Financial data
- Employee information

Requirements:

- HTTPS
- Secure cookies or short-lived JWT access tokens
- Refresh token rotation
- Password hashing
- Role-based authorization
- Store-level authorization
- Audit logs
- Rate limiting
- Input validation
- SQL injection protection through Prisma
- File access authorization
- No public customer documents
- No sensitive data in application logs

---

# 72. Backups

MySQL must have automated backups.

Recommended:

```text
Daily full backup
+
Point-in-time/binlog recovery if possible
```

Keep backups outside the main server.

Test restoration periodically.

A backup that has never been restored is not a proven backup.

---

# 73. Audit Requirements

The following actions should always be audited:

```text
Create rental
Cancel rental
Change price
Manual discount
Receive payment
Refund payment
Receive deposit
Refund deposit
Retain deposit
Add extra charge
Change vehicle status
Transfer vehicle
Close shift
Modify employee permissions
Modify price rules
Create expense
Approve expense
```

---

# 74. Dashboard KPIs

Useful KPIs:

```text
Revenue today
Revenue this month
Revenue by store
Revenue by vehicle category
Average rental value
Average rental duration
Fleet utilization
Top rented vehicle
Top rented category
Cash/Card ratio
Deposits held
Deposits retained
Refunds
Repair revenue
Repair costs
Expenses
Shift discrepancies
```

---

# 75. Daily Closing Workflow

At the end of the day:

```text
1. Employee closes active rentals.
2. Employees close their shifts.
3. System calculates expected cash.
4. Employee enters actual cash.
5. System calculates difference.
6. Manager reviews discrepancies.
7. Manager reviews refunds.
8. Manager reviews deposit retention.
9. Manager reviews expenses.
10. Manager closes operational day if desired.
```

---

# 76. Monthly Financial Workflow

Management can filter:

```text
01/08/2026 â†’ 31/08/2026
```

and see:

```text
Rental revenue
Repair revenue
Extra charge revenue
Retained deposits
Expenses
Refunds
Cash
Card
```

Deposits received and refunded should remain distinguishable from revenue.

---

# 77. Initial Price Catalog

The supplied photographs show an existing printed price list and repair catalog.

The application should not hardcode these prices.

Instead, create an import/seed process.

Example initial rental categories visible in the supplied pricing sheet:

```text
Bikes
E-Bikes
Scooters
XL Cars
S Cars / Quads
Buggy's
```

The photographed sheet contains duration-based prices such as:

```text
20 minutes
30 minutes
1 hour
2 hours
5 hours
1 day
1/2 day
1 week
2 weeks
```

Not every category has every duration.

The database must therefore allow missing combinations.

Example:

```text
Scooter + 1 hour = 15 â‚¬
Scooter + 1 day = 40 â‚¬
```

while another category may only have:

```text
XL Car + 20 minutes = 15 â‚¬
XL Car + 30 minutes = 20 â‚¬
XL Car + 1 hour = 30 â‚¬
```

The exact values must be verified against the current official price sheet before production import.

---

# 78. Repair Catalog Import

The photographed repair sheet contains replacement parts with:

- Part name
- Vehicle/model applicability
- Customer-facing price
- Labor price

The system should separate:

```text
Part
Labor
```

Example:

```text
Repair:
Brake replacement

Part:
Brake pads

Labor:
Mechanical labor
```

This allows management to change labor rates independently from part prices.

---

# 79. Documents and Contracts

The paper rental contract shown in the photos contains fields such as:

```text
Bike number
Deposit
Total
Start time
Arrival/return time
Customer name
DNI/passport
Card number
Card expiry
Date
Contract number
Customer signature
```

The digital system should preserve equivalent information.

However, do not store full card numbers unless there is a specific legal/payment-provider requirement.

For normal card payments, store only safe references such as:

```text
payment provider
transaction ID
masked card information if returned by provider
```

---

# 80. Digital Contract Number

Use a readable contract number:

```text
MAL-2026-000001
TOR-2026-000001
```

or:

```text
MAL-20260818-0001
```

The database primary key remains a UUID.

The contract number is a human-facing business identifier.

---

# 81. Business Identifiers

Recommended:

```text
Customer:
CUS-000001

Vehicle:
MAL-BIKE-001

Rental:
MAL-2026-000001

Repair:
MAL-REP-2026-000001

Payment:
MAL-PAY-2026-000001

Expense:
MAL-EXP-2026-000001
```

These identifiers are for users.

UUIDs remain the technical primary keys.

---

# 82. Status Architecture

Statuses should be enums/constants shared between frontend and backend.

Do not let the frontend invent arbitrary status strings.

Examples:

```text
RentalStatus
VehicleStatus
PaymentStatus
DepositStatus
RepairStatus
ShiftStatus
ReservationStatus
ExpenseStatus
```

---

# 83. Transactions

The backend must use database transactions for operations that modify multiple financial records.

Example: completing a rental:

```text
BEGIN TRANSACTION

Create rental payment
Create payment allocation
Create financial transaction
Create deposit transaction
Update vehicle status
Update rental status

COMMIT
```

If one operation fails, the entire financial operation must roll back.

---

# 84. API Authorization

Every endpoint must check:

```text
authenticated user
+
role
+
store access
+
resource ownership/access
```

Example:

An employee in MÃ¡laga must not be able to:

```text
GET /stores/TOR/rentals
```

unless their permissions allow Torremolinos access.

---

# 85. Manager Approval

Sensitive operations should support approval.

Examples:

```text
Large discount
Deposit retention above threshold
Large refund
Manual cash adjustment
Expense approval
Price override
Vehicle marked as lost
```

A configurable threshold can be stored in:

```text
company_settings
```

---

# 86. company_settings

```text
id
company_id
key
value
value_type
description
updated_by_user_id
updated_at
```

Examples:

```text
DEFAULT_CURRENCY = EUR
DEFAULT_DEPOSIT
MAX_EMPLOYEE_DISCOUNT
REQUIRE_MANAGER_FOR_REFUND
REQUIRE_MANAGER_FOR_DEPOSIT_RETENTION
```

For more structured systems, sensitive settings can be dedicated columns instead of key/value storage.

---

# 87. Notifications

The architecture can later support:

```text
notifications
```

Fields:

```text
id
user_id
type
title
message
reference_type
reference_id
read_at
created_at
```

Examples:

```text
Vehicle overdue
Low inventory
Shift discrepancy
Maintenance required
Reservation approaching
```

---

# 88. Search

Global search should support:

```text
Customer name
DNI
Passport
Phone
Contract number
Vehicle code
Repair number
Payment number
```

Search must be indexed.

---

# 89. Database Indexes

Important indexes:

```text
customers.dni
customers.passport_number
customers.phone
customers.email

vehicles.store_id
vehicles.status
vehicles.category_id
vehicles.vehicle_code

rental_contracts.store_id
rental_contracts.customer_id
rental_contracts.status
rental_contracts.contract_number
rental_contracts.started_at

rental_items.vehicle_id
rental_items.start_at
rental_items.expected_return_at

payments.store_id
payments.shift_id
payments.payment_method
payments.paid_at

deposits.store_id
deposits.status

employees.store_id
employee_shifts.store_id
employee_shifts.employee_id
```

---

# 90. Data Integrity

Use database constraints for:

- Unique contract number
- Unique vehicle code per company/store
- Unique employee code
- Valid foreign keys
- Non-negative monetary values where appropriate
- Valid status transitions where possible

Application validation alone is not enough.

---

# 91. Testing Strategy

## Unit Tests

Test:

```text
Price calculation
Deposit calculation
Discount calculation
Late charge calculation
Refund calculation
Shift calculation
Cash difference
Vehicle availability
```

## Integration Tests

Test:

```text
Create customer
Create rental
Take payment
Return vehicle
Retain deposit
Refund deposit
Close shift
Create repair
Consume inventory
```

## End-to-End Tests

Important real scenario:

```text
Customer â†’ Rental â†’ Payment â†’ Vehicle rented â†’ Return â†’ Damage â†’ Charge â†’ Deposit retention â†’ Refund â†’ Vehicle maintenance
```

---

# 92. Example Complete Scenario

Customer arrives in MÃ¡laga.

Employee searches:

```text
Phone: +34...
```

Customer exists.

Employee selects:

```text
2 Scooters
1 day
```

System:

```text
2 Ã— 40 â‚¬ = 80 â‚¬
Deposit = 100 â‚¬
```

Employee applies group discount:

```text
-10 â‚¬
```

Final rental:

```text
70 â‚¬
```

Total cash/card collection:

```text
170 â‚¬
```

Customer pays:

```text
100 â‚¬ Cash
70 â‚¬ Card
```

System creates:

```text
rental_contract
2 rental_items
2 payment records
payment_allocations
deposit
deposit_transaction
financial_transactions
vehicle_status_history
```

At return:

```text
One scooter has a damaged mirror.
```

Employee adds:

```text
Damage charge = 20 â‚¬
```

Deposit:

```text
100 â‚¬
-20 â‚¬
=80 â‚¬ refund
```

System records:

```text
rental_charge = 20 â‚¬
deposit_transaction = RETAINED 20 â‚¬
deposit_transaction = REFUNDED 80 â‚¬
refund = 80 â‚¬
```

The scooter becomes:

```text
MAINTENANCE
```

A repair order is created.

---

# 93. What Should NOT Be Done

Do not build:

```text
One giant rentals table
```

Do not store:

```text
vehicles = "bike1,bike2,bike3"
```

Do not store:

```text
payment = "90 cash"
```

Do not store financial history only in:

```text
income
expense
```

Do not overwrite old prices.

Do not delete completed rentals.

Do not use floating point for money.

Do not allow employees to change prices without an audit record.

Do not let frontend calculate final financial totals independently.

Do not make the application depend on Excel.

---

# 94. Recommended MVP

Version 1 should contain:

### Authentication

- Login
- Roles
- Store permissions

### Stores

- MÃ¡laga
- Torremolinos
- Store management

### Customers

- Customer creation
- Customer search
- Documents
- Rental history

### Vehicles

- Categories
- Vehicle inventory
- Availability
- Status
- Transfer

### Rentals

- New rental
- Multiple vehicles
- Pricing
- Discounts
- Deposit
- Payment
- Return
- Extra charges

### Payments

- Cash
- Card
- Refund
- Payment history

### Shifts

- Open shift
- Close shift
- Cash reconciliation

### Reports

- Daily sales
- Store sales
- Cash/card
- Rentals
- Deposits

### Repairs

- Repair orders
- Parts
- Labor
- Repair history

---

# 95. Phase 2

After the MVP:

```text
Reservations
Inventory purchasing
Supplier management
Advanced accounting
Advanced employee attendance
Payroll integration
Automatic invoices
Email/SMS/WhatsApp notifications
Customer portal
Online reservations
Online payments
Digital signatures
Advanced analytics
```

---

# 96. Recommended Development Order

Do not build everything simultaneously.

## Phase 1

```text
Database
Authentication
Stores
Users
Employees
Roles
```

## Phase 2

```text
Customers
Vehicle categories
Vehicles
Availability
```

## Phase 3

```text
Pricing
Rental contracts
Rental items
Deposits
Payments
```

## Phase 4

```text
Return workflow
Extra charges
Refunds
Cash register
Shifts
```

## Phase 5

```text
Repairs
Parts
Labor
Inventory
```

## Phase 6

```text
Reports
Dashboard
Audit
```

## Phase 7

```text
Reservations
Advanced finance
Notifications
Customer portal
```

---

# 97. Minimum Production Database

The first production database should contain at least:

```text
companies
stores
users
roles
user_roles
user_store_access
employees
employee_schedules
attendance_records
employee_shifts

customers
customer_documents

vehicle_categories
vehicles
vehicle_status_history
vehicle_transfers

rental_rate_plans
rental_rate_rules
discount_rules

rental_contracts
rental_items
charge_types
rental_charges

payments
payment_allocations
refunds

deposits
deposit_transactions

repair_categories
repair_parts
repair_labor_rates
repair_orders
repair_order_items

inventory_items
inventory_movements

expense_categories
expenses

financial_transactions
cash_movements

audit_logs
company_settings
```

---

# 98. Important Design Decision

The most important architectural decision is:

**Separate master data from transactional data.**

Master/configuration data:

```text
Vehicle categories
Price plans
Price rules
Charge types
Repair parts
Labor rates
Stores
Users
```

Transactional data:

```text
Rentals
Payments
Deposits
Refunds
Repairs
Expenses
Shifts
Cash movements
Financial transactions
```

This separation makes the system maintainable.

---

# 99. Second Important Design Decision

The second most important decision is:

**Never destroy financial history.**

For example:

```text
Payment 100 â‚¬
```

should not later become:

```text
Payment 80 â‚¬
```

Instead:

```text
Payment 100 â‚¬
Refund 20 â‚¬
```

This gives a complete audit trail.

---

# 100. Third Important Design Decision

The third most important decision is:

**Prices are configuration, but transaction prices are snapshots.**

Example:

```text
Price catalog today:
Scooter 1 day = 40 â‚¬
```

Rental created:

```text
rental_item.unit_price = 40 â‚¬
```

Next month:

```text
Scooter 1 day = 45 â‚¬
```

Old rental remains:

```text
40 â‚¬
```

New rental:

```text
45 â‚¬
```

This is mandatory for reliable historical reporting.

---

# 101. Final Architecture

Recommended final architecture:

```text
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚       Frontend        â”‚
                    â”‚ React / Expo Web      â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚ HTTPS
                                â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚      Node.js API      â”‚
                    â”‚ TypeScript + Fastify  â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚
                                â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚        Prisma         â”‚
                    â”‚          ORM          â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚
                                â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚       MySQL 8         â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Additional services:

Object Storage
    â†“
Customer documents / receipts

Backup Storage
    â†“
Database backups

Optional later:
Payment Provider
Email/SMS
Online Reservations
Customer Portal
```

---

# 102. Final Recommendation

For this specific business, use:

```text
Backend:
Node.js
TypeScript
Fastify
Prisma

Database:
MySQL 8

Frontend:
React / Next.js
or Expo + React Native Web if a unified mobile/tablet/web application is required.

Authentication:
JWT + refresh tokens

Storage:
S3-compatible object storage for documents/receipts

Deployment:
Docker
Reverse proxy
HTTPS

Monitoring:
Application logs
Error tracking
Database backups
Audit logs
```

The first goal should not be to reproduce the Excel spreadsheet inside a website.

The goal should be to convert the business into structured transactions:

```text
Customer
   â†“
Rental Contract
   â†“
Rental Items
   â†“
Payment + Deposit
   â†“
Vehicle Usage
   â†“
Return
   â†“
Extra Charges
   â†“
Deposit Refund/Retention
   â†“
Shift
   â†“
Financial Reporting
```

With this model, MÃ¡laga and Torremolinos are simply two stores in the same system, and adding a third location later does not require redesigning the database.
