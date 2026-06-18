'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, LayoutDashboard, MenuSquare, Flame } from 'lucide-react';

export default function AdminNavigation() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'จัดการโต๊ะ', href: '/admin', icon: LayoutDashboard },
    { name: 'จัดการเมนู', href: '/admin/menu', icon: MenuSquare },
    { name: 'หลังครัว', href: '/admin/kitchen', icon: Flame },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 flex items-center justify-center border-b border-slate-100/50">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30 mb-4 transform hover:scale-105 transition-transform cursor-pointer">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">EasyOrder</h1>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Management</p>
          </div>
        </div>
        <div className="flex-1 py-8 px-5 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-5 py-4 rounded-2xl font-bold transition-all duration-200 group ${
                  isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-xl mr-4 transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-base">{link.name}</span>
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-20 px-5 h-16 flex items-center justify-center shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
              <ChefHat className="w-5 h-5 text-white" />
           </div>
           <span className="text-xl font-black text-slate-800 tracking-tight">EasyOrder</span>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-30 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center h-20 px-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all ${
                  isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-2.5 rounded-2xl ${isActive ? 'bg-indigo-50 shadow-sm' : ''}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                </div>
                <span className={`text-[11px] font-bold ${isActive ? 'text-indigo-600' : ''}`}>{link.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  );
}
