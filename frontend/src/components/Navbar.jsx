import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCurrentUser,
  selectCurrentRole,
  selectIsAuthenticated,
  logout,
  switchMockRole
} from '../store/authSlice';
import { selectCartTotalQuantity } from '../store/cartSlice';
import {
  BookOpen,
  ShoppingCart,
  Search,
  User,
  LogOut,
  LogIn,
  Package,
  PlusCircle,
  Tag,
  LifeBuoy,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(selectCurrentUser);
  const currentRole = useSelector(selectCurrentRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cartItemCount = useSelector(selectCartTotalQuantity);

  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Synchronize search input with URL query parameter
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearchQuery(q);
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
  };


  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleRoleSwitch = (role) => {
    dispatch(switchMockRole(role));
    setShowRoleMenu(false);

    // Redirect to the newly selected role's primary dashboard
    switch (role) {
      case 'customer':
        navigate('/');
        break;
      case 'fresh_seller':
        navigate('/seller/fresh');
        break;
      case 'used_seller':
        navigate('/seller/used');
        break;
      case 'marketing':
        navigate('/marketing/campaigns');
        break;
      case 'support':
        navigate('/support/tickets');
        break;
      default:
        navigate('/');
    }
  };

  const formatRoleName = (role) => {
    switch (role) {
      case 'customer':
        return 'Customer';
      case 'fresh_seller':
        return 'Fresh Seller';
      case 'used_seller':
        return 'Used Book Seller';
      case 'marketing':
        return 'Marketing Team';
      case 'support':
        return 'Support Agent';
      default:
        return 'Guest';
    }
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Top Navbar Row */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#fff',
            padding: '0.45rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={22} />
          </div>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            BookVerse
          </span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} style={{
          flex: 1,
          maxWidth: '480px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by title, author, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.4rem',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </form>

        {/* User Account, Role Badge & Cart Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Role Badge & Quick Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              title="Click to switch simulated demo role"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                padding: '0.35rem 0.65rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={16} color="#4f46e5" />
              <span className={`badge badge-${currentRole || 'guest'}`}>
                {formatRoleName(currentRole)}
              </span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {/* Role Dropdown Menu */}
            {showRoleMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                marginTop: '0.5rem',
                width: '210px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                padding: '0.5rem',
                zIndex: 60
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '0.25rem 0.5rem' }}>
                  TEST MULTI-ROLE SWITCHER
                </div>
                {[
                  { id: 'customer', label: 'Customer' },
                  { id: 'fresh_seller', label: 'Fresh Seller' },
                  { id: 'used_seller', label: '2nd Hand Seller' },
                  { id: 'marketing', label: 'Marketing Team' },
                  { id: 'support', label: 'Support Agent' }
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSwitch(r.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.4rem 0.6rem',
                      border: 'none',
                      background: currentRole === r.id ? '#eef2ff' : 'transparent',
                      color: currentRole === r.id ? '#4f46e5' : '#1e293b',
                      fontWeight: currentRole === r.id ? 700 : 500,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem'
                    }}
                  >
                    {r.label}
                    {currentRole === r.id && '✓'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
            <User size={18} color="#64748b" />
            <span style={{ fontWeight: 600, color: '#334155' }}>
              {isAuthenticated ? `Hi, ${user?.name?.split(' ')[0]}` : 'Hi, Guest'}
            </span>
          </div>

          {/* Cart Icon with badge (Visible for Customers & Guests) */}
          {(!currentRole || currentRole === 'customer') && (
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#0f172a'
              }}
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-6px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Log out"
            >
              <LogOut size={15} />
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={15} />
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Role-Specific Navigation Sub-Bar */}
      <nav style={{
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #edf2f7',
        fontSize: '0.85rem'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0.4rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          overflowX: 'auto'
        }}>
          {/* Universal Link */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: location.pathname === '/' ? 700 : 500,
              color: location.pathname === '/' ? '#4f46e5' : '#475569'
            }}
          >
            <BookOpen size={15} />
            Browse Catalog
          </Link>

          {/* Customer Navigation */}
          {currentRole === 'customer' && (
            <>
              <Link
                to="/cart"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/cart' ? 700 : 500,
                  color: location.pathname === '/cart' ? '#4f46e5' : '#475569'
                }}
              >
                <ShoppingCart size={15} />
                My Cart ({cartItemCount})
              </Link>
              <Link
                to="/orders"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/orders' ? 700 : 500,
                  color: location.pathname === '/orders' ? '#4f46e5' : '#475569'
                }}
              >
                <Package size={15} />
                Order History
              </Link>
              <Link
                to="/support-request"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/support-request' ? 700 : 500,
                  color: location.pathname === '/support-request' ? '#4f46e5' : '#475569'
                }}
              >
                <LifeBuoy size={15} />
                Support Request Form
              </Link>
            </>
          )}

          {/* Fresh Seller Navigation */}
          {currentRole === 'fresh_seller' && (
            <>
              <Link
                to="/seller/fresh"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/seller/fresh' ? 700 : 500,
                  color: location.pathname === '/seller/fresh' ? '#166534' : '#475569'
                }}
              >
                <Package size={15} />
                Merchant Dashboard (Stock List)
              </Link>
              <Link
                to="/seller/fresh/add"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/seller/fresh/add' ? 700 : 500,
                  color: location.pathname === '/seller/fresh/add' ? '#166534' : '#475569'
                }}
              >
                <PlusCircle size={15} />
                Add New Book
              </Link>
            </>
          )}

          {/* Used Seller Navigation */}
          {currentRole === 'used_seller' && (
            <>
              <Link
                to="/seller/used"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/seller/used' ? 700 : 500,
                  color: location.pathname === '/seller/used' ? '#92400e' : '#475569'
                }}
              >
                <Package size={15} />
                2nd Hand Dashboard (Stock List)
              </Link>
              <Link
                to="/seller/used/add"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/seller/used/add' ? 700 : 500,
                  color: location.pathname === '/seller/used/add' ? '#92400e' : '#475569'
                }}
              >
                <PlusCircle size={15} />
                Add Used Book (Condition Dropdown)
              </Link>
            </>
          )}

          {/* Marketing Team Navigation */}
          {currentRole === 'marketing' && (
            <>
              <Link
                to="/marketing/campaigns"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/marketing/campaigns' ? 700 : 500,
                  color: location.pathname === '/marketing/campaigns' ? '#86198f' : '#475569'
                }}
              >
                <Tag size={15} />
                Campaign Control Dashboard (Sales & Banners)
              </Link>
            </>
          )}

          {/* Support Team Navigation */}
          {currentRole === 'support' && (
            <>
              <Link
                to="/support/tickets"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: location.pathname === '/support/tickets' ? 700 : 500,
                  color: location.pathname === '/support/tickets' ? '#0369a1' : '#475569'
                }}
              >
                <LifeBuoy size={15} />
                Ticket Management & User Lookup
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
