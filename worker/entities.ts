import { IndexedEntity } from "./core-utils";
import type { Transaction, Category, Commitment, EmiBorrowing, Goal } from "@shared/types";
import { MOCK_TRANSACTIONS, MOCK_CATEGORIES, MOCK_COMMITMENTS } from "@shared/mock-data";
export class CategoryEntity extends IndexedEntity<Category> {
  static readonly entityName = "category";
  static readonly indexName = "categories";
  static readonly initialState: Category = { id: "", name: "" };
  static seedData = MOCK_CATEGORIES;
}
export class TransactionEntity extends IndexedEntity<Transaction> {
  static readonly entityName = "transaction";
  static readonly indexName = "transactions";
  static readonly initialState: Transaction = {
    id: "",
    amount: 0,
    type: 'expense',
    categoryId: "",
    date: new Date().toISOString(),
  };
  static seedData = MOCK_TRANSACTIONS;
}
export class CommitmentEntity extends IndexedEntity<Commitment> {
  static readonly entityName = "commitment";
  static readonly indexName = "commitments";
  static readonly initialState: Commitment = {
    id: "",
    name: "",
    amount: 0,
    categoryId: "",
    dueDate: new Date().toISOString(),
    recurrence: 'none',
    status: 'upcoming',
  };
  static seedData = MOCK_COMMITMENTS;
}
export class EmiEntity extends IndexedEntity<EmiBorrowing> {
  static readonly entityName = "emi";
  static readonly indexName = "emis";
  static readonly initialState: EmiBorrowing = {
    id: "",
    name: "",
    principal: 0,
    interestRate: 0,
    tenure: 0,
    interestType: 'simple',
    emi: 0,
    totalInterest: 0,
    totalAmount: 0,
  };
  // No seed data for EMIs
}
export class GoalEntity extends IndexedEntity<Goal> {
    static readonly entityName = "goal";
    static readonly indexName = "goals";
    static readonly initialState: Goal = {
        id: "",
        name: "",
        targetAmount: 0,
        currentAmount: 0,
        deadline: new Date().toISOString(),
    };
    // No seed data for Goals
}