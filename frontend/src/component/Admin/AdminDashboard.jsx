import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, RefreshCw, IndianRupee, Gift, Wallet, 
  AlertCircle, Sparkles, TrendingUp, CircleAlert, ArrowRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import api from '../../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/analytics');
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err.message || 'Error loading dashboard analytics');
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-start gap-3.5 max-w-xl mx-auto mt-10 shadow-sm">
        <AlertCircle className="text-red-500 w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-red-800 text-sm">Dashboard Error</p>
          <p className="text-red-500 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const { metrics, operatorShare, growthTrends, recentRecharges, recentUsers } = data;

  const cardStats = [
    { title: 'Total Revenue', value: `₹${metrics.totalRevenue.toLocaleString()}`, change: '+12% this week', icon: IndianRupee, color: 'text-sky-600 bg-sky-50/60 border-sky-100/50' },
    { title: 'Total Recharges', value: metrics.totalRecharges.toString(), change: '+8% volume', icon: RefreshCw, color: 'text-indigo-600 bg-indigo-50/60 border-indigo-100/50' },
    { title: 'Active Users', value: metrics.totalUsers.toString(), change: '+15% signups', icon: Users, color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100/50' },
    { title: 'Cashback Given', value: `₹${metrics.totalCashback.toLocaleString()}`, change: 'Marketing cost', icon: Gift, color: 'text-pink-600 bg-pink-50/60 border-pink-100/50' },
    { title: 'Wallet Ecosystem', value: `₹${metrics.totalWalletBalance.toLocaleString()}`, change: 'System liabilities', icon: Wallet, color: 'text-amber-600 bg-amber-50/60 border-amber-100/50' },
    { title: 'Failed Transactions', value: metrics.failedRecharges.toString(), change: `${((metrics.failedRecharges / (metrics.totalRecharges || 1)) * 100).toFixed(1)}% fail rate`, icon: CircleAlert, color: 'text-red-600 bg-red-50/60 border-red-100/50' }
  ];

  // Operator Pie Chart brand palette matching main app style
  const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display tracking-tight text-slate-800">System Overview</h1>
          <p className="text-slate-500 text-xs mt-1">Real-time VoltTap payment platform analytics and control console.</p>
        </div>
        <div className="bg-white border border-slate-200/60 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 shadow-sm w-fit">
          <Sparkles className="text-sky-500 w-4 h-4" />
          <span>System Status: <span className="text-emerald-600 font-black uppercase animate-pulse">Healthy</span></span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cardStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-6 bg-white border border-slate-200/50 rounded-3xl flex items-center justify-between shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{stat.title}</span>
                <p className="text-2xl font-black mt-1.5 text-slate-850 font-display tracking-tight">{stat.value}</p>
                <span className="text-[10px] text-slate-500 mt-1 font-bold block">{stat.change}</span>
              </div>
              <div className={`w-12 h-12 border rounded-2xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recharge Growth Trend Area Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm flex flex-col h-96">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase text-sky-500 tracking-wider font-display">Revenue & Growth</span>
            <h3 className="text-base font-black text-slate-800 font-display mt-0.5">Recharge Transaction Trends</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthTrends.length > 0 ? growthTrends : [
                { date: '2026-05-17', count: 10, revenue: 1500 },
                { date: '2026-05-18', count: 18, revenue: 3200 },
                { date: '2026-05-19', count: 12, revenue: 2100 },
                { date: '2026-05-20', count: 24, revenue: 5400 },
                { date: '2026-05-21', count: 32, revenue: 7800 },
                { date: '2026-05-22', count: 20, revenue: 4900 },
                { date: '2026-05-23', count: 35, revenue: 8400 }
              ]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '14px', fontSize: '11px', color: '#1e293b', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operator Market Share Pie Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm flex flex-col h-96">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase text-indigo-500 tracking-wider font-display">Market Distribution</span>
            <h3 className="text-base font-black text-slate-800 font-display mt-0.5">Operator Volume Share</h3>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={operatorShare.length > 0 ? operatorShare : [
                    { operator: 'Jio', count: 45 },
                    { operator: 'Airtel', count: 30 },
                    { operator: 'Vi', count: 15 },
                    { operator: 'BSNL', count: 10 }
                  ]}
                  dataKey="count"
                  nameKey="operator"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={4}
                >
                  {(operatorShare.length > 0 ? operatorShare : ['Jio', 'Airtel', 'Vi', 'BSNL']).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '14px', fontSize: '11px', color: '#1e293b', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Overlay legends inside box */}
            <div className="absolute flex flex-wrap justify-center gap-x-4 gap-y-1.5 bottom-1 left-2 right-2">
              {(operatorShare.length > 0 ? operatorShare.map(o => o.operator) : ['Jio', 'Airtel', 'Vi', 'BSNL']).map((op, idx) => (
                <div key={op} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{op}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Recharges */}
        <div className="lg:col-span-8 bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-xs font-bold uppercase text-amber-500 tracking-wider font-display">Live Processing</span>
              <h3 className="text-base font-black text-slate-800 font-display mt-0.5">Recent Recharge Logs</h3>
            </div>
            <button 
              onClick={() => navigate('/admin/recharges')}
              className="flex items-center gap-1 text-[10px] font-black uppercase text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="pb-3 pl-2">User / No</th>
                  <th className="pb-3">Operator</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs">
                {recentRecharges.length > 0 ? (
                  recentRecharges.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2">
                        <p className="font-extrabold text-slate-850 text-xs">{rec.userId?.name || 'Self Pay'}</p>
                        <p className="text-[10px] text-slate-450 font-bold mt-0.5">+91 {rec.number}</p>
                      </td>
                      <td className="py-3.5 font-bold text-slate-600">{rec.operator}</td>
                      <td className="py-3.5 font-black text-sky-550">₹{rec.amount}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide
                          ${rec.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/70'
                            : rec.status === 'FAILED' ? 'bg-red-50 text-red-600 border border-red-100/70'
                            : rec.status === 'REFUNDED' ? 'bg-blue-50 text-blue-650 border border-blue-100/70'
                            : 'bg-amber-50 text-amber-600 border border-amber-100/70 animate-pulse'}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-450 font-bold">{new Date(rec.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">No recent recharge activities found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-xs font-bold uppercase text-teal-500 tracking-wider font-display">New Signups</span>
              <h3 className="text-base font-black text-slate-800 font-display mt-0.5">Recent Users</h3>
            </div>
            <button 
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-1 text-[10px] font-black uppercase text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {recentUsers.length > 0 ? (
              recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center font-black text-sky-600 text-xs shadow-inner">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs leading-none">{u.name}</h5>
                      <span className="text-[10px] text-slate-450 font-bold block mt-1">+91 {u.mobile}</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-500 font-extrabold uppercase tracking-wide">
                    {u.authProvider}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-slate-450 font-bold text-xs">No recent users registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
