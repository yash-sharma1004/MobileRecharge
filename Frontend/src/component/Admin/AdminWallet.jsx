import { useState, useEffect } from 'react';
import { Wallet, Search, Landmark, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export default function AdminWallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let query = `/admin/wallet-transactions?page=${page}&limit=10`;
      if (search) query += `&search=${search}`;
      if (type) query += `&type=${type}`;

      const res = await api.get(query);
      setTransactions(res.data);
      setPagination(res.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black font-display tracking-tight text-slate-800">Wallet Audits</h1>
        <p className="text-slate-500 text-xs mt-1">Audit platform cashflows, cashback allocations, and administrative adjustments.</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4 bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-3 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by Transaction ID, User Name, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-650 outline-none cursor-pointer focus:border-slate-400"
        >
          <option value="">All Transaction Types</option>
          <option value="TOP_UP">Top Up</option>
          <option value="RECHARGE">Recharge Payment</option>
          <option value="CASHBACK">Cashback Allocation</option>
          <option value="REFUND">Refund</option>
          <option value="REFERRAL">Referral Bonus</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Filter
        </button>
      </form>

      {/* Transactions table */}
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
                    <th className="py-4 pl-6">Transaction ID</th>
                    <th className="py-4">User Details</th>
                    <th className="py-4">Flow Type</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Purpose / Description</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 pr-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {transactions.length > 0 ? (
                    transactions.map((txn) => (
                      <tr key={txn._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-6">
                          <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">{txn.transactionId}</p>
                        </td>
                        <td className="py-4">
                          <p className="font-extrabold text-slate-850">{txn.userId?.name || 'Platform Admin'}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">+91 {txn.userId?.mobile}</p>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                            ${['TOP_UP', 'CASHBACK', 'REFUND', 'REFERRAL'].includes(txn.type) 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100/70' 
                              : 'bg-red-50 text-red-600 border-red-100/70'}`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className={`py-4 font-black text-sm
                          ${['TOP_UP', 'CASHBACK', 'REFUND', 'REFERRAL'].includes(txn.type) 
                            ? 'text-emerald-650' 
                            : 'text-red-650'}`}>
                          {['TOP_UP', 'CASHBACK', 'REFUND', 'REFERRAL'].includes(txn.type) ? '+' : '-'}₹{txn.amount}
                        </td>
                        <td className="py-4">
                          <p className="font-bold text-slate-800">{txn.purpose}</p>
                          <p className="text-[10px] text-slate-450 font-semibold mt-0.5 leading-snug">{txn.description}</p>
                        </td>
                        <td className="py-4">
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 uppercase">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        </td>
                        <td className="py-4 pr-6 font-semibold text-slate-450">
                          {new Date(txn.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">No wallet transactions logged in database.</td>
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
                    className="px-3.5 py-1.5 border border-slate-200 bg-slate-50 text-slate-650 hover:bg-slate-100 text-[10px] font-black uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="px-3.5 py-1.5 border border-slate-200 bg-slate-50 text-slate-650 hover:bg-slate-100 text-[10px] font-black uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
