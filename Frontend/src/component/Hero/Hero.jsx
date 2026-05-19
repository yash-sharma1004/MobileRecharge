import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMobileAlt, FaCreditCard, FaWifi, FaPhoneAlt,
  FaTv, FaLightbulb, FaGasPump, FaTint,
} from "react-icons/fa";
import { useWallet } from "../../context/WalletContext";
import { useHistory } from "../../context/HistoryContext";
import api from "../../utils/api";

const services = [
  { id: "1", name: "Mobile", icon: <FaMobileAlt />, src: "./src/assets/mobile.png", description: " Get up to 20% Cashback on your first mobile recharge." },
  { id: "2", name: "Card", icon: <FaCreditCard />, src: "./src/assets/card.jpg", description: " Get up to 20% Cashback on your first card recharge." },
  { id: "3", name: "Broadband", icon: <FaWifi />, src: "./src/assets/broadband.jpg", description: " Get up to 20% Cashback on your first broadband recharge." },
  { id: "4", name: "Landline", icon: <FaPhoneAlt />, src: "./src/assets/landline.jpg", description: " Get up to 20% Cashback on your first landline recharge." },
  { id: "5", name: "Cable TV", icon: <FaTv />, src: "./src/assets/cabletv.png", description: " Get up to 20% Cashback on your first cable tv recharge." },
  { id: "6", name: "Electricity", icon: <FaLightbulb />, src: "./src/assets/electricity.jpg", description: " Get up to 20% Cashback on your first electricity recharge." },
  { id: "7", name: "Gas", icon: <FaGasPump />, src: "./src/assets/gas.jpg", description: " Get up to 20% Cashback on your first gas recharge." },
  { id: "8", name: "Water", icon: <FaTint />, src: "./src/assets/water.jpg", description: " Get up to 20% Cashback on your first water bill recharge." },
];

const card = [
  {
    id: 1,
    title: "Airtel",
    offer: "20% off",
    img: "./src/assets/Airtel.png"
  },
  {
    id: 2,
    title: 'jio',
    img: "./src/assets/Jio.png"
  }
];

