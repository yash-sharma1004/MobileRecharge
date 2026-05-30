// ContactUs.jsx — VoltTap | Advanced Contact Section
// Theme: White/slate/gray + sky blue (matches header, footer, about)
// Features: floating labels, animated cards, FAQ accordion, char counter,
//           contact method selector, success animation, scroll reveals
// Stack: React + Tailwind CSS

import { useState, useRef, useEffect } from "react";

// ── useInView ──
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);8
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

// ── Floating Label Input ──
function FloatField({ id, label, type = "text", value, onChange, error, icon, maxLen }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div>
      <div className={`relative flex items-start border rounded-xl transition-all duration-200 bg-white
        ${error ? "border-red-300 ring-2 ring-red-100"
          : focused ? "border-sky-400 ring-2 ring-sky-100"
          : "border-slate-200 hover:border-slate-300"}`}>
        <span className={`pt-4 pl-4 transition-colors duration-200 shrink-0 ${focused ? "text-sky-500" : "text-black-400"}`}>
          {icon}
        </span>
        <div className="relative flex-1 min-h-14">
          <label htmlFor={id}
            className={`absolute left-3 transition-all duration-200 pointer-events-none font-medium
              ${lifted ? "top-2 text-[11px] text-sky-500" : "top-1/2 -translate-y-1/2 text-[14px] text-black-400"}`}>
            {label}
          </label>
          {type === "textarea" ? (
            <textarea id={id} value={value} onChange={onChange} rows={4}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              maxLength={maxLen}
              className="absolute bottom-0 left-3 right-0 top-6 text-sm text-black-800 bg-transparent outline-none resize-none w-full pb-2 pr-3" />
          ) : (
            <input id={id} type={type} value={value} onChange={onChange}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              className="absolute bottom-0 left-3 right-0 h-7 text-sm text-black bg-transparent outline-none w-full" />
          )}
        </div>
      </div>
      <div className="flex justify-between mt-1">
        {error ? <p className="text-red-400 text-xs ml-1">⚠ {error}</p> : <span />}
        {maxLen && <p className="text-black text-xs">{value.length}/{maxLen}</p>}
      </div>
    </div>
  );
}

