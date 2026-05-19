// Header.jsx — MobileRecharge App Header
// Matches footer color scheme: white bg, slate text, sky-500 accent
// Responsive: hamburger menu on mobile, full nav on desktop
// Stack: React + Tailwind CSS

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const navLinks = [
  { label: "Home", href: "#", name: "Home", path: "/" },
  { label: "About", href: "#", name: "About", path: "/about" },
  { label: "Recharge", href: "#", highlight: true, name: "Recharge", path: "/recharge" },
  { label: "Wallet", href: "#", name: "Wallet", path: "/wallet" },
  { label: "History", href: "#", name: "History", path: "/history" },
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
  const menuRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Logout even if API fails
    }
    logout();
    navigate('/login');
  };

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
        className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg transition-all duration-300 ${scrolled ? "shadow-md border-b border-slate-200/50" : "border-b border-transparent"
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-17.5">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-violet-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                <PhoneIcon />
              </div>
              <div className="leading-tight font-display">
                <span className="text-black font-black text-[20px] tracking-tight">Mobile</span>
                <span className="text-sky-500 font-black text-[20px] tracking-tight">Recharge</span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  to={link.path}
                  key={link.label}
                  onClick={() => setActiveLink(link.label)}
                  className={`
                    relative px-4 py-2 rounded-xl text-[14px] font-bold transition-all duration-200
                    ${link.highlight
                      ? "text-white bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-500/10"
                      : activeLink === link.label
                        ? "text-white bg-sky-500 shadow-sm"
                        : "text-slate-600 hover:text-sky-500 hover:bg-sky-50/50"
                    }
                  `}
                >
                  {link.label}
                  {/* Active underline dot */}
                  {activeLink === link.label && !link.highlight && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Desktop Auth Buttons ── */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Divider */}
              <div className="w-px h-6 bg-slate-200 mx-1" />

              {isAuthenticated ? (
                <>
                  <span className="text-[13.5px] font-bold text-slate-700 px-2 flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 rounded-xl py-1.5 px-3">
                    👤 {user?.name || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl text-[13.5px] font-bold text-white bg-red-500 hover:bg-red-650 transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-[13.5px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signUp"
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold btn-classy"
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
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-120 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/50 px-4 pt-3 pb-5 space-y-1 shadow-lg">

            {/* Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => { setActiveLink(link.label); setMenuOpen(false); }}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold transition-all
                  ${link.highlight
                    ? "text-white bg-sky-500 border border-sky-600 shadow-sm"
                    : activeLink === link.label
                      ? "text-white bg-sky-500 shadow-sm"
                      : "text-slate-700 hover:text-sky-500 hover:bg-slate-50"
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  {/* Nav icon mapping */}
                  <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm">
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
                <svg className="w-4 h-4 text-slate-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            {/* Divider */}
            <div className="h-px bg-slate-100 my-2" />

            {/* Auth — inside mobile menu */}
            <div className="flex gap-2 pt-1">
              {isAuthenticated ? (
                <>
                  <span className="flex-1 py-3 text-center rounded-xl border border-slate-200 text-slate-700 font-bold text-sm bg-slate-50">
                    👤 {user?.name || 'User'}
                  </span>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="flex-1 py-3 text-center rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 py-3 text-center rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signUp"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 py-3 text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm shadow-indigo-600/10 transition-all"
                  >
                    Sign Up
                  </Link>
                </>
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