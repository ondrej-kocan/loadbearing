'use client';

import { useState } from 'react';
import DependencyManager from './DependencyManager';
import TaskEditForm from './TaskEditForm';

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
  description: string | null;
  durationDays: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startDate: string | null;
  endDate: string | null;
  shiftDays?: number;
  shiftCause?: string | null;
  createdAt: string;
  dependencies?: Dependency[];
}

interface TaskListProps {
  tasks: Task[];
  projectId: string;
  onTaskDeleted: () => void;
  onDependencyUpdate: () => void;
}

export default function TaskList({ tasks, projectId, onTaskDeleted, onDependencyUpdate }: TaskListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [completionPrompt, setCompletionPrompt] = useState<{
    taskId: string;
    taskName: string;
    budgetItems: Array<{
      id: string;
      description: string;
      plannedAmount: number;
      actualAmount: number | null;
    }>;
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    in_progress: true,
    not_started: true,
    completed: false,
  });

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setDeletingId(taskId);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      onTaskDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete task');
      setDeletingId(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingId(null);
    onTaskDeleted(); // Reuse this callback to refresh data
  };

  const handleStatusToggle = async (task: Task) => {
    // Cycle through statuses: not_started -> in_progress -> completed -> not_started
    const statusCycle: Record<Task['status'], Task['status']> = {
      not_started: 'in_progress',
      in_progress: 'completed',
      completed: 'not_started',
    };

    const newStatus = statusCycle[task.status];

    // If marking as completed, check for linked budget items
    if (newStatus === 'completed') {
      try {
        const budgetResponse = await fetch(`/api/budget?projectId=${projectId}`);
        if (budgetResponse.ok) {
          const budgetData = await budgetResponse.json();
          const linkedItems = budgetData.budgetItems?.filter(
            (item: any) => item.taskId === task.id && item.actualAmount === null
          ) || [];

          if (linkedItems.length > 0) {
            // Show completion prompt instead of immediately updating
            setCompletionPrompt({
              taskId: task.id,
              taskName: task.name,
              budgetItems: linkedItems,
            });
            return;
          }
        }
      } catch (err) {
        console.error('Failed to check budget items:', err);
        // Continue with status update even if budget check fails
      }
    }

    // Update status
    setUpdatingStatusId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: task.name,
          description: task.description,
          durationDays: task.durationDays,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      onTaskDeleted(); // Refresh task list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCompleteWithBudgetUpdate = async (actualAmounts: Record<string, number>) => {
    if (!completionPrompt) return;

    try {
      // Update budget items with actual amounts
      await Promise.all(
        Object.entries(actualAmounts).map(([budgetId, amount]) =>
          fetch(`/api/budget/${budgetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actualAmount: amount,
            }),
          })
        )
      );

      // Mark task as completed
      await handleCompleteTask(completionPrompt.taskId);
      setCompletionPrompt(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update budget items');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setUpdatingStatusId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: task.name,
          description: task.description,
          durationDays: task.durationDays,
          status: 'completed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      onTaskDeleted(); // Refresh task list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusStyle = (status: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'not_started':
        return {
          label: 'Not Started',
          className: 'bg-gray-100 text-gray-700',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          className: 'bg-blue-100 text-blue-700',
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-700',
        };
    }
  };

  // Calculate which tasks are blocked by this task (reverse dependencies)
  const getBlockingTasks = (taskId: string): Task[] => {
    return tasks.filter(task =>
      task.dependencies?.some(dep => dep.dependsOnTaskId === taskId)
    );
  };

  // Get active (incomplete) dependencies for a task
  const getActiveDependencies = (task: Task): Dependency[] => {
    if (!task.dependencies) return [];
    return task.dependencies.filter(dep => {
      const dependencyTask = tasks.find(t => t.id === dep.dependsOnTaskId);
      return dependencyTask && dependencyTask.status !== 'completed';
    });
  };

  const toggleSection = (section: 'in_progress' | 'not_started' | 'completed') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Group tasks by status
  const groupedTasks = {
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    not_started: tasks.filter(t => t.status === 'not_started'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const sections: Array<{
    key: 'in_progress' | 'not_started' | 'completed';
    title: string;
    tasks: Task[];
    colorClass: string;
  }> = [
    {
      key: 'in_progress',
      title: 'In Progress',
      tasks: groupedTasks.in_progress,
      colorClass: 'text-blue-700 bg-blue-50',
    },
    {
      key: 'not_started',
      title: 'Not Started',
      tasks: groupedTasks.not_started,
      colorClass: 'text-gray-700 bg-gray-50',
    },
    {
      key: 'completed',
      title: 'Completed',
      tasks: groupedTasks.completed,
      colorClass: 'text-green-700 bg-green-50',
    },
  ];

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">No tasks yet. Add your first task to get started!</p>
      </div>
    );
  }

  const renderTask = (task: Task) => (
    <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {getActiveDependencies(task).length > 0 && (
                <span className="text-gray-400" title={`Blocked by ${getActiveDependencies(task).length} incomplete ${getActiveDependencies(task).length === 1 ? 'task' : 'tasks'}`}>
                  🔒
                </span>
              )}
              <h3 className="font-medium text-gray-900">{task.name}</h3>
            </div>
            <button
              onClick={() => handleStatusToggle(task)}
              disabled={updatingStatusId === task.id || editingId !== null}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusStyle(task.status).className}`}
              title="Click to change status"
            >
              {updatingStatusId === task.id ? '...' : getStatusStyle(task.status).label}
            </button>
            {getBlockingTasks(task.id).length > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                title={`Blocks: ${getBlockingTasks(task.id).map(t => t.name).join(', ')}`}
              >
                Blocks {getBlockingTasks(task.id).length}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-xs text-gray-500">
              Duration: {task.durationDays} {task.durationDays === 1 ? 'day' : 'days'}
            </span>
            {task.startDate && task.endDate && (
              <span className="text-xs text-blue-600 font-medium">
                {formatDate(task.startDate)} → {formatDate(task.endDate)}
              </span>
            )}
            {task.shiftDays && task.shiftDays !== 0 && task.shiftCause && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                title={`Task dates shifted due to dependency changes`}
              >
                {task.shiftDays > 0 ? '+' : ''}{task.shiftDays} {Math.abs(task.shiftDays) === 1 ? 'day' : 'days'}
                {' due to changes'}
              </span>
            )}
          </div>

          {/* Blocked Task Prompt */}
          {task.status !== 'completed' && getActiveDependencies(task).length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-lg flex-shrink-0">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    This task is waiting on {getActiveDependencies(task).length} {getActiveDependencies(task).length === 1 ? 'task' : 'tasks'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {getActiveDependencies(task).map(dep => dep.dependsOnTask.name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* In Progress Too Long Prompt */}
          {task.status === 'in_progress' && task.endDate && new Date() > new Date(task.endDate) && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-purple-600 text-lg flex-shrink-0">⏰</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">
                    This task was expected to finish by {formatDate(task.endDate)}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Consider updating the duration or checking if there are any blockers
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dependency Manager */}
          <DependencyManager
            taskId={task.id}
            taskName={task.name}
            dependencies={task.dependencies || []}
            availableTasks={tasks.map(t => ({ id: t.id, name: t.name }))}
            onUpdate={onDependencyUpdate}
          />

          {/* Blocking Tasks */}
          {getBlockingTasks(task.id).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600 mb-1">
                Blocking: {getBlockingTasks(task.id).map(t => t.name).join(', ')}
              </p>
            </div>
          )}
        </div>
        <div className="ml-4 flex gap-2">
          <button
            onClick={() => setEditingId(task.id)}
            disabled={deletingId === task.id || editingId !== null}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            disabled={deletingId === task.id || editingId !== null}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
          >
            {deletingId === task.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Inline Edit Form */}
      {editingId === task.id && (
        <TaskEditForm
          task={task}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingId(null)}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.key}>
          {/* Section Header */}
          <button
            onClick={() => toggleSection(section.key)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${section.colorClass} hover:opacity-80`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{section.title}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/50">
                {section.tasks.length}
              </span>
            </div>
            <span className="text-lg">
              {expandedSections[section.key] ? '▼' : '▶'}
            </span>
          </button>

          {/* Section Tasks */}
          {expandedSections[section.key] && (
            <div className="mt-3 space-y-3">
              {section.tasks.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  No {section.title.toLowerCase()} tasks
                </div>
              ) : (
                section.tasks.map((task) => renderTask(task))
              )}
            </div>
          )}
        </div>
      ))}

      {/* Completion Prompt Modal */}
      {completionPrompt && (
        <CompletionPromptModal
          taskName={completionPrompt.taskName}
          budgetItems={completionPrompt.budgetItems}
          onComplete={handleCompleteWithBudgetUpdate}
          onSkip={() => {
            handleCompleteTask(completionPrompt.taskId);
            setCompletionPrompt(null);
          }}
          onCancel={() => setCompletionPrompt(null)}
        />
      )}
    </div>
  );
}

// Completion Prompt Modal Component
function CompletionPromptModal({
  taskName,
  budgetItems,
  onComplete,
  onSkip,
  onCancel,
}: {
  taskName: string;
  budgetItems: Array<{
    id: string;
    description: string;
    plannedAmount: number;
    actualAmount: number | null;
  }>;
  onComplete: (amounts: Record<string, number>) => void;
  onSkip: () => void;
  onCancel: () => void;
}) {
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    budgetItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.plannedAmount.toString(),
    }), {})
  );

  const handleSubmit = () => {
    const numericAmounts = Object.entries(amounts).reduce((acc, [id, value]) => ({
      ...acc,
      [id]: parseFloat(value) || 0,
    }), {});
    onComplete(numericAmounts);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Task Complete! 🎉
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-medium">{taskName}</span> has budget items linked. Mark costs as spent?
        </p>

        <div className="space-y-3 mb-6">
          {budgetItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900 mb-2">{item.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Planned: {formatCurrency(item.plannedAmount)}</span>
                <span className="text-xs text-gray-400">→</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={amounts[item.id]}
                    onChange={(e) => setAmounts({ ...amounts, [item.id]: e.target.value })}
                    placeholder="Actual amount"
                    step="0.01"
                    min="0"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm font-medium"
          >
            Mark Complete & Update Costs
          </button>
          <button
            onClick={onSkip}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Mark Complete (Skip Budget Update)
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
