'use client';

import { useState } from 'react';

interface Task {
  id: string;
  name: string;
  description: string | null;
  durationDays: number;
  createdAt: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskDeleted: () => void;
}

export default function TaskList({ tasks, onTaskDeleted }: TaskListProps) {
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
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-gray-500">
                  Duration: {task.durationDays} {task.durationDays === 1 ? 'day' : 'days'}
                </span>
              </div>
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
