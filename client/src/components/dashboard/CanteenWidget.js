import React from 'react';
import { useNavigate } from 'react-router-dom';

// Importing generated images from src/assets
import gourmetImg from '../../assets/gourmet.png';
import savourImg from '../../assets/savour.png';

const RESTAURANTS = [
  { id: 'gourmet', name: 'Gourmet Café', distance: '0.2 km', image: gourmetImg },
  { id: 'savour', name: 'Savour Foods', distance: '0.5 km', image: savourImg },
  { id: 'bbq', name: 'Bundu Khan BBQ', distance: '1.1 km', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80' },
  { id: 'pizza', name: 'Pizza Online', distance: '0.8 km', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80' },
];

const CanteenWidget = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full mt-6">
      <h3 className="text-[14px] font-extrabold text-[#0a2342] tracking-wide mb-3.5">Campus Canteen & Nearby Eateries</h3>
      <div className="grid grid-cols-4 gap-4 max-[1024px]:grid-cols-2 max-[600px]:grid-cols-1">
        {RESTAURANTS.map((res, i) => (
          <div 
            key={i} 
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] group cursor-pointer"
            onClick={() => navigate('/canteen', { state: { restaurantId: res.id } })}
          >
            <div className="relative h-[120px] overflow-hidden">
              <img src={res.image} alt={res.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-2 left-2 bg-[#00c2cb]/90 text-white text-[10px] font-extrabold px-2 py-1 rounded-full backdrop-blur-[4px]">{res.distance}</div>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <h4 className="text-[13px] font-bold text-[#0a2342] m-0">{res.name}</h4>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/canteen', { state: { restaurantId: res.id } });
                }}
                className="bg-slate-50 text-[#00c2cb] border border-slate-200 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]"
              >
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CanteenWidget;

