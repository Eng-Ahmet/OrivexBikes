import { startTestServer, stopTestServer, results } from './testHelper.js';
import { runAuthTests } from './auth.test.js';
import { runStoresTests } from './stores.test.js';
import { runExpensesTests } from './expenses.test.js';
import { runVehiclesTests } from './vehicles.test.js';
import { runEmployeesTests } from './employees.test.js';
import { runRentalsTests } from './rentals.test.js';
import { runShiftsTests } from './shifts.test.js';
import { runShiftDefinitionsTests } from './shiftDefinitions.test.js';
import { runAttendanceTests } from './attendance.test.js';
import { runOvertimeTests } from './overtime.test.js';
import { runLeaveRequestsTests } from './leaveRequests.test.js';
import { runShiftSwapsTests } from './shiftSwaps.test.js';
import { runPayrollTests } from './payroll.test.js';
import { runReportsTests } from './reports.test.js';
import { runRepairsTests } from './repairs.test.js';
import { runSettlementsTests } from './settlements.test.js';
import { runSettingsTests } from './settings.test.js';
import { runTariffsTests } from './tariffs.test.js';
import { runPublicTests } from './public.test.js';

async function main() {
  console.log('\n===============================================================');
  console.log('🧪 QQBikes Modular Backend Routes Integration Test Suite');
  console.log('===============================================================\n');

  await startTestServer();

  try {
    await runAuthTests();
    await runStoresTests();
    await runExpensesTests();
    await runVehiclesTests();
    await runEmployeesTests();
    await runRentalsTests();
    await runShiftsTests();
    await runShiftDefinitionsTests();
    await runAttendanceTests();
    await runOvertimeTests();
    await runLeaveRequestsTests();
    await runShiftSwapsTests();
    await runPayrollTests();
    await runReportsTests();
    await runRepairsTests();
    await runSettlementsTests();
    await runSettingsTests();
    await runTariffsTests();
    await runPublicTests();
  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    await stopTestServer();

    console.log('\n===============================================================');
    console.log('📊 Modular Backend Routes Test Results Summary Matrix');
    console.log('===============================================================');

    let passedCount = 0;
    let failedCount = 0;

    results.forEach(r => {
      const icon = r.passed ? '✅ [PASS]' : '❌ [FAIL]';
      if (r.passed) passedCount++; else failedCount++;
      const noteText = r.notes ? ` (${r.notes})` : '';
      const expText = Array.isArray(r.expectedStatus) ? r.expectedStatus.join('/') : r.expectedStatus;
      console.log(`${icon} [${r.category}] ${r.method} ${r.endpoint} -> Expected: ${expText}, Got: ${r.actualStatus}${noteText}`);
    });

    console.log('\n===============================================================');
    console.log(`📈 Summary: Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
    console.log('===============================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

main();
