'use client';

import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
}

interface Task {
  id: string;
  endDate: string | null;
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
        {/* Tasks Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Tasks</h2>
          <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.length === 0 ? 'No tasks yet' : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
          </p>
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
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-purple-600">—</p>
              <p className="text-sm text-gray-500 mt-1">Add tasks to see timeline</p>
            </>
          )}
        </div>
      </div>

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
