import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/project/[id] - Update a project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, startDate, status } = body;

    // Verify project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // If archiving, verify there's no other active project before allowing unarchive
    if (status && status !== existingProject.status) {
      if (status === 'active') {
        const activeProject = await prisma.project.findFirst({
          where: {
            status: 'active',
            id: { not: id },
          },
        });
        if (activeProject) {
          return NextResponse.json(
            { error: 'Another active project exists. Archive it first before unarchiving this one.' },
            { status: 400 }
          );
        }
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Project name is required' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (startDate !== undefined) {
      updateData.startDate = new Date(startDate);
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}
