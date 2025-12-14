'use client';

import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
}

interface Dependency {
  id: string;
  dependsOnTaskId: string;
  dependsOnTask: {
    id: string;
    name: string;
  };
}

interface Task {
  id: string;
  name: string;
  durationDays: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startDate: string | null;
  endDate: string | null;
  originalStartDate?: string | null;
  originalEndDate?: string | null;
  shiftDays?: number;
  shiftCause?: string | null;
  dependencies?: Dependency[];
}

interface BudgetItem {
  plannedAmount: number;
  actualAmount: number | null;
}

interface ProjectOverviewProps {
  project: Project;
}

export default function ProjectOverview({ project }: ProjectOverviewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const startDate = new Date(project.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, budgetRes] = await Promise.all([
          fetch(`/api/tasks?projectId=${project.id}`),
          fetch(`/api/budget?projectId=${project.id}`),
        ]);

        const [tasksData, budgetData] = await Promise.all([
          tasksRes.json(),
          budgetRes.json(),
        ]);

        if (tasksRes.ok) setTasks(tasksData.tasks);
        if (budgetRes.ok) setBudgetItems(budgetData.budgetItems);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project.id]);

  // Calculate project end date (latest task end date)
  const projectEndDate = tasks.length > 0
    ? tasks.reduce((latest, task) => {
        if (!task.endDate) return latest;
        const taskEnd = new Date(task.endDate);
        return !latest || taskEnd > latest ? taskEnd : latest;
      }, null as Date | null)
    : null;

  // Calculate original project end date (from original scheduled dates)
  const originalProjectEndDate = tasks.length > 0
    ? tasks.reduce((latest, task) => {
        if (!task.originalEndDate) return latest;
        const taskEnd = new Date(task.originalEndDate);
        return !latest || taskEnd > latest ? taskEnd : latest;
      }, null as Date | null)
    : null;

  // Calculate timeline shift
  const timelineShift = projectEndDate && originalProjectEndDate
    ? Math.round((projectEndDate.getTime() - originalProjectEndDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Get tasks that shifted (sorted by shift magnitude)
  const shiftedTasks = tasks
    .filter(t => t.shiftDays && t.shiftDays !== 0)
    .sort((a, b) => Math.abs(b.shiftDays || 0) - Math.abs(a.shiftDays || 0));

  const formatProjectEnd = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate budget totals
  const budgetPlanned = budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0);
  const budgetActual = budgetItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get active (incomplete) dependencies for a task
  const getActiveDependencies = (task: Task): Dependency[] => {
    if (!task.dependencies) return [];
    return task.dependencies.filter(dep => {
      const dependencyTask = tasks.find(t => t.id === dep.dependsOnTaskId);
      return dependencyTask && dependencyTask.status !== 'completed';
    });
  };

  // Get tasks ready to start (no active blockers)
  const getReadyTasks = (): Task[] => {
    return tasks
      .filter(task =>
        task.status === 'not_started' &&
        getActiveDependencies(task).length === 0
      )
      .slice(0, 5); // Limit to 5 tasks
  };

  // Calculate task status counts
  const tasksByStatus = {
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    not_started: tasks.filter(t => t.status === 'not_started').length,
  };

  const completionPercentage = tasks.length > 0
    ? Math.round((tasksByStatus.completed / tasks.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading project overview...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Project Info */}
      <div className="mb-8">
        {project.description && (
          <p className="text-lg text-gray-600 mb-2">{project.description}</p>
        )}
        <p className="text-sm text-gray-500">Started: {startDate}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Card - Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h2>
          {tasks.length > 0 ? (
            <>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-blue-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Status Counts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">✓ Completed</span>
                  <span className="font-semibold text-green-700">{tasksByStatus.completed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">⚡ In Progress</span>
                  <span className="font-semibold text-blue-700">{tasksByStatus.in_progress}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">○ Not Started</span>
                  <span className="font-semibold text-gray-700">{tasksByStatus.not_started}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500 mt-1">No tasks yet</p>
            </>
          )}
        </div>

        {/* Budget Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Budget</h2>
          {budgetItems.length > 0 ? (
            <>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(budgetPlanned)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(budgetActual)} spent
                {budgetActual > 0 && budgetPlanned > 0 && (
                  <span className="ml-2">
                    ({Math.round((budgetActual / budgetPlanned) * 100)}%)
                  </span>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-green-600">$0</p>
              <p className="text-sm text-gray-500 mt-1">No budget items yet</p>
            </>
          )}
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Timeline</h2>
          {projectEndDate ? (
            <>
              <p className="text-3xl font-bold text-purple-600">
                {formatProjectEnd(projectEndDate)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Estimated completion</p>

              {/* Show timeline shift if exists */}
              {timelineShift !== 0 && originalProjectEndDate && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {timelineShift > 0 ? (
                      <>
                        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-yellow-700 font-medium">
                          +{timelineShift} {timelineShift === 1 ? 'day' : 'days'} from original plan
                        </p>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-green-700 font-medium">
                          {Math.abs(timelineShift)} {Math.abs(timelineShift) === 1 ? 'day' : 'days'} ahead of plan
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Originally planned: {formatProjectEnd(originalProjectEndDate)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-purple-600">—</p>
              <p className="text-sm text-gray-500 mt-1">Add tasks to see timeline</p>
            </>
          )}
        </div>
      </div>

      {/* Timeline Shifts - Show if tasks have shifted */}
      {shiftedTasks.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Timeline Changes</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tasks that shifted from their original schedule
          </p>
          <div className="space-y-2">
            {shiftedTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.name}</p>
                  {task.shiftCause && (
                    <p className="text-xs text-gray-600 mt-1">
                      Due to dependency changes
                    </p>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <span className={`text-sm font-semibold ${
                    (task.shiftDays || 0) > 0 ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {(task.shiftDays || 0) > 0 ? '+' : ''}{task.shiftDays} {Math.abs(task.shiftDays || 0) === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            ))}
            {shiftedTasks.length > 5 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                and {shiftedTasks.length - 5} more tasks shifted
              </p>
            )}
          </div>
        </div>
      )}

      {/* Next Actions - Ready to Start */}
      {tasks.length > 0 && getReadyTasks().length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Ready to Start</h2>
            <a
              href="/tasks"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all tasks →
            </a>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Tasks with no blockers that you can work on now
          </p>
          <div className="space-y-3">
            {getReadyTasks().map((task) => (
              <a
                key={task.id}
                href="/tasks"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Duration: {task.durationDays} {task.durationDays === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <span className="ml-4 text-gray-400">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {tasks.length === 0 && budgetItems.length === 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/tasks"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left block"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">+</span>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Add Your First Task</p>
                  <p className="text-sm text-gray-500">Break down your project into tasks</p>
                </div>
              </div>
            </a>

            <a
              href="/budget"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left block"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">$</span>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Set Your Budget</p>
                  <p className="text-sm text-gray-500">Track expenses by area</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
