import { Response } from 'express';
import { memoryData, Expense, FinancialAudit } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getExpenses = (req: AuthRequest, res: Response) => {
  const scope = req.storeScope!;
  const storeId = scope.activeStoreId;
  const status = req.query.status as string;

  let list = memoryData.expenses.filter(e => e.company_id === scope.companyId);
  if (storeId !== null) {
    list = list.filter(e => e.store_id === storeId);
  } else {
    list = list.filter(e => scope.allowedStoreIds.includes(e.store_id));
  }

  if (status && status !== 'ALL') {
    list = list.filter(e => e.status === status);
  }

  return res.json(list);
};

export const createExpense = (req: AuthRequest, res: Response) => {
  const scope = req.storeScope!;
  const { category, amount, date, payment_method, description } = req.body;

  // INVARIANT 13: All-Stores Context Is Read/Reporting Only by Default
  const targetStoreId = req.body.store_id ? Number(req.body.store_id) : scope.activeStoreId;
  if (!targetStoreId) {
    return res.status(403).json({ error: 'Access denied: Store-specific write operations require an explicit authorized store context (X-Store-Context)' });
  }

  if (!scope.allowedStoreIds.includes(targetStoreId)) {
    return res.status(403).json({ error: 'Access denied: Unauthorized store context' });
  }

  const expAmount = Math.abs(Number(amount || 0));

  const newExpense: Expense = {
    id: Date.now(),
    company_id: scope.companyId,
    store_id: targetStoreId,
    category: category || 'OTHER',
    amount: expAmount,
    date: date || new Date().toISOString().split('T')[0],
    payment_method: payment_method || 'CASH',
    description: description || 'Store operating expense',
    status: 'ACTIVE',
    created_by: req.user?.id || 1,
    created_at: new Date().toISOString(),
    voided_by: null,
    voided_at: null,
    void_reason: null
  };

  memoryData.expenses.unshift(newExpense);

  // Financial Reversal / Audit Entry
  const audit: FinancialAudit = {
    id: Date.now() + 1,
    company_id: scope.companyId,
    store_id: targetStoreId,
    entity_type: 'EXPENSE',
    entity_id: newExpense.id,
    action: 'CREATE',
    amount: expAmount,
    performed_by: req.user?.id || 1,
    performed_at: new Date().toISOString(),
    notes: `Created operating expense: ${description}`,
    metadata: { category: newExpense.category, payment_method: newExpense.payment_method }
  };
  memoryData.financial_audits.unshift(audit);

  return res.status(201).json(newExpense);
};

export const voidExpense = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { void_reason } = req.body;
  const scope = req.storeScope!;

  if (!void_reason) {
    return res.status(400).json({ error: 'Mandatory justification void_reason is required to void a financial expense' });
  }

  const expense = memoryData.expenses.find(e => e.id === id && e.company_id === scope.companyId);
  if (!expense) return res.status(404).json({ error: 'Expense record not found' });

  if (!scope.allowedStoreIds.includes(expense.store_id)) {
    return res.status(403).json({ error: 'Access denied: Unauthorized store context' });
  }

  if (expense.status === 'VOIDED') {
    return res.status(400).json({ error: 'Expense is already voided' });
  }

  expense.status = 'VOIDED';
  expense.voided_by = req.user?.id || 1;
  expense.voided_at = new Date().toISOString();
  expense.void_reason = void_reason;

  // Financial Audit Reversal Event
  const audit: FinancialAudit = {
    id: Date.now(),
    company_id: scope.companyId,
    store_id: expense.store_id,
    entity_type: 'EXPENSE',
    entity_id: expense.id,
    action: 'VOID',
    amount: expense.amount,
    performed_by: req.user?.id || 1,
    performed_at: new Date().toISOString(),
    notes: `Voided expense: ${void_reason}`,
    metadata: {
      original_status: 'ACTIVE',
      new_status: 'VOIDED',
      void_reason: void_reason,
      category: expense.category
    }
  };
  memoryData.financial_audits.unshift(audit);

  return res.json({ message: 'Expense record voided successfully', expense, audit });
};
