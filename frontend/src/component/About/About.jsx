// About.jsx — VoltTap | Advanced About Section
// Theme: White/slate/gray + sky blue accent (matches header & footer)
// Features: scroll animations, counter animation, hover transforms, tab switching, timeline
// Stack: React + Tailwind CSS

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

// ── useCountUp hook ──
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── useInView hook ──
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── Data ──
const stats = [
  { value: 24, suffix: "M+", label: "Recharges Done",    icon: "⚡", color: "bg-sky-50 text-sky-600 border-sky-100" },
  { value: 98, suffix: "%",  label: "Success Rate",      icon: "✅", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { value: 50, suffix: "+",  label: "Operators Covered", icon: "📡", color: "bg-violet-50 text-violet-600 border-violet-100" },
  { value: 4,  suffix: ".9★",label: "App Store Rating",  icon: "⭐", color: "bg-amber-50 text-amber-600 border-amber-100" },
];

const values = [
  { title: "Speed First",    desc: "Every recharge completes in under 3 seconds — no delays, no timeouts.",        icon: "⚡", color: "bg-sky-500" },
  { title: "Always Secure",  desc: "Bank-grade 256-bit SSL encryption on every transaction you make.",             icon: "🔒", color: "bg-emerald-500" },
  { title: "Best Value",     desc: "Guaranteed cashback and exclusive deals on every single recharge.",            icon: "🎁", color: "bg-violet-500" },
  { title: "Always On",      desc: "Our platform stays online 24/7, 365 days a year. Recharge anytime.",          icon: "🌐", color: "bg-amber-500" },
  { title: "All Operators",  desc: "Jio, Airtel, Vi, BSNL, MTNL, and 45+ more operators in one place.",          icon: "📱", color: "bg-rose-500" },
  { title: "You First",      desc: "Our support team resolves every query in under 5 minutes, guaranteed.",       icon: "🤝", color: "bg-cyan-500" },
];

const timeline = [
  { year: "2018", title: "Founded",        desc: "VoltTap was born with a mission to make digital payments instant for India." },
  { year: "2019", title: "1M Users",       desc: "Crossed 1 million users within 12 months of launch." },
  { year: "2021", title: "All Operators",  desc: "Expanded to cover all 50+ telecom operators across India." },
  { year: "2022", title: "Cashback Added", desc: "Launched industry-first guaranteed cashback on every recharge." },
  { year: "2024", title: "24M Recharges",  desc: "Processed 24 million recharges. Rated 4.9★ on App Store & Play Store." },
  { year: "2025", title: "What's Next",    desc: "Expanding to DTH, electricity, and broadband — all in one super app." },
];

const tabs = ["Our Story", "Our Values", "Our Journey"];

// ── Operators Data ──
const operatorsData = [
  {
    name: "Jio",
    plans: {
      topup: [{ price: 10 }, { price: 50 }],
      popular: [{ price: 199 }, { price: 299 }],
      unlimited: [{ price: 399 }, { price: 599 }]
    }
  },
  {
    name: "Airtel",
    plans: {
      topup: [{ price: 20 }, { price: 100 }],
      popular: [{ price: 249 }, { price: 349 }],
      unlimited: [{ price: 499 }, { price: 699 }]
    }
  },
  {
    name: "Vi",
    plans: {
      topup: [{ price: 10 }, { price: 50 }],
      popular: [{ price: 179 }, { price: 269 }],
      unlimited: [{ price: 359 }, { price: 479 }]
    }
  }
];

// ── Stat Card ──
function StatCard({ stat, inView }) {
  const count = useCountUp(stat.value, 1600, inView);
  return (
    <div className={`flex flex-col items-center text-center p-6 rounded-2xl border ${stat.color} transition-all duration-500 hover:scale-105 hover:shadow-lg`}>
      <span className="text-3xl mb-3">{stat.icon}</span>
      <div className="text-3xl font-extrabold text-slate-800 tabular-nums">
        {count}{stat.suffix}
      </div>
      <div className="text-sm text-slate-600 mt-1 font-medium">{stat.label}</div>
    </div>
  );
}

// ── Value Card ──
function ValueCard({ v, i }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400 group
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${i * 80}ms` }}
    >
      <div className={`w-11 h-11 ${v.color} rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {v.icon}
      </div>
      <h3 className="text-slate-800 font-bold text-[15px] mb-2">{v.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
    </div>
  );
}

// ── Timeline Item ──
function TimelineItem({ item, i, inView }) {
  const isEven = i % 2 === 0;
  return (
    <div
      className={`flex items-start gap-6 transition-all duration-600 ${
        inView ? "opacity-100 translate-x-0" : `opacity-0 ${isEven ? "-translate-x-6" : "translate-x-6"}`
      }`}
      style={{ transitionDelay: `${i * 120}ms` }}
    >
      {/* Year badge */}
      <div className="flex-shrink-0 w-16 text-right">
        <span className="inline-block bg-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          {item.year}
        </span>
      </div>
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-sky-500 border-2 border-white shadow ring-2 ring-sky-200 mt-1 flex-shrink-0" />
        {i < timeline.length - 1 && <div className="w-0.5 bg-slate-200 flex-1 min-h-[40px] mt-1" />}
      </div>
      {/* Content */}
      <div className="pb-8 flex-1">
        <h4 className="text-slate-800 font-bold text-[15px] mb-1">{item.title}</h4>
        <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function About() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [statsRef, statsInView] = useInView(0.3);
  const [heroRef, heroInView] = useInView(0.1);
  const [tlRef, tlInView] = useInView(0.1);

  // Plans View State
  const [showPlans, setShowPlans] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-white border-b border-slate-100 overflow-hidden"
      >
        {/* Decorative top stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400" />

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #0ea5e9 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 py-20 text-center relative z-10">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ${
              heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            About VoltTap
          </div>

          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight mb-6 transition-all duration-700 delay-100 ${
              heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            India's fastest way to
            <br />
            <span className="text-sky-500">recharge & stay connected</span>
          </h1>

          <p
            className={`text-black text-lg max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Since 2018, VoltTap has been India's most trusted platform for instant mobile, DTH, and broadband recharges — serving 24 million+ satisfied customers across the country.
          </p>

          {/* CTA pills */}
          <div
            className={`flex flex-wrap justify-center gap-3 mt-8 transition-all duration-700 delay-300 ${
              heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <button
              onClick={() => navigate('/recharge')}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm shadow-sky-200"
            >
              Start Recharging
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setShowPlans(prev => !prev); }}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-600 font-semibold text-sm rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              View Plans →
            </button>
          </div>
        </div>
      </section>

      {/* ── PLANS SECTION ── */}
      {showPlans && (
        <section className="py-16 bg-white border-b border-slate-100 animate-fadeIn">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-8">Select your operator</h2>
            
            {/* Operator Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {operatorsData.map((op) => (
                <button
                  key={op.name}
                  onClick={() => setSelectedOperator(op)}
                  className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${
                    selectedOperator?.name === op.name
                      ? "bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-200 scale-105"
                      : "bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50"
                  }`}
                >
                  {op.name}
                </button>
              ))}
            </div>

            {/* Plans List */}
            {selectedOperator && (
              <div className="text-left space-y-10 animate-fadeIn">
                {/* Popular Plans */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 inline-flex items-center gap-2">
                    <span className="text-amber-500">🔥</span> Popular Plans
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedOperator.plans.popular.map((p, idx) => (
                      <div key={idx} onClick={() => navigate('/recharge')} className="border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group bg-slate-50 hover:bg-white">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-extrabold text-slate-800 group-hover:text-sky-600 transition-colors">₹{p.price}</span>
                          <button className="text-xs bg-sky-100 text-sky-600 font-bold px-3 py-1.5 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-all">Select</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unlimited Plans */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 inline-flex items-center gap-2">
                    <span className="text-violet-500">♾️</span> Unlimited Plans
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedOperator.plans.unlimited.map((p, idx) => (
                      <div key={idx} onClick={() => navigate('/recharge')} className="border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group bg-slate-50 hover:bg-white">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-extrabold text-slate-800 group-hover:text-sky-600 transition-colors">₹{p.price}</span>
                          <button className="text-xs bg-sky-100 text-sky-600 font-bold px-3 py-1.5 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-all">Select</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Up Plans */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 inline-flex items-center gap-2">
                    <span className="text-emerald-500">💰</span> Top Up Plans
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedOperator.plans.topup.map((p, idx) => (
                      <div key={idx} onClick={() => navigate('/recharge')} className="border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:border-sky-300 transition-all cursor-pointer text-center group bg-slate-50 hover:bg-white">
                        <div className="text-xl font-extrabold text-slate-800 group-hover:text-sky-600 transition-colors mb-2">₹{p.price}</div>
                        <button className="text-[10px] uppercase tracking-wider bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded-md group-hover:bg-sky-500 group-hover:text-white transition-all w-full">Top Up</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── STATS ── */}
      <section ref={statsRef} className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard key={s.label} stat={s} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TABS SECTION ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">

          {/* Tab buttons */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1.5 gap-1 shadow-sm">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === i
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab 0: Our Story ── */}
          {activeTab === 0 && (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left text */}
              <div className="space-y-5 animate-fadeIn">
                <div className="inline-flex items-center gap-2 text-sky-500 text-sm font-semibold">
                  <span className="w-6 h-0.5 bg-sky-500 rounded" /> Our Story
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 leading-snug">
                  Built to make recharging effortless for every Indian
                </h2>
                <p className="text-black text-[15px] leading-relaxed">
                  VoltTap was founded in 2018 with one clear goal — eliminate the frustration of mobile recharges and digital payments. Long queues, failed transactions, and confusing plan comparisons were holding millions of Indians back from staying connected.
                </p>
                <p className="text-black text-[15px] leading-relaxed">
                  Today, we're a team of 200+ passionate engineers, designers, and support specialists building technology that just works — every time. From a student in Pune to a businessman in Delhi, we serve everyone with the same speed and reliability.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {["200+ Team Members", "6 Years of Trust", "Pan-India Coverage"].map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-sky-500 border border-slate-200 px-3 py-1.5 rounded-full font-medium">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>
              {/* Right visual card */}
              <div className="relative">
                {/* Main card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <img 
                      src={logo} 
                      alt="VoltTap Logo" 
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  {/* Fake transaction rows */}
                  {[
                    { op: "Jio", amount: "₹239", time: "Just now", color: "bg-blue-100 text-blue-600" },
                    { op: "Airtel", amount: "₹299", time: "2 min ago", color: "bg-red-100 text-red-600" },
                    { op: "Vi",   amount: "₹199", time: "5 min ago", color: "bg-violet-100 text-violet-600" },
                  ].map((r) => (
                    <div key={r.op} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center text-xs font-bold`}>{r.op[0]}</div>
                        <div>
                          <div className="text-slate-700 text-sm font-semibold">{r.op} Recharge</div>
                          <div className="text-slate-500 text-xs">{r.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-bold text-sm">{r.amount}</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 bg-sky-50 rounded-xl p-3 text-center">
                    <div className="text-sky-600 text-xs font-semibold">⚡ Avg recharge time: 2.8 seconds</div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20">
                  4.9★ Rated
                </div>
                {/* Background blob */}
                <div className="absolute inset-4 bg-sky-100/50 rounded-3xl -z-10 blur-sm" />
              </div>
            </div>
          )}

          {/* ── Tab 1: Our Values ── */}
          {activeTab === 1 && (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-slate-800 mb-3">What we stand for</h2>
                <p className="text-slate-600 text-[15px] max-w-xl mx-auto">
                  Six core principles guide every decision we make — from product to support.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {values.map((v, i) => <ValueCard key={v.title} v={v} i={i} />)}
              </div>
            </div>
          )}

          {/* ── Tab 2: Our Journey ── */}
          {activeTab === 2 && (
            <div ref={tlRef} className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Our Journey</h2>
                <p className="text-slate-600 text-[15px]">From a startup idea to 24M+ recharges — here's our story.</p>
              </div>
              <div>
                {timeline.map((item, i) => (
                  <TimelineItem key={item.year} item={item} i={i} inView={tlInView} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TEAM STRIP ── */}
      <section className="py-16 bg-white border-t border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-700 text-sm font-medium uppercase tracking-widest mb-4">Trusted by teams across India</p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {[
              { name: "Jio",     bg: "bg-blue-500"   },
              { name: "Airtel",  bg: "bg-red-500"    },
              { name: "Vi",      bg: "bg-violet-500" },
              { name: "BSNL",    bg: "bg-emerald-600"},
              { name: "MTNL",    bg: "bg-orange-500" },
              { name: "TATA",    bg: "bg-cyan-600"   },
            ].map((op) => (
              <div key={op.name}
                className={`${op.bg} text-white px-5 py-2 rounded-xl font-bold text-sm opacity-80 hover:opacity-100 hover:scale-105 transition-all cursor-pointer`}
              >
                {op.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 bg-gradient-to-r from-sky-500 to-sky-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to recharge smarter?</h2>
          <p className="text-sky-100 text-[15px] mb-8 max-w-xl mx-auto">
            Join 24 million Indians who trust VoltTap for fast, secure, and rewarding recharges every day.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#"
              className="px-7 py-3 bg-white text-sky-600 font-bold text-sm rounded-xl hover:bg-sky-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              Create Free Account
            </a>
            <button
              onClick={(e) => { e.preventDefault(); setShowPlans(prev => !prev); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-7 py-3 border-2 border-white/50 text-white font-semibold text-sm rounded-xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              View Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}