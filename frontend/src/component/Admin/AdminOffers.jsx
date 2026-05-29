import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, ToggleLeft, ToggleRight, X, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mobile',
    bannerUrl: '',
    code: ''
  });
  const [error, setError] = useState('');

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/offers');
      setOffers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleToggleActive = async (offer) => {
    try {
      await api.put(`/admin/offers/${offer._id}`, {
        isActive: !offer.isActive
      });
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Failed to toggle offer status');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this promotional offer?')) {
      try {
        await api.delete(`/admin/offers/${id}`);
        fetchOffers();
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

    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await api.post('/admin/offers', formData);
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'mobile',
        bannerUrl: '',
        code: ''
      });
      fetchOffers();
    } catch (err) {
      setError(err.message || 'Failed to create offer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display tracking-tight text-slate-800">Promo Banners</h1>
          <p className="text-slate-500 text-xs mt-1">Configure active promotional campaigns and visual banners.</p>
        </div>
        <button
          onClick={() => { setModalOpen(true); setError(''); }}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Offer</span>
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : offers.length > 0 ? (
          offers.map((offer) => (
            <div 
              key={offer._id} 
              className={`p-6 rounded-[2rem] border bg-white shadow-sm transition-all flex flex-col justify-between h-52 relative group
                ${offer.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-red-100 bg-red-50/20 opacity-75'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-800 font-display tracking-wider bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                      {offer.category}
                    </span>
                    {!offer.isActive && (
                      <span className="text-[8px] bg-red-50 border border-red-100 text-red-650 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Disabled
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-slate-850 mt-3 leading-snug">{offer.title}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-snug">{offer.description}</p>
                </div>

                {/* Active Toggle Switch */}
                <button
                  onClick={() => handleToggleActive(offer)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer transition-all shrink-0"
                  title={offer.isActive ? 'Deactivate Banner' : 'Activate Banner'}
                >
                  {offer.isActive ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Specs Details */}
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-3 mt-3">
                <span>Associated Code:</span>
                <span className="font-extrabold text-slate-800 uppercase">{offer.code || 'None'}</span>
              </div>

              {/* Trash/delete action */}
              <button
                onClick={() => handleDelete(offer._id)}
                className="absolute bottom-4 right-4 p-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl transition-all cursor-pointer md:opacity-0 group-hover:opacity-100"
                title="Delete Offer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white border border-slate-200 p-10 rounded-[2rem] text-center font-bold text-slate-450 text-xs shadow-sm">
            No dynamic promotional banners registered.
          </div>
        )}
      </div>

      {/* CREATE NEW OFFER MODAL */}
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
              <h3 className="text-xl font-black text-slate-800 font-display mt-3 tracking-tight">Create Promo Banner</h3>
              <p className="text-slate-500 text-xs mt-1">Add a new dynamic offer/banner for category filters.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Offer Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Jio Special"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-650 outline-none cursor-pointer focus:border-slate-400"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="card">Metro Card</option>
                    <option value="broadband">Broadband</option>
                    <option value="landline">Landline</option>
                    <option value="cable tv">Cable TV</option>
                    <option value="electricity">Electricity</option>
                    <option value="gas">LPG Gas</option>
                    <option value="water">Water Bill</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Description *</label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Get ₹50 cashback on Jio ₹749 plans"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Promo Code</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="e.g. JIO50"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5 tracking-wider font-display">Banner Image URL</label>
                  <input
                    type="text"
                    name="bannerUrl"
                    placeholder="e.g. ./src/assets/mobile.png"
                    value={formData.bannerUrl}
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
                Create Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
