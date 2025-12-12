import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectCycles } from '@/core/services/scheduling';

// POST /api/dependencies - Create a task dependency
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, dependsOnTaskId } = body;

    if (!taskId || !dependsOnTaskId) {
      return NextResponse.json(
        { error: 'taskId and dependsOnTaskId are required' },
        { status: 400 }
      );
    }

    if (taskId === dependsOnTaskId) {
      return NextResponse.json(
        { error: 'A task cannot depend on itself' },
        { status: 400 }
      );
    }

    // Check if dependency already exists
    const existingDep = await prisma.taskDependency.findFirst({
      where: {
        taskId,
        dependsOnTaskId,
      },
    });

    if (existingDep) {
      return NextResponse.json(
        { error: 'This dependency already exists' },
        { status: 400 }
      );
    }

    // Get the task to find its project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Fetch all tasks and dependencies to check for cycles
    const allTasks = await prisma.task.findMany({
      where: { projectId: task.projectId },
    });

    const allDependencies = await prisma.taskDependency.findMany({
      where: {
        task: { projectId: task.projectId },
      },
    });

    // Add the new dependency temporarily to check for cycles
    const newDependencies = [
      ...allDependencies.map(d => ({
        id: d.id,
        taskId: d.taskId,
        dependsOnTaskId: d.dependsOnTaskId,
        createdAt: d.createdAt,
      })),
      {
        id: 'temp',
        taskId,
        dependsOnTaskId,
        createdAt: new Date(),
      },
    ];

    // Check for cycles
    if (detectCycles(allTasks, newDependencies)) {
      return NextResponse.json(
        { error: 'This dependency would create a circular dependency' },
        { status: 400 }
      );
    }

    // Create the dependency
    const dependency = await prisma.taskDependency.create({
      data: {
        taskId,
        dependsOnTaskId,
      },
      include: {
        dependsOnTask: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ dependency }, { status: 201 });
  } catch (error) {
    console.error('Error creating dependency:', error);
    return NextResponse.json(
      { error: 'Failed to create dependency' },
      { status: 500 }
    );
  }
}