const rechargeCategories = {
  mobile: {
    operators: ["Jio", "Airtel", "Vi", "BSNL"],
    offers: [
      { code: "MOB30", description: "Flat ₹30 cashback on unlimited plans of ₹299+" },
      { code: "JIO50", description: "Get ₹50 cashback on Jio ₹749 plans" }
    ],
    plans: [
      { amount: 239, label: "1.5GB/day Unlimited (28 Days)", details: { data: "1.5GB/Day", calls: "Unlimited", validity: "28 Days", tag: "Popular" } },
      { amount: 299, label: "2GB/day Unlimited (28 Days)", details: { data: "2GB/Day", calls: "Unlimited", validity: "28 Days", tag: "Unlimited" } },
      { amount: 749, label: "2GB/day + Disney+ Hotstar (84 Days)", details: { data: "2GB/Day + OTT", calls: "Unlimited", validity: "84 Days", tag: "OTT Plans" } },
      { amount: 155, label: "1GB Data Booster pack", details: { data: "1GB", calls: "N/A", validity: "Active Plan", tag: "Data Packs" } }
    ],
    placeholder: "Enter 10-Digit Mobile Number",
    label: "Mobile Number",
    validation: /^[6-9]\d{9}$/,
    validationError: "Enter a valid 10-digit mobile number."
  },
  card: {
    operators: ["SBI Metro", "ICICI Metro Card", "DMRC Smart Card"],
    offers: [
      { code: "METRO20", description: "Get 20% off on your metro card recharge" }
    ],
    plans: [
      { amount: 100, label: "Top-up: ₹100", details: { data: "Metro Card Balance", calls: "N/A", validity: "Lifetime", tag: "Top Up" } },
      { amount: 200, label: "Top-up: ₹200", details: { data: "Metro Card Balance", calls: "N/A", validity: "Lifetime", tag: "Top Up" } },
      { amount: 500, label: "Top-up: ₹500", details: { data: "Metro Card Balance", calls: "N/A", validity: "Lifetime", tag: "Top Up" } }
    ],
    placeholder: "Enter 16-Digit Smart Card Number",
    label: "Smart Card Number",
    validation: /^\d{16}$/,
    validationError: "Enter a valid 16-digit smart card number."
  },
  broadband: {
    operators: ["Net+", "Fastway", "JioFiber", "Airtel Xstream", "BSNL Fiber", "Excitel"],
    offers: [
      { code: "STREAMFREE", description: "Get Netflix free on yearly broadband plans" },
      { code: "FIBER50", description: "Flat ₹50 cashback on monthly renewals" }
    ],
    plans: [
      { amount: 599, label: "Monthly: 30 Mbps Unlimited", details: { data: "30 Mbps Unlimited", calls: "Unlimited Voice", validity: "30 Days", tag: "Monthly Broadband" } },
      { amount: 999, label: "Monthly: 200 Mbps + 15 OTTs", details: { data: "200 Mbps Unlimited", calls: "Unlimited Voice + OTT", validity: "30 Days", tag: "OTT Bundles" } },
      { amount: 1499, label: "Monthly: 300 Mbps Premium Bundles", details: { data: "300 Mbps Unlimited", calls: "Premium OTTs Included", validity: "30 Days", tag: "Fiber Plans" } },
      { amount: 5999, label: "Yearly: 100 Mbps Unlimited (Get Netflix Free)", details: { data: "100 Mbps Unlimited", calls: "Free OTT Year", validity: "365 Days", tag: "Unlimited WiFi" } }
    ],
    placeholder: "Enter Broadband Customer ID",
    label: "Customer ID",
    validation: /^[a-zA-Z0-9-]{6,15}$/,
    validationError: "Enter valid customer ID (6-15 alphanumeric chars)."
  },
  landline: {
    operators: ["Airtel Landline", "BSNL Landline", "MTNL"],
    offers: [
      { code: "LANDLINE10", description: "Get 10% cashback on landline bill" }
    ],
    plans: [
      { amount: 399, label: "Basic Plan: Unlimited Local/STD", details: { data: "Voice Only", calls: "Unlimited", validity: "30 Days", tag: "Basic" } },
      { amount: 499, label: "Premium Plan: Unlimited + Basic Broadband", details: { data: "Voice + 10GB Data", calls: "Unlimited", validity: "30 Days", tag: "Premium" } }
    ],
    placeholder: "Enter Landline Number with STD Code",
    label: "Landline Number",
    validation: /^0\d{10}$/,
    validationError: "Enter valid landline number starting with 0 (11 digits)."
  },
  "cable tv": {
    operators: ["Tata Play", "Dish TV", "Airtel Digital TV", "Sun Direct", "d2h"],
    offers: [
      { code: "DTHFREE", description: "Get 7 days extra on yearly subscription" },
      { code: "DTH20", description: "Flat ₹20 cashback on recharge of ₹300+" }
    ],
    plans: [
      { amount: 250, label: "Basic Family Pack (80+ Channels)", details: { data: "SD Channels Pack", calls: "N/A", validity: "30 Days", tag: "Monthly Pack" } },
      { amount: 450, label: "Premium HD Pack (150+ HD Channels)", details: { data: "HD Channels Pack", calls: "N/A", validity: "30 Days", tag: "HD Packs" } },
      { amount: 2500, label: "Annual Value Pack (Save 15%)", details: { data: "Annual SD Pack", calls: "N/A", validity: "365 Days", tag: "Annual Pack" } }
    ],
    placeholder: "Enter Subscriber ID",
    label: "Subscriber ID",
    validation: /^\d{8,11}$/,
    validationError: "Enter valid 8-11 digit DTH subscriber ID."
  },
  electricity: {
    operators: ["PSPCL", "DHBVN", "UPPCL", "BSES", "TNEB"],
    offers: [
      { code: "LIGHT40", description: "Pay via wallet & save ₹40 on bill payments" },
      { code: "POWER50", description: "Pay electricity bill & get ₹50 cashback" }
    ],
    plans: [
      { amount: 0, label: "Fetch Outstanding Bill", details: { data: "Fetch Bill", calls: "N/A", validity: "N/A", tag: "Fetch Bill" } }
    ],
    placeholder: "Enter Consumer Number",
    label: "Consumer Number",
    validation: /^\d{10,13}$/,
    validationError: "Enter valid 10-13 digit electricity consumer number."
  },
  gas: {
    operators: ["Indane", "HP Gas", "Bharat Gas"],
    offers: [
      { code: "GAS30", description: "Flat ₹30 cashback on booking cylinder" }
    ],
    plans: [
      { amount: 1105, label: "Refill Cylinder: ₹1105", details: { data: "14.2 kg Cylinder", calls: "N/A", validity: "N/A", tag: "Booking" } }
    ],
    placeholder: "Enter LPG Consumer Number",
    label: "LPG Consumer Number",
    validation: /^\d{17}$/,
    validationError: "Enter valid 17-digit LPG consumer number."
  },
  water: {
    operators: ["Delhi Jal Board", "Municipal Water Services", "BWSSB"],
    offers: [
      { code: "WATER15", description: "Flat ₹15 cashback on water bill" }
    ],
    plans: [
      { amount: 0, label: "Fetch Outstanding Bill", details: { data: "Fetch Bill", calls: "N/A", validity: "N/A", tag: "Fetch Bill" } }
    ],
    placeholder: "Enter Water Connection ID",
    label: "Water Connection ID",
    validation: /^[a-zA-Z0-9-]{8,12}$/,
    validationError: "Enter valid 8-12 character water connection ID."
  }
};

