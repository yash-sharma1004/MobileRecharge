// Help.jsx — MobileRecharge | Help & Support
// Classy, eye-catching UI matching app theme (white/slate/sky-blue)
// Features: search, category cards, FAQ accordion, contact strip, scroll reveals
// Stack: React + Tailwind CSS

import { useState, useRef, useEffect } from "react";

// ── useInView ──
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── Data ──
const categories = [
  {
    id: "recharge", icon: "⚡", title: "Recharge Issues",
    color: "bg-sky-50 border-sky-100 text-sky-600 group-hover:bg-sky-100",
    iconBg: "bg-sky-100",
    count: 12,
  },
  {
    id: "payment", icon: "💳", title: "Payments & Refunds",
    color: "bg-violet-50 border-violet-100 text-violet-600 group-hover:bg-violet-100",
    iconBg: "bg-violet-100",
    count: 9,
  },
  {
    id: "account", icon: "👤", title: "Account & Profile",
    color: "bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-100",
    iconBg: "bg-emerald-100",
    count: 7,
  },
  {
    id: "cashback", icon: "🎁", title: "Cashback & Offers",
    color: "bg-amber-50 border-amber-100 text-amber-600 group-hover:bg-amber-100",
    iconBg: "bg-amber-100",
    count: 8,
  },
  {
    id: "plans", icon: "📱", title: "Plans & Operators",
    color: "bg-rose-50 border-rose-100 text-rose-600 group-hover:bg-rose-100",
    iconBg: "bg-rose-100",
    count: 10,
  },
  {
    id: "security", icon: "🔒", title: "Security & Privacy",
    color: "bg-cyan-50 border-cyan-100 text-cyan-600 group-hover:bg-cyan-100",
    iconBg: "bg-cyan-100",
    count: 5,
  },
];

const faqs = [
  {
    cat: "recharge",
    q: "My recharge failed but money was deducted. What do I do?",
    a: "Don't worry! If a recharge fails after payment, the amount is automatically refunded within 24–48 hours to your original payment method. You can also track the status under My Orders → View Details.",
  },
  {
    cat: "recharge",
    q: "How long does a recharge take?",
    a: "Most recharges complete instantly — under 3 seconds. In rare cases with operator delays, it may take up to 2 minutes. If it takes longer, check My Orders or contact our support team.",
  },
  {
    cat: "payment",
    q: "Which payment methods are supported?",
    a: "We support UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards (Visa, Mastercard, RuPay), Net Banking (all major banks), and popular wallets like Paytm & Amazon Pay.",
  },
  {
    cat: "payment",
    q: "How do I get a refund for a failed transaction?",
    a: "Refunds are processed automatically within 24–48 hours. If you don't receive it within 3 days, please raise a ticket from My Orders → Report Issue and our team will resolve it within 24 hours.",
  },
  {
    cat: "cashback",
    q: "How do I earn cashback on recharges?",
    a: "You earn cashback on every successful recharge automatically. The cashback amount depends on the plan and your user tier. It is credited to your MobileRecharge wallet within 24 hours.",
  },
  {
    cat: "cashback",
    q: "Where can I see my earned cashback?",
    a: "Go to My Account → Wallet & Cashback. You'll see the total balance, transaction history, and expiry dates for each cashback credit.",
  },
  {
    cat: "account",
    q: "How do I change my registered mobile number?",
    a: "Go to My Account → Edit Profile → Change Mobile. You'll receive an OTP on your current number for verification before the update is applied.",
  },
  {
    cat: "plans",
    q: "Which operators are supported?",
    a: "We support Jio, Airtel, Vi (Vodafone Idea), BSNL, MTNL, and 45+ other telecom operators across all Indian states for prepaid, postpaid, and data top-ups.",
  },
];

