import { useState } from "react";
import { useHistory } from "../../context/HistoryContext";
import api from "../../utils/api";

export default function History() {
  const { rechargeHistory } = useHistory();
  const [filterOp, setFilterOp] = useState("All");

  const uniqueOperators = ["All", ...new Set(rechargeHistory.map(r => r.operator))];

  const filteredHistory = filterOp === "All" 
    ? rechargeHistory 
    : rechargeHistory.filter(r => r.operator === filterOp);

  const downloadInvoice = (record) => {
    const invoiceContent = `
=================================
       MOBILE RECHARGE INVOICE    
=================================

Transaction ID : ${record.id}
Date           : ${new Date(record.createdAt || record.date).toLocaleString()}
Status         : ${record.status}

---------------------------------
Operator       : ${record.operator}
Mobile Number  : +91 ${record.number}
Plan Details   : ${record.plan}
Payment Method : ${record.payMethod || "N/A"}
---------------------------------

Amount Paid    : ₹${record.amount}

=================================
 Thank you for using our service!
=================================
    `;
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${record.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans antialiased">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 text-center font-display tracking-tight">Recharge History</h1>

        {/* Filter Section */}
        {rechargeHistory.length > 0 && (
          <div className="mb-6 flex justify-end">
            <select 
              value={filterOp}
              onChange={(e) => setFilterOp(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all cursor-pointer shadow-sm"
            >
              {uniqueOperators.map(op => (
                <option key={op} value={op}>{op === "All" ? "All Operators" : op.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center shadow-xl">
            <span className="text-5xl block mb-4">📭</span>
            <p className="text-slate-500 font-extrabold font-display">
              {rechargeHistory.length === 0 ? "No recharges found. Your history is empty!" : `No recharges found for ${filterOp.toUpperCase()}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((record) => (
              <div key={record._id || record.id} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  
                  {/* Left Side: Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl border border-indigo-100/30 group-hover:scale-105 transition-transform shadow-sm">
                      📱
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="font-extrabold text-slate-800 text-sm sm:text-base font-display">
                          <span className="capitalize">{record.operator}</span> · <span className="text-slate-900 font-black">+91 {record.number}</span>
                        </p>
                        <StatusBadge status={record.status} />
                        {record.failureReason && (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-lg font-display">
                            {record.failureReason}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs font-semibold mb-1">{record.plan}</p>
                      <p className="text-slate-400 text-[10px] font-semibold flex flex-wrap items-center gap-1.5">
                        <span>{new Date(record.createdAt || record.date).toLocaleDateString()} at {new Date(record.createdAt || record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="text-slate-200">•</span>
                        <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">ID: {record.transactionId || record.id || record._id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Amount & Actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <p className="font-black text-xl text-slate-900 font-display">₹{record.amount}</p>
                    <div className="flex gap-2">
                      {(record.status === 'FAILED' || record.status === 'REFUNDED') && (
                        <RetryButton rechargeId={record._id || record.id} />
                      )}
                      <button 
                        onClick={() => downloadInvoice(record)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm border border-indigo-100/30"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Invoice
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    PENDING: { color: 'bg-amber-50 border-amber-100/50 text-amber-600', label: 'Pending', dot: 'bg-amber-400' },
    PROCESSING: { color: 'bg-indigo-50 border-indigo-100/50 text-indigo-600', label: 'Processing', dot: 'bg-indigo-500 animate-pulse' },
    SUCCESS: { color: 'bg-emerald-50 border-emerald-100/50 text-emerald-600', label: 'Success', dot: 'bg-emerald-500' },
    FAILED: { color: 'bg-rose-50 border-rose-100/50 text-rose-600', label: 'Failed', dot: 'bg-rose-500' },
    REFUNDED: { color: 'bg-purple-50 border-purple-100/50 text-purple-600', label: 'Refunded', dot: 'bg-purple-500' },
    Success: { color: 'bg-emerald-50 border-emerald-100/50 text-emerald-600', label: 'Success', dot: 'bg-emerald-500' },
  };

  const config = configs[status] || configs.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${config.color} text-[10px] font-extrabold uppercase tracking-wider font-display`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function RetryButton({ rechargeId }) {
  const [loading, setLoading] = useState(false);
  const { refetchHistory } = useHistory();

  const handleRetry = async () => {
    try {
      setLoading(true);
      await api.post(`/recharges/retry/${rechargeId}`);
      alert('Retry initiated successfully!');
      refetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Retry failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRetry}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
    >
      {loading ? 'Retrying…' : 'Retry'}
    </button>
  );
}
