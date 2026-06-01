// Recharge.jsx — VoltTap
// 4-step flow: Operator → Number → Plan → Payment
// Stack: React + Tailwind CSS

import { useState, useEffect, useRef } from "react";
import logo from "../../assets/logo.png";
import { useWallet } from "../../context/WalletContext";
import { useHistory } from "../../context/HistoryContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";
import { loadRazorpay } from "../../utils/loadRazorpay";

// ── Data ──
const operators = [
  { id: "jio", name: "Jio", color: "bg-blue-500", light: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "airtel", name: "Airtel", color: "bg-red-500", light: "bg-red-50 border-red-200 text-red-700" },
  { id: "vi", name: "Vi", color: "bg-violet-500", light: "bg-violet-50 border-violet-200 text-violet-700" },
  { id: "bsnl", name: "BSNL", color: "bg-emerald-600", light: "bg-emerald-50 border-emerald-200 text-emerald-700" },
];

const plans = [
  { id: 1, price: 149, data: "1.5GB/day", calls: "Unlimited", validity: "28 days", validityDays: 28, tag: "Budget" },
  { id: 2, price: 239, data: "2GB/day", calls: "Unlimited", validity: "28 days", validityDays: 28, tag: "Popular" },
  { id: 3, price: 299, data: "2GB/day", calls: "Unlimited", validity: "56 days", validityDays: 56, tag: "Best Value" },
  { id: 4, price: 599, data: "3GB/day", calls: "Unlimited", validity: "84 days", validityDays: 84, tag: "Premium" },
];

const payMethods = [
  { id: "upi", label: "UPI", icon: "💳", desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Debit/Credit Card", icon: "🏧", desc: "Visa, Mastercard, RuPay" },
  { id: "wallet", label: "Wallet", icon: "👝", desc: "Paytm, Amazon Pay, Mobikwik" },
  { id: "nb", label: "Net Banking", icon: "🏦", desc: "All major banks supported" },
];

// ── Operator Auto Detection ──
const operatorPrefixes = {
  jio: ["6", "7"],
  airtel: ["9"],
  vi: ["8"],
  bsnl: ["5"] // mock prefix
};

const detectOperator = (mobile) => {
  const firstDigit = mobile.charAt(0);
  if (operatorPrefixes.jio.includes(firstDigit)) return "jio";
  if (operatorPrefixes.airtel.includes(firstDigit)) return "airtel";
  if (operatorPrefixes.vi.includes(firstDigit)) return "vi";
  if (operatorPrefixes.bsnl.includes(firstDigit)) return "bsnl";
  return null;
};

// Coupons are now loaded dynamically from the backend database

const cashbackRules = {
  type: "random", // "fixed", "percentage", or "random"
  min: 1, // Minimum cashback
  max: 25 // Maximum cashback
};

// ── Personalized Offers Engine ──
const userProfile = {
  isNewUser: true, // Set to true to allow testing the referral code logic
  lastRechargeDate: "2026-05-01",
  rechargeCount: 5
};

const offerRules = {
  newUser: { type: "discount", value: 20, message: "Welcome! Get ₹20 OFF on your first recharge" },
  frequentUser: { type: "cashback", value: 50, message: "Loyal user! Get ₹50 extra cashback on this recharge" },
  inactiveUser: { type: "discount", value: 30, message: "We miss you! Get ₹30 OFF" }
};

const getPersonalizedOffer = (profile) => {
  if (profile.isNewUser) return offerRules.newUser;
  
  const daysSince = Math.floor((new Date() - new Date(profile.lastRechargeDate)) / (1000 * 60 * 60 * 24));
  if (daysSince > 30) return offerRules.inactiveUser;
  if (profile.rechargeCount > 3) return offerRules.frequentUser;
  
  return null;
};

// ── Smart Suggestion Logic ──
const userHistory = [
  { amount: 239 },
  { amount: 239 },
  { amount: 149 }
];

const getSmartSuggestion = (plansList, history) => {
  if (!history || history.length === 0) return null;
  
  const frequencies = history.reduce((acc, curr) => {
    acc[curr.amount] = (acc[curr.amount] || 0) + 1;
    return acc;
  }, {});
  
  let mostFreqAmount = 0;
  let maxFreq = 0;
  for (const [amount, freq] of Object.entries(frequencies)) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mostFreqAmount = Number(amount);
    }
  }

  // Suggest a plan slightly higher (+₹10 to +₹100) or just the Best Value one
  const suggestion = plansList.find(p => p.price > mostFreqAmount && p.price <= mostFreqAmount + 100);
  
  if (suggestion) {
    return {
      recommended: suggestion,
      reason: `You usually recharge ₹${mostFreqAmount}. Here’s a better ₹${suggestion.price} plan with more benefits.`
    };
  }
  return null;
};

