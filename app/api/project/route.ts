import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/project - Get the single active project (or null if none exists)
export async function GET() {
  try {
    const project = await prisma.project.findFirst({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// POST /api/project - Create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Check if an active project already exists
    const existingProject = await prisma.project.findFirst({
      where: { status: 'active' },
    });
    if (existingProject) {
      return NextResponse.json(
        { error: 'An active project already exists. This app supports one project at a time.' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