// ── FAQ Accordion Item ──
function FaqItem({ q, a, i }) {
  const [open, setOpen] = useState(false);
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref}
      className={`border border-slate-100 rounded-2xl bg-white overflow-hidden transition-all duration-500
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${i * 80}ms` }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left group">
        <span className={`text-sm font-semibold transition-colors duration-200 ${open ? "text-sky-600" : "text-black group-hover:text-sky-500"}`}>
          {q}
        </span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-4 transition-all duration-300
          ${open ? "bg-sky-500 text-white rotate-45" : "bg-slate-100 text-black group-hover:bg-sky-50 group-hover:text-sky-500"}`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3 h-3">
            <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-6 pb-5 text-black text-sm leading-relaxed border-t border-slate-50 pt-3">{a}</p>
      </div>
    </div>
  );
}

// ── Contact Method Card ──
function MethodCard({ method, active, onClick, delay }) {
  const [ref, inView] = useInView(0.1);
  return (
    <button ref={ref} onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        ${active
          ? "border-sky-400 bg-sky-50 shadow-md shadow-sky-100"
          : "border-slate-100 bg-white hover:border-sky-200 hover:shadow-sm"}`}
      style={{ transitionDelay: `${delay}ms` }}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-300
          ${active ? method.activeBg : method.bg} ${active ? "scale-110" : "group-hover:scale-105"}`}>
          {method.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className={`text-sm font-bold transition-colors ${active ? "text-sky-700" : "text-black"}`}>{method.title}</p>
            {method.badge && (
              <span className="text-[10px] bg-emerald-100 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                {method.badge}
              </span>
            )}
          </div>
          <p className="text-black text-xs leading-relaxed">{method.desc}</p>
          <p className={`text-xs font-semibold mt-1.5 transition-colors ${active ? "text-sky-600" : "text-black"}`}>{method.value}</p>
        </div>
      </div>
    </button>
  );
}

// ── Data ──
const contactMethods = [
  { id: "chat",  icon: "💬", title: "Live Chat",     desc: "Talk to our team instantly",    value: "Avg. reply in 2 min",    badge: "Fastest", bg: "bg-sky-100",     activeBg: "bg-sky-200" },
  { id: "email", icon: "✉️", title: "Email Support", desc: "Send us a detailed query",      value: "support@volttap.in", badge: null,      bg: "bg-violet-100",  activeBg: "bg-violet-200" },
  { id: "phone", icon: "📞", title: "Call Us",       desc: "Speak to our support team",     value: "+91-1800-XXX-XXXX",      badge: "24/7",    bg: "bg-emerald-100", activeBg: "bg-emerald-200" },
  { id: "whatsapp", icon: "💚", title: "WhatsApp",   desc: "Chat on WhatsApp anytime",      value: "+91-98765-XXXXX",        badge: "Popular", bg: "bg-green-100",   activeBg: "bg-green-200" },
];

const faqs = [
  { q: "How long does a recharge take?",            a: "Most recharges complete in under 3 seconds. In rare cases with operator delays, it may take up to 2 minutes." },
  { q: "My recharge failed but money was deducted?", a: "Don't worry — failed recharges are auto-refunded within 24–48 hours to your original payment method. You can also track status in My Orders." },
  { q: "Which operators are supported?",             a: "We support Jio, Airtel, Vi (Vodafone Idea), BSNL, MTNL, and 45+ other telecom operators across India." },
  { q: "How do I get my cashback?",                 a: "Cashback is credited to your VoltTap wallet within 24 hours of a successful recharge. You can use it on your next recharge." },
  { q: "Is my payment information secure?",          a: "Yes. All transactions use 256-bit SSL encryption and are PCI-DSS compliant. We never store your card details." },
  { q: "Can I recharge for someone else?",           a: "Absolutely! Just enter the mobile number you want to recharge — it doesn't have to be your own number." },
];

const topics = ["Failed Recharge", "Cashback Issue", "Account Problem", "Plan Query", "Payment Issue", "Other"];

// ── Main Component ──
export default function ContactUs() {
  const [activeMethod, setActiveMethod] = useState("chat");
  const [topic, setTopic] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [heroRef, heroInView] = useInView(0.1);
  const [formRef, formInView] = useInView(0.1);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                 e.name    = "Your name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   e.email   = "Enter a valid email.";
    if (form.message.trim().length < 20)                   e.message = "Please write at least 20 characters.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1400);
  };

  // ── SVG Icons ──
  const PersonIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  const MailSvg     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const PhoneSvg    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>;
  const ChatSvg     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-12 text-center max-w-md w-full">
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center text-4xl animate-bounce">✉️</div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h2>
        <p className="text-black text-sm mb-2">Thanks <span className="font-semibold text-black">{form.name}</span>! We've received your message.</p>
        <p className="text-black text-sm mb-8">Our team will reply to <span className="font-semibold text-sky-500">{form.email}</span> within 2 hours.</p>
        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left space-y-2">
          <p className="text-xs text-black uppercase tracking-widest font-semibold mb-3">Your ticket details</p>
          {[["Topic", topic || "General"], ["Channel", activeMethod], ["Ref No.", `MR${Date.now().toString().slice(-6)}`]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-black">{k}</span>
              <span className="text-black font-medium capitalize">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSubmitted(false); setForm({ name:"", email:"", phone:"", message:"" }); setTopic(""); }}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-sm">
          Send Another Message
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="h-1 w-full bg-linear-to-r from-sky-400 via-violet-400 to-emerald-400" />
        {/* Dot grid bg */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle,#0ea5e9 1px,transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="max-w-6xl mx-auto px-6 py-20 text-center relative z-10">
          <div className={`inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            We're here to help
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold text-slate-800 leading-tight mb-4 transition-all duration-700 delay-100 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            Get in touch with<br />
            <span className="text-sky-500">our support team</span>
          </h1>
          <p className={`text-black text-lg max-w-xl mx-auto transition-all duration-700 delay-200 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            Have a question, issue, or just want to say hello? We'd love to hear from you. Our team is available 24/7.
          </p>

          {/* Quick stats */}
          <div className={`flex flex-wrap justify-center gap-6 mt-10 transition-all duration-700 delay-300 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {[
              { icon: "⚡", label: "2 min avg response" },
              { icon: "🌟", label: "4.9/5 support rating" },
              { icon: "🕐", label: "24/7 availability" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-full text-sm text-black font-medium">
                <span>{s.icon}</span> {s.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT METHODS ── */}
      <section className="py-14 max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Choose how to reach us</h2>
          <p className="text-black text-sm">Pick the method that works best for you.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactMethods.map((m, i) => (
            <MethodCard key={m.id} method={m} active={activeMethod === m.id}
              onClick={() => setActiveMethod(m.id)} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT: FORM + INFO ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── LEFT: Contact Form (3 cols) ── */}
          <div ref={formRef} className={`lg:col-span-3 transition-all duration-700 scroll-mt-20 md:scroll-mt-30  ${formInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} id="liveChat">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

              {/* Form header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                  <ChatSvg />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">Send us a message</h3>
                  <p className="text-slate-600 text-xs">We'll reply within 2 hours</p>
                </div>
                {/* Active channel badge */}
                <div className="ml-auto flex items-center gap-1.5 bg-sky-50 border border-sky-100 text-sky-600 px-3 py-1.5 rounded-full text-xs font-semibold capitalize">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  via {activeMethod}
                </div>
              </div>

              <div className="space-y-5">

                {/* Name + Email row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatField id="name" label="Your full name" value={form.name}
                    onChange={e => set("name", e.target.value)} icon={<PersonIcon />} error={errors.name} />
                  <FloatField id="email" label="Email address" type="email" value={form.email}
                    onChange={e => set("email", e.target.value)} icon={<MailSvg />} error={errors.email} />
                </div>

                {/* Phone (optional) */}
                <FloatField id="phone" label="Mobile number (optional)" type="tel" value={form.phone}
                  onChange={e => set("phone", e.target.value.replace(/\D/g,"").slice(0,10))}
                  icon={<PhoneSvg />} error={errors.phone} />

                {/* Topic pills */}
                <div>
                  <p className="text-xs font-semibold text-black mb-3 uppercase tracking-widest">What's this about?</p>
                  <div className="flex flex-wrap gap-2">
                    {topics.map(t => (
                      <button key={t} onClick={() => setTopic(t === topic ? "" : t)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 active:scale-95
                          ${topic === t
                            ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200"
                            : "bg-white text-black border-slate-200 hover:border-sky-300 hover:text-sky-600"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message textarea */}
                <FloatField id="message" label="Describe your issue or question" type="textarea"
                  value={form.message} onChange={e => set("message", e.target.value)}
                  icon={<ChatSvg />} error={errors.message} maxLen={500} />

                {/* Submit */}
                <button onClick={handleSubmit} disabled={submitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm
                    ${submitting
                      ? "bg-sky-400 text-white cursor-wait"
                      : "bg-sky-500 hover:bg-sky-600 active:scale-95 text-white shadow-sky-200 hover:shadow-sky-300 hover:scale-[1.01]"}`}>
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : "Send Message →"}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Info cards (2 cols) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Office info */}
            {[{
              delay: 0,
              content: (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center text-lg">🏢</div>
                    <div>
                      <p className="text-slate-800 font-bold text-sm">Our Office</p>
                      <p className="text-slate-700 text-xs">Visit us in person</p>
                    </div>
                  </div>
                  <p className="text-slate-800 text-sm leading-relaxed">
                    VoltTap HQ<br />
                    12th Floor, Tower B, Cyber City<br />
                    Gurugram, Haryana — 122002
                  </p>
                  <div className="mt-4 bg-slate-100 rounded-xl h-28 overflow-hidden relative flex items-center justify-center">
                    <div className="absolute inset-0 opacity-40"
                      style={{ backgroundImage:"radial-gradient(circle,#94a3b8 1px,transparent 1px)", backgroundSize:"16px 16px" }} />
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg">📍</div>
                      <span className="text-xs text-slate-600 font-medium bg-white px-2 py-1 rounded-full shadow-sm">Gurugram, HR</span>
                    </div>
                  </div>
                </>
              )
            }, {
              delay: 100,
              content: (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-lg">🕐</div>
                    <div>
                      <p className="text-slate-800 font-bold text-sm">Support Hours</p>
                      <p className="text-slate-600 text-xs">When we're available</p>
                    </div>
                  </div>
                  {[
                    { day: "Chat & WhatsApp", time: "24 / 7", dot: "bg-emerald-500" },
                    { day: "Phone Support",   time: "7am – 11pm", dot: "bg-sky-500" },
                    { day: "Email Support",   time: "24 / 7", dot: "bg-emerald-500" },
                  ].map(r => (
                    <div key={r.day} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${r.dot}`} />
                        <span className="text-black text-sm">{r.day}</span>
                      </div>
                      <span className="text-black text-sm font-semibold">{r.time}</span>
                    </div>
                  ))}
                </>
              )
            }].map(({ delay, content }, i) => {
              const [ref, inView] = useInView(0.1);
              return (
                <div key={i} ref={ref}
                  className={`bg-white border border-slate-100 rounded-2xl shadow-sm p-6 transition-all duration-500
                    ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
                  style={{ transitionDelay: `${delay}ms` }}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              ❓ Frequently Asked Questions
            </div>
            <h2 className="text-3xl font-extrabold text-black-800 mb-3">Quick answers for you</h2>
            <p className="text-black text-sm">Can't find what you need? Use the contact form above.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 bg-linear-to-r from-sky-500 to-sky-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-3">Still need help?</h2>
          <p className="text-sky-100 text-sm mb-8 max-w-lg mx-auto">
            Our 24/7 live chat team is always ready. Tap below for an instant response.
          </p>
         <a href="#liveChat">
           <button className="px-8 py-3.5 bg-white text-sky-600 font-bold text-sm rounded-xl hover:bg-sky-50 transition-all hover:scale-105 active:scale-95 shadow-sm">
            💬 Start Live Chat
          </button>
         </a>
        </div>
      </section>
    </div>
  );
}