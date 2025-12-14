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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
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
              {task.dependencies && task.dependencies.length > 0 && (
                <span className="text-gray-400" title={`Blocked by ${task.dependencies.length} ${task.dependencies.length === 1 ? 'task' : 'tasks'}`}>
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
    </div>
  );
}