// ── Step Dots ──
function Steps({ current }) {
  const labels = ["Operator", "Number", "Plan", "Payment"];
  return (
    <div className="flex items-center justify-center gap-1 mb-10 font-display">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
              ${current > i + 1 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : current === i + 1 ? "bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 shadow-lg shadow-indigo-600/20"
                  : "bg-slate-200 text-slate-500"}`}>
              {current > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] font-bold hidden sm:block ${current >= i + 1 ? "text-indigo-600 font-extrabold" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className={`w-8 sm:w-16 h-[3px] mb-4 sm:mb-5 rounded-full transition-all duration-300 ${current > i + 1 ? "bg-indigo-600" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──
export default function Recharge() {
  const [step, setStep] = useState(1);
  const [operator, setOp] = useState(null);
  const [number, setNumber] = useState("");
  const [numErr, setNumErr] = useState("");
  const [plan, setPlan] = useState(null);
  
  // Auto-Detection State Control
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [payMethod, setPay] = useState("upi");

  // UPI state
  const [upiId, setUpiId] = useState("");
  const [upiErr, setUpiErr] = useState("");

  // Card state
  const [card, setCard] = useState({ num: "", name: "", expiry: "", cvv: "" });
  const [cardErr, setCardErr] = useState({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [coupons, setCoupons] = useState([]);

  // Referral state
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [appliedReferralCode, setAppliedReferralCode] = useState(null);
  const [referralError, setReferralError] = useState("");

  // Cashback state
  const [cashbackAmount, setCashbackAmount] = useState(0);
  const { 
    walletBalance: globalWalletBalance, 
    createTopUpOrder,
    verifyTopUpPayment,
    refetchWallet
  } = useWallet();
  const { addRechargeRecord, rechargeHistory } = useHistory();
  const [cashbackMessage, setCashbackMessage] = useState("");
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  // Expiry Reminder state
  const [expiryDate, setExpiryDate] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);
  
  // Quick Recharge state
  const [lastRechargeData, setLastRechargeData] = useState(null);

  // Fetch expiry, last recharge, and coupons from backend API
  useEffect(() => {
    const fetchRechargeData = async () => {
      try {
        // Fetch plan expiry
        const expiryRes = await api.get('/recharges/expiry');
        if (expiryRes.data) {
          setExpiryDate(expiryRes.data.expiryDate);
          setDaysLeft(expiryRes.data.daysLeft);
        }

        // Fetch last recharge for quick recharge
        const lastRes = await api.get('/recharges/last');
        if (lastRes.data) {
          setLastRechargeData({
            mobile: lastRes.data.number,
            operator: lastRes.data.operator?.toLowerCase(),
            plan: lastRes.data.planData || { price: lastRes.data.amount, data: lastRes.data.plan }
          });
        }
      } catch (err) {
        // Silently fail — user may not have any recharges yet
      }
    };

    const fetchCoupons = async () => {
      try {
        const res = await api.get('/recharges/coupons');
        setCoupons(res.data || []);
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
      }
    };

    fetchRechargeData();
    fetchCoupons();
  }, []);

  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [liveStatus, setLiveStatus] = useState("RECHARGE_PROCESSING");
  const [liveMessage, setLiveMessage] = useState("Submitting recharge to operator…");
  const pendingRechargeId = useRef(null);
  const socket = useSocket();

  const handleRechargeNowClick = () => {
    if (rechargeHistory && rechargeHistory.length > 0) {
      const lastRecharge = rechargeHistory[0];
      const opObj = operators.find(o => o.name === lastRecharge.operator);
      if (opObj) setOp(opObj.id);
      setNumber(lastRecharge.number);
      setStep(3); // Skip directly to plan selection
    } else {
      setStep(1);
    }
  };

  const op = operators.find(o => o.id === operator);

  const suggestedData = getSmartSuggestion(plans, userHistory);
  const suggestedPlan = suggestedData?.recommended;

  const activeOffer = getPersonalizedOffer(userProfile);

  const discountAmount = appliedCoupon ? (appliedCoupon.type === 'percentage' ? (plan?.price * appliedCoupon.discount / 100) : appliedCoupon.discount) : 0;
  
  // Conflict Handling: Apply offer discount only if no coupon is explicitly applied
  const offerDiscount = (!appliedCoupon && activeOffer?.type === "discount") ? activeOffer.value : 0;
  
  const referralDiscount = appliedReferralCode ? 50 : 0;

  const baseFinalAmount = plan ? Math.max(0, plan.price - discountAmount - offerDiscount - referralDiscount) : 0;
  const walletUsedAmount = (payMethod === 'wallet' && useWalletBalance) ? Math.min(globalWalletBalance, baseFinalAmount) : 0;
  const finalAmount = payMethod === 'wallet' ? baseFinalAmount - walletUsedAmount : baseFinalAmount;

  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code");
      return;
    }
    const found = coupons.find(c => c.code === couponCode.toUpperCase());
    if (!found) {
      setCouponError("Invalid coupon code");
      return;
    }
    if (plan?.price < found.minAmount) {
      setCouponError(`Minimum recharge of ₹${found.minAmount} required`);
      return;
    }
    if (new Date() > new Date(found.expiry)) {
      setCouponError("Coupon has expired");
      return;
    }
    setAppliedCoupon(found);
    setCouponCode("");
  };

  const handleApplyReferral = () => {
    setReferralError("");
    if (!referralCodeInput.trim()) {
      setReferralError("Enter a referral code");
      return;
    }
    
    // Only new users can use referral codes
    if (!userProfile.isNewUser) {
      setReferralError("Referral codes are only valid for new users.");
      return;
    }

    // Mock valid referral code logic
    if (referralCodeInput.toUpperCase() === "YASH2026") {
      setAppliedReferralCode(referralCodeInput.toUpperCase());
      setReferralCodeInput("");
    } else {
      setReferralError("Invalid referral code");
    }
  };

  // ── Validate Payment ──
  const validatePayment = () => {
    if (payMethod === "upi") {
      if (!upiId.includes("@")) { setUpiErr("Enter a valid UPI ID (e.g. name@upi)"); return false; }
      setUpiErr("");
    }
    if (payMethod === "card") {
      const e = {};
      if (card.num.replace(/\s/g, "").length < 16) e.num = "Enter valid 16-digit card number";
      if (!card.name.trim()) e.name = "Enter cardholder name";
      if (card.expiry.length < 5) e.expiry = "Enter valid expiry (MM/YY)";
      if (card.cvv.length < 3) e.cvv = "Enter valid CVV";
      if (Object.keys(e).length) { setCardErr(e); return false; }
      setCardErr({});
    }
    return true;
  };

  const calculateCashback = (amount) => {
    if (!amount) return 0;
    
    // If a coupon code is applied, restrict cashback to 2-5 rupees
    if (appliedCoupon) {
      return Math.floor(Math.random() * 4) + 2;
    }

    let cb = 0;
    if (cashbackRules.type === "percentage") {
      cb = (amount * cashbackRules.value) / 100;
    } else if (cashbackRules.type === "fixed") {
      cb = cashbackRules.value;
    } else if (cashbackRules.type === "random") {
      cb = Math.floor(Math.random() * (cashbackRules.max - cashbackRules.min + 1)) + cashbackRules.min;
    }
    
    let totalCb = Math.round(cb);
    if (cashbackRules.maxCashback) {
      totalCb = Math.min(totalCb, cashbackRules.maxCashback);
    }
    
    // Add Personalized Cashback if applicable
    if (activeOffer?.type === "cashback") {
      totalCb += activeOffer.value;
    }
    
    // Manage overall calculation: Force the final overall cashback strictly into the 20-25 range
    if (totalCb > 25) {
      // If it exceeds 25, cap it with a dynamic random value between 20 and 25
      totalCb = Math.floor(Math.random() * 6) + 20; 
    } else if (totalCb < 20) {
      // Boost it to ensure a minimum of 20
      totalCb = Math.floor(Math.random() * 6) + 20;
    }
    
    return totalCb;
  };

  const handlePay = async () => {
    if (!validatePayment()) return;
    setProcessing(true);

    try {
      const isWallet = payMethod === 'wallet';

      if (isWallet) {
        let finalWalletUsedAmount = walletUsedAmount;
        let finalUseWallet = useWalletBalance;

        // If there is a remaining balance to be paid via Razorpay (top-up first)
        if (finalAmount > 0) {
          const sdkLoaded = await loadRazorpay();
          if (!sdkLoaded) {
            setProcessing(false);
            alert("Failed to load Razorpay SDK. Please check your internet connection.");
            return;
          }

          const orderRes = await createTopUpOrder(finalAmount);
          if (!orderRes.success || !orderRes.data) {
            throw new Error(orderRes.message || "Failed to create payment order.");
          }

          const order = orderRes.data;
          const isMockMode = 
            !import.meta.env.VITE_RAZORPAY_KEY || 
            import.meta.env.VITE_RAZORPAY_KEY.includes('YOUR_KEY_ID');

          let paymentPromise;
          if (isMockMode && order.orderId.startsWith('order_mock_')) {
            console.log("ℹ️ Placeholder keys detected. Running in mock Razorpay simulator mode.");
            paymentPromise = (async () => {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              return await verifyTopUpPayment({
                razorpay_order_id: order.orderId,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: "mock_signature_approved"
              });
            })();
          } else {
            paymentPromise = new Promise((resolve, reject) => {
              const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_dummyKeyId",
                amount: order.amount * 100,
                currency: order.currency || "INR",
                name: "VoltTap",
                description: `Wallet Top-Up for Recharge (+91 ${number})`,
                order_id: order.orderId,
                handler: async function (response) {
                  try {
                    const verifyRes = await verifyTopUpPayment({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature
                    });
                    if (verifyRes.success) {
                      resolve(verifyRes);
                    } else {
                      reject(new Error(verifyRes.message || "Signature verification failed."));
                    }
                  } catch (err) {
                    reject(err);
                  }
                },
                prefill: { name: "Premium Customer", email: "customer@example.com", contact: number },
                theme: { color: "#4f46e5" },
                modal: { ondismiss: function () { reject(new Error("Payment cancelled by user.")); } }
              };
              const rzp = new window.Razorpay(options);
              rzp.on("payment.failed", function (response) { reject(new Error(response.error.description || "Payment failed.")); });
              rzp.open();
            });
          }

          await paymentPromise;
          finalWalletUsedAmount = baseFinalAmount;
          finalUseWallet = true;
        }

        // Post Wallet Recharge
        const result = await api.post('/recharges', {
          operator: op?.name,
          number: number,
          amount: plan?.price,
          plan: `${plan?.data} · ${plan?.validity}`,
          planData: plan ? {
            price: plan.price,
            data: plan.data,
            calls: plan.calls,
            validity: plan.validity,
            validityDays: plan.validityDays,
            tag: plan.tag
          } : undefined,
          payMethod: 'Wallet',
          couponCode: appliedCoupon?.code || undefined,
          referralCode: appliedReferralCode || undefined,
          useWallet: finalUseWallet,
          walletAmountUsed: finalWalletUsedAmount
        });

        const { recharge } = result.data;
        pendingRechargeId.current = recharge.id;
        setLiveStatus(recharge.status || "RECHARGE_PROCESSING");
        setLiveMessage(result.message || "Recharge processing with operator…");

        await refetchWallet();

        addRechargeRecord({
          _id: recharge.id,
          id: recharge.transactionId,
          operator: recharge.operator,
          number: recharge.number,
          amount: recharge.amount,
          plan: recharge.plan,
          createdAt: recharge.date,
          status: recharge.status,
          providerResponse: recharge.providerResponse
        });
      } else {
        // Direct External Recharge Payment (UPI, Card, Net Banking)
        const initRes = await api.post('/recharges', {
          operator: op?.name,
          number: number,
          amount: plan?.price,
          plan: `${plan?.data} · ${plan?.validity}`,
          planData: plan ? {
            price: plan.price,
            data: plan.data,
            calls: plan.calls,
            validity: plan.validity,
            validityDays: plan.validityDays,
            tag: plan.tag
          } : undefined,
          payMethod: payMethods.find(p => p.id === payMethod)?.label || 'UPI',
          couponCode: appliedCoupon?.code || undefined,
          referralCode: appliedReferralCode || undefined,
          useWallet: false,
          walletAmountUsed: 0
        });

        if (!initRes.success || !initRes.data || !initRes.data.isExternalPayment) {
          throw new Error(initRes.message || "Failed to initiate external recharge payment.");
        }

        const { order, recharge: pendingRecharge } = initRes.data;

        // Open Razorpay Checkout for direct payment
        const sdkLoaded = await loadRazorpay();
        if (!sdkLoaded) {
          setProcessing(false);
          alert("Failed to load Razorpay SDK. Please check your internet connection.");
          return;
        }

        const isMockMode = 
          !import.meta.env.VITE_RAZORPAY_KEY || 
          import.meta.env.VITE_RAZORPAY_KEY.includes('YOUR_KEY_ID');

        let verifyRes;
        if (isMockMode && order.orderId.startsWith('order_mock_')) {
          console.log("ℹ️ Placeholder keys detected. Running in mock Razorpay simulator mode for direct recharge.");
          await new Promise((resolve) => setTimeout(resolve, 1500));
          verifyRes = await api.post('/payment/verify-recharge', {
            razorpay_order_id: order.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_signature_approved"
          });
        } else {
          verifyRes = await new Promise((resolve, reject) => {
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_dummyKeyId",
              amount: order.amount * 100,
              currency: order.currency || "INR",
              name: "VoltTap",
              description: `Direct Recharge Payment (+91 ${number})`,
              order_id: order.orderId,
              handler: async function (response) {
                try {
                  const res = await api.post('/payment/verify-recharge', {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  });
                  resolve(res);
                } catch (err) {
                  reject(err);
                }
              },
              prefill: { name: "Premium Customer", email: "customer@example.com", contact: number },
              theme: { color: "#4f46e5" },
              modal: { ondismiss: function () { reject(new Error("Payment cancelled by user.")); } }
            };
            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) { reject(new Error(response.error.description || "Payment failed.")); });
            rzp.open();
          });
        }

        if (!verifyRes.success || !verifyRes.data) {
          throw new Error(verifyRes.message || "Payment signature verification failed.");
        }

        const { recharge: finalRecharge } = verifyRes.data;

        pendingRechargeId.current = finalRecharge._id || finalRecharge.id;
        setLiveStatus(finalRecharge.status || "RECHARGE_PROCESSING");
        setLiveMessage(verifyRes.message || "Recharge processing with operator…");

        // Do NOT call refetchWallet() because direct payment doesn't modify user wallet balance!
        
        addRechargeRecord({
          _id: finalRecharge._id || finalRecharge.id,
          id: finalRecharge.transactionId,
          operator: finalRecharge.operator,
          number: finalRecharge.number,
          amount: finalRecharge.amount,
          plan: finalRecharge.plan,
          createdAt: finalRecharge.createdAt || finalRecharge.date,
          status: finalRecharge.status,
          providerResponse: finalRecharge.providerResponse
        });
      }

      setLastRechargeData({
        mobile: number,
        operator: operator,
        plan: plan
      });

      setProcessing(false);
      setDone(true);
    } catch (err) {
      console.error('Recharge failed:', err);
      setProcessing(false);
      alert(err.data?.message || err.message || 'Recharge failed. Please try again.');
    }
  };

  useEffect(() => {
    if (!socket || !done) return;

    const onStatus = (update) => {
      if (
        pendingRechargeId.current &&
        update.rechargeId?.toString() !== pendingRechargeId.current?.toString()
      ) {
        return;
      }
      setLiveStatus(update.status);
      if (update.message) setLiveMessage(update.message);
      if (update.reason || update.failureReason) {
        setLiveMessage(update.reason || update.failureReason);
      }
      if (update.status === "RECHARGE_SUCCESS" || update.status === "SUCCESS") {
        if (update.cashback > 0) {
          setCashbackAmount(update.cashback);
          setCashbackMessage(`₹${update.cashback} cashback credited to wallet`);
          refetchWallet();
        }
        if (plan?.validityDays) {
          setExpiryDate(new Date(Date.now() + plan.validityDays * 86400000).toISOString());
          setDaysLeft(plan.validityDays);
        }
      }
      if (update.status === "REFUNDED" || update.status === "RECHARGE_FAILED") {
        refetchWallet();
      }
    };

    socket.on("recharge_status", onStatus);
    return () => socket.off("recharge_status", onStatus);
  }, [socket, done, plan, refetchWallet]);

  const reset = () => {
    setStep(1); setOp(null); setNumber(""); setPlan(null);
    setPay("upi"); setUpiId(""); setCard({ num: "", name: "", expiry: "", cvv: "" });
    setCouponCode(""); setAppliedCoupon(null); setCouponError("");
    setCashbackAmount(0); setCashbackMessage("");
    setDone(false);
    setLiveStatus("RECHARGE_PROCESSING");
    setLiveMessage("");
    pendingRechargeId.current = null;
  };

  const isProcessingLive = [
    "RECHARGE_PROCESSING",
    "PAYMENT_PENDING",
    "PAYMENT_SUCCESS",
    "REFUND_PROCESSING",
    "PROCESSING",
    "PENDING"
  ].includes(liveStatus);

  const isSuccessLive = liveStatus === "RECHARGE_SUCCESS" || liveStatus === "SUCCESS";
  const isFailedLive = liveStatus === "RECHARGE_FAILED" || liveStatus === "FAILED";
  const isRefundedLive = liveStatus === "REFUNDED";

  // Card number formatter: adds space every 4 digits
  const formatCard = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  // Expiry formatter: MM/YY
  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  // ── Success Screen ──
  if (done) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-sm w-full text-center">
        <div className={`text-5xl mb-4 ${isProcessingLive ? "animate-pulse" : ""}`}>
          {isSuccessLive ? "✅" : isRefundedLive ? "↩️" : isFailedLive ? "❌" : "⏳"}
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {isSuccessLive
            ? "Recharge Successful!"
            : isFailedLive
              ? "Recharge Failed"
              : isRefundedLive
                ? "Refund Completed"
                : "Recharge In Progress"}
        </h2>
        <p className="text-slate-400 text-sm mb-1">
          +91 {number} · {op?.name || "Operator"}
        </p>
        <p className="text-sky-600 font-extrabold text-3xl my-4">₹{finalAmount}</p>
        <p className="text-slate-400 text-xs mb-2">{plan?.data} · {plan?.validity}</p>
        
        <div className={`rounded-xl p-4 mb-6 text-left flex items-start gap-3 border ${
          isSuccessLive
            ? "bg-emerald-50 border-emerald-100"
            : isFailedLive || isRefundedLive
              ? "bg-rose-50 border-rose-100"
              : "bg-indigo-50 border-indigo-100"
        }`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0">
            {isProcessingLive && (
              <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin block" />
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800">
              {liveStatus.replace(/_/g, " ")}
            </p>
            <p className="text-[11px] text-slate-600 mt-1">{liveMessage}</p>
            {cashbackMessage && isSuccessLive && (
              <p className="text-[11px] text-emerald-700 mt-1 font-semibold">{cashbackMessage}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => window.location.href = '/history'}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95">
            Track Status in History
          </button>
          <button onClick={reset}
            className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm transition-all hover:bg-slate-50">
            Recharge Another Number
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-20 items-center justify-center px-4">
      <div className="max-w-xl mx-auto">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img 
            src={logo} 
            alt="VoltTap Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* ── Expiry Reminder UI ── */}
        {daysLeft !== null && daysLeft <= 3 && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between border shadow-sm ${daysLeft <= 0 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{daysLeft <= 0 ? "⚠️" : "⏳"}</span>
              <div>
                <p className={`font-bold text-sm ${daysLeft <= 0 ? "text-red-800" : "text-amber-800"}`}>
                  {daysLeft <= 0 ? "Your plan has expired. Recharge now" : `Your plan expires in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}.`}
                </p>
                {daysLeft > 0 && (
                  <p className="text-xs mt-0.5 text-amber-700">Recharge now & get ₹20 cashback</p>
                )}
              </div>
            </div>
            <button onClick={handleRechargeNowClick} className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-all ${daysLeft <= 0 ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"}`}>
              Recharge Now
            </button>
          </div>
        )}

        {/* Steps */}
        <Steps current={step} />

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl p-8 sm:p-10">

          {/* ── Quick Recharge (1-Click UX) ── */}
          {lastRechargeData && step === 1 && (
            <div className="mb-8 border border-indigo-100 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="bg-indigo-50/50 px-4 py-2.5 border-b border-indigo-100/50 flex items-center gap-2">
                <span className="text-indigo-600">⚡</span>
                <span className="font-extrabold text-xs text-indigo-800 uppercase tracking-wider font-display">Quick Recharge</span>
              </div>
              <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-black text-slate-800 text-lg font-display">+91 {lastRechargeData.mobile}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                    {operators.find(o => o.id === lastRechargeData.operator)?.name} · {lastRechargeData.plan?.data} · <span className="text-indigo-600 font-black">₹{lastRechargeData.plan?.price}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setOp(lastRechargeData.operator);
                      setNumber(lastRechargeData.mobile);
                      setStep(3);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Modify Plan
                  </button>
                  <button 
                    onClick={() => {
                      setOp(lastRechargeData.operator);
                      setNumber(lastRechargeData.mobile);
                      setPlan(lastRechargeData.plan);
                      setStep(4);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1 justify-center cursor-pointer"
                  >
                    <span>⚡</span> Volt Tap
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Operator ── */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1 font-display tracking-tight">Select Operator</h2>
              <p className="text-slate-500 text-sm mb-6">Which network do you want to recharge?</p>
              <div className="grid grid-cols-2 gap-3.5 mb-6">
                {operators.map(op => (
                  <button key={op.id} onClick={() => { 
                    setOp(op.id); 
                    setStep(2); 
                  }}
                    className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-indigo-500/30 hover:bg-indigo-50/20 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer text-left">
                    <div className={`w-10 h-10 ${op.color} rounded-xl flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform shadow-sm`}>
                      {op.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-slate-700 font-bold text-sm font-display">{op.name}</span>
                  </button>
                ))}
              </div>

              {/* ── Recent Recharges ── */}
              <div className="border-t border-slate-100 pt-5">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 font-display">Recent Recharges</p>
                <div className="space-y-2">
                  {[
                    { num: "9876543210", op: "jio", plan: "₹239 · 28 days", color: "bg-blue-500" },
                    { num: "9123456789", op: "airtel", plan: "₹299 · 56 days", color: "bg-red-500" },
                    { num: "8800001234", op: "vi", plan: "₹149 · 28 days", color: "bg-violet-500" },
                  ].map(r => (
                    <button key={r.num}
                      onClick={() => { setOp(r.op); setNumber(r.num); setStep(3); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200/50 border border-slate-200/60 transition-all duration-200 group cursor-pointer"
                    >
                      <div className={`w-8 h-8 ${r.color} rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-sm`}>
                        {r.op.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-slate-900 font-bold text-xs font-display">+91 {r.num}</p>
                        <p className="text-slate-500 text-[11px] font-medium">{r.plan}</p>
                      </div>
                      <span className="text-slate-300 group-hover:text-indigo-500 text-sm font-bold transition-colors">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Number ── */}
          {step === 2 && (
            <div>
              <div className={`inline-flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-bold mb-5 ${op?.light}`}>
                <span className={`w-2 h-2 rounded-full ${op?.color}`} />{op?.name}
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1 font-display tracking-tight">Enter Mobile Number</h2>
              <p className="text-slate-500 text-sm mb-6">Enter a 10-digit Indian mobile number</p>
              <div className={`flex items-center border rounded-2xl mb-1.5 transition-all bg-slate-50/50 ${numErr ? "border-red-300" : "border-slate-200 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-600/10 focus-within:bg-white"}`}>
                <span className="pl-4 pr-3 py-4 text-slate-700 font-extrabold text-sm border-r border-slate-200">+91</span>
                <input type="tel" maxLength={10} placeholder="9876543210" value={number}
                  onChange={e => { 
                    const val = e.target.value.replace(/\D/g, "");
                    setNumber(val); 
                    setNumErr(""); 
                    
                    // Trigger Auto Detection
                    if (val.length >= 10 && !manualOverride) {
                      const detected = detectOperator(val);
                      if (detected) {
                        setOp(detected);
                        setIsAutoDetected(true);
                      } else {
                        setIsAutoDetected(false);
                      }
                    } else if (val.length < 10) {
                      setIsAutoDetected(false);
                    }
                  }}
                  className="flex-1 px-4 py-4 text-slate-800 font-black text-base bg-transparent outline-none tracking-widest" />
                {number.length === 10 && <span className="pr-4 text-emerald-500 text-xl font-bold">✓</span>}
              </div>
              
              {/* Detection UI Feedback */}
              {number.length >= 10 && !manualOverride && isAutoDetected && (
                <p className="text-emerald-600 text-xs mb-3 font-bold bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-1.5 w-fit">⚡ Operator detected: <span className="font-black">{operators.find(o => o.id === operator)?.name}</span></p>
              )}
              {number.length >= 10 && !manualOverride && !isAutoDetected && (
                <p className="text-amber-600 text-xs mb-3 font-bold bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-1.5 w-fit">⚠ Could not detect operator. Please select manually.</p>
              )}
              
              {numErr && <p className="text-red-500 text-xs mb-3 font-semibold">⚠ {numErr}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">← Back</button>
                <button onClick={() => {
                  if (!/^[6-9]\d{9}$/.test(number)) { setNumErr("Enter a valid 10-digit number."); return; }
                  setStep(3);
                }} className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer">
                  View Plans →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Plan ── */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1 font-display tracking-tight">Choose a Plan</h2>
              <p className="text-slate-500 text-sm mb-6">For <span className="font-bold text-slate-700">+91 {number}</span> · {op?.name}</p>
              
              {/* ── Personalized Offer Banner ── */}
              {activeOffer && (
                <div className="mb-6 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
                  <span className="text-2xl animate-bounce">🎉</span>
                  <p className="text-emerald-800 font-extrabold text-sm tracking-wide font-display">{activeOffer.message}</p>
                </div>
              )}

              {/* Suggestion UI */}
              {suggestedData && (
                <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
                  <span className="text-indigo-600 text-xl">💡</span>
                  <div>
                    <p className="text-indigo-900 font-black text-sm mb-1 font-display">Smart Suggestion</p>
                    <p className="text-indigo-950/80 text-xs font-semibold leading-relaxed">{suggestedData.reason}</p>
                    <button 
                      onClick={() => setPlan(suggestedPlan)}
                      className="mt-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      Select ₹{suggestedPlan.price} Plan
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {plans.map(p => {
                  const isSuggested = suggestedPlan?.id === p.id;
                  return (
                  <div key={p.id} onClick={() => setPlan(p)}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden
                      ${plan?.id === p.id 
                        ? "border-indigo-600 bg-indigo-50/30 shadow-md shadow-indigo-600/5" 
                        : isSuggested 
                          ? "border-amber-300 bg-amber-50/20 hover:border-amber-400" 
                          : "border-slate-200 hover:border-indigo-500/20"}`}>
                    
                    {isSuggested && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl tracking-wider z-10 font-display">
                        RECOMMENDED
                      </div>
                    )}
                    <div className="flex items-center gap-4 relative z-20">
                      <span className={`text-2xl font-black font-display ${plan?.id === p.id ? "text-indigo-600" : "text-slate-900"}`}>₹{p.price}</span>
                      <div>
                        <p className="text-slate-800 font-black text-sm font-display">{p.data} · {p.validity}</p>
                        <p className="text-slate-500 text-xs font-semibold">{p.calls} calls</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider font-display">{p.tag}</span>
                      {plan?.id === p.id && (
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm shadow-indigo-600/20">
                          <svg viewBox="0 0 8 6" fill="none" stroke="white" strokeWidth={2.5} className="w-2.5 h-2">
                            <polyline points="1 3 3 5 7 1" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">← Back</button>
                <button disabled={!plan} onClick={() => setStep(4)}
                  className={`flex-1 py-3.5 rounded-2xl font-extrabold text-sm transition-all cursor-pointer
                    ${plan ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01] active:scale-95 shadow-md shadow-indigo-600/10" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                  {plan ? `Continue to Payment · ₹${plan.price}` : "Select a plan"}
                </button> 
              </div>
            </div>
          )}

          {/* ── STEP 4: Payment ── */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1 font-display tracking-tight">Payment</h2>
              <p className="text-slate-500 text-sm mb-6">Pay ₹{finalAmount} for {op?.name} recharge</p>

              {/* Order summary strip */}
              <div className={`flex items-center justify-between p-5 rounded-2xl border mb-6 ${op?.light} border-slate-200/40 shadow-sm`}>
                <div>
                  <p className="font-extrabold text-sm text-slate-800 font-display">{op?.name} · +91 {number}</p>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">{plan?.data} · {plan?.validity}</p>
                </div>
                <div className="text-right">
                  {appliedCoupon ? (
                    <>
                      <p className="text-slate-500 line-through text-xs mb-0.5 font-bold">₹{plan?.price}</p>
                      <span className="text-indigo-600 font-black text-2xl font-display">₹{baseFinalAmount}</span>
                    </>
                  ) : (
                    <span className="text-indigo-600 font-black text-2xl font-display">₹{plan?.price}</span>
                  )}
                </div>
              </div>

              {/* Wallet Usage Toggle */}
              {payMethod === 'wallet' && globalWalletBalance > 0 && (
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-4 mb-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👝</span>
                    <div>
                      <p className="text-slate-800 text-sm font-black font-display">Use Wallet Balance</p>
                      <p className="text-slate-500 text-xs font-semibold">Available: ₹{globalWalletBalance}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={useWalletBalance} onChange={(e) => setUseWalletBalance(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}

              {/* Payment Summary */}
              {useWalletBalance && walletUsedAmount > 0 && (
                <div className="mb-6 p-5 border border-slate-200 rounded-2xl bg-slate-50/50 shadow-inner">
                  <div className="flex justify-between text-sm mb-2.5 text-slate-600 font-semibold">
                    <span>Recharge Amount</span>
                    <span>₹{baseFinalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2.5 text-emerald-600 font-bold">
                    <span>Wallet Used</span>
                    <span>-₹{walletUsedAmount}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2.5 border-t border-slate-200 font-display">
                    <span>Payable Amount</span>
                    <span>₹{finalAmount}</span>
                  </div>
                </div>
              )}

              {/* Coupon Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Enter Coupon Code" value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${couponError ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white"}`} />
                      <button onClick={handleApplyCoupon}
                        className="px-6 py-3 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all font-display uppercase tracking-wider cursor-pointer">
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1.5 px-1 font-semibold">⚠ {couponError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="text-emerald-500 text-xl">🏷️</span>
                      <div>
                        <p className="text-emerald-800 text-xs font-black uppercase font-display">{appliedCoupon.code} applied!</p>
                        <p className="text-emerald-600 text-[10px] font-bold">You saved ₹{appliedCoupon.type === 'percentage' ? (plan?.price * appliedCoupon.discount / 100) : appliedCoupon.discount}</p>
                      </div>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponError(""); }} className="text-emerald-700 hover:text-emerald-900 text-xs font-extrabold underline cursor-pointer">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Referral Code Section */}
              <div className="mb-6">
                {!appliedReferralCode ? (
                  <div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Enter Referral Code" value={referralCodeInput}
                        onChange={e => { setReferralCodeInput(e.target.value.toUpperCase()); setReferralError(""); }}
                        className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${referralError ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white"}`} />
                      <button onClick={handleApplyReferral}
                        className="px-6 py-3 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-display uppercase tracking-wider cursor-pointer">
                        Apply
                      </button>
                    </div>
                    {referralError && <p className="text-red-500 text-xs mt-1.5 px-1 font-semibold">⚠ {referralError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/15 rounded-2xl px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="text-indigo-500 text-xl">🤝</span>
                      <div>
                        <p className="text-indigo-800 text-xs font-black uppercase font-display">{appliedReferralCode} applied!</p>
                        <p className="text-indigo-600 text-[10px] font-bold">You saved ₹50 instantly</p>
                      </div>
                    </div>
                    <button onClick={() => { setAppliedReferralCode(null); setReferralError(""); }} className="text-indigo-700 hover:text-indigo-900 text-xs font-extrabold underline cursor-pointer">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Payment method tabs */}
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 font-display">Choose Payment Method</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {payMethods.map(m => (
                  <button key={m.id} onClick={() => { setPay(m.id); setUpiErr(""); setCardErr({}); }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left
                      ${payMethod === m.id 
                        ? "border-indigo-600 bg-indigo-50/30 shadow-sm" 
                        : "border-slate-200 hover:border-indigo-500/20 hover:bg-indigo-50/10"}`}>
                    <span className="text-2xl">{m.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-black truncate font-display ${payMethod === m.id ? "text-indigo-700" : "text-slate-700"}`}>{m.label}</p>
                      <p className="text-[10px] text-slate-500 truncate font-semibold">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* ── UPI Input ── */}
              {payMethod === "upi" && (
                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest font-display">UPI ID</label>
                  <input type="text" placeholder="yourname@upi" value={upiId}
                    onChange={e => { setUpiId(e.target.value); setUpiErr(""); }}
                    className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all font-semibold
                      ${upiErr ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white"}`} />
                  {upiErr && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {upiErr}</p>}

                  {/* Popular UPI apps */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {[{ label: "GPay", suffix: "@okaxis" }, { label: "PhonePe", suffix: "@ybl" }, { label: "Paytm", suffix: "@paytm" }].map(u => (
                      <button key={u.label} onClick={() => setUpiId(u.label.toLowerCase() + u.suffix)}
                        className="text-xs bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-600 border border-slate-200 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer">
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Card Input ── */}
              {payMethod === "card" && (
                <div className="space-y-3.5 mb-5">
                  {/* Card number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-widest font-display">Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                      value={card.num} onChange={e => setCard({ ...card, num: formatCard(e.target.value) })}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none tracking-widest transition-all font-bold
                        ${cardErr.num ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white"}`} />
                    {cardErr.num && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {cardErr.num}</p>}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-widest font-display">Cardholder Name</label>
                    <input type="text" placeholder="RAHUL SHARMA"
                      value={card.name} onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all font-bold
                        ${cardErr.name ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white"}`} />
                    {cardErr.name && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {cardErr.name}</p>}
                  </div>

                  {/* Expiry + CVV side by side */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-widest font-display">Expiry</label>
                      <input type="text" placeholder="MM/YY" maxLength={5}
                        value={card.expiry} onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all font-bold
                          ${cardErr.expiry ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white"}`} />
                      {cardErr.expiry && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {cardErr.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-widest font-display">CVV</label>
                      <input type="password" placeholder="•••" maxLength={4}
                        value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all font-bold
                          ${cardErr.cvv ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white"}`} />
                      {cardErr.cvv && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {cardErr.cvv}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet / Net Banking message */}
              {(payMethod === "wallet" || payMethod === "nb") && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mb-5 text-center shadow-sm">
                  <p className="text-indigo-600 text-sm font-black mb-1 font-display">
                    {payMethod === "wallet" ? "👝 Wallet Payment" : "🏦 Net Banking"}
                  </p>
                  <p className="text-slate-600 text-xs font-semibold">You'll be redirected to complete payment securely.</p>
                </div>
              )}

              {/* Security note */}
              <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-4 py-2.5 mb-5 shadow-sm">
                <span className="text-emerald-500 text-lg">🔒</span>
                <span className="text-emerald-800 text-xs font-bold font-display uppercase tracking-wide">256-bit SSL · 100% Secure Payment</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">← Back</button>
                <button onClick={handlePay} disabled={processing}
                  className={`flex-1 py-3.5 rounded-2xl font-extrabold text-sm transition-all cursor-pointer
                    ${processing ? "bg-indigo-400 text-white cursor-wait" : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01] active:scale-95 shadow-md shadow-indigo-600/15"}`}>
                  {processing
                    ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                    : `Pay ₹${finalAmount} →`}
                </button>
              </div>
            </div>
          )}

        </div>


      </div>
    </div>
  );
}