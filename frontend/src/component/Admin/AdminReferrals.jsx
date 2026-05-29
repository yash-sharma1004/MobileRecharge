import { useState, useEffect } from 'react';
import { Share2, Users, AlertCircle, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

export default function AdminReferrals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/referrals');
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError(err.message || 'Failed to load referral auditing logs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-start gap-3.5 max-w-xl mx-auto mt-10 shadow-sm">
        <AlertCircle className="text-red-500 w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-red-800 text-sm">Auditing Error</p>
          <p className="text-red-500 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const { referrals, leaderboard, suspiciousReferrals } = data;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black font-display tracking-tight text-slate-800">Referral Audit</h1>
        <p className="text-slate-500 text-xs mt-1">Audit invites network loops, track distributed rewards, and audit leaderboard rankings.</p>
      </div>

      {/* Suspicious loop warnings */}
      {suspiciousReferrals.length > 0 && (
        <div className="p-5 border border-red-100 bg-red-50 rounded-[1.8rem] space-y-3.5">
          <div className="flex items-center gap-2 text-red-650">
            <ShieldAlert className="w-5 h-5 shrink-0 animate-bounce" />
            <h4 className="font-black text-sm uppercase tracking-wider font-display">Fraud Scanner: Suspicious Accounts Loop Detected</h4>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {suspiciousReferrals.map((loop, idx) => (
              <p key={idx} className="text-red-600 text-xs font-semibold leading-relaxed">
                🚨 <span className="font-black underline">Loop detected</span>: Users signed up in a cyclic pattern (Self-referral or loop invite structure). Action: Investigate blocking user status.
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Log */}
        <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm">
          <h3 className="text-base font-black text-slate-800 font-display mb-4">Referral Invitation Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="pb-3 pl-2">Referrer / Owner</th>
                  <th className="pb-3">Referred User</th>
                  <th className="pb-3">Reward Earned</th>
                  <th className="pb-3 pr-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {referrals.length > 0 ? (
                  referrals.map((ref) => (
                    <tr key={ref._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2">
                        <p className="font-extrabold text-slate-850">{ref.referrerId?.name || 'Deleted Account'}</p>
                        <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">Code: {ref.referrerId?.referralCode || ref.codeUsed}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-slate-750">{ref.referredUserName || ref.referredUserId?.name}</p>
                        <p className="text-[10px] text-slate-450 font-semibold mt-0.5">+91 {ref.referredUserId?.mobile}</p>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
                          ${ref.isMilestone ? 'bg-amber-50 text-amber-600 border border-amber-100/70' : 'bg-emerald-50 text-emerald-600 border border-emerald-100/70'}`}>
                          +₹{ref.reward} {ref.isMilestone && '🌟 Milestone'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 font-semibold text-slate-450">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">No referral conversions logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-[2rem] p-6 space-y-5 shadow-sm">
          <div>
            <span className="text-[9px] bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-500 font-extrabold uppercase tracking-widest font-display">Rankings</span>
            <h3 className="text-base font-black text-slate-800 font-display mt-3">Referral Earnings</h3>
            <p className="text-slate-550 text-[10px] mt-0.5">Top referrers by conversion volumes.</p>
          </div>

          <div className="space-y-3.5">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-850 text-xs">{entry.referrer?.name || 'Guest User'}</h5>
                      <span className="text-[10px] text-slate-450 font-semibold">{entry.inviteCount} invites converted</span>
                    </div>
                  </div>
                  <span className="font-black text-xs text-emerald-600 bg-emerald-50 border border-emerald-100/70 px-2.5 py-0.5 rounded-lg">
                    ₹{entry.totalEarnings}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-slate-400 font-bold text-xs">No leaderboard ranks compiled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
