import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scheduleForward } from '@/packages/core/src/services/scheduling';
import type { Task, TaskDependency } from '@/packages/core/src/models/task';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { durationDays } = body;

    if (!durationDays || durationDays < 1) {
      return NextResponse.json(
        { error: 'Valid durationDays is required' },
        { status: 400 }
      );
    }

    // Get the task being edited
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Get all tasks and dependencies for this project
    const [allTasks, allDependencies] = await Promise.all([
      prisma.task.findMany({
        where: { projectId: task.projectId },
      }),
      prisma.taskDependency.findMany({
        where: {
          OR: [
            { task: { projectId: task.projectId } },
            { dependsOnTask: { projectId: task.projectId } },
          ],
        },
      }),
    ]);

    // Create a modified version of the tasks with the proposed change
    const modifiedTasks = allTasks.map((t) =>
      t.id === id ? { ...t, durationDays } : t
    ) as Task[];

    // Run scheduling with the proposed change
    const proposedResult = scheduleForward(
      modifiedTasks,
      allDependencies as TaskDependency[],
      task.project.startDate
    );

    if (proposedResult.hasCycle) {
      return NextResponse.json(
        { error: 'This change would create a dependency cycle' },
        { status: 400 }
      );
    }

    // Compare proposed schedule with current schedule
    const impacts = [];
    for (const proposedTask of proposedResult.scheduledTasks) {
      const currentTask = allTasks.find((t) => t.id === proposedTask.id);
      if (
        currentTask &&
        currentTask.id !== id &&
        currentTask.startDate &&
        proposedTask.startDate
      ) {
        const currentStart = new Date(currentTask.startDate);
        const proposedStart = proposedTask.startDate;
        const daysDiff = Math.round(
          (proposedStart.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff !== 0) {
          impacts.push({
            taskId: proposedTask.id,
            taskName: proposedTask.name,
            currentStartDate: currentStart,
            proposedStartDate: proposedStart,
            shiftDays: daysDiff,
          });
        }
      }
    }

    return NextResponse.json({
      impacts,
      totalAffected: impacts.length,
      maxShift: impacts.length > 0 ? Math.max(...impacts.map((i) => Math.abs(i.shiftDays))) : 0,
    });
  } catch (error) {
    console.error('Error calculating impact:', error);
    return NextResponse.json(
      { error: 'Failed to calculate impact' },
      { status: 500 }
    );
  }
}
