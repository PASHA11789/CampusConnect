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
    <section className="w-full mt-4 text-left">
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col">
          <h3 className="text-[15px] font-black text-[#071A35] tracking-wide m-0">Campus Canteen &amp; Nearby Eateries</h3>
          <span className="text-[11px] font-semibold text-[#211A24]/60 mt-0.5">Order delicious meals from your favorite student spots</span>
        </div>
        <button 
          onClick={() => navigate('/canteen', { state: { viewAll: true } })}
          className="bg-transparent border-none text-[12px] text-[#071A35] no-underline font-extrabold transition-all duration-200 hover:text-[#2563EB] cursor-pointer flex items-center gap-1"
        >
          View all ➔
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 max-[1024px]:grid-cols-2 max-[600px]:grid-cols-1">
        {loading && displayList.length === 0 ? (
          <div className="col-span-4 py-8 text-center text-xs font-bold text-[#211A24]/50">Loading canteen eateries...</div>
        ) : (
          displayList.slice(0, 4).map((res, i) => {
            const resId = res._id || res.id;
            const img = getDisplayImage(res.name, res.coverImage);
            const dist = getDistanceText(res.name, res.address);
            const isJohnny = (res.name || "").toLowerCase().includes("johnny");
            const isGourmet = (res.name || "").toLowerCase().includes("gourmet");

            // Subtitle matching screenshot #4
            const getSubtitle = (name) => {
              const lower = (name || "").toLowerCase();
              if (lower.includes("savour")) return "Famous Pulao & traditional delights";
              if (lower.includes("gourmet")) return "Premium fast food & bakeries";
              if (lower.includes("johnny")) return "Crispy wraps & legendary sauces";
              if (lower.includes("dogar")) return "Authentic Desi breakfast & tea";
              return "Student favorite spot & snacks";
            };

            return (
              <div 
                key={resId || i} 
                className={`rounded-[1.5rem] overflow-hidden border transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1.5 hover:shadow-[0_14px_35px_rgba(7,26,53,0.1)] group cursor-pointer flex flex-col justify-between ${
                  isJohnny 
                    ? "bg-[#071A35] text-white border-[#071A35]" 
                    : "bg-white text-[#211A24] border-[#E8E1D5]"
                }`}
                onClick={() => navigate('/canteen', { state: { restaurantId: resId, restaurantName: res.name } })}
              >
                <div className="relative h-[130px] overflow-hidden">
                  <img src={img} alt={res.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className={`absolute top-2.5 left-2.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-[4px] shadow-sm flex items-center gap-1 ${
                    isJohnny
                      ? "bg-white text-[#071A35]"
                      : isGourmet
                      ? "bg-white text-[#071A35]"
                      : "bg-[#071A35]/90 text-white"
                  }`}>
                    <span>📍</span> {dist} from MUL
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between text-left">
                  <div className="flex flex-col">
                    <h4 className={`text-[14px] font-extrabold m-0 truncate ${isJohnny ? "text-white" : "text-[#071A35]"}`}>{res.name}</h4>
                    <span className={`text-[10px] font-medium mt-0.5 ${isJohnny ? "text-white/70" : "text-[#211A24]/60"}`}>{getSubtitle(res.name)}</span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/canteen', { state: { restaurantId: resId, restaurantName: res.name } });
                    }}
                    className={`py-2 rounded-full text-[11.5px] font-extrabold cursor-pointer transition-all duration-200 shadow-sm w-full border-none ${
                      isJohnny
                        ? "bg-[#F5B82E] text-[#071A35] hover:bg-[#FFD05B]"
                        : isGourmet
                        ? "bg-[#DCD9F7] text-[#071A35] hover:bg-[#D0CBF5]"
                        : "bg-[#071A35] text-white hover:bg-[#0D2A42]"
                    }`}
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

