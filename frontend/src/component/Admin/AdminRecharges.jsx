import { useState, useEffect } from 'react';
import { 
  RefreshCw, Search, AlertCircle, 
  RotateCcw, CheckCircle, HelpCircle, X, ChevronRight 
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminRecharges() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [operator, setOperator] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Detail dialog
  const [selectedRecharge, setSelectedRecharge] = useState(null);

  const fetchRecharges = async () => {
    try {
      setLoading(true);
      let query = `/admin/recharges?page=${page}&limit=10`;
      if (search) query += `&search=${search}`;
      if (status) query += `&status=${status}`;
      if (operator) query += `&operator=${operator}`;

      const res = await api.get(query);
      setRecharges(res.data);
      setPagination(res.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recharges:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();
  }, [page, status, operator]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecharges();
  };

  const handleRetry = async (id) => {
    if (confirm('Are you sure you want to trigger a manual retry for this failed transaction?')) {
      try {
        setActionLoading(true);
        const res = await api.post(`/admin/recharges/${id}/retry`);
        alert(res.message || 'Retry transaction successfully initiated');
        fetchRecharges();
        setSelectedRecharge(null);
      } catch (error) {
        alert(error.message || 'Retry operation failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRefund = async (id) => {
    if (confirm('Are you sure you want to manually refund this failed transaction to the user wallet?')) {
      try {
        setActionLoading(true);
        const res = await api.post(`/admin/recharges/${id}/refund`);
        alert(res.message || 'Refund successfully processed');
        fetchRecharges();
        setSelectedRecharge(null);
      } catch (error) {
        alert(error.message || 'Refund operation failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black font-display tracking-tight text-slate-800">Recharge Monitor</h1>
        <p className="text-slate-500 text-xs mt-1">Audit mobile, DTH, broadband recharges, and resolve payment failures.</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4 bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-3 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by Mobile, Recharge ID, Transaction ID, Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-650 outline-none cursor-pointer focus:border-slate-400"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="RECHARGE_PROCESSING">Processing</option>
          <option value="RECHARGE_SUCCESS">Success Only</option>
          <option value="RECHARGE_FAILED">Failed Only</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-650 outline-none cursor-pointer focus:border-slate-400"
        >
          <option value="">All Networks</option>
          <option value="Jio">Jio</option>
          <option value="Airtel">Airtel</option>
          <option value="Vi">Vi</option>
          <option value="BSNL">BSNL</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Filter
        </button>
      </form>

      {/* Recharges table */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="py-4 pl-6">Recharge ID</th>
                    <th className="py-4">User</th>
                    <th className="py-4">Network / No</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Status</th>
                    <th className="py-4">Date</th>
                    <th className="py-4 pr-6 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {recharges.length > 0 ? (
                    recharges.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-6">
                          <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">{rec.rechargeId || 'SIMULATING'}</p>
                          <p className="text-[9px] text-slate-450 mt-0.5">{rec.transactionId || 'No Txn ID'}</p>
                        </td>
                        <td className="py-4">
                          <p className="font-extrabold text-slate-850">{rec.userId?.name || 'Self Pay'}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">{rec.userId?.email || 'Walk-in'}</p>
                        </td>
                        <td className="py-4 font-bold">
                          <span className="text-slate-800">{rec.operator}</span>
                          <span className="text-[10px] text-slate-450 mt-0.5 block">+91 {rec.number}</span>
                        </td>
                        <td className="py-4 font-black text-slate-900">₹{rec.amount}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
                            ${rec.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/70'
                              : rec.status === 'FAILED' ? 'bg-red-50 text-red-650 border border-red-100/70'
                              : rec.status === 'REFUNDED' ? 'bg-blue-50 text-blue-650 border border-blue-100/70'
                              : 'bg-amber-50 text-amber-600 border border-amber-100/70 animate-pulse'}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-4 font-semibold text-slate-450">{new Date(rec.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 pr-6 text-center">
                          <button
                            onClick={() => setSelectedRecharge(rec)}
                            className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-900 rounded-xl cursor-pointer transition-all inline-flex items-center"
                            title="Audit lifecycle"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">No recharge transactions found.</td>
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
                    className="px-3.5 py-1.5 border border-slate-200 bg-slate-550 text-slate-600 hover:bg-slate-100 text-[10px] font-black uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="px-3.5 py-1.5 border border-slate-200 bg-slate-550 text-slate-600 hover:bg-slate-100 text-[10px] font-black uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* AUDIT RECHARGE DETAILS MODAL */}
      {selectedRecharge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 max-w-lg w-full text-left relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => setSelectedRecharge(null)}
              className="absolute top-6 right-6 w-9 h-9 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="text-[9px] bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-500 font-extrabold uppercase tracking-widest font-display">Recharge Audit</span>
              <h3 className="text-xl font-black text-slate-800 font-display mt-3 tracking-tight">ID: {selectedRecharge.rechargeId || 'SIMULATING'}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">Transaction Ref: <span className="text-slate-700">{selectedRecharge.transactionId || 'N/A'}</span></p>
            </div>

            {/* Audit Fields */}
            <div className="space-y-4 bg-slate-50/50 border border-slate-200 p-5 rounded-[1.8rem] mb-6 text-xs text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">User Account</span>
                <span className="font-extrabold text-slate-800">{selectedRecharge.userId?.name || 'Self / Direct Pay'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">Mobile number</span>
                <span className="font-extrabold text-slate-800">+91 {selectedRecharge.number}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">Network operator</span>
                <span className="font-extrabold text-slate-800">{selectedRecharge.operator}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">Amount Charged</span>
                <span className="font-black text-slate-900 text-sm">₹{selectedRecharge.amount}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">Plan specifications</span>
                <span className="font-bold text-slate-700">{selectedRecharge.plan}</span>
              </div>
              {selectedRecharge.cashbackEarned > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                  <span className="text-slate-455 font-bold uppercase tracking-wider text-[10px]">Cashback Credited</span>
                  <span className="font-black text-emerald-600">+₹{selectedRecharge.cashbackEarned}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">Lifecycle Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
                  ${selectedRecharge.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/70'
                    : selectedRecharge.status === 'FAILED' ? 'bg-red-50 text-red-650 border border-red-100/70'
                    : selectedRecharge.status === 'REFUNDED' ? 'bg-blue-50 text-blue-650 border border-blue-100/70'
                    : 'bg-amber-50 text-amber-600 border border-amber-100/70 animate-pulse'}`}>
                  {selectedRecharge.status}
                </span>
              </div>

              {selectedRecharge.status === 'FAILED' && selectedRecharge.failureReason && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-2.5 text-[10px] text-red-650 font-bold mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="uppercase text-[9px] font-black text-red-700">Failure Reason</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedRecharge.failureReason}</p>
                  </div>
                </div>
              )}

              {selectedRecharge.status === 'REFUNDED' && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-2.5 text-[10px] text-blue-650 font-bold mt-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="uppercase text-[9px] font-black text-blue-700">Refund Status</p>
                    <p className="font-semibold text-slate-750 mt-0.5">Refund completed to User Wallet balance.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Failure Management Actions Panel */}
            {selectedRecharge.status === 'FAILED' && (
              <div className="p-4.5 bg-slate-50 border border-slate-200 rounded-[1.8rem] space-y-3.5">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest font-display">Failure Management Actions</h4>
                <div className="flex gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleRetry(selectedRecharge._id)}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Txn</span>
                  </button>
                  {selectedRecharge.refundStatus !== 'COMPLETED' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRefund(selectedRecharge._id)}
                      className="flex-1 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Issue Refund</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
