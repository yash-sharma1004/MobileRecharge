import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, RefreshCw, Wallet, 
  Tag, Gift, Share2, Megaphone, LogOut, Menu, X, ArrowLeft,
  ChevronDown, History
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Recharges', path: '/admin/recharges', icon: RefreshCw },
    { name: 'Wallet Audits', path: '/admin/wallet', icon: Wallet },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Cashback Engine', path: '/admin/cashback', icon: Gift },
    { name: 'Referral Monitor', path: '/admin/referrals', icon: Share2 },
    { name: 'Offer Banners', path: '/admin/offers', icon: Megaphone }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0 p-5 sticky top-0 h-screen shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8.5 h-8.5 bg-gradient-to-tr from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-sky-500/10">A</div>
          <div className="leading-tight">
            <span className="font-black text-[15px] text-slate-800 tracking-tight block">Partner Console</span>
            <span className="text-[10px] text-sky-500 font-bold uppercase tracking-wider">Super Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                  active 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/15 border border-sky-400/20' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="pt-5 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center font-black text-sky-600 text-sm shadow-inner">
              {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
              <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">System Partner</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100/50 text-red-650 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Nav Backdrop & Sidebar */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 p-5 z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 bg-gradient-to-tr from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">A</div>
            <div className="leading-tight">
              <span className="font-black text-[14px] text-slate-800 tracking-tight block">Partner Console</span>
              <span className="text-[9px] text-sky-500 font-bold uppercase tracking-wider">Super Admin</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                  active 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center font-black text-sky-600 text-xs shadow-inner">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{user?.name}</p>
              <span className="text-[8px] text-emerald-600 font-bold uppercase">System Partner</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100/50 text-red-650 text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Dynamic Content Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <Link 
              to="/home" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200 outline-none text-left"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] text-sky-500 font-bold">Admin Workspace</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-xs font-black text-sky-600 border border-sky-100 shadow-inner">
                {user?.name?.slice(0, 1).toUpperCase() || 'A'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Control</p>
                  </div>
                  <Link 
                    to="/wallet" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-all"
                  >
                    <Wallet className="w-4 h-4 text-slate-400" />
                    <span>My Wallet</span>
                  </Link>
                  <Link 
                    to="/history" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-all"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    <span>My History</span>
                  </Link>
                  <div className="h-px bg-slate-100 my-1.5" />
                  <button 
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-all text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Logout Account</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Content Region */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
