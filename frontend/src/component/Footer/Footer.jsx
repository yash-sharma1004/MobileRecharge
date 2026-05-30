// Footer.jsx — VoltTap App Footer
// Color Scheme: Premium dark slate / HSL indigo accents — elegant & accessible
// Stack: React + Tailwind CSS

import { useState } from "react";
import logo from "../../assets/logo.png";

// ── Icons ──
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ── Footer Links ──
const footerLinks = {
  "Quick Links": [
    { label: "Home", href: "#" },
    { label: "Recharge Now", href: "#" },
    { label: "My Orders", href: "#" },
    { label: "Cashback & Offers", href: "#" },
    { label: "Refer & Earn", href: "#" },
  ],
  "Operators": [
    { label: "Jio", href: "#" },
    { label: "Airtel", href: "#" },
    { label: "Vi (Vodafone Idea)", href: "#" },
    { label: "BSNL", href: "#" },
    { label: "MTNL", href: "#" },
  ],
  "Services": [
    { label: "VoltTap", href: "#" },
    { label: "DTH Recharge", href: "#" },
    { label: "Broadband Plans", href: "#" },
    { label: "Electricity Bill", href: "#" },
    { label: "Gas Bill Pay", href: "#" },
  ],
  "Company": [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

const socials = [
  { icon: <TwitterIcon />, label: "Twitter", href: "#" },
  { icon: <FacebookIcon />, label: "Facebook", href: "#" },
  { icon: <InstagramIcon />, label: "Instagram", href: "#" },
  { icon: <YoutubeIcon />, label: "YouTube", href: "#" },
  { icon: <LinkedinIcon />, label: "LinkedIn", href: "#" },
];

const paymentIcons = ["Visa", "Mastercard", "UPI", "GPay", "PhonePe", "Paytm"];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-300 border-t border-slate-900 relative overflow-hidden">

      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/5 blur-[140px] pointer-events-none rounded-full" />

      {/* ── Newsletter Banner (Elegant Glassmorphism Card style) ── */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-4">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 sm:p-12 backdrop-blur-md shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left Text */}
          <div className="flex items-start gap-4 max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/5">
              <span className="text-sky-400 text-2xl animate-pulse">⚡</span>
            </div>
            <div>
              <h3 className="text-white font-black text-xl tracking-tight font-display">
                Get Exclusive Recharge Cashbacks
              </h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                Subscribe for customized cashback reminders, weekly active coupons, operator price-drops, and festival rewards.
              </p>
            </div>
          </div>

          {/* Right Input Form */}
          <div className="flex gap-2 w-full lg:w-auto relative z-10">
            {subscribed ? (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-6 py-3.5 rounded-2xl text-xs uppercase tracking-widest font-black shadow-lg shadow-emerald-500/10 animate-fade-in font-display">
                ✓ Enrolled Successfully!
              </div>
            ) : (
              <div className="flex gap-2.5 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  placeholder="Enter your email"
                  className="flex-1 lg:w-72 bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 px-5 py-3.5 rounded-2xl text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-semibold"
                />
                <button
                  onClick={handleSubscribe}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap shadow-lg shadow-sky-500/20 cursor-pointer font-display"
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Grid Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8">

          {/* Brand Info Panel */}
          <div className="lg:col-span-2 space-y-6">

            {/* Unified Logo */}
            <div className="flex items-center gap-3 font-display">
              <img
                src={logo}
                alt="VoltTap Logo"
                className="h-16 md:h-20 w-auto object-contain hover:scale-[1.03] transition-transform duration-300"
              />
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              Experience India's most secure &amp; blazing fast recharge engine. Get guaranteed cashbacks on Jio, Airtel, Vi, BSNL and broadband utility settlements.
            </p>

            {/* Premium Trust Badges */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: "🔒", label: "256-Bit SSL Secured" },
                { icon: "🛡️", label: "PCI-DSS Compliant" },
                { icon: "⚡", label: "Instant Settlement" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3.5 py-2 rounded-xl"
                >
                  <span>{badge.icon}</span>
                  {badge.label.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Smart App Download Badge */}
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-display">
                Download Mobile App
              </p>
              <div className="flex gap-2.5">
                {[
                  { icon: "🍎", top: "Download on the", bottom: "App Store" },
                  { icon: "▶️", top: "Get it on", bottom: "Google Play" },
                ].map((app) => (
                  <a
                    key={app.bottom}
                    href="#"
                    className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800/80 hover:border-sky-500/30 hover:bg-slate-900 px-4 py-2.5 rounded-2xl text-left transition-all group shadow-inner"
                  >
                    <span className="text-xl">{app.icon}</span>
                    <div className="leading-none">
                      <span className="text-slate-500 text-[8px] block mb-0.5 font-bold uppercase tracking-wider">{app.top}</span>
                      <span className="text-slate-200 text-xs font-black group-hover:text-sky-400 transition-colors font-display">{app.bottom}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="space-y-5">
              <h4 className="text-white font-black text-[15px] sm:text-base uppercase tracking-wider font-display pb-1.5 relative">
                {heading}
                <span className="absolute bottom-0 left-0 w-10 h-[3px] bg-sky-500 rounded-full" />
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-sky-400 text-sm transition-all duration-200 inline-block hover:translate-x-1.5 transform font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* ── Footer Bottom Section ── */}
      <div className="bg-slate-950 border-t border-slate-900/60 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Social icons */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-display">
              Connect With Us
            </span>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-400 rounded-xl flex items-center justify-center text-slate-400 transition-all duration-300 hover:scale-110 shadow-sm"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Supported Payments */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-display">
              We Accept
            </span>
            <div className="flex gap-2 flex-wrap justify-center">
              {paymentIcons.map((p) => (
                <span
                  key={p}
                  className="bg-slate-900/40 border border-slate-800/80 text-slate-400 text-[10px] px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider font-display shadow-inner"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Legals / Copyright bar */}
        <div className="border-t border-slate-900/40">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
            <span>© {new Date().getFullYear()} VoltTap Pvt. Ltd. All rights reserved.</span>
            <div className="flex flex-wrap gap-5 justify-center">
              {["Privacy Policy", "Terms of Service", "Refund Policy", "Cookies"].map((legal) => (
                <a key={legal} href="#" className="hover:text-sky-400 transition-colors">
                  {legal}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}