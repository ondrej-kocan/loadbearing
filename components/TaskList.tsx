'use client';

import { useState } from 'react';
import DependencyManager from './DependencyManager';

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
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  dependencies?: Dependency[];
}

interface TaskListProps {
  tasks: Task[];
  onTaskDeleted: () => void;
  onDependencyUpdate: () => void;
}

export default function TaskList({ tasks, onTaskDeleted, onDependencyUpdate }: TaskListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate which tasks are blocked by this task (reverse dependencies)
  const getBlockingTasks = (taskId: string): Task[] => {
    return tasks.filter(task =>
      task.dependencies?.some(dep => dep.dependsOnTaskId === taskId)
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">No tasks yet. Add your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{task.name}</h3>
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
              </div>

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
            <button
              onClick={() => handleDelete(task.id)}
              disabled={deletingId === task.id}
              className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              {deletingId === task.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
