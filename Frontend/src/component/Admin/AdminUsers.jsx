import { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldAlert, ArrowRight, ShieldCheck, 
  Wallet, Eye, X, Plus, Minus, AlertCircle, History, Landmark
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Wallet Adjust state
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDesc, setAdjustDesc] = useState('');
  const [adjustOp, setAdjustOp] = useState('ADD');
  const [adjustError, setAdjustError] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = `/admin/users?page=${page}&limit=10`;
      if (search) query += `&search=${search}`;
      if (status) query += `&status=${status}`;

      const res = await api.get(query);
      setUsers(res.data);
      setPagination(res.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBlockUnblock = async (user) => {
    if (confirm(`Are you sure you want to ${user.status === 'ACTIVE' ? 'BLOCK' : 'UNBLOCK'} ${user.name}?`)) {
      try {
        await api.put(`/admin/users/${user._id}/block`);
        fetchUsers();
        if (selectedUser && selectedUser._id === user._id) {
          setSelectedUser({
            ...selectedUser,
            status: selectedUser.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
          });
        }
      } catch (error) {
        alert(error.message || 'Block operation failed');
      }
    }
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setHistoryLoading(true);
    setAdjustError('');
    setAdjustSuccess('');
    setAdjustAmount('');
    setAdjustDesc('');
    
    try {
      const res = await api.get(`/admin/users/${user._id}/history`);
      setUserHistory(res.data);
      setHistoryLoading(false);
    } catch (error) {
      console.error('Error fetching user history:', error);
      setHistoryLoading(false);
    }
  };

  const handleAdjustWallet = async (e) => {
    e.preventDefault();
    setAdjustError('');
    setAdjustSuccess('');

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      setAdjustError('Please enter a valid amount.');
      return;
    }

    try {
      const res = await api.put(`/admin/users/${selectedUser._id}/wallet`, {
        amount: amt,
        operation: adjustOp,
        description: adjustDesc || `Manual adjustment: ${adjustOp}`
      });

      setAdjustSuccess(`Successfully adjusted balance! New balance: ₹${res.data.data.newBalance}`);
      
      // Update local states
      const updatedUsers = users.map(u => {
        if (u._id === selectedUser._id) {
          return { ...u, walletBalance: res.data.data.newBalance };
        }
        return u;
      });
      setUsers(updatedUsers);

      setSelectedUser({
        ...selectedUser,
        walletBalance: res.data.data.newBalance
      });

      // Reload transaction log in modal
      const refreshedHistory = await api.get(`/admin/users/${selectedUser._id}/history`);
      setUserHistory(refreshedHistory.data);
      
      setAdjustAmount('');
      setAdjustDesc('');
    } catch (error) {
      setAdjustError(error.message || 'Wallet adjustment failed');
    }
  };  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black font-display tracking-tight text-slate-800">User Administration</h1>
        <p className="text-slate-500 text-xs mt-1">Audit profile activity, lock accounts, and adjust wallet balances.</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4 bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-3 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-all"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-650 outline-none cursor-pointer focus:border-sky-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="BLOCKED">Blocked Only</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/10"
        >
          Search
        </button>
      </form>

      {/* Users table */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="py-4 pl-6">Profile Info</th>
                    <th className="py-4">Mobile</th>
                    <th className="py-4">Wallet Balance</th>
                    <th className="py-4">Activity</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-6">
                          <p className="font-extrabold text-slate-900 text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">{u.email || 'No email registered'}</p>
                        </td>
                        <td className="py-4 font-bold text-slate-600">+91 {u.mobile}</td>
                        <td className="py-4 font-black text-emerald-600">₹{u.walletBalance.toLocaleString()}</td>
                        <td className="py-4">
                          <p className="font-bold text-slate-700">{u.rechargeCount} Recharges</p>
                          <p className="text-[10px] text-slate-450 font-semibold mt-0.5">₹{u.totalRechargedAmount.toLocaleString()} total</p>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
                            ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/70'
                              : 'bg-red-50 text-red-650 border border-red-100/70'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-4 pr-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(u)}
                              className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                              title="Audit details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Audit</span>
                            </button>
                            <button
                              onClick={() => handleBlockUnblock(u)}
                              className={`p-2 border rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider
                                ${u.status === 'ACTIVE' 
                                  ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700' 
                                  : 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'}`}
                            >
                              {u.status === 'ACTIVE' ? (
                                <>
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span>Block</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Unblock</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">No user accounts found matching query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <span className="text-[10px] text-slate-550 font-bold uppercase">Page {page} of {pagination.pages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3.5 py-1.5 border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-[10px] font-black uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="px-3.5 py-1.5 border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-[10px] font-black uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* AUDIT DETAILS & WALLET ADJUSTMENT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 max-w-4xl w-full text-left relative shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => { setSelectedUser(null); setUserHistory(null); }}
              className="absolute top-6 right-6 w-9 h-9 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-[1.2rem] flex items-center justify-center font-black text-sky-650 text-xl shadow-inner">
                {selectedUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 font-display tracking-tight">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Mobile: <span className="text-slate-850 font-bold">+91 {selectedUser.mobile}</span> · Role: <span className="text-sky-600 font-extrabold">{selectedUser.role}</span></p>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Wallet Adjuster & Account Actions */}
              <div className="lg:col-span-5 space-y-6">
                {/* Balance display */}
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-[1.8rem] text-center shadow-inner flex flex-col justify-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Current Wallet Balance</span>
                  <p className="text-3xl font-black text-emerald-600 mt-1.5 font-display tracking-tight">₹{selectedUser.walletBalance.toLocaleString()}</p>
                </div>

                {/* Adjuster Form */}
                <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-[1.8rem]">
                  <h4 className="text-xs font-black uppercase text-sky-600 tracking-widest mb-4 font-display flex items-center gap-1.5">
                    <Landmark className="w-4 h-4" />
                    <span>Balance Adjuster</span>
                  </h4>
                  <form onSubmit={handleAdjustWallet} className="space-y-4">
                    <div className="flex bg-white border border-slate-200 p-1 rounded-xl w-full">
                      <button
                        type="button"
                        onClick={() => setAdjustOp('ADD')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          adjustOp === 'ADD' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-850'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 inline mr-1" />
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustOp('DEDUCT')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          adjustOp === 'DEDUCT' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-850'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5 inline mr-1" />
                        Deduct
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Amount (₹)</label>
                      <input
                        type="text"
                        placeholder="₹ 0.00"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Description / Audit Reason</label>
                      <input
                        type="text"
                        placeholder="e.g. Compensatory cashback or manual debit"
                        value={adjustDesc}
                        onChange={(e) => setAdjustDesc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
                        required
                      />
                    </div>

                    {adjustError && (
                      <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-[10px] text-red-650 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{adjustError}</span>
                      </div>
                    )}

                    {adjustSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2 text-[10px] text-emerald-650 font-bold">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>{adjustSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-sky-550/10"
                    >
                      Apply Adjustment
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: User transaction and recharge history */}
              <div className="lg:col-span-7 space-y-6">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  userHistory && (
                    <div className="space-y-6">
                      {/* Recharges log */}
                      <div>
                        <h4 className="text-xs font-black uppercase text-amber-500 tracking-widest mb-3 font-display flex items-center gap-1.5">
                          <History className="w-4 h-4" />
                          <span>Recharges History ({userHistory.recharges.length})</span>
                        </h4>
                        <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-2">
                          {userHistory.recharges.length > 0 ? (
                            userHistory.recharges.map(rec => (
                              <div key={rec._id} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 text-xs hover:border-slate-200">
                                <div>
                                  <p className="font-extrabold text-slate-800">{rec.operator} · ₹{rec.amount}</p>
                                  <p className="text-[10px] text-slate-450 font-bold mt-0.5">Plan: {rec.plan?.split('·')[0] || rec.plan}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
                                    ${rec.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/70'
                                      : rec.status === 'FAILED' ? 'bg-red-50 text-red-600 border border-red-100/70'
                                      : 'bg-blue-50 text-blue-650 border border-blue-100/70'}`}>
                                    {rec.status}
                                  </span>
                                  <p className="text-[9px] text-slate-450 font-bold mt-1">{new Date(rec.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-slate-400 text-xs font-bold py-6">No recharges recorded.</p>
                          )}
                        </div>
                      </div>

                      {/* Wallet transactions log */}
                      <div>
                        <h4 className="text-xs font-black uppercase text-sky-500 tracking-widest mb-3 font-display flex items-center gap-1.5">
                          <Wallet className="w-4 h-4" />
                          <span>Wallet Transactions ({userHistory.transactions.length})</span>
                        </h4>
                        <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-2">
                          {userHistory.transactions.length > 0 ? (
                            userHistory.transactions.map(txn => (
                              <div key={txn._id} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 text-xs hover:border-slate-200">
                                <div>
                                  <p className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px]">{txn.type}</p>
                                  <p className="text-[10px] text-slate-450 mt-0.5 font-bold">{txn.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-black text-xs
                                    ${['TOP_UP', 'CASHBACK', 'REFUND', 'REFERRAL'].includes(txn.type) 
                                      ? 'text-emerald-600' 
                                      : 'text-red-500'}`}>
                                    {['TOP_UP', 'CASHBACK', 'REFUND', 'REFERRAL'].includes(txn.type) ? '+' : '-'}₹{txn.amount}
                                  </p>
                                  <p className="text-[9px] text-slate-450 font-bold mt-1">{new Date(txn.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-slate-400 text-xs font-bold py-6">No wallet activity logged.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
