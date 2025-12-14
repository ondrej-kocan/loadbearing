import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/budget?projectId=xxx - Get all budget items for a project
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

    const budgetItems = await prisma.budgetItem.findMany({
      where: { projectId },
      include: {
        task: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ budgetItems });
  } catch (error) {
    console.error('Error fetching budget items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget items' },
      { status: 500 }
    );
  }
}

// POST /api/budget - Create a new budget item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, area, description, plannedAmount, actualAmount, taskId } = body;

    if (!projectId || !area || !description || plannedAmount === undefined) {
      return NextResponse.json(
        { error: 'projectId, area, description, and plannedAmount are required' },
        { status: 400 }
      );
    }

    const budgetItem = await prisma.budgetItem.create({
      data: {
        projectId,
        area: area.trim(),
        description: description.trim(),
        plannedAmount,
        actualAmount: actualAmount || null,
        taskId: taskId || null,
      },
    });

    return NextResponse.json({ budgetItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget item:', error);
    return NextResponse.json(
      { error: 'Failed to create budget item' },
      { status: 500 }
    );
  }
}
