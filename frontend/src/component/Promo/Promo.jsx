import React from 'react';
import airtelLogo from '../../assets/Airtel.png';
import viLogo from '../../assets/Vi.png';
import jioLogo from '../../assets/Jio.png';
import bsnlLogo from '../../assets/Bsnl.png';
import ideaLogo from '../../assets/Idea.png';

const promos = [
  { id: 1, name: "Airtel Special", code: "AIR50", logo: airtelLogo },
  { id: 2, name: "VI Super Saver", code: "VI50", logo: viLogo },
  { id: 3, name: "Jio Unlimited", code: "JIO30", logo: jioLogo },
  { id: 4, name: "BSNL Topup", code: "BSNL10", logo: bsnlLogo },
  { id: 5, name: "Idea Cashback", code: "IDEA25", logo: ideaLogo },
  { id: 6, name: "Exclusive Pay", code: "XYZ99", logo: viLogo },
];

function Promo() {
  return (
    <div className="py-20 bg-slate-50/30 border-t border-slate-100">
      {/* SECTION HEADER */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col items-start">
          <h2 className="text-indigo-600 font-extrabold tracking-widest uppercase text-xs mb-2 font-display">
            Hot Deals
          </h2>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase font-display tracking-tight">
            Promo Codes
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-violet-600 mt-3 rounded-full"></div>
        </div>
      </div>

      {/* PROMO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-6">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="group flex justify-between items-center p-6 border border-slate-200/60 rounded-3xl hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transform transition-all duration-300 bg-white shadow-sm"
          >
            {/* LOGO CONTAINER */}
            <div className="flex items-center justify-center w-24 h-14 bg-slate-50/50 rounded-xl p-2 border border-slate-100">
              <img
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                src={promo.logo}
                alt={promo.name}
              />
            </div>

            {/* TEXT & ACTION */}
            <div className="text-right flex flex-col items-end gap-1.5">
              <h3 className="text-sm font-black text-slate-800 font-display">
                {promo.name}
              </h3>
              <div className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                {promo.code}
              </div>
              <button className="cursor-pointer mt-1 px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-extrabold rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95">
                APPLY
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Promo;