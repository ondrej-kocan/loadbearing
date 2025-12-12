'use client';

import { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  name: string;
  description: string | null;
  durationDays: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  dependencies?: any[];
}

interface ProjectDashboardProps {
  project: Project;
}

export default function ProjectDashboard({ project }: ProjectDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const startDate = new Date(project.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-gray-600">{project.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">Started: {startDate}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <p className="text-3xl font-bold text-green-600">$0</p>
            <p className="text-sm text-gray-500 mt-1">No budget items yet</p>
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

        {/* Tasks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
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
            <div className="text-center py-8">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onTaskDeleted={fetchTasks}
              onDependencyUpdate={fetchTasks}
            />
          )}
        </div>

        {/* Quick Actions - Only show if no tasks */}
        {tasks.length === 0 && !showTaskForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowTaskForm(true)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
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
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">$</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Set Your Budget</p>
                    <p className="text-sm text-gray-500">Track expenses by area</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
