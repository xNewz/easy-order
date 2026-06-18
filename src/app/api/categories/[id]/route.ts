import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Note: If a category has items, Prisma might throw an error depending on constraints
    await prisma.category.delete({
      where: { id: parseInt(id, 10) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category. Ensure it has no items.' }, { status: 500 });
  }
}
