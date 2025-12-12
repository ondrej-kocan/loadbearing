/**
 * Task domain model and types
 */

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  durationDays: number;
  startDate: Date | null;
  endDate: Date | null;
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