// ── FAQ Item ──
function FaqItem({ faq, i, inView }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-slate-100 rounded-2xl bg-white overflow-hidden transition-all duration-500 hover:border-sky-200 hover:shadow-sm
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${i * 60}ms` }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left group"
      >
        <span className={`text-sm font-semibold pr-4 leading-relaxed transition-colors duration-200 ${open ? "text-sky-600" : "text-slate-700 group-hover:text-sky-500"}`}>
          {faq.q}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
          ${open ? "bg-sky-500 text-white rotate-45" : "bg-slate-100 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-500"}`}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3 h-3">
            <line x1="6" y1="2" x2="6" y2="10" />
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50">
          {faq.a}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function Help() {
  const [search, setSearch]       = useState("");
  const [activeCategory, setActiveCat] = useState("all");
  const [heroRef, heroInView]     = useInView(0.1);
  const [catRef,  catInView]      = useInView(0.1);
  const [faqRef,  faqInView]      = useInView(0.05);

  // Filter FAQs by search + category
  const filtered = faqs.filter(f => {
    const matchCat  = activeCategory === "all" || f.cat === activeCategory;
    const matchSearch = search.trim() === ""
      || f.q.toLowerCase().includes(search.toLowerCase())
      || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ═══════════════════════════
          HERO
      ═══════════════════════════ */}
      <section ref={heroRef} className="relative bg-white border-b border-slate-100 overflow-hidden">
        {/* Top rainbow line */}
        <div className="h-1 w-full bg-linear-to-r from-sky-400 via-violet-400 to-emerald-400" />

        {/* Dot-grid background */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle,#0ea5e9 1px,transparent 1px)", backgroundSize: "30px 30px" }}
        />

        {/* Soft blob decorations */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-sky-100/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-violet-100/40 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Help & Support Center
          </div>

          {/* Title */}
          <h1 className={`text-4xl sm:text-5xl font-extrabold text-slate-800 leading-tight mb-4 transition-all duration-700 delay-100 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            How can we <span className="text-sky-500">help you</span> today?
          </h1>
          <p className={`text-slate-800 font-semibold text-base max-w-xl mx-auto mb-10 transition-all duration-700 delay-150 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            Search our help center, browse categories, or talk to our support team — we're here 24/7.
          </p>

          {/* ── Search Bar ── */}
          <div className={`relative max-w-lg mx-auto transition-all duration-700 delay-200 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex items-center bg-white border-2 border-slate-200 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100 rounded-2xl shadow-sm transition-all duration-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5 text-slate-400 ml-5 shrink-0">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search for help... e.g. recharge failed, cashback"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 px-4 py-4 text-sm text-slate-700 placeholder-slate-500 bg-transparent outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="mr-4 text-slate-400 hover:text-slate-600 transition-colors text-lg">×</button>
              )}
            </div>
            {/* Popular searches */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["Recharge failed", "Get refund", "Cashback", "Change number"].map(s => (
                <button key={s} onClick={() => setSearch(s)}
                  className="text-xs text-slate-500 bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 px-3 py-1.5 rounded-full font-medium transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          CATEGORY CARDS
      ═══════════════════════════ */}
      <section ref={catRef} className="max-w-6xl mx-auto px-6 py-16">
        <div className={`text-center mb-10 transition-all duration-700 ${catInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-2xl font-extrabold text-black mb-2">Browse by category</h2>
          <p className="text-black text-sm">Pick a topic to find answers fast.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* All button */}
          <button
            onClick={() => setActiveCat("all")}
            className={`flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md
              ${activeCategory === "all"
                ? "border-sky-400 bg-sky-50 shadow-md shadow-sky-100"
                : "border-slate-100 bg-white hover:border-sky-200"}`}
            style={{ animation: catInView ? "fadeUp .4s ease both" : "none" }}
          >
            <div className={`w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
              🗂️
            </div>
            <p className="text-black font-semibold text-md">All Topics</p>
            <span className="text-[12px] font-semibold text-black">{faqs.length} articles</span>
          </button>

          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id === activeCategory ? "all" : cat.id)}
              className={`flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md
                ${activeCategory === cat.id
                  ? `border-2 shadow-md ${cat.color}`
                  : "border-slate-100 bg-white hover:border-sky-200"}`}
              style={{ animation: catInView ? `fadeUp .4s ease ${i * 60}ms both` : "none" }}
            >
              <div className={`w-11 h-11 rounded-xl ${activeCategory === cat.id ? cat.iconBg : "bg-slate-100"} flex items-center justify-center text-3xl zl group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              <p className="text-black font-semibold text-md">{cat.title}</p>
              <span className="text-[12px] font-semibold text-black">{cat.count} articles</span>
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════
          FAQ SECTION
      ═══════════════════════════ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div ref={faqRef}>
          {/* Section heading */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                {search
                  ? `Results for "${search}"`
                  : activeCategory === "all"
                  ? "Frequently Asked Questions"
                  : categories.find(c => c.id === activeCategory)?.title}
              </h2>
              <p className="text-slate-600 text-xs mt-1">{filtered.length} article{filtered.length !== 1 ? "s" : ""} found</p>
            </div>
            {(search || activeCategory !== "all") && (
              <button
                onClick={() => { setSearch(""); setActiveCat("all"); }}
                className="text-xs text-sky-500 hover:underline font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* FAQ list */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <FaqItem key={i} faq={faq} i={i} inView={faqInView} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-slate-700 font-semibold mb-1">No results found</p>
              <p className="text-slate-600 text-sm mb-5">Try different keywords or browse a category above.</p>
              <button onClick={() => { setSearch(""); setActiveCat("all"); }}
                className="text-sm text-sky-500 hover:underline font-semibold">
                View all articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════
          CONTACT STRIP
      ═══════════════════════════ */}
      <section className="bg-white border-t border-slate-100 py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Still need help?</h2>
            <p className="text-slate-600 text-sm">Our team is available 24/7 — choose how you'd like to reach us.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: "💬", title: "Live Chat",
                desc : "Talk to a support agent right now.",
                badge: "Fastest · 2 min avg",
                badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
                btn: "Start Chat",
                btnColor: "bg-sky-500 hover:bg-sky-600 text-white",
              },
              {
                icon: "✉️", title: "Email Support",
                desc: "Send us a detailed message.",
                badge: "Reply within 2 hrs",
                badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
                btn: "Send Email",
                btnColor: "bg-violet-500 hover:bg-violet-600 text-white",
              },
              {
                icon: "📞", title: "Call Us",
                desc: "+91-1800-XXX-XXXX · Toll free",
                badge: "24/7 Available",
                badgeColor: "bg-sky-100 text-sky-700 border-sky-200",
                btn: "Call Now",
                btnColor: "bg-emerald-500 hover:bg-emerald-600 text-white",
              },
            ].map((c, i) => (
              <div
                key={c.title}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 text-center"
                style={{ animation: "fadeUp .5s ease both", animationDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl mb-4">{c.icon}</div>
                <h3 className="text-slate-800 font-bold text-[15px] mb-1">{c.title}</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">{c.desc}</p>
                <span className={`inline-block text-[10px] font-bold border px-2.5 py-1 rounded-full mb-4 ${c.badgeColor}`}>
                  {c.badge}
                </span>
                <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${c.btnColor}`}>
                  {c.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
       
      {/* ══════════════════════════
          BOTTOM CTA BANNER
      ══════════════════════════ */}
      <section className="py-16 bg-linear-to-r from-sky-500 to-sky-600 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-3">Can't find your answer?</h2>
          <p className="text-sky-100 text-sm mb-8">Our support team replies in under 2 minutes. No bots — real people.</p>
          <button className="px-8 py-3.5 bg-white text-sky-600 font-bold text-sm rounded-xl hover:bg-sky-50 transition-all hover:scale-105 active:scale-95 shadow-sm">
            💬 Chat with Support
          </button>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}