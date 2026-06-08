import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../utils/api";


export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP, 3 = Reset Password
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => { console.log('reCAPTCHA solved'); }
      });
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!identifier) { setError("Please enter your email"); return; }
    if (!identifier.includes("@")) { setError("Please enter a valid email address."); return; }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to send OTP");
      
      setStep(2);
    } catch (err) {
      console.error("Forgot Pw OTP Error:", err);
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) { setError("Enter the full 6-digit OTP"); return; }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp: otpCode })
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Invalid OTP");
      
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      console.error("Verification Error:", err);
      setError(err.message || "Invalid OTP or session expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to reset password");
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Password Reset!</h2>
          <p className="text-slate-600 text-sm mb-7">Your password has been changed successfully.</p>
          <button onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-all">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Forgot Password</h1>
        <p className="text-slate-500 text-sm mb-6">
          {step === 1 && "Enter your email to reset password."}
          {step === 2 && `Enter the OTP sent to ${identifier}.`}
          {step === 3 && "Set your new password."}
        </p>

        {error && <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-xl">⚠ {error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <input 
              type="email" 
              placeholder="Email address" 
              value={identifier} 
              onChange={e => setIdentifier(e.target.value)} 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 mb-4 text-sm"
            />
            <button type="submit" disabled={loading} className="w-full py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600">
              {loading ? "Sending..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, i) => (
                <input key={i} type="text" maxLength={1} value={digit}
                  onChange={e => {
                    const newOtp = [...otp];
                    newOtp[i] = e.target.value;
                    setOtp(newOtp);
                  }}
                  className="w-12 h-12 text-center text-lg font-bold border rounded-xl outline-none focus:border-sky-500"
                />
              ))}
            </div>
            <button onClick={handleVerifyOtp} disabled={loading} className="w-full py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-sky-500 mb-4 text-sm"
            />
            <button type="submit" disabled={loading} className="w-full py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600">
              {loading ? "Saving..." : "Set New Password"}
            </button>
          </form>
        )}

        <button onClick={() => navigate('/login')} className="w-full text-center mt-6 text-slate-400 text-sm hover:text-slate-600">
          Back to Login
        </button>
      </div>
    </div>
  );
}
