import React from 'react';
import './CanteenWidget.css';

// Importing generated images from src/assets
import gourmetImg from '../../assets/gourmet.png';
import savourImg from '../../assets/savour.png';

const RESTAURANTS = [
  { name: 'Gourmet Restaurant', distance: '1.2 km', image: gourmetImg },
  { name: 'Savour Foods', distance: '2.5 km', image: savourImg },
  { name: 'Bundu Khan BBQ', distance: '3.1 km', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80' },
  { name: 'Pizza Online', distance: '0.8 km', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80' },
];

const CanteenWidget = () => {
  return (
    <section className="db-canteen-section">
      <h3 className="db-section-title">Campus Canteen & Nearby Eateries</h3>
      <div className="canteen-grid">
        {RESTAURANTS.map((res, i) => (
          <div key={i} className="canteen-card">
            <div className="canteen-img-wrapper">
              <img src={res.image} alt={res.name} />
              <div className="canteen-distance">{res.distance}</div>
            </div>
            <div className="canteen-info">
              <h4>{res.name}</h4>
              <button className="btn-order">Order Now</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CanteenWidget;
