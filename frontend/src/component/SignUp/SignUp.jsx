// SignUp.jsx — VoltTap | Simple & Clean
// Stack: React + Tailwind CSS

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export default function SignUp() {
  const [form, setForm]       = useState({ name: "", phone: "", email: "", password: "", referralCode: "" });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [done, setDone]       = useState(false); 
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                              e.name     = "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(form.phone))              e.phone    = "Enter a valid 10-digit number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email  = "Enter a valid email.";
    if (form.password.length < 8)                       e.password = "Minimum 8 characters.";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    setLoading(true);
    setApiError("");
    
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: form.phone,
          email: form.email,
          name: form.name,
          password: form.password,
          ...(form.referralCode.trim() && { referralCode: form.referralCode.trim() })
        })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        setApiError(data.message || "Registration failed. Try again.");
        setLoading(false);
        return;
      }
      
      // Account created successfully — do NOT auto-login.
      // User must manually log in after signup.
      
      setLoading(false);
      setDone(true);
    } catch (err) {
      setApiError("Server not reachable. Make sure the backend is running.");
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (done) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Account Created!</h2>
        <p className="text-slate-500 text-sm mb-7">Your account has been created successfully. Please log in to continue.</p>
        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-all"
        >
          Go to Login →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img 
            src={logo} 
            alt="VoltTap Logo" 
            className="h-24 w-auto object-contain"
          />
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Create account</h1>
            <p className="text-slate-400 text-sm">
              Already have one?{" "}
              <a href="/login" className="text-sky-500 font-semibold hover:underline">Log in</a>
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
              <span>⚠</span> {apiError}
            </div>
          )}

          {/* ── Fields ── */}
          <div className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                className={field(errors.name)}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Mobile Number</label>
              <div className="flex">
                <span className="px-3 flex items-center bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-slate-400 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={form.phone}
                  onChange={e => set("phone", e.target.value.replace(/\D/g, ""))}
                  className={`${field(errors.phone)} rounded-l-none border-l-0`}
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="rahul@email.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                className={field(errors.email)}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  className={`${field(errors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Referral Code <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. YASH4821"
                value={form.referralCode}
                onChange={e => set("referralCode", e.target.value.toUpperCase())}
                className={field()}
              />
            </div>

            {/* Terms note */}
            <p className="text-slate-400 text-xs leading-relaxed">
              By signing up, you agree to our{" "}
              <a href="#" className="text-sky-500 hover:underline font-medium">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-sky-500 hover:underline font-medium">Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all shadow-sm ${
                loading ? "bg-sky-300 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600 active:scale-95"
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or continue with</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Social */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium text-slate-600 transition-all">
              <span className="font-black text-[#4285F4]">G</span> Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium text-slate-600 transition-all">
              <span className="font-black text-[#1877F2]">f</span> Facebook
            </button>
          </div>
        </div>

        {/* Bottom */}
        <p className="text-center text-slate-400 text-xs mt-6">
          © {new Date().getFullYear()} VoltTap Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}

// Input class helper
function field(err) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm text-slate-700 placeholder-slate-300 outline-none transition-all focus:ring-2 ${
    err
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"
  }`;
}