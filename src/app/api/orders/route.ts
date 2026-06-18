import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionToken, items } = body;

    // Verify table session
    const table = await prisma.table.findUnique({
      where: { currentSessionToken: sessionToken }
    });

    if (!table || table.status !== 'OCCUPIED') {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 403 });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItemsData = [];
    
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (menuItem) {
        totalAmount += menuItem.price * item.quantity;
        orderItemsData.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes || '',
        });
      }
    }

    // Create Order
    const newOrder = await prisma.order.create({
      data: {
        tableId: table.id,
        sessionToken,
        totalAmount,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
      }
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
