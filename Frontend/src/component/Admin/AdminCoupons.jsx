import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, X, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Coupon Modal & Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount: '',
    type: 'flat',
    minAmount: '',
    expiry: '',
    usageLimit: ''
  });
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons');
      setCoupons(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon._id}`, {
        isActive: !coupon.isActive
      });
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to permanently delete this coupon?')) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        alert(err.message || 'Deletion failed');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!formData.code.trim() || !formData.description.trim() || !formData.discount || !formData.expiry) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await api.post('/admin/coupons', {
        ...formData,
        discount: parseFloat(formData.discount),
        minAmount: parseFloat(formData.minAmount || 0),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      });

      setModalOpen(false);
      setFormData({
        code: '',
        description: '',
        discount: '',
        type: 'flat',
        minAmount: '',
        expiry: '',
        usageLimit: ''
      });
      fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display tracking-tight text-slate-800">Promo Coupons</h1>
          <p className="text-slate-500 text-xs mt-1">Configure and manage active promotional code strategies.</p>
        </div>
        <button
          onClick={() => { setModalOpen(true); setError(''); }}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Coupon</span>
        </button>
      </div>

      {/* Coupons grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div 
              key={coupon._id} 
              className={`p-6 rounded-[2rem] border bg-white shadow-sm transition-all flex flex-col justify-between h-56 relative group
                ${coupon.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-red-100 bg-red-50/20 opacity-75'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-slate-800 font-display tracking-wider bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                      {coupon.code}
                    </span>
                    {!coupon.isActive && (
                      <span className="text-[8px] bg-red-50 border border-red-100 text-red-600 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Disabled
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800 mt-3 leading-snug">{coupon.description}</h3>
                </div>
                
                {/* Active Toggle Switch */}
                <button
                  onClick={() => handleToggleActive(coupon)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer transition-all"
                  title={coupon.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                >
                  {coupon.isActive ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Specs Details */}
              <div className="space-y-1.5 text-[10px] font-semibold text-slate-500 border-t border-slate-100 pt-3 mt-3">
                <div className="flex justify-between">
                  <span>Discount Value:</span>
                  <span className="font-extrabold text-slate-800">
                    {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Recharge Required:</span>
                  <span className="font-extrabold text-slate-800">₹{coupon.minAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage stats:</span>
                  <span className="font-extrabold text-slate-800">
                    {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'Redeemed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration Date:</span>
                  <span className="font-extrabold text-slate-800">{new Date(coupon.expiry).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Trash/delete action */}
              <button
                onClick={() => handleDelete(coupon._id)}
                className="absolute bottom-4 right-4 p-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl transition-all cursor-pointer md:opacity-0 group-hover:opacity-100"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white border border-slate-200 p-10 rounded-[2rem] text-center font-bold text-slate-450 text-xs shadow-sm">
            No dynamic coupon records created yet.
          </div>
        )}
      </div>

      {/* CREATE NEW COUPON MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 max-w-md w-full text-left relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="mb-6">
              <span className="text-[9px] bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-500 font-extrabold uppercase tracking-widest font-display">Create</span>
              <h3 className="text-xl font-black text-slate-800 font-display mt-3 tracking-tight">Create Promo Coupon</h3>
              <p className="text-slate-500 text-xs mt-1">Add a new dynamic coupon code to the database.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="e.g. FLAT50"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Discount Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-650 outline-none cursor-pointer focus:border-slate-400"
                  >
                    <option value="flat">Flat Price (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Description *</label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Flat ₹50 cashback on recharge"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Discount Amount *</label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="e.g. 50"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Min Recharge Amount</label>
                  <input
                    type="number"
                    name="minAmount"
                    placeholder="e.g. 199"
                    value={formData.minAmount}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Expiry Date *</label>
                  <input
                    type="date"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-650 outline-none focus:border-slate-400 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Usage Limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    placeholder="Unlimited"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-center gap-2.5 text-[10px] text-red-650 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
