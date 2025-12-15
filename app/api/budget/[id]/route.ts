import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/budget/[id] - Update a budget item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { area, description, plannedAmount, actualAmount, taskId } = body;

    const budgetItem = await prisma.budgetItem.update({
      where: { id },
      data: {
        area: area?.trim(),
        description: description?.trim(),
        plannedAmount,
        actualAmount: actualAmount === '' ? null : actualAmount,
        taskId: taskId || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ budgetItem });
  } catch (error) {
    console.error('Error updating budget item:', error);
    return NextResponse.json(
      { error: 'Failed to update budget item' },
      { status: 500 }
    );
  }
}

// DELETE /api/budget/[id] - Delete a budget item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.budgetItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget item:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget item' },
      { status: 500 }
    );
  }
}
