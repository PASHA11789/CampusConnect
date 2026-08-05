import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/helpers";

const CanteenWidget = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const { data } = await axios.get('/api/canteen/restaurants', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).catch(async () => {
        return await axios.get('/api/restaurants');
      });

      if (data && data.success && Array.isArray(data.restaurants)) {
        setRestaurants(data.restaurants);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error("Error fetching restaurants in CanteenWidget:", err);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    const socket = io(SOCKET_URL);
    socket.on("restaurant_status_update", fetchRestaurants);
    socket.on("restaurant_menu_update", fetchRestaurants);
    socket.on("restaurant_updated", fetchRestaurants);

    return () => {
      socket.disconnect();
    };
  }, []);

  const getDisplayImage = (res) => {
    if (!res) return '';
    return res.coverImage || res.owner?.avatar || res.avatar || '';
  };

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
        {loading ? (
          <div className="col-span-4 py-8 text-center text-xs font-bold text-[#211A24]/50">Loading canteen eateries...</div>
        ) : restaurants.length === 0 ? (
          <div className="col-span-4 py-8 text-center border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-white">
            <div className="text-3xl mb-2">🍽️</div>
            <h4 className="text-sm font-black text-[#071A35]">No Active Canteen Eateries</h4>
            <p className="text-xs font-semibold text-slate-400 mt-1">Check back soon when a canteen vendor goes online!</p>
          </div>
        ) : (
          restaurants.slice(0, 4).map((res, i) => {
            const resId = res._id || res.id;
            const img = getDisplayImage(res);

            const getSubtitle = (name) => {
              const lower = (name || "").toLowerCase();
              if (lower.includes("mcdonald")) return "World famous burgers, fries & nuggets";
              return "World famous burgers, fries & nuggets";
            };

            return (
              <div
                key={resId || i}
                className="rounded-[1.5rem] overflow-hidden border transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1.5 hover:shadow-[0_14px_35px_rgba(7,26,53,0.1)] group cursor-pointer flex flex-col justify-between bg-white text-[#211A24] border-[#E8E1D5]"
                onClick={() => navigate('/canteen', { state: { restaurantId: resId, restaurantName: res.name } })}
              >
                <div className="relative h-[130px] overflow-hidden">
                  <img
                    src={img}
                    alt={res.name}
                    onError={(e) => {
                      e.target.onerror = null;
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between text-left">
                  <div className="flex flex-col">
                    <h4 className="text-[14px] font-extrabold m-0 truncate text-[#071A35]">{res.name}</h4>
                    <span className="text-[10px] font-medium mt-0.5 text-[#211A24]/60">{getSubtitle(res.name)}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/canteen', { state: { restaurantId: resId, restaurantName: res.name } });
                    }}
                    className="py-2.5 rounded-full text-[11.5px] font-extrabold cursor-pointer transition-all duration-200 shadow-sm w-full border-none bg-[#071A35] text-white hover:bg-[#0D2A42]"
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

