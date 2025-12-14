'use client';

import { useState } from 'react';

interface Task {
  id: string;
  name: string;
  description: string | null;
  durationDays: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface TaskEditFormProps {
  task: Task;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TaskEditForm({ task, onSuccess, onCancel }: TaskEditFormProps) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [durationDays, setDurationDays] = useState<number | ''>(task.durationDays);
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed'>(task.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          durationDays: durationDays === '' ? 1 : durationDays,
          status
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Edit Task</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
            Task Name
          </label>
          <input
            type="text"
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duration (days)
          </label>
          <input
            type="number"
            id="edit-duration"
            value={durationDays}
            onChange={(e) => {
              const value = e.target.value;
              setDurationDays(value === '' ? '' : parseInt(value));
            }}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'not_started' | 'in_progress' | 'completed')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={loading}
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
