import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = parseInt(id, 10);
    
    const table = await prisma.table.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        status: 'AVAILABLE',
        currentSessionToken: null,
      }
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error closing table:', error);
    return NextResponse.json({ error: 'Failed to close table' }, { status: 500 });
  }
}
