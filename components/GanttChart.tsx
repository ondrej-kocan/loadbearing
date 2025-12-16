'use client';

import { useMemo, useRef, useEffect, useState } from 'react';

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
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Day column width: 40px on mobile, 60px on desktop
  const dayWidth = 40; // Will be styled responsively with CSS

  // Calculate position and width for a task bar
  const getTaskBarStyle = (task: Task) => {
    if (!task.startDate || !task.endDate) return null;

    const start = new Date(task.startDate);

    const startOffset = Math.floor(
      (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Use the task's durationDays directly for accurate width
    const duration = task.durationDays;

    // Use pixel-based positioning
    const leftPx = startOffset * dayWidth;
    const widthPx = duration * dayWidth;

    return {
      left: `${leftPx}px`,
      width: `${widthPx}px`,
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

  // Calculate dependency lines
  const getDependencyLines = () => {
    if (!mounted || !containerRef.current) return [];

    const lines: Array<{ path: string; id: string; arrowX: number; arrowY: number; angle: number }> = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    tasksWithDates.forEach((task) => {
      if (!task.dependencies || task.dependencies.length === 0) return;

      task.dependencies.forEach((dep) => {
        const fromTaskRef = taskRefs.current[dep.dependsOnTaskId];
        const toTaskRef = taskRefs.current[task.id];

        if (!fromTaskRef || !toTaskRef) return;

        const fromRect = fromTaskRef.getBoundingClientRect();
        const toRect = toTaskRef.getBoundingClientRect();

        // Calculate relative positions
        const x1 = fromRect.right - containerRect.left;
        const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
        const x2 = toRect.left - containerRect.left;
        const y2 = toRect.top - containerRect.top + toRect.height / 2;

        // Create a curved path (bezier curve)
        const midX = (x1 + x2) / 2;
        const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

        // Calculate arrow angle
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        lines.push({
          path,
          id: `${dep.dependsOnTaskId}-${task.id}`,
          arrowX: x2,
          arrowY: y2,
          angle,
        });
      });
    });

    return lines;
  };

  const dependencyLines = getDependencyLines();

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
    <div className="bg-white rounded-lg shadow overflow-hidden w-full min-w-0">
      <div className="p-4 sm:p-6 pb-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Timeline View</h2>
      </div>

      <div className="px-4 sm:px-6 min-w-0">
        <div className="overflow-x-auto pb-4">
          <div className="inline-block" ref={containerRef}>
          {/* Timeline Header */}
          <div className="flex border-b border-gray-200 pb-2 mb-4 relative">
            {/* Header sticky background */}
            <div className="absolute top-0 left-0 bottom-0 w-32 sm:w-48 bg-white sticky left-0 z-20 border-r border-gray-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]" />

            <div className="w-32 sm:w-48 flex-shrink-0 pr-3 sm:pr-4 sticky left-0 z-30 relative">
              <span className="text-sm font-medium text-gray-700">Task</span>
            </div>
            <div className="flex">
              {timelineLabels.map((date, index) => (
                <div
                  key={index}
                  className="text-center flex-shrink-0"
                  style={{ width: `${dayWidth}px` }}
                >
                  <span className="text-xs text-gray-600">{formatDate(date)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="space-y-3 relative">
            {/* Continuous sticky column background */}
            <div className="absolute top-0 left-0 bottom-0 w-32 sm:w-48 bg-white sticky left-0 z-20 border-r border-gray-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]" />

            {tasksWithDates.map((task) => {
              const barStyle = getTaskBarStyle(task);
              if (!barStyle) return null;

              return (
                <div key={task.id} className="flex items-center relative">
                  {/* Task Name */}
                  <div className="w-32 sm:w-48 h-10 flex-shrink-0 pr-3 sm:pr-4 sticky left-0 z-30 flex items-center relative">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={task.name}>
                        {task.name}
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block truncate">
                        {task.durationDays} {task.durationDays === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>

                  {/* Task Bar */}
                  <div className="relative h-10 z-10" style={{ width: `${totalDays * dayWidth}px` }}>
                    {/* Background grid */}
                    <div className="absolute inset-0 flex">
                      {timelineLabels.map((_, index) => (
                        <div
                          key={index}
                          className="border-r border-gray-100 flex-shrink-0"
                          style={{ width: `${dayWidth}px` }}
                        />
                      ))}
                    </div>

                    {/* Task bar */}
                    <div
                      ref={(el) => { taskRefs.current[task.id] = el; }}
                      className="absolute top-1 h-8 flex items-center"
                      style={barStyle}
                    >
                      <div
                        className={`w-full h-full rounded-md ${getStatusColor(task.status)} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                        title={`${task.name}\n${formatDate(new Date(task.startDate!))} → ${formatDate(new Date(task.endDate!))}\nStatus: ${task.status.replace('_', ' ')}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Dependency Lines SVG Overlay */}
            {mounted && dependencyLines.length > 0 && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#2563eb" />
                  </marker>
                </defs>
                {dependencyLines.map((line) => (
                  <g key={line.id}>
                    {/* Main line */}
                    <path
                      d={line.path}
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      opacity="0.8"
                    />
                  </g>
                ))}
              </svg>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 pb-6 px-4 sm:px-6 border-t border-gray-200 flex flex-wrap items-center gap-4 sm:gap-6">
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
  );
}
