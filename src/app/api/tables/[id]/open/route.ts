import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = parseInt(id, 10);
    
    // Check if table exists
    const table = await prisma.table.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const sessionToken = crypto.randomUUID();

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        status: 'OCCUPIED',
        currentSessionToken: sessionToken,
      }
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error opening table:', error);
    return NextResponse.json({ error: 'Failed to open table' }, { status: 500 });
  }
}
