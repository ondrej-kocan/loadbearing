'use client';

import { useState, useEffect } from 'react';
import GanttChart from './GanttChart';

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
  dependencies?: any[];
}

interface SchedulePageProps {
  project: Project;
}

export default function SchedulePage({ project }: SchedulePageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  return (
    <div className="min-w-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visual timeline of your renovation project
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Loading schedule...</p>
        </div>
      ) : (
        <GanttChart tasks={tasks} projectStartDate={project.startDate} />
      )}
    </div>
  );
}
