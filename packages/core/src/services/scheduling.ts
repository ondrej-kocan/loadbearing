/**
 * Scheduling engine for task dependencies and timeline calculation
 */

import { Task, TaskDependency } from '../models/task';

export interface SchedulingResult {
  scheduledTasks: Task[];
  hasCycle: boolean;
  cycleError?: string;
}

/**
 * Detects circular dependencies in the task graph
 */
export function detectCycles(
  tasks: Task[],
  dependencies: TaskDependency[]
): boolean {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  tasks.forEach(task => graph.set(task.id, []));
  dependencies.forEach(dep => {
    const neighbors = graph.get(dep.taskId) || [];
    neighbors.push(dep.dependsOnTaskId);
    graph.set(dep.taskId, neighbors);
  });

  // DFS to detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycleDFS(taskId: string): boolean {
    visited.add(taskId);
    recursionStack.add(taskId);

    const neighbors = graph.get(taskId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  for (const taskId of graph.keys()) {
    if (!visited.has(taskId)) {
      if (hasCycleDFS(taskId)) return true;
    }
  }

  return false;
}

/**
 * Performs forward scheduling (finish-to-start dependencies)
 * Calculates start and end dates for all tasks based on dependencies
 */
export function scheduleForward(
  tasks: Task[],
  dependencies: TaskDependency[],
  projectStartDate: Date
): SchedulingResult {
  // Check for cycles first
  if (detectCycles(tasks, dependencies)) {
    return {
      scheduledTasks: tasks,
      hasCycle: true,
      cycleError: 'Circular dependency detected in task graph',
    };
  }

  // Build dependency map
  const depMap = new Map<string, string[]>();
  dependencies.forEach(dep => {
    const deps = depMap.get(dep.taskId) || [];
    deps.push(dep.dependsOnTaskId);
    depMap.set(dep.taskId, deps);
  });

  // Calculate earliest start dates
  const scheduledTasks = tasks.map(task => {
    const deps = depMap.get(task.id) || [];

    let earliestStart = projectStartDate;

    // Find latest end date of all dependencies
    for (const depId of deps) {
      const depTask = tasks.find(t => t.id === depId);
      if (depTask?.endDate && depTask.endDate > earliestStart) {
        earliestStart = depTask.endDate;
      }
    }

    const startDate = earliestStart;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + task.durationDays);

    return {
      ...task,
      startDate,
      endDate,
    };
  });

  return {
    scheduledTasks,
    hasCycle: false,
  };
}
