'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, ReceiptText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type MenuClientProps = {
  table: any;
  categories: any[];
  initialOrders: any[];
};

export default function MenuClient({ table, categories, initialOrders }: MenuClientProps) {
  const cart = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const openItemModal = (item: any) => {
    setSelectedItem(item);
    setQuantity(1);
    setNotes('');
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      cart.addItem({
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        quantity,
        notes,
      });
      toast.success(`เพิ่ม ${selectedItem.name} ลงตะกร้าแล้ว`, {
        icon: '🛒',
        className: 'rounded-xl',
      });
      setSelectedItem(null);
    }
  };

  const submitOrder = async () => {
    if (cart.items.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: table.currentSessionToken,
          items: cart.items,
        }),
      });

      if (res.ok) {
        const newOrder = await res.json();
        setOrders([newOrder, ...orders]);
        cart.clearCart();
        setIsCartOpen(false);
        toast.success('ส่งคำสั่งซื้อสำเร็จ พนักงานกำลังเตรียมอาหาร', {
          icon: '✨',
          className: 'bg-green-50 text-green-700 border-green-200',
        });
        setIsOrdersOpen(true);
      } else {
        toast.error('ไม่สามารถส่งคำสั่งซื้อได้ โปรดติดต่อพนักงาน');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      {/* Sleek Gradient Header */}
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 sticky top-0 z-10 shadow-lg">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between text-white">
          <div className="font-bold text-xl tracking-tight">EasyOrder</div>
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full font-medium shadow-sm transition-all px-3"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.items.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{cart.items.reduce((a, b) => a + b.quantity, 0)}</span>}
            </Button>
            <div className="bg-white text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              โต๊ะ {table.number}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto px-5 pt-8 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-800">ยินดีต้อนรับ! 👋</h1>
        <p className="text-slate-500 mt-1">เลือกเมนูอาหารที่ต้องการสั่งได้เลยครับ</p>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-10">
        {categories.map((category) => (
          <div key={category.id} className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {category.items.map((item: any) => (
                <Card 
                  key={item.id} 
                  role="button"
                  tabIndex={0}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl bg-white group touch-manipulation"
                  onClick={() => openItemModal(item)}
                >
                  <div className="flex h-36">
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-extrabold text-indigo-600 text-lg">฿{item.price}</div>
                        <button 
                          type="button"
                          className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            openItemModal(item);
                          }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {item.imageUrl && (
                      <div className="w-36 h-full bg-slate-100 overflow-hidden relative shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10 mix-blend-overlay"></div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Buttons (Cart & Orders) */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-between items-end z-20 pointer-events-none max-w-3xl mx-auto">
        <Button 
          size="icon"
          className="w-14 h-14 rounded-full shadow-2xl pointer-events-auto bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 flex-shrink-0"
          onClick={() => setIsOrdersOpen(true)}
        >
          <div className="relative flex flex-col items-center">
            <ReceiptText className="w-6 h-6 text-indigo-600" />
            <span className="text-[9px] font-bold mt-0.5 text-slate-500">บิล/สถานะ</span>
            {orders.length > 0 && <span className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{orders.length}</span>}
          </div>
        </Button>

        {cart.items.length > 0 && (
          <Button 
            className="flex-1 ml-4 h-14 rounded-full shadow-2xl pointer-events-auto flex items-center justify-between px-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-transform hover:scale-[1.02]"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="flex items-center">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 mr-3" />
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-600">
                  {cart.items.reduce((a, b) => a + b.quantity, 0)}
                </span>
              </div>
              <span className="font-semibold ml-2">ดูตะกร้า</span>
            </div>
            <span className="font-bold flex items-center">
              ฿{cart.totalAmount()} <ChevronRight className="w-5 h-5 ml-1 opacity-70" />
            </span>
          </Button>
        )}
      </div>

      {/* Item Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-3xl p-0 border-0 shadow-2xl max-h-[85dvh] flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 w-full">
            {selectedItem?.imageUrl && (
              <div className="relative h-56 w-full shrink-0">
                <img src={selectedItem.imageUrl} alt="food" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                  <p className="text-white/80 line-clamp-1">{selectedItem.description}</p>
                </div>
              </div>
            )}
            <div className="p-6 space-y-6">
            {!selectedItem?.imageUrl && (
              <div>
                <DialogTitle className="text-2xl font-bold">{selectedItem?.name}</DialogTitle>
                <DialogDescription className="mt-2 text-base">{selectedItem?.description}</DialogDescription>
              </div>
            )}
            
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
              <span className="font-semibold text-slate-700">จำนวน</span>
              <div className="flex items-center gap-4 bg-white px-2 py-1 rounded-full shadow-sm border">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-indigo-600" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-6 text-center text-lg font-bold">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-indigo-600" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 ml-1">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
              <Input 
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย" 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <Button className="w-full h-14 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shrink-0" onClick={handleAddToCart}>
              เพิ่มลงตะกร้า - ฿{(selectedItem?.price || 0) * quantity}
            </Button>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Modal */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-3xl max-h-[85dvh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b bg-slate-50/50">
            <DialogTitle className="text-2xl font-bold">ตะกร้าสินค้า</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <ShoppingCart className="w-16 h-16 opacity-20" />
                <p className="text-lg">ตะกร้าว่างเปล่า</p>
              </div>
            ) : (
              cart.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-lg text-slate-800">{item.name}</div>
                    <div className="text-sm text-slate-500 mt-1">฿{item.price} / รายการ</div>
                    {item.notes && <div className="text-sm text-orange-500 mt-2 bg-orange-50 inline-block px-2 py-1 rounded-md">หมายเหตุ: {item.notes}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="font-extrabold text-lg text-indigo-600">฿{item.price * item.quantity}</div>
                    <div className="flex items-center gap-1 bg-slate-50 border rounded-full p-1 shadow-sm">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-200 transition-colors" onClick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1)}><Minus className="w-3 h-3" /></button>
                      <span className="text-sm w-6 text-center font-bold">{item.quantity}</span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-200 transition-colors" onClick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1)}><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-6 bg-white border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between w-full text-xl font-bold mb-5 text-slate-800">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-indigo-600">฿{cart.totalAmount()}</span>
            </div>
            <Button className="w-full h-14 rounded-xl text-lg font-bold shadow-md bg-indigo-600 hover:bg-indigo-700" disabled={cart.items.length === 0 || isSubmitting} onClick={submitOrder}>
              {isSubmitting ? 'กำลังส่งคำสั่งซื้อ...' : 'ยืนยันสั่งอาหารเลย'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Orders/Status Modal */}
      <Dialog open={isOrdersOpen} onOpenChange={setIsOrdersOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-3xl max-h-[85dvh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b bg-slate-50/50">
            <DialogTitle className="text-2xl font-bold">ประวัติสั่งอาหาร</DialogTitle>
            <DialogDescription className="text-base mt-1">ออเดอร์สำหรับโต๊ะ {table.number}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <ReceiptText className="w-16 h-16 opacity-20" />
                <p className="text-lg">ยังไม่มีรายการสั่งอาหาร</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <Card key={order.id} className="border-0 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="py-4 px-5 flex flex-row items-center justify-between border-b bg-white">
                    <div className="text-sm font-bold text-slate-500">ออเดอร์ #{order.id}</div>
                    <div className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                      order.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      order.status === 'PREPARING' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      order.status === 'SERVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {order.status === 'PENDING' ? 'รอดำเนินการ' :
                       order.status === 'PREPARING' ? 'กำลังทำอาหาร' :
                       order.status === 'SERVED' ? 'เสิร์ฟแล้ว' : 'ชำระเงินแล้ว'}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3 bg-white">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-slate-700">
                        <span className="font-medium"><span className="text-indigo-600 mr-2">{item.quantity}x</span> {item.menuItem.name}</span>
                        <span className="font-semibold text-slate-900">฿{item.quantity * item.menuItem.price}</span>
                      </div>
                    ))}
                    <div className="border-t border-dashed pt-3 mt-4 flex justify-between font-bold text-lg text-slate-800">
                      <span>รวมรายการนี้</span>
                      <span>฿{order.totalAmount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="p-6 bg-white border-t">
            <div className="w-full text-center">
              <p className="text-sm text-slate-500 mb-2">เมื่อทานเสร็จแล้ว แจ้งพนักงานเพื่อเช็คบิลได้เลยครับ</p>
              <div className="font-black text-2xl text-indigo-600 py-2 bg-indigo-50 rounded-xl mt-3">
                ยอดรวมทั้งหมด: ฿{orders.reduce((sum, o) => sum + o.totalAmount, 0)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
