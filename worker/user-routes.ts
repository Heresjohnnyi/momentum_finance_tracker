import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './core-utils';
import { TransactionEntity, CategoryEntity, CommitmentEntity, EmiEntity, GoalEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { DashboardSummary, Transaction, Category, Commitment, EmiBorrowing, Goal } from "@shared/types";
import { add } from "date-fns";
const createTransactionSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1),
  date: z.string().datetime(),
  description: z.string().optional(),
});
const updateTransactionSchema = createTransactionSchema.partial();
const categorySchema = z.object({
  name: z.string().min(2),
});
const commitmentSchema = z.object({
    name: z.string().min(2),
    amount: z.number().int().positive(),
    categoryId: z.string().min(1),
    dueDate: z.string().datetime(),
    recurrence: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'none']),
});
const updateCommitmentSchema = commitmentSchema.partial();
const emiSchema = z.object({
    name: z.string().min(2),
    principal: z.number().int().positive(),
    interestRate: z.number().positive(),
    tenure: z.number().int().positive(),
    interestType: z.enum(['simple', 'compound']),
    emi: z.number().int().positive(),
    totalInterest: z.number().int().positive(),
    totalAmount: z.number().int().positive(),
});
const updateEmiSchema = emiSchema.partial();
const goalSchema = z.object({
    name: z.string().min(2),
    targetAmount: z.number().int().positive(),
    deadline: z.string().datetime(),
});
const updateGoalSchema = goalSchema.partial();
const contributeGoalSchema = z.object({
    amount: z.number().int().positive(),
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is present on first load
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      CategoryEntity.ensureSeed(c.env),
      TransactionEntity.ensureSeed(c.env),
      CommitmentEntity.ensureSeed(c.env),
      EmiEntity.ensureSeed(c.env),
      GoalEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // CATEGORY ROUTES
  app.get('/api/categories', async (c) => {
    const { items } = await CategoryEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/categories', zValidator('json', categorySchema), async (c) => {
    const { name } = c.req.valid('json');
    const newCategory: Category = { id: crypto.randomUUID(), name };
    await CategoryEntity.create(c.env, newCategory);
    return ok(c, newCategory);
  });
  app.put('/api/categories/:id', zValidator('json', categorySchema), async (c) => {
    const id = c.req.param('id');
    const { name } = c.req.valid('json');
    const category = new CategoryEntity(c.env, id);
    if (!(await category.exists())) return notFound(c, 'Category not found');
    await category.patch({ name });
    return ok(c, await category.getState());
  });
  app.delete('/api/categories/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await CategoryEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Category not found');
    return ok(c, { id });
  });
  // TRANSACTION ROUTES
  app.get('/api/transactions', async (c) => {
    const { query, type, categoryId, from, to } = c.req.query();
    let { items } = await TransactionEntity.list(c.env);
    if (query) {
      items = items.filter(t => t.description?.toLowerCase().includes(query.toLowerCase()));
    }
    if (type && type !== 'all') {
      items = items.filter(t => t.type === type);
    }
    if (categoryId && categoryId !== 'all') {
      items = items.filter(t => t.categoryId === categoryId);
    }
    if (from) {
      const fromDate = new Date(from);
      items = items.filter(t => new Date(t.date) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      items = items.filter(t => new Date(t.date) <= toDate);
    }
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return ok(c, items);
  });
  app.post('/api/transactions', zValidator('json', createTransactionSchema), async (c) => {
    const body = c.req.valid('json');
    const newTransaction: Transaction = { id: crypto.randomUUID(), ...body };
    await TransactionEntity.create(c.env, newTransaction);
    return ok(c, newTransaction);
  });
  app.put('/api/transactions/:id', zValidator('json', updateTransactionSchema), async (c) => {
    const id = c.req.param('id');
    const patch = c.req.valid('json');
    const transaction = new TransactionEntity(c.env, id);
    if (!(await transaction.exists())) return notFound(c, 'Transaction not found');
    await transaction.patch(patch);
    return ok(c, await transaction.getState());
  });
  app.delete('/api/transactions/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await TransactionEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Transaction not found');
    return ok(c, { id });
  });
  // SUMMARY ROUTE
  app.get('/api/summary', async (c) => {
    const { from, to } = c.req.query();
    let { items: transactions } = await TransactionEntity.list(c.env);
    if (from) {
        const fromDate = new Date(from);
        transactions = transactions.filter(t => new Date(t.date) >= fromDate);
    }
    if (to) {
        const toDate = new Date(to);
        transactions = transactions.filter(t => new Date(t.date) <= toDate);
    }
    const summary = transactions.reduce(
      (acc, txn) => {
        if (txn.type === 'income') {
          acc.income += txn.amount;
          acc.balance += txn.amount;
        } else {
          acc.expenses += txn.amount;
          acc.balance -= txn.amount;
        }
        return acc;
      },
      { balance: 0, income: 0, expenses: 0 } as DashboardSummary
    );
    return ok(c, summary);
  });
  // COMMITMENT ROUTES
  app.get('/api/commitments', async (c) => {
    const { items } = await CommitmentEntity.list(c.env);
    items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return ok(c, items);
  });
  app.post('/api/commitments', zValidator('json', commitmentSchema), async (c) => {
    const body = c.req.valid('json');
    const newCommitment: Commitment = { id: crypto.randomUUID(), ...body, status: 'upcoming' };
    await CommitmentEntity.create(c.env, newCommitment);
    return ok(c, newCommitment);
  });
  app.put('/api/commitments/:id', zValidator('json', updateCommitmentSchema), async (c) => {
    const id = c.req.param('id');
    const patch = c.req.valid('json');
    const commitment = new CommitmentEntity(c.env, id);
    if (!(await commitment.exists())) return notFound(c, 'Commitment not found');
    await commitment.patch(patch);
    return ok(c, await commitment.getState());
  });
  app.delete('/api/commitments/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await CommitmentEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Commitment not found');
    return ok(c, { id });
  });
  app.post('/api/commitments/:id/pay', async (c) => {
    const id = c.req.param('id');
    const commitmentEntity = new CommitmentEntity(c.env, id);
    if (!(await commitmentEntity.exists())) return notFound(c, 'Commitment not found');
    const commitment = await commitmentEntity.getState();
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: commitment.amount,
      type: 'expense',
      categoryId: commitment.categoryId,
      date: new Date().toISOString(),
      description: `Paid: ${commitment.name}`,
    };
    await TransactionEntity.create(c.env, newTransaction);
    if (commitment.recurrence === 'none') {
      await commitmentEntity.patch({ status: 'paid' });
    } else {
      let nextDueDate: Date;
      const currentDueDate = new Date(commitment.dueDate);
      switch (commitment.recurrence) {
        case 'daily': nextDueDate = add(currentDueDate, { days: 1 }); break;
        case 'weekly': nextDueDate = add(currentDueDate, { weeks: 1 }); break;
        case 'monthly': nextDueDate = add(currentDueDate, { months: 1 }); break;
        case 'yearly': nextDueDate = add(currentDueDate, { years: 1 }); break;
        default: nextDueDate = currentDueDate;
      }
      await commitmentEntity.patch({ dueDate: nextDueDate.toISOString(), status: 'upcoming' });
    }
    return ok(c, { transaction: newTransaction, commitment: await commitmentEntity.getState() });
  });
  // EMI ROUTES
  app.get('/api/emis', async (c) => {
    const { items } = await EmiEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/emis', zValidator('json', emiSchema), async (c) => {
    const body = c.req.valid('json');
    const newEmi: EmiBorrowing = { id: crypto.randomUUID(), ...body };
    await EmiEntity.create(c.env, newEmi);
    return ok(c, newEmi);
  });
  app.put('/api/emis/:id', zValidator('json', updateEmiSchema), async (c) => {
    const id = c.req.param('id');
    const patch = c.req.valid('json');
    const emi = new EmiEntity(c.env, id);
    if (!(await emi.exists())) return notFound(c, 'EMI record not found');
    await emi.patch(patch);
    return ok(c, await emi.getState());
  });
  app.delete('/api/emis/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await EmiEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'EMI record not found');
    return ok(c, { id });
  });
  // GOAL ROUTES
  app.get('/api/goals', async (c) => {
    const { items } = await GoalEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/goals', zValidator('json', goalSchema), async (c) => {
    const body = c.req.valid('json');
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      ...body,
      currentAmount: 0,
    };
    await GoalEntity.create(c.env, newGoal);
    return ok(c, newGoal);
  });
  app.put('/api/goals/:id', zValidator('json', updateGoalSchema), async (c) => {
    const id = c.req.param('id');
    const patch = c.req.valid('json');
    const goal = new GoalEntity(c.env, id);
    if (!(await goal.exists())) return notFound(c, 'Goal not found');
    await goal.patch(patch);
    return ok(c, await goal.getState());
  });
  app.delete('/api/goals/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await GoalEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Goal not found');
    return ok(c, { id });
  });
  app.post('/api/goals/:id/contribute', zValidator('json', contributeGoalSchema), async (c) => {
    const id = c.req.param('id');
    const { amount } = c.req.valid('json');
    const goalEntity = new GoalEntity(c.env, id);
    if (!(await goalEntity.exists())) return notFound(c, 'Goal not found');
    const goal = await goalEntity.getState();
    const newCurrentAmount = goal.currentAmount + amount;
    if (newCurrentAmount > goal.targetAmount) {
        return bad(c, 'Contribution exceeds target amount.');
    }
    const savingsCategory = (await CategoryEntity.list(c.env)).items.find(cat => cat.name.toLowerCase() === 'savings');
    if (!savingsCategory) {
        return bad(c, 'A "Savings" category is required to contribute to a goal.');
    }
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: amount,
      type: 'expense',
      categoryId: savingsCategory.id,
      date: new Date().toISOString(),
      description: `Contribution to goal: ${goal.name}`,
    };
    await TransactionEntity.create(c.env, newTransaction);
    await goalEntity.patch({ currentAmount: newCurrentAmount });
    return ok(c, { transaction: newTransaction, goal: await goalEntity.getState() });
  });
}