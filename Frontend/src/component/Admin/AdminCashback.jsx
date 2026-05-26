import { useState, useEffect } from 'react';
import { Gift, ShieldCheck, AlertCircle, RefreshCw, Sparkles, Award } from 'lucide-react';
import api from '../../utils/api';

export default function AdminCashback() {
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [type, setType] = useState('random');
  const [minAmount, setMinAmount] = useState('0');
  const [cashbackPercentage, setCashbackPercentage] = useState('0');
  const [cashbackAmount, setCashbackAmount] = useState('0');
  const [minRandom, setMinRandom] = useState('1');
  const [maxRandom, setMaxRandom] = useState('25');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchCashbackRule = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/cashback-rules');
      const r = res.data;
      setRule(r);
      setType(r.type);
      setMinAmount(r.minAmount.toString());
      setCashbackPercentage(r.cashbackPercentage.toString());
      setCashbackAmount(r.cashbackAmount.toString());
      setMinRandom(r.minRandom.toString());
      setMaxRandom(r.maxRandom.toString());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cashback rule:', err);
      setError(err.message || 'Failed to load cashback rule');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashbackRule();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const res = await api.put('/admin/cashback-rules', {
        type,
        minAmount: parseFloat(minAmount),
        cashbackPercentage: parseFloat(cashbackPercentage),
        cashbackAmount: parseFloat(cashbackAmount),
        minRandom: parseInt(minRandom),
        maxRandom: parseInt(maxRandom)
      });

      setRule(res.data);
      setSuccess('Cashback Engine rules successfully updated and activated!');
      setUpdating(false);
    } catch (err) {
      setError(err.message || 'Update failed');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black font-display tracking-tight text-slate-800">Cashback Engine</h1>
        <p className="text-slate-500 text-xs mt-1">Configure real-time cashback allocation algorithms and bounds.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Rules Designer */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-200/60 p-6 sm:p-10 rounded-[2.5rem] space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-black text-slate-800 font-display">Cashback Logic Designer</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Select a rule type and define parameters. Rules apply immediately platform-wide.</p>
          </div>

          {/* Type Select */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Rule Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'random', label: 'Random Range', desc: 'Min-Max bounds' },
                { id: 'percentage', label: 'Percentage', desc: 'Flat charge rate' },
                { id: 'flat', label: 'Flat Cashback', desc: 'Constant reward' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-4 border rounded-2xl text-left cursor-pointer transition-all duration-200 flex flex-col justify-between gap-1
                    ${type === t.id 
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-105 text-slate-700'}`}
                >
                  <span className="font-extrabold text-xs">{t.label}</span>
                  <span className={`text-[9px] font-semibold ${type === t.id ? 'text-slate-300' : 'text-slate-450'}`}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Minimum Amount */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Min Recharge Required (₹)</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                required
              />
            </div>

            {/* Percentage Type Value */}
            {type === 'percentage' && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Cashback Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cashbackPercentage}
                  onChange={(e) => setCashbackPercentage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  required
                />
              </div>
            )}

            {/* Flat Type Value */}
            {type === 'flat' && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Flat Cashback Amount (₹)</label>
                <input
                  type="number"
                  value={cashbackAmount}
                  onChange={(e) => setCashbackAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  required
                />
              </div>
            )}

            {/* Random Type Values */}
            {type === 'random' && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Min Random (₹)</label>
                  <input
                    type="number"
                    value={minRandom}
                    onChange={(e) => setMinRandom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Max Random (₹)</label>
                  <input
                    type="number"
                    value={maxRandom}
                    onChange={(e) => setMaxRandom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    required
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-center gap-2.5 text-[10px] text-red-650 font-bold">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center gap-2.5 text-[10px] text-emerald-600 font-bold">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0 animate-bounce" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={updating}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
          >
            {updating ? 'Updating Engine...' : 'Activate Rules'}
          </button>
        </form>

        {/* Right Column: Engine Summary and Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3.5 font-display flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span>Current Status Summary</span>
            </h4>
            <div className="space-y-3.5 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-450 block">Calculation Method</span>
                <p className="font-extrabold text-slate-800 text-sm capitalize mt-1.5 flex items-center gap-1.5">
                  <Award className="text-slate-650 w-4.5 h-4.5" />
                  <span>{rule?.type} Calculation Method</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-450 block">Current Settings</span>
                <p className="font-extrabold text-slate-750 mt-2 font-display text-sm">
                  {rule?.type === 'random' && `Randomized bound range: ₹${rule?.minRandom} to ₹${rule?.maxRandom}`}
                  {rule?.type === 'percentage' && `Variable rate: ${rule?.cashbackPercentage}% of total`}
                  {rule?.type === 'flat' && `Constant reward value: ₹${rule?.cashbackAmount}`}
                </p>
                <p className="text-[10px] text-slate-450 mt-1 font-bold">Minimum recharge price trigger: ₹{rule?.minAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
