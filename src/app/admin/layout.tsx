import AdminNavigation from './AdminNavigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <AdminNavigation />
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 w-full px-5 sm:px-10 py-8 md:py-12 pb-28 md:pb-12 max-w-7xl mx-auto">
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {children}
        </div>
      </main>
    </div>
  );
}
