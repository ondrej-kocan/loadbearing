/**
 * Budget domain model and types
 */

export interface BudgetItem {
  id: string;
  projectId: string;
  area: string;
  description: string;
  plannedAmount: number;
  actualAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  totalPlanned: number;
  totalActual: number;
  remaining: number;
  byArea: Map<string, { planned: number; actual: number }>;
}
