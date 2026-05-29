import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserFriends, FaGift, FaShareAlt, FaCopy, FaCheckCircle } from "react-icons/fa";
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function Refer() {
  const navigate = useNavigate();
  const { addCashback } = useWallet() || {};
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [referralCode, setReferralCode] = useState(user?.referralCode || "");
  const [earnings, setEarnings] = useState(0);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(isAuthenticated);

  // Fetch referral data from backend
  const fetchReferralData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/referrals');
      if (res.success) {
        setEarnings(res.data?.earnings || 0);
        setHistory(res.data?.history || []);
        if (res.data?.referralCode) {
          setReferralCode(res.data.referralCode);
        }
      }
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
    } finally {
      setLoading(false);
      setInitLoading(false);
    }
  }, [isAuthenticated]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.get('/referrals/leaderboard');
      if (res.data?.success) {
        setLeaderboard(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
    fetchLeaderboard();
  }, [fetchReferralData, fetchLeaderboard]);

  // Handlers
  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referralCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join FastPay & Earn!',
        text: `Use my referral code ${referralCode} to get started and we both earn rewards!`,
        url: window.location.origin,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-slate-50 py-16 min-h-screen font-sans antialiased">
      {/* Top Banner / Hero */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Illustration */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl flex items-center justify-center">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/refer-a-friend-3488530-2912012.png"
              alt="refer"
              className="w-full max-h-[360px] object-contain mix-blend-multiply"
            />
          </div>
        </div>

        {/* Right Content */}
        <div>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100/50 rounded-full px-4 py-1.5 font-display">Loyalty Rewards</span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-slate-900 font-display tracking-tight mt-4">Refer & Earn</h1>
          <p className="text-slate-500 font-semibold leading-relaxed mb-8">
            Share the convenience of instant digital payments. Invite your friends to register and complete their first transaction to earn cash rewards directly into your wallet.
          </p>

          {/* Referral Code UI */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200/60 mb-8 flex items-center justify-between">
            {isAuthenticated ? (
              <>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1 font-display">Your Referral Code</p>
                  <p className="text-2xl font-black text-indigo-600 tracking-widest font-display">
                    {initLoading ? "•••" : (referralCode || "PENDING")}
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button 
                    onClick={handleCopy}
                    className="p-3.5 bg-slate-50 text-slate-600 border border-slate-200/60 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer shadow-sm"
                    title="Copy Code"
                  >
                    {copied ? <FaCheckCircle className="text-emerald-500" /> : <FaCopy />}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                    title="Share"
                  >
                    <FaShareAlt />
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full text-center py-4">
                <p className="text-slate-600 text-sm font-semibold mb-4">Log in to view your unique referral code & begin earning</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  Login Now
                </button>
              </div>
            )}
          </div>

          {/* How It Works Steps */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 border border-indigo-100/50 p-3.5 rounded-2xl text-indigo-600 text-lg shadow-sm">
                <FaShareAlt />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base font-display">1. Share Referral Code</h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  Copy and send your invitation code to friends via WhatsApp, SMS, or Social Media.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 border border-indigo-100/50 p-3.5 rounded-2xl text-indigo-600 text-lg shadow-sm">
                <FaUserFriends />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base font-display">2. Friends Signup & Pay</h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  Your referred friend signs up and completes any transaction on our platform.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 border border-indigo-100/50 p-3.5 rounded-2xl text-indigo-600 text-lg shadow-sm">
                <FaGift />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base font-display">3. Earn Cash Bonus</h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  Get ₹50 cash bonus credited directly into your wallet balance instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification, Stats & Leaderboard Section */}
      <div className="max-w-6xl mx-auto px-6 mt-20 grid md:grid-cols-12 gap-8">
        
        {/* Left Col: Earnings & History (Spans 7 cols on large screens) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Earnings & Milestones */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black font-display mb-0.5">Total Earnings</p>
                <h2 className="text-xl font-black text-slate-900 font-display">Cash Rewards</h2>
              </div>
              {/* Badges based on earnings */}
              {earnings >= 250 && <span className="bg-amber-100 border border-amber-200/50 text-amber-700 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-1 font-display">🏆 Gold Rank</span>}
              {earnings >= 100 && earnings < 250 && <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-1 font-display">🥈 Silver Rank</span>}
              {earnings > 0 && earnings < 100 && <span className="bg-orange-50 border border-orange-200/50 text-orange-800 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-1 font-display">🥉 Bronze Rank</span>}
            </div>
            
            <p className="text-5xl font-black text-indigo-600 mb-8 font-display">₹{earnings}</p>
            
            {/* Gamification / Milestone */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end mb-2.5">
                <p className="text-xs sm:text-sm font-black text-slate-800 font-display">Milestone Challenge (Level {Math.floor(history.length / 5) + 1})</p>
                <p className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-full font-display">Refer 5 friends for ₹100 Bonus</p>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden shadow-inner border border-slate-200/30">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 h-full transition-all duration-500 ease-out relative" 
                  style={{ width: `${((history.length % 5) / 5) * 100}%` }} 
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-black text-slate-500 mt-2.5 text-right font-display uppercase tracking-widest">{history.length % 5} / 5 completed</p>
            </div>
          </div>

          {/* Referral History */}
          {history.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/60">
              <h2 className="text-xl font-black text-slate-900 mb-6 font-display tracking-tight">Recent Referrals</h2>
              <div className="space-y-3">
                {history.slice(0, 5).map(item => (
                  <div key={item._id || item.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-colors ${item.isMilestone ? "bg-gradient-to-r from-amber-500/5 to-yellow-500/5 border-amber-200" : "bg-slate-50/50 border-slate-200/60 hover:border-indigo-500/30 hover:bg-white"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${item.isMilestone ? "bg-amber-100 text-amber-600 border border-amber-200/30 shadow-sm" : "bg-emerald-50 text-emerald-600 border border-emerald-100/30 shadow-sm"}`}>
                        {item.isMilestone ? "🎁" : <FaUserFriends />}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm font-display">{item.referredUserName || item.referredUser || item.user}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-base sm:text-lg ${item.isMilestone ? "text-amber-600" : "text-emerald-600"}`}>+₹{item.reward}</p>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">{item.isMilestone ? "Milestone Bonus" : "Credited"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Leaderboard (Spans 5 cols on large screens) */}
        <div className="md:col-span-5">
          <div className="bg-slate-950 rounded-3xl p-8 shadow-2xl border border-slate-900 text-white h-full relative overflow-hidden group">
            {/* background subtle mesh glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent opacity-65 pointer-events-none" />
            
            <div className="flex items-center gap-3.5 mb-8 relative z-10">
              <span className="text-3xl animate-bounce">🏆</span>
              <div>
                <h2 className="text-xl font-black font-display tracking-tight">Top Referrers</h2>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">All-time leaderboard</p>
              </div>
            </div>
            
            <div className="space-y-3.5 relative z-10">
              {leaderboard.length > 0 ? (
                leaderboard.map((user, index) => (
                  <div key={index} className="flex items-center gap-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-900/50 hover:border-slate-800 transition-colors">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner font-display
                      ${index === 0 ? "bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-900 shadow-amber-500/10" : 
                        index === 1 ? "bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 shadow-slate-500/10" : 
                        index === 2 ? "bg-gradient-to-tr from-orange-400 to-orange-200 text-orange-950 shadow-orange-500/10" : 
                        "bg-slate-800 text-slate-400 border border-slate-700/30"}`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-slate-100 font-display truncate">{user.name}</p>
                    </div>
                    <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-900/80">
                      <p className="font-black text-emerald-400 text-xs font-mono">₹{user.earnings}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800/80 rounded-2xl">
                  <span className="text-3xl block mb-2">🌱</span>
                  <p className="font-bold text-sm text-slate-400 font-display">No referrals yet</p>
                  <p className="text-xs mt-1 text-slate-500 font-medium">Be the first to share your code!</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}