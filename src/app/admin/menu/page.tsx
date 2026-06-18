'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
};

type Category = {
  id: number;
  name: string;
  items: MenuItem[];
};

export default function MenuManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: ''
  });

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error('โหลดข้อมูลเมนูไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        toast.success('เพิ่มหมวดหมู่สำเร็จ');
        setNewCategoryName('');
        setIsCategoryModalOpen(false);
        fetchMenu();
      }
    } catch (error) {
      toast.error('ไม่สามารถเพิ่มหมวดหมู่ได้');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('ยืนยันการลบหมวดหมู่นี้? (ต้องลบเมนูข้างในก่อน)')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบหมวดหมู่สำเร็จ');
        fetchMenu();
      } else {
        toast.error('ไม่สามารถลบได้ กรุณาลบเมนูข้างในหมวดหมู่นี้ก่อน');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.categoryId) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, ราคา, หมวดหมู่)');
      return;
    }
    try {
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        toast.success('เพิ่มเมนูสำเร็จ');
        setNewItem({ name: '', description: '', price: '', imageUrl: '', categoryId: '' });
        setIsItemModalOpen(false);
        fetchMenu();
      }
    } catch (error) {
      toast.error('ไม่สามารถเพิ่มเมนูได้');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('ยืนยันการลบเมนูนี้?')) return;
    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบเมนูสำเร็จ');
        fetchMenu();
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบ');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] text-indigo-600">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 font-sans pb-10">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            จัดการเมนูอาหาร
          </h1>
          <p className="text-slate-500 mt-2 text-lg">เพิ่ม ลบ หรือแก้ไขรายการอาหารและหมวดหมู่</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsCategoryModalOpen(true)} variant="outline" className="h-12 px-6 rounded-xl font-bold bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มหมวดหมู่
          </Button>
          <Button onClick={() => setIsItemModalOpen(true)} className="h-12 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มเมนู
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-indigo-100 pb-2 flex-1 mr-4">
                {category.name}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            {category.items.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                ยังไม่มีเมนูในหมวดหมู่นี้
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {category.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white group flex flex-col">
                    <div className="flex-1 flex flex-col p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 text-lg pr-4">{item.name}</h3>
                        <div className="font-extrabold text-indigo-600 text-lg whitespace-nowrap">฿{item.price}</div>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{item.description || '-'}</p>
                      
                      {item.imageUrl ? (
                        <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden mb-4">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-slate-50 rounded-xl flex items-center justify-center mb-4 text-slate-300">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      
                      <Button variant="destructive" className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-0 rounded-xl shadow-none" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> ลบเมนู
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">เพิ่มหมวดหมู่ใหม่</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">ชื่อหมวดหมู่</label>
              <Input 
                placeholder="เช่น ของหวาน, อาหารทานเล่น" 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)}
                className="h-12 rounded-xl bg-slate-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="rounded-xl h-12">ยกเลิก</Button>
            <Button onClick={handleCreateCategory} className="rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700">บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">เพิ่มเมนูอาหารใหม่</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">หมวดหมู่ <span className="text-red-500">*</span></label>
              <Select onValueChange={(val) => setNewItem({...newItem, categoryId: val})} value={newItem.categoryId}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">ชื่อเมนู <span className="text-red-500">*</span></label>
              <Input 
                placeholder="เช่น ส้มตำไทย" 
                value={newItem.name} 
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                className="h-12 rounded-xl bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">ราคา (บาท) <span className="text-red-500">*</span></label>
              <Input 
                type="number"
                placeholder="เช่น 60" 
                value={newItem.price} 
                onChange={e => setNewItem({...newItem, price: e.target.value})}
                className="h-12 rounded-xl bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">คำอธิบาย (ถ้ามี)</label>
              <Input 
                placeholder="เช่น รสจัดจ้าน เปรี้ยวหวาน" 
                value={newItem.description} 
                onChange={e => setNewItem({...newItem, description: e.target.value})}
                className="h-12 rounded-xl bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">URL รูปภาพ (ถ้ามี)</label>
              <Input 
                placeholder="https://..." 
                value={newItem.imageUrl} 
                onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                className="h-12 rounded-xl bg-slate-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemModalOpen(false)} className="rounded-xl h-12">ยกเลิก</Button>
            <Button onClick={handleCreateItem} className="rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700">บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
