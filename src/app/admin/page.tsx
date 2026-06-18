'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { QrCode, LogOut, Loader2, Link2 } from 'lucide-react';
import { toast } from 'sonner';

type Table = {
  id: number;
  number: string;
  status: string;
  currentSessionToken: string | null;
};

export default function AdminDashboard() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeData, setQrCodeData] = useState<{ url: string; tableNumber: string } | null>(null);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenTable = async (id: number) => {
    try {
      const res = await fetch(`/api/tables/${id}/open`, { method: 'POST' });
      if (res.ok) {
        const updatedTable = await res.json();
        toast.success(`เปิดโต๊ะ ${updatedTable.number} สำเร็จ`, { icon: '🎉' });
        fetchTables();
        
        // Generate QR code for the table
        const url = `${window.location.origin}/menu/${updatedTable.currentSessionToken}`;
        const qrUrl = await QRCode.toDataURL(url, { margin: 2, scale: 8, color: { dark: '#1e1b4b', light: '#ffffff' } });
        setQrCodeData({ url: qrUrl, tableNumber: updatedTable.number });
      }
    } catch (error) {
      toast.error('Error opening table');
    }
  };

  const handleCloseTable = async (id: number) => {
    if (!confirm('ยืนยันการปิดโต๊ะ (เช็คบิล)?')) return;
    try {
      const res = await fetch(`/api/tables/${id}/close`, { method: 'POST' });
      if (res.ok) {
        toast.success('ปิดโต๊ะสำเร็จ โต๊ะว่างแล้ว');
        fetchTables();
      }
    } catch (error) {
      toast.error('Error closing table');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] text-indigo-600">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">จัดการโต๊ะ (Table Management)</h1>
          <p className="text-slate-500 mt-2 text-lg">เปิดโต๊ะเพื่อสร้าง QR Code แบบสุ่มให้ลูกค้าสแกนสั่งอาหารได้อย่างปลอดภัย</p>
        </div>
        <div className="hidden lg:block bg-indigo-50 p-4 rounded-2xl">
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-indigo-600">{tables.length}</div>
              <div className="text-sm text-slate-500 font-medium">ทั้งหมด</div>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div>
              <div className="text-2xl font-black text-green-600">{tables.filter(t => t.status === 'AVAILABLE').length}</div>
              <div className="text-sm text-slate-500 font-medium">ว่าง</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className={`border-0 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden relative ${table.status === 'OCCUPIED' ? 'bg-indigo-50/30' : 'bg-white'}`}>
            {table.status === 'OCCUPIED' && <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />}
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="flex justify-between items-center text-xl">
                <span className="font-extrabold text-slate-800">โต๊ะ {table.number}</span>
                <Badge className={`px-3 py-1 rounded-full text-xs font-bold border-0 ${table.status === 'OCCUPIED' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {table.status === 'OCCUPIED' ? 'กำลังรับประทาน' : 'โต๊ะว่าง'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-col gap-3 mt-2">
                {table.status === 'AVAILABLE' ? (
                  <Button className="w-full h-12 rounded-xl text-md font-semibold bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => handleOpenTable(table.id)}>
                    <QrCode className="w-5 h-5 mr-2" />
                    เปิดโต๊ะ
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full h-11 rounded-xl text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold" onClick={() => {
                      const url = `${window.location.origin}/menu/${table.currentSessionToken}`;
                      QRCode.toDataURL(url, { margin: 2, scale: 8, color: { dark: '#1e1b4b', light: '#ffffff' } }).then(qr => {
                        setQrCodeData({ url: qr, tableNumber: table.number });
                      });
                    }}>
                      ดู QR Code
                    </Button>
                    <Button variant="destructive" className="w-full h-11 rounded-xl font-semibold bg-red-500 hover:bg-red-600 shadow-sm" onClick={() => handleCloseTable(table.id)}>
                      <LogOut className="w-4 h-4 mr-2" />
                      เช็คบิล / ปิดโต๊ะ
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code Modal */}
      <Dialog open={!!qrCodeData} onOpenChange={(open) => !open && setQrCodeData(null)}>
        <DialogContent className="sm:max-w-md text-center rounded-3xl p-8 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">สแกนเพื่อสั่งอาหาร 📱</DialogTitle>
            <DialogDescription className="text-lg font-medium text-indigo-600 mt-2 bg-indigo-50 py-2 rounded-xl inline-block">
              สำหรับโต๊ะ {qrCodeData?.tableNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {qrCodeData?.url && (
              <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100">
                <img src={qrCodeData.url} alt="QR Code" className="w-64 h-64 rounded-xl" />
              </div>
            )}
            <p className="mt-6 text-slate-500 text-sm">QR Code นี้สร้างขึ้นใหม่ทุกครั้งที่มีลูกค้านั่ง ปลอดภัยจากการสั่งอาหารข้ามโต๊ะ</p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button type="button" className="w-full sm:w-auto px-8 h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800" onClick={() => setQrCodeData(null)}>
              ปิดหน้าต่าง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
