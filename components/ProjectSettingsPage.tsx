'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectSettingsPageProps {
  project: Project;
}

export default function ProjectSettingsPage({ project }: ProjectSettingsPageProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [startDate, setStartDate] = useState(
    new Date(project.startDate).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/project/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          startDate: new Date(startDate).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/project/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive project');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive project');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(project.name);
    setDescription(project.description || '');
    setStartDate(new Date(project.startDate).toISOString().split('T')[0]);
    setError('');
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Project Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your renovation project details
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            {isEditing ? (
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={loading}
                placeholder="e.g., Kitchen Renovation"
              />
            ) : (
              <p className="text-gray-900 text-lg">{project.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            {isEditing ? (
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={loading}
                placeholder="Add project details..."
              />
            ) : (
              <p className="text-gray-700">
                {project.description || <span className="text-gray-400 italic">No description</span>}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            {isEditing ? (
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={loading}
              />
            ) : (
              <p className="text-gray-900">
                {new Date(project.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Edit Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Archive this project. You won't be able to access it anymore, but the data will be preserved.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading || isEditing}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Archive Project
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Archive Project?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to archive "{project.name}"? The project data will be preserved
              but you won't be able to access it anymore. This action cannot be easily undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleArchive}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Archiving...' : 'Yes, Archive Project'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
