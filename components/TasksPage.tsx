'use client';

import { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

interface Project {
  id: string;
  name: string;
  startDate: string;
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
  dependencies?: any[];
}

interface TasksPageProps {
  project: Project;
}

export default function TasksPage({ project }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${project.id}`);
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [project.id]);

  const handleTaskSuccess = () => {
    setShowTaskForm(false);
    fetchTasks();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your renovation tasks and dependencies
          </p>
        </div>
        {!showTaskForm && (
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Add Task
          </button>
        )}
      </div>

      {showTaskForm && (
        <div className="mb-6">
          <TaskForm
            projectId={project.id}
            onSuccess={handleTaskSuccess}
            onCancel={() => setShowTaskForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length > 0 ? (
        <TaskList
          tasks={tasks}
          projectId={project.id}
          onTaskDeleted={fetchTasks}
          onDependencyUpdate={fetchTasks}
        />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No tasks yet</p>
          <button
            onClick={() => setShowTaskForm(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first task
          </button>
        </div>
      )}
    </div>
  );
}
