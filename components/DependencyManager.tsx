'use client';

import { useState } from 'react';

interface Task {
  id: string;
  name: string;
}

interface Dependency {
  id: string;
  dependsOnTaskId: string;
  dependsOnTask: {
    id: string;
    name: string;
  };
}

interface DependencyManagerProps {
  taskId: string;
  taskName: string;
  dependencies: Dependency[];
  availableTasks: Task[];
  onUpdate: () => void;
}

export default function DependencyManager({
  taskId,
  taskName,
  dependencies,
  availableTasks,
  onUpdate,
}: DependencyManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter out current task and tasks that are already dependencies
  const dependencyIds = dependencies.map(d => d.dependsOnTaskId);
  const selectableTasks = availableTasks.filter(
    t => t.id !== taskId && !dependencyIds.includes(t.id)
  );

  const handleAddDependency = async () => {
    if (!selectedTaskId) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          dependsOnTaskId: selectedTaskId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add dependency');
      }

      setSelectedTaskId('');
      setShowAddForm(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    if (!confirm('Remove this dependency?')) return;

    try {
      const response = await fetch(`/api/dependencies/${dependencyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove dependency');
      }

      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove dependency');
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Dependencies</h4>
        {selectableTasks.length > 0 && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            + Add
          </button>
        )}
      </div>

      {dependencies.length === 0 && !showAddForm && (
        <p className="text-xs text-gray-500">No dependencies</p>
      )}

      {dependencies.length > 0 && (
        <div className="space-y-1 mb-2">
          {dependencies.map(dep => (
            <div
              key={dep.id}
              className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded"
            >
              <span className="text-gray-700">
                Blocked by: <span className="font-medium">{dep.dependsOnTask.name}</span>
              </span>
              <button
                onClick={() => handleRemoveDependency(dep.id)}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="mt-2 space-y-2">
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">Select a task...</option>
            {selectableTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddDependency}
              disabled={!selectedTaskId || loading}
              className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Dependency'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedTaskId('');
                setError('');
              }}
              disabled={loading}
              className="flex-1 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
