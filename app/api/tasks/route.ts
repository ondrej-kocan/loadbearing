import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scheduleForward } from '@/core/services/scheduling';

// GET /api/tasks?projectId=xxx - Get all tasks for a project
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Fetch project to get start date
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { startDate: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch tasks with dependencies
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        dependencies: {
          include: {
            dependsOnTask: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Fetch all dependencies for scheduling
    const dependencies = await prisma.taskDependency.findMany({
      where: {
        task: { projectId },
      },
    });

    // Apply scheduling algorithm
    const schedulingResult = scheduleForward(tasks, dependencies, project.startDate);

    // Return scheduled tasks with dependencies
    return NextResponse.json({
      tasks: schedulingResult.scheduledTasks.map(task => ({
        ...task,
        startDate: task.startDate?.toISOString() || null,
        endDate: task.endDate?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
      hasCycle: schedulingResult.hasCycle,
      cycleError: schedulingResult.cycleError,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, name, description, durationDays } = body;

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'projectId and name are required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        name: name.trim(),
        description: description?.trim() || null,
        durationDays: durationDays || 1,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
