import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import gourmetImg from '../../assets/gourmet.png';
import savourImg from '../../assets/savour.png';

const FALLBACK_RESTAURANTS = [
  { _id: 'savour', name: 'Savour Foods', distance: '2.8 km', coverImage: savourImg },
  { _id: 'gourmet', name: 'Gourmet Restaurant', distance: '1.5 km', coverImage: gourmetImg },
  { _id: 'johnny', name: 'Johnny & Jugnu', distance: '4.2 km', coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80' },
  { _id: 'dogar', name: 'Dogar Restaurant', distance: '1.2 km', coverImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80' },
];

const CanteenWidget = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get('/api/canteen/restaurants', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success && data.restaurants && data.restaurants.length > 0) {
          setRestaurants(data.restaurants);
        } else {
          setRestaurants(FALLBACK_RESTAURANTS);
        }
      } catch (err) {
        console.error("Error fetching restaurants in CanteenWidget:", err);
        setRestaurants(FALLBACK_RESTAURANTS);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const getDisplayImage = (name, coverImage) => {
    const nameLower = (name || "").toLowerCase();
    if (nameLower.includes("gourmet")) return gourmetImg;
    if (nameLower.includes("savour")) return savourImg;
    return coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80';
  };

  const getDistanceText = (name, address) => {
    if (address && address.includes("(")) {
      const match = address.match(/\(([^)]+)\)/);
      if (match) return match[1];
    }
    const nameLower = (name || "").toLowerCase();
    if (nameLower.includes("gourmet")) return "1.5 km";
    if (nameLower.includes("savour")) return "2.8 km";
    if (nameLower.includes("johnny")) return "4.2 km";
    if (nameLower.includes("dogar")) return "1.2 km";
    return "1.0 km";
  };

  const displayList = restaurants.length > 0 ? restaurants : FALLBACK_RESTAURANTS;

  return (
    <section className="w-full mt-6">
      <div className="flex justify-between items-center mb-3.5">
        <h3 className="text-[14px] font-extrabold text-[#0a2342] tracking-wide m-0">Campus Canteen & Nearby Eateries</h3>
        <button 
          onClick={() => navigate('/canteen', { state: { viewAll: true } })}
          className="bg-transparent border-none text-[12px] text-[#00c2cb] no-underline font-semibold transition-all duration-200 hover:opacity-70 hover:translate-x-[3px] cursor-pointer"
        >
          View all →
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 max-[1024px]:grid-cols-2 max-[600px]:grid-cols-1">
        {loading && displayList.length === 0 ? (
          <div className="col-span-4 py-8 text-center text-xs font-bold text-slate-400">Loading canteen eateries...</div>
        ) : (
          displayList.slice(0, 4).map((res, i) => {
            const resId = res._id || res.id;
            const img = getDisplayImage(res.name, res.coverImage);
            const dist = getDistanceText(res.name, res.address);

            return (
              <div 
                key={resId || i} 
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] group cursor-pointer"
                onClick={() => navigate('/canteen', { state: { restaurantId: resId, restaurantName: res.name } })}
              >
                <div className="relative h-[120px] overflow-hidden">
                  <img src={img} alt={res.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 left-2 bg-[#00c2cb]/90 text-white text-[10px] font-extrabold px-2 py-1 rounded-full backdrop-blur-[4px]">{dist}</div>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <h4 className="text-[13px] font-bold text-[#0a2342] m-0 truncate">{res.name}</h4>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/canteen', { state: { restaurantId: resId, restaurantName: res.name } });
                    }}
                    className="bg-slate-50 text-[#00c2cb] border border-slate-200 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#00c2cb] hover:text-white hover:border-[#00c2cb]"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default CanteenWidget;

