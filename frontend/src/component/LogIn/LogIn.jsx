// Login.jsx — VoltTap | Advanced Login Section
// Features: floating labels, OTP mode, animated bg blobs, shake on error,
//           show/hide password, remember me, social login, live input validation
// Stack: React + Tailwind CSS

import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/api";

// ── Icons ──
const EyeOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
    <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={3}/>
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4 text-emerald-500">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── Floating Label Input ──
function FloatInput({ id, label, type = "text", value, onChange, icon, error, suffix }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const lifted = focused || filled;

  return (
    <div className="relative">
      <div
        className={`relative flex items-center border rounded-xl transition-all duration-200 bg-white
          ${error ? "border-red-300 ring-2 ring-red-100" : focused ? "border-sky-400 ring-2 ring-sky-100" : "border-slate-200 hover:border-slate-300"}`}
      >
        {/* Left icon */}
        <span className={`pl-4 transition-colors duration-200 ${focused ? "text-sky-500" : "text-slate-400"}`}>
          {icon}
        </span>

        <div className="relative flex-1 h-14">
          {/* Floating label */}
          <label
            htmlFor={id}
            className={`absolute left-3 transition-all duration-200 pointer-events-none select-none font-medium
              ${lifted ? "top-2 text-[11px] text-sky-500" : "top-1/2 -translate-y-1/2 text-[14px] text-slate-400"}`}
          >
            {label}
          </label>
          {/* Input */}
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="absolute bottom-0 left-3 right-0 h-7 text-sm text-slate-800 bg-transparent outline-none w-full"
            autoComplete="off"
          />
        </div>

        {/* Right suffix (show/hide, etc.) */}
        {suffix && <div className="pr-3">{suffix}</div>}
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ── OTP Input ──
function OtpInput({ otp, setOtp }) {
  const refs = useRef([]);
  const handle = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };
  return (
    <div className="flex gap-3 justify-center my-4">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => onKey(i, e)}
          className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all duration-200
            ${digit ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-800"}
            focus:border-sky-400 focus:ring-2 focus:ring-sky-100`}
        />
      ))}
    </div>
  );
}

// ── Countdown timer ──
function Countdown({ onExpire }) {
  const [sec, setSec] = useState(30);
  useEffect(() => {
    if (sec <= 0) { onExpire(); return; }
    const t = setTimeout(() => setSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sec]);
  return (
    <span className="text-slate-400 text-xs">
      {sec > 0 ? `Resend in ${sec}s` : ""}
    </span>
  );
}

// ── Main Component ──
export default function Login() {
  const [mode, setMode] = useState("password"); // "password" | "otp"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [canResend, setCanResend] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [step, setStep] = useState(1); // 1=credentials, 2=otp verify
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier))
      e.identifier = "Enter a valid email address.";
    if (mode === "password" && password.length < 6)
      e.password = "Password must be at least 6 characters.";
    return e;
  };

  const handleSendOtp = async () => {
    const e = validate();
    if (e.identifier) { setErrors(e); shake(); return; }
    
    setLoading(true);
    setApiError("");

    try {
      // --- Legacy Backend Email OTP Flow ---
      const res = await fetch(`${API_BASE}/auth/login-otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to send OTP.");

      setOtpSent(true);
      setStep(2);
      setCanResend(false);
      setLoading(false);
    } catch (err) {
      console.error("OTP Send Error:", err);
      setApiError(err.message || "Failed to send OTP. Please check your connection.");
      setLoading(false);
      shake();
    }
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); shake(); return; }
    
    setLoading(true);
    setApiError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier,
          password: password
        })
      });

      const data = await res.json();

      if (!data.success) {
        setApiError(data.message || "Login failed.");
        setLoading(false);
        shake();
        return;
      }

      // Save auth state via AuthContext (handles localStorage internally)
      authLogin(data.data.user, data.data.token);

      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setApiError("Server not reachable. Make sure the backend is running.");
      setLoading(false);
      shake();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setErrors({ otp: "Please enter the full 6-digit OTP." });
      shake();
      return;
    }
    
    setLoading(true);
    setApiError("");

    try {
      // --- Legacy Backend Email OTP Flow ---
      const res = await fetch(`${API_BASE}/auth/login-otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp: otpValue })
      });
      const data = await res.json();

      if (!data.success) {
        setErrors({ otp: data.message || "Invalid OTP." });
        setLoading(false);
        shake();
        return;
      }

      authLogin(data.data.user, data.data.token);
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      console.error("Verification Error:", err);
      setErrors({ otp: err.message || "Verification failed." });
      setLoading(false);
      shake();
    }
  };

  // ── Success Screen ──
  if (success) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome back!</h2>
        <p className="text-slate-600 text-sm mb-7">You're logged in to VoltTap.</p>
        <button onClick={() => navigate("/")}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-all">
          Go to Dashboard →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* ── Animated background blobs ── */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-sky-200/40 blur-3xl animate-blob" />
      <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-violet-200/30 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/3 w-56 h-56 rounded-full bg-emerald-100/30 blur-3xl animate-blob animation-delay-4000" />

      <style>{`
        @keyframes blob {
          0%,100%{transform:translate(0,0) scale(1);}
          33%{transform:translate(20px,-20px) scale(1.05);}
          66%{transform:translate(-15px,15px) scale(0.97);}
        }
        .animate-blob{animation:blob 8s ease-in-out infinite;}
        .animation-delay-2000{animation-delay:2s;}
        .animation-delay-4000{animation-delay:4s;}
        @keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-8px);}40%{transform:translateX(8px);}60%{transform:translateX(-5px);}80%{transform:translateX(5px)};}
        .shake{animation:shake .45s ease-in-out;}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        .slide-up{animation:slideUp .35s ease both;}
      `}</style>

      <div className="w-full max-w-sm relative z-10">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img 
            src={logo} 
            alt="VoltTap Logo" 
            className="h-24 w-auto object-contain"
          />
        </div>

        {/* Card */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${shaking ? "shake" : ""}`}>

          {/* Progress bar top */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-1 bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500 rounded-r-full"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          <div className="p-8">

            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold text-slate-800">
                  {step === 2 ? "Verify OTP" : "Welcome back"}
                </h1>
                {/* Step indicator */}
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                  Step {step}/2
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {step === 2
                  ? "OTP sent to your email."
                  : <>Don't have an account?{" "}
                      <a href="/signUp" className="text-sky-500 font-semibold hover:underline">Sign Up</a>
                    </>
                }
              </p>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                <span>⚠</span> {apiError}
              </div>
            )}

            {/* ── STEP 1: Credentials ── */}
            {step === 1 && (
              <div className="slide-up space-y-5">

                {/* Identifier input */}
                <FloatInput id="email" label="Email address" type="email" value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setErrors({}); setApiError(""); }}
                  icon={<MailIcon />} error={errors.identifier} />

                 
                {/* Mode toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm font-medium">Sign in with</span>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                    {["password","otp"].map(m => (
                      <button key={m} onClick={() => { setMode(m); setErrors({}); setApiError(""); }}
                        className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all duration-200
                          ${mode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                        {m === "otp" ? "OTP" : "Password"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password input */}
                {mode === "password" && (
                  <FloatInput id="password" label="Password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors({}); setApiError(""); }}
                    icon={<LockIcon />}
                    error={errors.password}
                    suffix={
                      <button onClick={() => setShowPw(v => !v)}
                        className="text-slate-400 hover:text-slate-600 transition-colors">
                        {showPw ? <EyeOn /> : <EyeOff />}
                      </button>
                    }
                  />
                )}

                {/* Remember + Forgot */}
                {mode === "password" && (
                  <div className="flex items-center justify-between"> 
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div onClick={() => setRemember(v => !v)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                          ${remember ? "bg-sky-500 border-sky-500" : "border-slate-300 group-hover:border-sky-400"}`}>
                        {remember && <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none" stroke="white" strokeWidth={2}><polyline points="1 4 3.5 6.5 9 1"/></svg>}
                      </div>
                      <span className="text-slate-500 text-sm">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sky-500 text-sm font-semibold hover:underline">Forgot password?</Link>
                  </div>
                )}

                {/* Security badge */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                  <ShieldIcon />
                  <span className="text-emerald-700 text-xs font-medium">256-bit SSL encrypted · Your data is safe</span>
                </div>

                {/* CTA */}
                {mode === "password" ? (
                  <button onClick={handleLogin} disabled={loading}
                    className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-sm shadow-sky-200 ${
                      loading ? "bg-sky-300 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600 active:scale-95"
                    }`}>
                    {loading ? "Logging in..." : "Log In →"}
                  </button>
                ) : (
                  <button onClick={handleSendOtp}
                    className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-sm transition-all shadow-sm shadow-sky-200">
                    Send OTP →
                  </button>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs text-slate-400">or continue with</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Social */}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 py-2.5 rounded-xl text-sm font-medium text-slate-600 transition-all">
                    <GoogleIcon /> Google
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 py-2.5 rounded-xl text-sm font-medium text-slate-600 transition-all">
                    <span className="font-black text-[#1877F2] text-base leading-none">f</span> Facebook
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: OTP Verify ── */}
            {step === 2 && (
              <div className="slide-up">
                {/* What we sent */}
                <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
                  <span className="text-sky-500 text-lg">📨</span>
                  <div>
                    <p className="text-sky-700 text-sm font-semibold">OTP Sent!</p>
                    <p className="text-sky-500 text-xs mt-0.5">
                      We've sent a 6-digit code to{" "}
                      <span className="font-bold">
                        {identifier}
                      </span>
                    </p>
                  </div>
                </div>

                <OtpInput otp={otp} setOtp={setOtp} />
                {errors.otp && <p className="text-red-400 text-xs text-center -mt-2 mb-4">⚠ {errors.otp}</p>}

                {/* Resend */}
                <div className="flex items-center justify-between mb-5">
                  {canResend ? (
                    <button onClick={handleSendOtp}
                      className="text-sky-500 text-sm font-semibold hover:underline">
                      Resend OTP
                    </button>
                  ) : (
                    <Countdown onExpire={() => setCanResend(true)} />
                  )}
                  <button onClick={() => { setStep(1); setOtpSent(false); setOtp(["","","","","",""]); setErrors({}); }}
                    className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
                    ← Change Email
                  </button>
                </div>

                <button onClick={handleVerifyOtp} disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-sm shadow-sky-200 ${
                    loading ? "bg-sky-300 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600 active:scale-95"
                  }`}>
                  {loading ? "Verifying..." : "Verify & Log In →"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-400 text-xs mt-6">
          © {new Date().getFullYear()} VoltTap Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}