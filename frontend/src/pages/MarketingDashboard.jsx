import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartPromotion, savePromotion, fetchActivePromotion } from '../store/cartSlice';
import {
  Tag,
  Sliders,
  CheckCircle,
  Eye,
  Sparkles,
  Megaphone,
  Percent,
  Power
} from 'lucide-react';

export const MarketingDashboard = () => {
  const dispatch = useDispatch();
  const currentPromo = useSelector(selectCartPromotion);

  const [saleName, setSaleName] = useState(
    currentPromo?.sale_name || 'Grand Autumn & Festival Literary Carnival'
  );
  const [discountPercent, setDiscountPercent] = useState(
    currentPromo?.discount_percent ?? 20
  );
  const [isActive, setIsActive] = useState(
    currentPromo ? currentPromo.is_active === 1 : true
  );
  const [bannerTagline, setBannerTagline] = useState(
    'Special festival deals on select publisher prints and pre-loved bestsellers!'
  );
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    dispatch(fetchActivePromotion());
  }, [dispatch]);

  useEffect(() => {
    if (currentPromo) {
      setSaleName(currentPromo.sale_name || 'Grand Autumn & Festival Literary Carnival');
      setDiscountPercent(currentPromo.discount_percent ?? 20);
      setIsActive(currentPromo.is_active === 1);
    }
  }, [currentPromo]);

  const handleSaveCampaign = (e) => {
    e.preventDefault();

    dispatch(
      savePromotion({
        sale_name: saleName,
        discount_percent: parseFloat(discountPercent) || 0,
        is_active: isActive ? 1 : 0
      })
    );

    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };


  return (
    <div className="container" style={{ maxWidth: '880px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div style={{ background: '#fae8ff', color: '#86198f', padding: '0.65rem', borderRadius: '12px' }}>
          <Megaphone size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Marketing Campaign Control</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Broadcast sitewide festival discount banners, configure flash sales, and manage buyer incentives
          </p>
        </div>
      </div>

      {savedNotification && (
        <div style={{
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <CheckCircle size={20} color="#059669" />
          <span>Campaign configuration applied! Customers now see your updated banner & cart discount.</span>
        </div>
      )}

      {/* 1. LIVE BANNER PREVIEW */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <Eye size={15} />
          Live Buyer Banner Preview:
        </div>

        <div style={{
          background: isActive
            ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)'
            : '#64748b',
          color: '#ffffff',
          padding: '1.5rem 2rem',
          borderRadius: '14px',
          boxShadow: '0 8px 18px -4px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              <Sparkles size={12} />
              {isActive ? 'Live Festival Campaign' : 'Campaign Paused'}
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>{saleName || 'Unnamed Sale'}</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.95, maxWidth: '580px', marginTop: '0.25rem' }}>
              {bannerTagline || 'Enjoy exclusive seasonal discounts across selected categories.'}{' '}
              {isActive && (
                <strong style={{ textDecoration: 'underline' }}>{discountPercent}% OFF at checkout!</strong>
              )}
            </p>
          </div>

          <span
            className="badge"
            style={{
              backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
              color: isActive ? '#166534' : '#991b1b',
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem'
            }}
          >
            {isActive ? 'ACTIVE ON CATALOG' : 'INACTIVE / DRAFT'}
          </span>
        </div>
      </div>

      {/* 2. CAMPAIGN CONFIGURATION FORM */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sliders size={18} color="#4f46e5" />
          Campaign Parameters & Controls
        </h2>

        <form onSubmit={handleSaveCampaign}>
          {/* Active Switch */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Power size={16} color={isActive ? '#10b981' : '#94a3b8'} />
                Enable Festival Campaign
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                When activated, the banner appears across Home Catalog and deductions apply to Shopping Carts.
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isActive ? '#4f46e5' : '#cbd5e1',
                borderRadius: '34px',
                transition: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '20px',
                  width: '20px',
                  left: isActive ? '26px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.2s'
                }} />
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Festival Sale Name (Announcement Title)</label>
            <input
              type="text"
              className="form-input"
              required
              value={saleName}
              onChange={(e) => setSaleName(e.target.value)}
              placeholder="e.g. Grand Diwali & Autumn Literary Carnival"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Banner Subtitle / Promotional Tagline</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={bannerTagline}
              onChange={(e) => setBannerTagline(e.target.value)}
              placeholder="Write a catchy announcement for customers..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Discount Percentage Applied at Checkout (%)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="range"
                min="0"
                max="75"
                step="5"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                style={{ flex: 1, cursor: 'pointer' }}
              />
              <div style={{
                minWidth: '70px',
                padding: '0.45rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#4f46e5'
              }}>
                {discountPercent}%
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              Customers checking out will see this discount automatically calculated on their invoice.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', fontSize: '0.95rem' }}
          >
            <Tag size={16} />
            Publish & Update Campaign
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarketingDashboard;
