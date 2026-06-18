'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Flame, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type OrderItem = {
  id: number;
  quantity: number;
  notes: string | null;
  status: string;
  menuItem: {
    name: string;
  };
};

type Order = {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  table: {
    number: string;
  };
  items: OrderItem[];
};

export default function KitchenView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 10 seconds
    const interval = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`อัปเดตออเดอร์ #${id} เป็น ${status === 'PREPARING' ? 'กำลังทำ' : 'เสิร์ฟแล้ว'}`, {
          icon: status === 'PREPARING' ? '🔥' : '✅',
          className: status === 'PREPARING' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-green-50 text-green-700 border-green-200'
        });
        fetchOrders();
      }
    } catch (error) {
      toast.error('Error updating order');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING');
  const completedOrders = orders.filter(o => o.status === 'SERVED' || o.status === 'PAID').slice(0, 10);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] text-indigo-600">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 font-sans pb-10">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            ระบบหลังครัว (Kitchen View)
          </h1>
          <p className="text-slate-500 mt-2 text-lg">ออเดอร์จะแสดงขึ้นมาที่นี่อัตโนมัติเมื่อลูกค้าสั่ง</p>
        </div>
        <Button onClick={() => fetchOrders(true)} variant="outline" className={`h-12 px-6 rounded-xl font-bold bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm ${refreshing ? 'opacity-80' : ''}`}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'กำลังดึงข้อมูล...' : 'อัปเดตข้อมูล'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Orders Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold flex items-center gap-2 text-slate-800">
              <Clock className="w-6 h-6 text-indigo-500" />
              ออเดอร์ต้องทำ 
              <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full ml-2">{pendingOrders.length}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pendingOrders.map(order => (
              <Card key={order.id} className={`border-0 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${order.status === 'PENDING' ? 'bg-orange-50/50' : 'bg-indigo-50/50'}`}>
                <div className={`absolute top-0 left-0 w-full h-1.5 ${order.status === 'PENDING' ? 'bg-orange-400' : 'bg-indigo-500'}`} />
                <CardHeader className="pb-3 px-6 pt-5">
                  <CardTitle className="flex justify-between items-start text-lg">
                    <div>
                      <div className="font-extrabold text-2xl text-slate-800">โต๊ะ {order.table.number}</div>
                      <div className="text-sm font-semibold text-slate-500 mt-1">ออเดอร์ #{order.id} • {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <Badge className={`px-3 py-1 rounded-full text-xs font-bold border-0 ${
                      order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {order.status === 'PENDING' ? 'รอดำเนินการ' : 'กำลังทำ'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="bg-white rounded-xl p-4 mb-5 shadow-sm border border-slate-100/50 min-h-[120px]">
                    <ul className="space-y-3">
                      {order.items.map(item => (
                        <li key={item.id} className="flex justify-between items-start border-b border-dashed border-slate-200 pb-3 last:border-0 last:pb-0">
                          <div className="w-full">
                            <div className="font-bold text-slate-800 text-lg flex items-start gap-2">
                              <span className="bg-slate-100 text-indigo-600 px-2 py-0.5 rounded-md min-w-[32px] text-center">{item.quantity}x</span> 
                              <span>{item.menuItem.name}</span>
                            </div>
                            {item.notes && (
                              <div className="text-sm text-red-600 font-medium mt-1.5 bg-red-50 py-1 px-2 rounded-lg inline-block">
                                หมายเหตุ: {item.notes}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    {order.status === 'PENDING' ? (
                      <Button className="w-full h-12 text-md font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-transform hover:scale-[1.02]" onClick={() => updateOrderStatus(order.id, 'PREPARING')}>
                        👨‍🍳 เริ่มทำอาหาร
                      </Button>
                    ) : (
                      <Button className="w-full h-12 text-md font-bold rounded-xl bg-green-600 hover:bg-green-700 shadow-sm transition-transform hover:scale-[1.02]" onClick={() => updateOrderStatus(order.id, 'SERVED')}>
                        ✅ พร้อมเสิร์ฟ
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {pendingOrders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4">
                <CheckCircle2 className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">ไม่มีออเดอร์ค้าง</h3>
              <p className="text-slate-500 mt-2">พักผ่อนได้เลย หรือรอออเดอร์ใหม่เข้า</p>
            </div>
          )}
        </div>

        {/* Completed Orders Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-slate-800">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            เสิร์ฟแล้วล่าสุด
          </h2>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            {completedOrders.length === 0 ? (
              <p className="text-slate-400 text-center py-8">ยังไม่มีออเดอร์ที่เสร็จแล้ว</p>
            ) : (
              <div className="space-y-4">
                {completedOrders.map(order => (
                  <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-extrabold text-slate-800">โต๊ะ {order.table.number}</span>
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">เสร็จสิ้น</span>
                    </div>
                    <ul className="text-sm font-medium text-slate-500 space-y-1">
                      {order.items.map(item => (
                        <li key={item.id} className="truncate">• {item.quantity}x {item.menuItem.name}</li>
                      ))}
                    </ul>
                    <div className="text-xs text-slate-400 mt-3 text-right">
                      {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
