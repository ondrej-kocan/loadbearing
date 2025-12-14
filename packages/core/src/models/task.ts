/**
 * Task domain model and types
 */

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  durationDays: number;
  status: TaskStatus;
  startDate: Date | null;
  endDate: Date | null;
  originalStartDate: Date | null;
  originalEndDate: Date | null;
  shiftDays: number;
  shiftCause: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  createdAt: Date;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';
