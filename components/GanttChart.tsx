'use client';

import { useMemo } from 'react';

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
  dependencies?: Dependency[];
}

interface GanttChartProps {
  tasks: Task[];
  projectStartDate: string;
}

export default function GanttChart({ tasks, projectStartDate }: GanttChartProps) {
  const tasksWithDates = tasks.filter(t => t.startDate && t.endDate);

  // Calculate date range for the chart
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (tasksWithDates.length === 0) {
      const start = new Date(projectStartDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 30); // Default 30 days
      return {
        minDate: start,
        maxDate: end,
        totalDays: 30,
      };
    }

    const dates = tasksWithDates.flatMap(t => [
      new Date(t.startDate!),
      new Date(t.endDate!),
    ]);
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add some padding
    min.setDate(min.getDate() - 1);
    max.setDate(max.getDate() + 1);

    const days = Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24));

    return {
      minDate: min,
      maxDate: max,
      totalDays: days,
    };
  }, [tasksWithDates, projectStartDate]);

  // Generate timeline labels (dates)
  const timelineLabels = useMemo(() => {
    const labels: Date[] = [];
    const current = new Date(minDate);

    while (current <= maxDate) {
      labels.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return labels;
  }, [minDate, maxDate]);

  // Calculate position and width for a task bar
  const getTaskBarStyle = (task: Task) => {
    if (!task.startDate || !task.endDate) return null;

    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    const startOffset = Math.floor(
      (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const duration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  // Get color based on task status
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'not_started':
        return 'bg-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (tasksWithDates.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          No scheduled tasks yet. Tasks will appear here once they have start and end dates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Timeline View</h2>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex border-b border-gray-200 pb-2 mb-4">
            <div className="w-48 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700">Task</span>
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {timelineLabels.map((date, index) => (
                  <div
                    key={index}
                    className="flex-1 text-center"
                    style={{ minWidth: `${100 / totalDays}%` }}
                  >
                    <span className="text-xs text-gray-600">{formatDate(date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="space-y-3">
            {tasksWithDates.map((task) => {
              const barStyle = getTaskBarStyle(task);
              if (!barStyle) return null;

              return (
                <div key={task.id} className="flex items-center">
                  {/* Task Name */}
                  <div className="w-48 flex-shrink-0 pr-4">
                    <p className="text-sm font-medium text-gray-900 truncate" title={task.name}>
                      {task.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.durationDays} {task.durationDays === 1 ? 'day' : 'days'}
                    </p>
                  </div>

                  {/* Task Bar */}
                  <div className="flex-1 relative h-10">
                    {/* Background grid */}
                    <div className="absolute inset-0 flex">
                      {timelineLabels.map((_, index) => (
                        <div
                          key={index}
                          className="flex-1 border-r border-gray-100"
                          style={{ minWidth: `${100 / totalDays}%` }}
                        />
                      ))}
                    </div>

                    {/* Task bar */}
                    <div
                      className="absolute top-1 h-8 flex items-center"
                      style={barStyle}
                    >
                      <div
                        className={`w-full h-full rounded-md ${getStatusColor(task.status)} flex items-center justify-center px-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                        title={`${task.name}\n${formatDate(new Date(task.startDate!))} → ${formatDate(new Date(task.endDate!))}\nStatus: ${task.status.replace('_', ' ')}`}
                      >
                        <span className="text-xs font-medium text-white truncate">
                          {task.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-6">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm text-gray-600">Not Started</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
