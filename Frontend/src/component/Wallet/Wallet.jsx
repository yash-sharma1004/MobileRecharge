import { useState, useEffect } from "react";
import { useWallet } from "../../context/WalletContext";
import { loadRazorpay } from "../../utils/loadRazorpay";

export default function Wallet() {
  const { 
    walletBalance, 
    walletHistory, 
    createTopUpOrder, 
    verifyTopUpPayment 
  } = useWallet();
  
  const [addAmount, setAddAmount] = useState("");
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState("");
  
  // Payment Modal States
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // 'SUCCESS' | 'FAILED' | null
  const [modalError, setModalError] = useState("");

  // Load Razorpay on mount
  useEffect(() => {
    loadRazorpay();
  }, []);

  const handleCreateOrder = async () => {
    setError("");
    const amt = Number(addAmount);
    
    // Frontend validation
    if (isNaN(amt) || !Number.isInteger(amt)) {
      setError("Decimal amounts are not allowed.");
      return;
    }
    if (amt < 10) {
      setError("Minimum load amount is ₹10.");
      return;
    }
    if (amt > 50000) {
      setError("Maximum load amount is ₹50,000.");
      return;
    }

    try {
      setLoadingOrder(true);
      const res = await createTopUpOrder(amt);
      if (res.success && res.data) {
        setCurrentOrder(res.data);
        setPaymentResult(null);
        setModalError("");
        setProcessing(false);

        // Check if we are using placeholder/mock credentials
        const isMockMode = 
          !import.meta.env.VITE_RAZORPAY_KEY || 
          import.meta.env.VITE_RAZORPAY_KEY.includes('YOUR_KEY_ID');

        if (isMockMode && res.data.orderId.startsWith('order_mock_')) {
          console.log("ℹ️ Placeholder keys detected. Running in mock Razorpay simulator mode.");
          
          // Open our existing premium modal in processing state
          setShowModal(true);
          setProcessing(true);
          setPaymentResult(null);
          setModalError("");

          // Simulate bank payment delay
          setTimeout(async () => {
            try {
              const verifyRes = await verifyTopUpPayment({
                razorpay_order_id: res.data.orderId,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: "mock_signature_approved"
              });

              if (verifyRes.success) {
                setPaymentResult("SUCCESS");
                setAddAmount("");
              } else {
                setPaymentResult("FAILED");
                setModalError(verifyRes.message || "Simulated verification failed.");
              }
            } catch (err) {
              setPaymentResult("FAILED");
              setModalError(err.data?.message || err.message || "Simulated payment verification failed.");
            } finally {
              setProcessing(false);
            }
          }, 1500);

          return;
        }

        // Load Razorpay dynamically
        const sdkLoaded = await loadRazorpay();
        if (!sdkLoaded) {
          setError("Failed to load Razorpay SDK. Please check your network connection.");
          return;
        }

        // Open official Razorpay Checkout popup
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_dummyKeyId",
          amount: res.data.amount * 100, // Amount in paisa
          currency: res.data.currency || "INR",
          name: "MobileRecharge",
          description: "Wallet Top-up",
          order_id: res.data.orderId,
          handler: async function (response) {
            try {
              setShowModal(true);
              setProcessing(true);
              setPaymentResult(null);
              setModalError("");

              // Verify payment with backend signature verification
              const verifyRes = await verifyTopUpPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.success) {
                setPaymentResult("SUCCESS");
                setAddAmount("");
              } else {
                setPaymentResult("FAILED");
                setModalError(verifyRes.message || "Payment signature verification failed.");
              }
            } catch (err) {
              setPaymentResult("FAILED");
              setModalError(err.data?.message || err.message || "Payment verification failed.");
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: "Premium Customer",
            email: "customer@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#4f46e5" // Premium Indigo
          },
          modal: {
            ondismiss: function () {
              console.log("Razorpay popup closed by customer.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setShowModal(true);
          setPaymentResult("FAILED");
          setModalError(response.error.description || "The transaction was declined by the gateway.");
        });
        rzp.open();

      } else {
        setError(res.message || "Failed to initiate payment.");
      }
    } catch (err) {
      setError(err.data?.message || err.message || "Failed to initiate order. Rate limit may apply.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleConfirmPayment = () => {
    // Deprecated for real Razorpay checkout
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentOrder(null);
    setPaymentResult(null);
    setModalError("");
  };

  // Limit transaction list to 20 for UX pagination prep
  const transactionsToShow = walletHistory.slice(0, 20);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans antialiased">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 text-center font-display tracking-tight">My Wallet</h1>
        
        {/* Balance Virtual Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-[2rem] p-8 text-white shadow-2xl mb-8 border border-slate-800/80 overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent opacity-60 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-indigo-300 font-display">OmniPay Premium</p>
              <p className="text-2xl font-black font-display tracking-tight mt-1">Virtual Card</p>
            </div>
            <span className="text-xl opacity-60">📶</span>
          </div>

          {/* Chip */}
          <div className="w-12 h-9 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-lg mb-6 border border-amber-200/50 shadow-inner relative flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-amber-700/20 top-1/3" />
            <div className="absolute w-full h-[1px] bg-amber-700/20 top-2/3" />
            <div className="absolute h-full w-[1px] bg-amber-700/20 left-1/3" />
            <div className="absolute h-full w-[1px] bg-amber-700/20 left-2/3" />
          </div>

          <div className="mb-6">
            <p className="text-[10px] text-indigo-200/60 uppercase tracking-widest font-bold font-display mb-1">Card Number</p>
            <p className="text-xl font-bold tracking-[0.25em] font-display text-slate-100">•••• •••• •••• 9840</p>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] text-indigo-200/60 uppercase tracking-wider font-bold mb-1">Card Holder</p>
              <p className="text-xs font-black tracking-wide font-display text-slate-100 uppercase">PREMIUM CUSTOMER</p>
            </div>
            <div>
              <p className="text-[9px] text-indigo-200/60 uppercase tracking-wider font-bold mb-1">Expires</p>
              <p className="text-xs font-black tracking-wide font-display text-slate-100">12/30</p>
            </div>
          </div>
        </div>

        {/* Balance & deposit Display */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 font-display">Wallet Balance</p>
              <p className="text-4xl font-black text-slate-900 font-display">₹{walletBalance}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm">
              👝
            </div>
          </div>

          {/* Add Money Form */}
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3 font-display">Quick Load Funds</p>
            
            <div className="flex gap-2 mb-4">
              {[100, 500, 1000].map(amt => (
                <button 
                  key={amt} 
                  onClick={() => { setAddAmount(amt.toString()); setError(""); }}
                  className="flex-1 py-2 text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-500/20 text-slate-700 hover:text-indigo-600 font-bold rounded-xl transition-all cursor-pointer"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 flex items-center border border-slate-200 rounded-xl bg-slate-50/50 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-600/10 focus-within:bg-white transition-all px-3">
                <span className="text-slate-500 text-sm font-extrabold">₹</span>
                <input 
                  type="number" 
                  placeholder="Enter amount" 
                  value={addAmount} 
                  onChange={e => { setAddAmount(e.target.value); setError(""); }}
                  className="w-full bg-transparent border-0 outline-none px-2 py-3 text-sm font-bold text-slate-800"
                />
              </div>
              <button 
                onClick={handleCreateOrder} 
                disabled={loadingOrder || !addAmount}
                className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer
                  ${loadingOrder || !addAmount 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/15"}`}
              >
                {loadingOrder ? "Loading…" : "Load"}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-semibold">⚠ {error}</p>}
          </div>
        </div>

        {/* History Section */}
        <h2 className="text-lg font-black text-slate-900 mb-4 font-display tracking-tight">Transaction History</h2>
        
        {transactionsToShow.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-10 text-center text-slate-400 shadow-sm font-semibold">
            <span className="text-3xl block mb-2">📥</span>
            No transactions yet.
          </div>
        ) : (
          <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-xl p-5 space-y-4 relative">
            <div className="absolute left-[38px] top-8 bottom-8 w-[2px] bg-slate-100 z-0 pointer-events-none" />

            {transactionsToShow.map((txn) => {
              const isCredit = ['TOP_UP', 'CASHBACK', 'REFUND', 'REFERRAL'].includes(txn.type);
              
              // Icon mapping
              let icon = '💳';
              if (txn.type === 'CASHBACK') icon = '🎁';
              else if (txn.type === 'RECHARGE') icon = '📱';
              else if (txn.type === 'REFUND') icon = '🔄';
              else if (txn.type === 'REFERRAL') icon = '🤝';

              // Text mapping
              let typeText = 'Transaction';
              if (txn.type === 'TOP_UP') typeText = 'Wallet Top-up';
              else if (txn.type === 'RECHARGE') typeText = 'Recharge Debit';
              else if (txn.type === 'CASHBACK') typeText = 'Cashback Received';
              else if (txn.type === 'REFUND') typeText = 'Wallet Refund';
              else if (txn.type === 'REFERRAL') typeText = 'Referral Bonus';

              return (
                <div 
                  key={txn._id || txn.transactionId} 
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 rounded-2xl transition-all relative z-10 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm border ${
                      isCredit 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                    } group-hover:scale-105 transition-transform`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold text-sm font-display flex items-center gap-2">
                        {typeText}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                          txn.status === 'SUCCESS' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : txn.status === 'FAILED'
                            ? 'bg-red-50 border-red-100 text-red-600'
                            : 'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                          {txn.status}
                        </span>
                      </p>
                      
                      <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                        {new Date(txn.createdAt).toLocaleDateString()} at {new Date(txn.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {txn.paymentMethod && txn.paymentMethod !== 'NONE' && ` • ${txn.paymentMethod}`}
                        {txn.transactionId && ` • ID: ${txn.transactionId}`}
                      </p>
                    </div>
                  </div>
                  <div className={`font-black text-base font-display ${isCredit ? 'text-emerald-500' : 'text-slate-700'}`}>
                    {isCredit ? '+' : '-'}₹{txn.amount}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Gateway Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal header */}
            {!processing && !paymentResult && (
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-display">Select Payment Method</h3>
                  <p className="text-xs text-slate-500 mt-0.5">To load ₹{currentOrder?.amount} in your wallet</p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Processing State */}
            {processing && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
                <h3 className="text-lg font-black text-slate-900 font-display">Processing payment...</h3>
                <p className="text-xs text-slate-500 mt-1">Please do not refresh or close this screen.</p>
              </div>
            )}

            {/* Success State */}
            {!processing && paymentResult === "SUCCESS" && (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
                  ✓
                </div>
                <h3 className="text-xl font-black text-slate-900 font-display">Payment Successful</h3>
                <p className="text-sm text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2 mt-3">
                  ₹{currentOrder?.amount} added successfully
                </p>
                <button
                  onClick={handleCloseModal}
                  className="mt-8 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            )}

            {/* Failed State */}
            {!processing && paymentResult === "FAILED" && (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm text-red-500">
                  ✕
                </div>
                <h3 className="text-xl font-black text-slate-900 font-display">Payment Failed</h3>
                <p className="text-xs text-red-500 mt-2 font-semibold">
                  {modalError || "The transaction was declined by the bank."}
                </p>
                <button
                  onClick={handleCloseModal}
                  className="mt-8 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Close
                </button>
              </div>
            )}

            {/* Checkout Options Form */}
            {!processing && !paymentResult && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {[
                    { id: "UPI", label: "UPI (Google Pay, PhonePe, Paytm)", icon: "📱" },
                    { id: "CARD", label: "Debit/Credit Card", icon: "💳" },
                    { id: "NET_BANKING", label: "Net Banking", icon: "🏦" }
                  ].map((method) => (
                    <label 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                        paymentMethod === method.id 
                          ? "border-indigo-600 bg-indigo-50/30" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{method.icon}</span>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                          {method.label}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id 
                          ? "border-indigo-600 bg-indigo-600" 
                          : "border-slate-300"
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {modalError && <p className="text-red-500 text-xs mt-2 font-semibold text-center">⚠ {modalError}</p>}

                <button
                  onClick={handleConfirmPayment}
                  className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-600/15"
                >
                  Proceed Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