export default function Hero() {
  const navigate = useNavigate();
  const { walletBalance, deductWallet, addCashback } = useWallet();
  const { addRechargeRecord } = useHistory();

  const [activeTab, setActiveTab] = useState({ id: "1", name: "Mobile", icon: <FaMobileAlt />, src: "./src/assets/mobile.png", description: " Get up to 20% Cashback on your first mobile recharge." });

  // Quick Recharge Form States
  const [number, setNumber] = useState("");
  const [operator, setOperator] = useState("Jio");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("prepaid");

  // UI Dropdown & Errors
  const [isOpDropdownOpen, setIsOpDropdownOpen] = useState(false);
  const [numErr, setNumErr] = useState("");
  const [amtErr, setAmtErr] = useState("");

  // Payment Checkout Modal States
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("wallet");
  const [upiId, setUpiId] = useState("");
  const [upiErr, setUpiErr] = useState("");
  const [cardDetails, setCardDetails] = useState({ num: "", name: "", expiry: "", cvv: "" });
  const [cardErr, setCardErr] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);

  // Category Specific States
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [fetchingBill, setFetchingBill] = useState(false);
  const [billDetails, setBillDetails] = useState(null);

  const handleNumberChange = (e) => {
    const catKey = activeTab.name.toLowerCase();
    const cat = rechargeCategories[catKey] || rechargeCategories.mobile;

    let val = e.target.value;
    if (catKey === "mobile") {
      val = val.replace(/\D/g, "").slice(0, 10);
    } else if (catKey === "card" || catKey === "cable tv" || catKey === "electricity" || catKey === "gas") {
      val = val.replace(/\D/g, "").slice(0, 20);
    } else {
      val = val.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 20);
    }

    setNumber(val);
    setNumErr("");
    setBillDetails(null); // Reset previously fetched bills on input change

    // Trigger Auto-Detection only for Mobile
    if (catKey === "mobile" && val.length >= 10) {
      const firstDigit = val.charAt(0);
      if (["6", "7"].includes(firstDigit)) setOperator("Jio");
      else if (["9"].includes(firstDigit)) setOperator("Airtel");
      else if (["8"].includes(firstDigit)) setOperator("Vi");
      else if (["5"].includes(firstDigit)) setOperator("BSNL");
    }
  };

  const handleFetchBill = async () => {
    const catKey = activeTab.name.toLowerCase();
    const cat = rechargeCategories[catKey] || rechargeCategories.mobile;

    if (!cat.validation.test(number)) {
      setNumErr(cat.validationError);
      return;
    }

    setFetchingBill(true);
    setAmtErr("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const simulatedAmount = Math.floor(Math.random() * 2000) + 450;
      setAmount(simulatedAmount.toString());
      setBillDetails({
        amount: simulatedAmount,
        consumerName: "RAHUL SHARMA",
        dueDate: `15th ${new Date().toLocaleString('default', { month: 'long' })} 2026`
      });
    } catch (err) {
      console.error("Failed to fetch bill:", err);
      setAmtErr("Failed to fetch outstanding bill.");
    } finally {
      setFetchingBill(false);
    }
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    let hasErr = false;

    const catKey = activeTab.name.toLowerCase();
    const cat = rechargeCategories[catKey] || rechargeCategories.mobile;

    if (!cat.validation.test(number)) {
      setNumErr(cat.validationError);
      hasErr = true;
    }

    const parsedAmt = Number(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setAmtErr("Enter a valid recharge amount.");
      hasErr = true;
    }

    if (hasErr) return;

    // Reset checkout states
    setPayMethod(walletBalance >= parsedAmt ? "wallet" : "upi");
    setUpiId("");
    setUpiErr("");
    setCardDetails({ num: "", name: "", expiry: "", cvv: "" });
    setCardErr({});
    setPaymentSuccess(false);
    setPayModalOpen(true);
  };

  // Card Format Helpers
  const formatCard = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const validateCheckout = () => {
    if (payMethod === "wallet") {
      if (walletBalance < Number(amount)) {
        alert("Insufficient wallet balance. Choose another payment method.");
        return false;
      }
      return true;
    }

    if (payMethod === "upi") {
      if (!upiId.includes("@") || upiId.trim().length < 5) {
        setUpiErr("Enter a valid UPI ID (e.g. user@okhdfc).");
        return false;
      }
      return true;
    }

    if (payMethod === "card") {
      const errors = {};
      if (cardDetails.num.replace(/\s/g, "").length < 16) errors.num = "Enter a valid 16-digit card number.";
      if (!cardDetails.name.trim()) errors.name = "Enter cardholder name.";
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) errors.expiry = "Use MM/YY format.";
      if (cardDetails.cvv.length < 3) errors.cvv = "Invalid CVV.";

      setCardErr(errors);
      return Object.keys(errors).length === 0;
    }

    return true;
  };

  const handleProcessPayment = async () => {
    if (!validateCheckout()) return;
    setProcessing(true);

    try {
      const finalAmt = Number(amount);
      const planName = selectedPlan
        ? selectedPlan.label
        : `${activeTab.name} Quick Bill Payment`;

      const planData = selectedPlan
        ? {
            price: finalAmt,
            data: selectedPlan.details.data,
            calls: selectedPlan.details.calls,
            validity: selectedPlan.details.validity,
            validityDays: selectedPlan.details.validity.includes("Days") ? parseInt(selectedPlan.details.validity) : 0,
            tag: selectedPlan.details.tag
          }
        : {
            price: finalAmt,
            data: `${activeTab.name} Payment`,
            calls: "N/A",
            validity: "Instant Transaction",
            validityDays: 0,
            tag: "QuickPay"
          };

      const payload = {
        operator: operator,
        number: number,
        amount: finalAmt,
        plan: planName,
        planData: planData,
        payMethod: payMethod === "wallet" ? "Wallet" : payMethod === "card" ? "Card" : "UPI",
        useWallet: payMethod === "wallet",
        walletAmountUsed: payMethod === "wallet" ? finalAmt : 0
      };

      const res = await api.post('/recharges', payload);
      const { recharge, cashbackEarned, walletUsed } = res.data;

      // Sync local Context values
      if (payMethod === "wallet" && walletUsed > 0) {
        deductWallet(walletUsed);
      }
      if (cashbackEarned > 0) {
        addCashback(cashbackEarned);
      }

      // Add to local history list
      addRechargeRecord({
        _id: recharge.id || Date.now().toString(),
        id: recharge.txnId || `TXN${Date.now().toString().slice(-8)}`,
        operator: recharge.operator || operator,
        number: recharge.number || number,
        amount: recharge.amount || finalAmt,
        plan: recharge.plan || planName,
        createdAt: recharge.date || new Date().toISOString(),
        status: recharge.status || "Success",
        payMethod: recharge.payMethod || (payMethod === "wallet" ? "Wallet" : payMethod === "card" ? "Card" : "UPI")
      });

      setTxnDetails(recharge);
      setPaymentSuccess(true);
      setProcessing(false);
    } catch (err) {
      console.error("Quick payment failed:", err);
      setProcessing(false);
      alert(err.message || "Payment process failed. Please try again.");
    }
  };

  const resetQuickForm = () => {
    setNumber("");
    setAmount("");
    setSelectedPlan(null);
    setBillDetails(null);
    setPayModalOpen(false);
    setPaymentSuccess(false);
  };

  const catKey = activeTab.name.toLowerCase();
  const currentCat = rechargeCategories[catKey] || rechargeCategories.mobile;

  return (
    <div className="min-h-200 bg-slate-50/50 pb-20">
      {/* 1. TOP SERVICE NAV (The Floating Bar) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-16 pb-28 px-4 border-b border-indigo-950/40 relative overflow-hidden">
        {/* Background mesh glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 text-white">
            <h1 className="text-3xl text-white tracking-tight md:text-4xl font-black font-display">
              Recharge or Pay Bills In <span className="text-indigo-400">Seconds</span>
            </h1>
            <p className="text-white mt-2 text-sm max-w-md mx-auto">
              Choose a category below to get started with your high-speed transaction.
            </p>
          </div>

          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {services.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item);
                  const catKey = item.name.toLowerCase();
                  const cat = rechargeCategories[catKey] || rechargeCategories.mobile;
                  setOperator(cat.operators[0]);
                  setNumber("");
                  setAmount("");
                  setNumErr("");
                  setAmtErr("");
                  setSelectedPlan(null);
                  setBillDetails(null);
                  setFetchingBill(false);
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${activeTab.id === item.id
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/35 border border-indigo-500/30 scale-105"
                  : "bg-white/5 border border-white/10 text-slate-300 backdrop-blur-md hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span className="text-xl sm:text-2xl mb-2">{item.icon}</span>
                <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-wider font-display">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE SECTION (Overlapping) */}
      <div className="max-w-6xl mx-auto px-4 flex flex-col -mt-14 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">

          {/* FORM CARD (Left - spans 7 cols) */}
          <form onSubmit={handleContinueToPayment} className="lg:col-span-7 bg-white p-6 sm:p-12 rounded-[2.5rem] shadow-xl border border-slate-100/80">
            <div className="max-w-lg mx-auto lg:mx-0">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                Pay {activeTab.name} Bill
              </h2>
              <p className="text-slate-500 text-sm mt-1">Quick, secure, and instant fintech processing.</p>

              {/* RADIO SWITCHER */}
              {(catKey === "mobile" || catKey === "broadband" || catKey === "landline") && (
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mt-8 border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setType("prepaid")}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all uppercase tracking-wider font-display ${type === "prepaid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-indigo-650"
                      }`}
                  >
                    Prepaid
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("postpaid")}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all uppercase tracking-wider font-display ${type === "postpaid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-indigo-650"
                      }`}
                  >
                    Postpaid
                  </button>
                </div>
              )}

              {/* RESPONSIVE INPUT GRID */}
              <div className="grid sm:grid-cols-2 gap-5 mt-10">
                {/* Mobile / Account Number */}
                <div className="group">
                  <label className="text-xs font-bold uppercase text-slate-700 ml-1 mb-2 block tracking-wider font-display">
                    {currentCat.label}
                  </label>
                  <input
                    type="text"
                    placeholder={currentCat.placeholder}
                    value={number}
                    onChange={handleNumberChange}
                    className={`w-full bg-slate-50 border p-4 rounded-2xl focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all text-slate-800 text-sm font-semibold ${numErr ? "border-red-300 bg-red-50/20" : "border-slate-200"
                      }`}
                  />
                  {numErr && <p className="text-red-500 text-[10px] mt-1 font-bold">⚠ {numErr}</p>}
                </div>

                {/* Operator Custom Dropdown */}
                <div className="group relative">
                  <label className="text-xs font-bold uppercase text-slate-700 ml-1 mb-2 block tracking-wider font-display">Operator</label>
                  <button
                    type="button"
                    onClick={() => setIsOpDropdownOpen(!isOpDropdownOpen)}
                    className="w-full text-left bg-slate-50 border border-slate-200 p-4 rounded-2xl hover:border-sky-500 focus:border-sky-500 focus:bg-white transition-all cursor-pointer flex justify-between items-center text-sm font-semibold text-slate-800"
                  >
                    <span>{operator}</span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </button>
                  {isOpDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-30 p-2 overflow-y-auto max-h-48">
                      {currentCat.operators.map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => {
                            setOperator(op);
                            setIsOpDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-xs font-black uppercase text-slate-700 hover:bg-slate-50 hover:text-sky-500 rounded-xl transition-all font-display"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="group sm:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-700 ml-1 mb-2 block tracking-wider font-display">Amount</label>
                  <input
                    type="text"
                    placeholder="₹ 0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value.replace(/\D/g, ""));
                      setAmtErr("");
                      setSelectedPlan(null);
                    }}
                    className={`w-full bg-slate-50 border p-4 rounded-2xl focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all text-slate-800 text-sm font-semibold ${amtErr ? "border-red-300 bg-red-50/20" : "border-slate-200"
                      }`}
                  />
                  {amtErr && <p className="text-red-500 text-[10px] mt-1 font-bold">⚠ {amtErr}</p>}
                </div>

                {/* Plans List or Simulated Bill Fetching */}
                {currentCat.plans && currentCat.plans.length > 0 && currentCat.plans[0].amount > 0 ? (
                  <div className="sm:col-span-2 mt-2">
                    <label className="text-xs font-bold uppercase text-slate-700 ml-1 mb-2 block tracking-wider font-display">Select Plan / Pack</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1.5 bg-slate-50/50 rounded-2xl border border-slate-200/60 shadow-inner">
                      {currentCat.plans.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAmount(p.amount.toString());
                            setSelectedPlan(p);
                            setAmtErr("");
                          }}
                          className={`p-4 text-left rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex flex-col justify-between gap-1.5 group
                            ${amount === p.amount.toString() && selectedPlan?.amount === p.amount
                              ? "border-indigo-600 bg-indigo-50/40 text-slate-900 ring-2 ring-indigo-600/15"
                              : "border-slate-200 bg-white hover:border-indigo-300 text-slate-650"}`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-black text-[15px] text-indigo-600">₹{p.amount}</span>
                            <span className="text-[9px] bg-slate-100 font-extrabold px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-wider group-hover:bg-indigo-600 group-hover:text-white transition-colors">{p.details.tag}</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{p.label}</p>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-semibold border-t border-slate-100 pt-1">
                            <span>Data: {p.details.data}</span>
                            <span>Val: {p.details.validity}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="sm:col-span-2 mt-2">
                    <label className="text-xs font-bold uppercase text-slate-700 ml-1 mb-2 block tracking-wider font-display">Bill Fetching</label>
                    <button
                      type="button"
                      disabled={fetchingBill || number.length < 8}
                      onClick={handleFetchBill}
                      className={`w-full p-4.5 rounded-2xl border text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-2 font-display uppercase tracking-widest
                        ${number.length < 8
                          ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                          : "border-sky-500 bg-sky-50/50 hover:bg-sky-50 text-sky-600 active:scale-[0.98]"}`}
                    >
                      {fetchingBill ? (
                        <>
                          <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                          Fetching Bill Info...
                        </>
                      ) : billDetails ? (
                        `✓ Outstanding Bill: ₹${billDetails.amount} (Fetched)`
                      ) : (
                        "🔍 Fetch Outstanding Bill"
                      )}
                    </button>
                    {billDetails && (
                      <div className="mt-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex justify-between items-center text-xs text-emerald-800 font-bold shadow-sm">
                        <div className="space-y-0.5">
                          <p className="text-slate-800">Consumer Name: <span className="font-extrabold text-emerald-600">RAHUL SHARMA</span></p>
                          <p className="text-slate-400 font-semibold text-[10px]">Due Date: {billDetails.dueDate}</p>
                        </div>
                        <span className="bg-emerald-100/80 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider text-[9px] font-black">Unpaid</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-10 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white py-5 rounded-2xl font-bold text-base shadow-lg shadow-sky-500/15 active:scale-[0.98] transition-all cursor-pointer font-display uppercase tracking-wider"
              >
                Continue to Payment
              </button>
            </div>
          </form>

          {/* PROMO SIDEBAR (Right - spans 5 cols) */}
          <div className="lg:col-span-5 relative lg:flex flex-col">
            <div className="sticky top-10 group overflow-hidden rounded-[2.5rem] shadow-xl border border-slate-100 bg-white flex flex-col h-full">
              <div className="h-[48%] overflow-hidden flex items-center justify-center bg-slate-50/50 border-b border-slate-100">
                <img
                  src={activeTab.src}
                  alt="promo"
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out p-4"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-center gap-4">
                <div className="bg-sky-50 border border-sky-100 px-3.5 py-1.5 rounded-full text-sky-600 w-fit text-[10px] font-black uppercase tracking-wider font-display">
                  Active Promo
                </div>
                <p className="text-slate-700 text-[15px] font-bold leading-relaxed font-display">
                  {activeTab.description}
                </p>
                {currentCat.offers && currentCat.offers.length > 0 && (
                  <div className="space-y-3 mt-2 border-t border-slate-100 pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Coupons</p>
                    {currentCat.offers.map((offer, oIdx) => (
                      <div key={oIdx} className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex flex-col gap-2 transition-all hover:bg-slate-100/50">
                        <p className="text-slate-700 text-[11px] font-bold font-display leading-snug">{offer.description}</p>
                        <div className="text-sky-650 font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5 bg-sky-50 border border-sky-100 w-fit px-2 py-1 rounded-lg">
                          🏷️ Code: <span className="text-slate-900 font-extrabold">{offer.code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. DETAILED PAYMENT OVERLAY MODAL ── */}
      {payModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="card-classy w-full max-w-lg p-6 sm:p-10 relative overflow-hidden max-h-[90vh] overflow-y-auto">

            {/* Success screen */}
            {paymentSuccess ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto shadow-lg shadow-emerald-500/35 animate-bounce mb-6">
                  ✓
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-display">Payment Successful!</h2>
                <p className="text-slate-500 text-sm mt-1">Recharge txn is being processed asynchronously.</p>

                <p className="text-sky-500 font-black text-4xl my-6 font-display">₹{amount}</p>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6 text-left shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-800 text-xs font-black uppercase font-display">
                    <span>🎉</span> Cashback Earned!
                  </div>
                  <p className="text-emerald-700 text-xs font-semibold leading-relaxed">
                    A flat cashback of <span className="font-extrabold">₹20</span> has been credited to your virtual wallet account securely.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      resetQuickForm();
                      navigate('/history');
                    }}
                    className="w-full py-4 bg-sky-500 hover:bg-sky-650 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-sky-500/10 cursor-pointer font-display"
                  >
                    Track in History
                  </button>
                  <button
                    onClick={resetQuickForm}
                    className="w-full py-4 border border-slate-200 text-slate-700 hover:bg-slate-50 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer font-display"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Header close button */}
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm transition-all"
                >
                  ✕
                </button>

                <h2 className="text-xl font-black text-slate-900 mb-1 font-display tracking-tight uppercase tracking-wider">Secure Billing Details</h2>
                <p className="text-slate-500 text-xs mb-6 font-semibold">Verify details and choose payment source.</p>

                {/* Summary Strip */}
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 mb-6 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-slate-800 font-extrabold text-sm font-display uppercase tracking-wide">{operator} · {type}</p>
                    <p className="text-slate-600 text-xs mt-1 font-semibold">{activeTab.name} No: +91 {number}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sky-500 font-black text-2xl font-display">₹{amount}</span>
                  </div>
                </div>

                {/* Payment Methods tabs */}
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 font-display">Choose Method</p>
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  {/* Wallet Tab */}
                  <button
                    type="button"
                    onClick={() => { setPayMethod("wallet"); setUpiErr(""); setCardErr({}); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer
                      ${payMethod === "wallet"
                        ? "border-sky-500 bg-sky-50 shadow-sm text-sky-600"
                        : "border-slate-200 hover:border-sky-500/20 hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span className="text-lg">👝</span>
                    <span className="text-[9px] font-black uppercase tracking-wider font-display">Wallet</span>
                  </button>

                  {/* Card Tab */}
                  <button
                    type="button"
                    onClick={() => { setPayMethod("card"); setUpiErr(""); setCardErr({}); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer
                      ${payMethod === "card"
                        ? "border-sky-500 bg-sky-50 shadow-sm text-sky-600"
                        : "border-slate-200 hover:border-sky-500/20 hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span className="text-lg">💳</span>
                    <span className="text-[9px] font-black uppercase tracking-wider font-display">Card</span>
                  </button>

                  {/* UPI Tab */}
                  <button
                    type="button"
                    onClick={() => { setPayMethod("upi"); setUpiErr(""); setCardErr({}); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer
                      ${payMethod === "upi"
                        ? "border-sky-500 bg-sky-50 shadow-sm text-sky-600"
                        : "border-slate-200 hover:border-sky-500/20 hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span className="text-lg">⚡</span>
                    <span className="text-[9px] font-black uppercase tracking-wider font-display">UPI ID</span>
                  </button>
                </div>

                {/* Render Selected Method Form */}
                {payMethod === "wallet" && (
                  <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4.5 mb-6 shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-600 font-bold">Virtual Balance</span>
                      <span className="text-sm font-black text-slate-800">₹{walletBalance}</span>
                    </div>
                    {walletBalance < Number(amount) ? (
                      <p className="text-red-500 text-[10px] font-bold">⚠ Insufficient balance. Please reload wallet or choose another method.</p>
                    ) : (
                      <p className="text-emerald-600 text-[10px] font-bold">✓ Sufficient balance. Payment will process instantly.</p>
                    )}
                  </div>
                )}

                {payMethod === "upi" && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider font-display">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={e => { setUpiId(e.target.value); setUpiErr(""); }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all font-semibold ${upiErr ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:bg-white"}`}
                    />
                    {upiErr && <p className="text-red-500 text-[10px] mt-1 font-bold">⚠ {upiErr}</p>}
                  </div>
                )}

                {payMethod === "card" && (
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-display">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={cardDetails.num}
                        onChange={e => setCardDetails({ ...cardDetails, num: formatCard(e.target.value) })}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-bold ${cardErr.num ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-sky-500 focus:bg-white"}`}
                      />
                      {cardErr.num && <p className="text-red-500 text-[9px] mt-0.5 font-bold">⚠ {cardErr.num}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-display">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="RAHUL SHARMA"
                        value={cardDetails.name}
                        onChange={e => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-bold ${cardErr.name ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-sky-500 focus:bg-white"}`}
                      />
                      {cardErr.name && <p className="text-red-500 text-[9px] mt-0.5 font-bold">⚠ {cardErr.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-display">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardDetails.expiry}
                          onChange={e => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-bold ${cardErr.expiry ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-sky-500 focus:bg-white"}`}
                        />
                        {cardErr.expiry && <p className="text-red-500 text-[9px] mt-0.5 font-bold">⚠ {cardErr.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-display">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardDetails.cvv}
                          onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-bold ${cardErr.cvv ? "border-red-300 bg-red-50/50" : "border-slate-200 focus:border-sky-500 focus:bg-white"}`}
                        />
                        {cardErr.cvv && <p className="text-red-500 text-[9px] mt-0.5 font-bold">⚠ {cardErr.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* SSL Security note */}
                <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-4 py-3 mb-6 shadow-sm">
                  <span className="text-emerald-500 text-lg">🔒</span>
                  <span className="text-emerald-800 text-[10px] font-black font-display uppercase tracking-wide">256-bit SSL · Instant Settlement Shield</span>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPayModalOpen(false)}
                    className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer font-display"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={processing}
                    className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all cursor-pointer font-display shadow-md shadow-sky-500/10
                      ${processing ? "bg-sky-400 cursor-wait" : "bg-sky-500 hover:bg-sky-600 active:scale-95"}`}
                  >
                    {processing ? "Settling..." : `Confirm & Pay ₹${amount}`}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}