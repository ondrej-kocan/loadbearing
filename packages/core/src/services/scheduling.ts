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
 * Performs topological sort on tasks based on dependencies
 */
function topologicalSort(
  tasks: Task[],
  dependencies: TaskDependency[]
): string[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  tasks.forEach(task => {
    graph.set(task.id, []);
    inDegree.set(task.id, 0);
  });

  // Build graph and in-degree count
  dependencies.forEach(dep => {
    const neighbors = graph.get(dep.dependsOnTaskId) || [];
    neighbors.push(dep.taskId);
    graph.set(dep.dependsOnTaskId, neighbors);
    inDegree.set(dep.taskId, (inDegree.get(dep.taskId) || 0) + 1);
  });

  // Kahn's algorithm
  const queue: string[] = [];
  const sorted: string[] = [];

  // Start with tasks that have no dependencies
  inDegree.forEach((degree, taskId) => {
    if (degree === 0) {
      queue.push(taskId);
    }
  });

  while (queue.length > 0) {
    const taskId = queue.shift()!;
    sorted.push(taskId);

    const neighbors = graph.get(taskId) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sorted;
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

  // Get tasks in topological order
  const sortedTaskIds = topologicalSort(tasks, dependencies);

  // Map to store calculated dates
  const calculatedDates = new Map<string, { startDate: Date; endDate: Date }>();

  // Calculate dates in topological order
  for (const taskId of sortedTaskIds) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) continue;

    const deps = depMap.get(task.id) || [];
    let earliestStart = projectStartDate;

    // Find latest end date of all dependencies
    for (const depId of deps) {
      const depDates = calculatedDates.get(depId);
      if (depDates && depDates.endDate > earliestStart) {
        earliestStart = depDates.endDate;
      }
    }

    const startDate = new Date(earliestStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + task.durationDays);

    calculatedDates.set(task.id, { startDate, endDate });
  }

  // Map tasks with calculated dates
  const scheduledTasks = tasks.map(task => {
    const dates = calculatedDates.get(task.id);
    return {
      ...task,
      startDate: dates?.startDate || projectStartDate,
      endDate: dates?.endDate || new Date(new Date(projectStartDate).getTime() + task.durationDays * 24 * 60 * 60 * 1000),
    };
  });

  return {
    scheduledTasks,
    hasCycle: false,
  };
}
