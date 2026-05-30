// Header.jsx — VoltTap App Header
// Matches footer color scheme: white bg, slate text, sky-500 accent
// Responsive: hamburger menu on mobile, full nav on desktop
// Stack: React + Tailwind CSS

import { useState, useEffect, useRef } from "react";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  Wallet,
  History,
  Gift,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Users,
  Ticket
} from "lucide-react";

const navLinks = [
  { label: "Home", href: "#", name: "Home", path: "/" },
  { label: "About", href: "#", name: "About", path: "/about" },
  { label: "Recharge", href: "#", highlight: true, name: "Recharge", path: "/recharge" },
  { label: "Contact Us", href: "#", name: "Contact Us", path: "/contactUs" },
  { label: "Help", href: "#", name: "Help", path: "/help" },
];

// ── Hamburger / Close Icon ──
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Phone / Signal Icon for logo ──
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={3} />
  </svg>
);

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const displayLinks = navLinks;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Logout even if API fails
    }
    logout();
    navigate('/login');
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard accessibility: Escape key closes dropdown & mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? "shadow-sm border-b border-slate-200" : "border-b border-transparent"
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-17.5">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <img 
                src={logo} 
                alt="VoltTap Logo" 
                className="h-11.5 w-auto sm:h-13.5 md:h-15.5 object-contain group-hover:scale-[1.03] transition-all duration-300 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              />
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {displayLinks.map((link) => (
                <Link
                  to={link.path}
                  key={link.label}
                  onClick={() => setActiveLink(link.label)}
                  className={`
                    relative px-4 py-2 rounded-xl text-[13.5px] font-extrabold transition-all duration-200 hover:-translate-y-[0.5px]
                    ${link.highlight
                      ? "text-white bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-500/15"
                      : activeLink === link.label
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 rounded-xl"
                        : "text-slate-700 hover:text-sky-500 hover:bg-sky-500/10"
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop Auth Buttons / Symmetrical Profile Dropdown ── */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Divider */}
              <div className="w-px h-6 bg-slate-200 mx-1" />

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Trigger Button */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:border-sky-400 hover:bg-sky-50 transition-all duration-200 group cursor-pointer outline-none"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    {/* Avatar Initials Badge */}
                    <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-sky-500/10 group-hover:scale-105 transition-transform duration-200 select-none">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {/* Name & Chevron */}
                    <span className="text-[13.5px] font-black text-slate-800 max-w-[100px] truncate">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-sky-500' : 'group-hover:text-sky-600'}`} />
                  </button>

                  {/* Dropdown Menu Container */}
                  <div
                    className={`absolute right-0 mt-2.5 w-76 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden z-50 origin-top-right transition-all duration-250 ease-out transform backdrop-blur-md ${dropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 visible'
                      : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                      }`}
                  >
                    {/* 1. User Identity Header */}
                    <div className="p-5 bg-slate-50/50 border-b border-slate-200 flex flex-col items-center text-center">
                      {/* Large Initial Avatar */}
                      <div className="w-13 h-13 rounded-2xl bg-sky-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-sky-500/15 mb-3 select-none">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>

                      {/* Name */}
                      <h4 className="font-extrabold text-[15px] text-slate-900 tracking-tight leading-none mb-1">
                        {user?.name || 'Valued User'}
                      </h4>

                      {/* Email (Subtle) */}
                      {user?.email && (
                        <p className="text-[11px] font-bold text-slate-500 truncate max-w-full px-2 mb-1">
                          {user.email}
                        </p>
                      )}

                      {/* Mobile */}
                      {user?.mobile && (
                        <p className="text-[10px] font-extrabold text-slate-650 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full mb-3">
                          +91 {user.mobile.replace(/(\d{5})(\d{5})/, "$1 $2")}
                        </p>
                      )}

                      {/* Role Badge */}
                      {user?.role === 'ADMIN' ? (
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shadow-sm">
                          🛡️ Admin Partner
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                          👤 Customer
                        </span>
                      )}
                    </div>

                    {/* 2. User General Actions */}
                    <div className="p-3.5 space-y-0.5">
                      <Link
                        to="/history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[12.5px] font-bold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-155 group"
                      >
                        <History className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                        <span>History</span>
                      </Link>

                      <Link
                        to="/wallet"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[12.5px] font-bold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-155 group"
                      >
                        <Wallet className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                        <span>Wallet</span>
                      </Link>

                      <Link
                        to="/refer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[12.5px] font-bold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-155 group"
                      >
                        <Gift className="w-4 h-4 text-slate-455 group-hover:text-sky-600 transition-colors" />
                        <span>Refer & Earn</span>
                      </Link>
                    </div>

                    {/* 3. Admin Actions (Separated & Conditional) */}
                    {user?.role === 'ADMIN' && (
                      <div className="mx-3.5 my-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="block text-[9px] font-black uppercase tracking-wider text-indigo-600 mb-2">
                          🛡️ Admin Partner Panel
                        </span>

                        <div className="space-y-1">
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-extrabold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-150"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Control Panel</span>
                          </Link>

                          <Link
                            to="/admin/users"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-extrabold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-150"
                          >
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Manage Users</span>
                          </Link>

                          <Link
                            to="/admin/coupons"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-extrabold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-150"
                          >
                            <Ticket className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Configure Coupons</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* 4. Logout Section */}
                    <div className="p-3 border-t border-slate-200 bg-slate-50/50">
                      <button
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                      >
                        <LogOut className="w-4 h-4 shrink-0 transition-transform" />
                        <span>Logout Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-[13.5px] font-bold text-slate-700 hover:text-sky-500 hover:bg-sky-500/10 transition-all duration-200"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signUp"
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-500/15"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              aria-label="Toggle menu"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        <div
          ref={menuRef}
          className={`lg:hidden overflow-hidden transition-all duration-350 ease-in-out ${menuOpen ? "max-h-[85vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"
            }`}
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/50 px-4 pt-3 pb-5 space-y-1 shadow-2xl">

            {/* Nav Links */}
            {displayLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => { setActiveLink(link.label); setMenuOpen(false); }}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl text-[13.5px] font-extrabold transition-all
                  ${link.highlight
                    ? "text-white bg-sky-500 border border-sky-600 shadow-md shadow-sky-500/15"
                    : activeLink === link.label
                      ? "text-sky-600 bg-sky-50 border border-sky-100 shadow-sm"
                      : "text-slate-700 hover:text-sky-500 hover:bg-sky-500/10"
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  {/* Nav icon mapping */}
                  <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-sm">
                    {link.label === "Home" && "🏠"}
                    {link.label === "About" && "ℹ️"}
                    {link.label === "Recharge" && "⚡"}
                    {link.label === "Wallet" && "👝"}
                    {link.label === "History" && "📜"}
                    {link.label === "Contact Us" && "📞"}
                    {link.label === "Help" && "❓"}
                  </span>
                  {link.label}
                </span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            {/* Divider */}
            <div className="h-px bg-slate-200 my-3" />

            {/* Mobile Auth & Identity Card */}
            <div className="pt-1">
              {isAuthenticated ? (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4.5 space-y-4">
                  {/* A. Mobile User Identity */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-650 flex items-center justify-center text-white text-md font-black shadow-md shadow-sky-500/10 shrink-0 select-none">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                        {user?.name || 'User'}
                      </h4>
                      {user?.email && (
                        <p className="text-[10px] font-bold text-slate-500 truncate">
                          {user.email}
                        </p>
                      )}
                      {user?.mobile && (
                        <p className="text-[9.5px] font-extrabold text-slate-400 mt-0.5">
                          +91 {user.mobile.replace(/(\d{5})(\d{5})/, "$1 $2")}
                        </p>
                      )}
                    </div>
                    <div>
                      {user?.role === 'ADMIN' ? (
                        <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          User
                        </span>
                      )}
                    </div>
                  </div>

                  {/* B. Mobile Admin Controls Section (if ADMIN) */}
                  {user?.role === 'ADMIN' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                      <span className="block text-[8px] font-black uppercase tracking-widest text-indigo-600">
                        🛡️ Admin Dashboard Links
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-center transition-all text-slate-700 font-extrabold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                          <span className="text-[9px]">Panel</span>
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setMenuOpen(false)}
                          className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-center transition-all text-slate-700 font-extrabold"
                        >
                          <Users className="w-4 h-4 text-indigo-500" />
                          <span className="text-[9px]">Users</span>
                        </Link>
                        <Link
                          to="/admin/coupons"
                          onClick={() => setMenuOpen(false)}
                          className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-center transition-all text-slate-700 font-extrabold"
                        >
                          <Ticket className="w-4 h-4 text-indigo-500" />
                          <span className="text-[9px]">Coupons</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* C. Mobile Action Buttons Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <Link
                      to="/history"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:bg-sky-50 hover:text-sky-600 transition-all text-slate-700 font-extrabold text-center group"
                    >
                      <History className="w-4.5 h-4.5 text-slate-400 group-hover:text-sky-500 transition-colors mb-1.5" />
                      <span className="text-[10px] tracking-tight leading-tight">History</span>
                    </Link>

                    <Link
                      to="/wallet"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:bg-sky-50 hover:text-sky-600 transition-all text-slate-700 font-extrabold text-center group"
                    >
                      <Wallet className="w-4.5 h-4.5 text-slate-400 group-hover:text-sky-500 transition-colors mb-1.5" />
                      <span className="text-[10px] tracking-tight leading-tight">Wallet</span>
                    </Link>

                    <Link
                      to="/refer"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:bg-sky-50 hover:text-sky-600 transition-all text-slate-700 font-extrabold text-center group"
                    >
                      <Gift className="w-4.5 h-4.5 text-slate-400 group-hover:text-sky-500 transition-colors mb-1.5" />
                      <span className="text-[10px] tracking-tight leading-tight">Refer</span>
                    </Link>
                  </div>

                  {/* D. Mobile Logout */}
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="w-full py-3.5 bg-red-50 hover:bg-red-500 text-red-650 hover:text-white border border-red-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Logout Account</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 py-3.5 text-center rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all duration-150"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signUp"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 py-3.5 text-center rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/15 transition-all duration-150"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide behind fixed header */}
      <div className="h-16 lg:h-17.5" />
    </>
  );
}