import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { selectAllBooks, fetchBooks } from '../store/bookSlice';
import { selectCartPromotion, fetchActivePromotion, addToCart } from '../store/cartSlice';
import {
  BookOpen,
  ShoppingCart,
  Search,
  Tag,
  CheckCircle,
  Sparkles,
  AlertOctagon,
  X,
  RotateCcw
} from 'lucide-react';

export const HomeCatalog = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Read search term from URL query parameter
  const qParam = new URLSearchParams(location.search).get('q') || '';

  const books = useSelector(selectAllBooks);
  const promotion = useSelector(selectCartPromotion);

  const [filterCondition, setFilterCondition] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [cartAlert, setCartAlert] = useState('');

  // Synchronize state and trigger backend fetch when URL query or condition changes
  useEffect(() => {
    setSearchTerm(qParam);
    dispatch(fetchBooks({ q: qParam, condition: filterCondition }));
    dispatch(fetchActivePromotion());
  }, [qParam, filterCondition, dispatch]);

  // Handle in-page live search input
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    const params = new URLSearchParams(location.search);
    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    const searchString = params.toString();
    navigate(searchString ? `/?${searchString}` : '/', { replace: true });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilterCondition('ALL');
    navigate('/', { replace: true });
  };

  // Immediate in-memory fallback filtering so results react instantly as you type
  const normalizedTerm = searchTerm.trim().toLowerCase();
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !normalizedTerm ||
      book.title.toLowerCase().includes(normalizedTerm) ||
      book.author.toLowerCase().includes(normalizedTerm) ||
      book.condition.toLowerCase().includes(normalizedTerm);

    const matchesCondition =
      filterCondition === 'ALL' ||
      (filterCondition === 'NEW' && book.condition === 'New') ||
      (filterCondition === 'USED' && book.condition !== 'New');

    return matchesSearch && matchesCondition;
  });

  const handleAddToCart = (book) => {
    if (book.quantity <= 0) return;

    dispatch(
      addToCart({
        id: book.id,
        title: book.title,
        author: book.author,
        condition: book.condition,
        price: book.discount_price || book.original_price,
        quantity: 1,
        maxQuantity: book.quantity
      })
    );

    setCartAlert(`Added "${book.title}" to your cart!`);
    setTimeout(() => setCartAlert(''), 2500);
  };

  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case 'New':
        return 'badge-fresh_seller';
      case 'Like New':
        return 'badge-used_seller';
      case 'Good':
        return 'badge-marketing';
      case 'Acceptable':
        return 'badge-guest';
      default:
        return 'badge-customer';
    }
  };

  return (
    <div className="container">
      {/* 1. MARKETING FESTIVAL BANNER */}
      {promotion && promotion.is_active === 1 && (
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
          color: '#ffffff',
          padding: '1.5rem 2rem',
          borderRadius: '14px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.35)'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '0.5rem'
            }}>
              <Sparkles size={14} />
              Active Festival Campaign
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0' }}>
              {promotion.sale_name}
            </h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.95, maxWidth: '650px' }}>
              Special limited-time festival discount: Get{' '}
              <strong style={{ textDecoration: 'underline' }}>{promotion.discount_percent}% OFF</strong> on
              eligible titles at checkout!
            </p>
          </div>

          <Link
            to="/cart"
            className="btn"
            style={{
              backgroundColor: '#ffffff',
              color: '#4f46e5',
              fontWeight: 700,
              padding: '0.65rem 1.25rem',
              borderRadius: '10px'
            }}
          >
            <Tag size={16} />
            Claim {promotion.discount_percent}% Off in Cart
          </Link>
        </div>
      )}

      {/* Cart Toast Notification */}
      {cartAlert && (
        <div style={{
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} color="#059669" />
          <span>{cartAlert}</span>
        </div>
      )}

      {/* Catalog Search & Filter Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Browse Book Catalog</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Showing {filteredBooks.length} available titles across new publisher editions & pre-loved copies
          </p>
        </div>

        {/* Filter Tabs & In-Page Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search title, author, condition..."
              className="form-input"
              style={{
                paddingLeft: '2.1rem',
                paddingRight: searchTerm ? '2rem' : '0.75rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem'
              }}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title="Clear search query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[
              { id: 'ALL', label: 'All Editions' },
              { id: 'NEW', label: 'Brand New' },
              { id: 'USED', label: '2nd Hand' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterCondition(tab.id)}
                className={`btn ${filterCondition === tab.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Search / Filter Indicator Badge */}
      {normalizedTerm && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          padding: '0.4rem 0.85rem',
          background: '#eef2ff',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#3730a3'
        }}>
          <span>
            Filtering by search query: <strong>"{searchTerm}"</strong> ({filteredBooks.length} results)
          </span>
          <button
            onClick={handleClearSearch}
            className="btn btn-sm btn-secondary"
            style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
          >
            <X size={12} />
            Reset Search
          </button>
        </div>
      )}

      {/* 2. GRID OF BOOKS */}
      {filteredBooks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
            No books found matching "{searchTerm}"
          </h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            We couldn't find any titles, authors, or editions matching your query. Check for typos or reset the search filters.
          </p>
          <button
            onClick={handleClearSearch}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RotateCcw size={16} />
            Reset Search & View All Books
          </button>
        </div>
      ) : (
        <div className="grid-cols-3">
          {filteredBooks.map((book) => {
            const isOutOfStock = book.quantity <= 0;
            const hasDiscount = book.discount_price && book.discount_price < book.original_price;

            return (
              <div
                key={book.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isOutOfStock ? 0.75 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className={`badge ${getConditionBadgeClass(book.condition)}`}>
                      {book.condition}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isOutOfStock ? '#ef4444' : '#64748b' }}>
                      {isOutOfStock ? '0 in stock' : `${book.quantity} left`}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    marginBottom: '0.35rem',
                    color: '#0f172a'
                  }}>
                    {book.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    by <span style={{ color: '#334155', fontWeight: 600 }}>{book.author}</span>
                  </p>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    Seller: {book.seller_name || 'BookVerse Merchant'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                      ${(book.discount_price || book.original_price).toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ${book.original_price.toFixed(2)}
                      </span>
                    )}
                    {hasDiscount && (
                      <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        Save ${(book.original_price - book.discount_price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {isOutOfStock ? (
                    <button
                      disabled
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        cursor: 'not-allowed',
                        color: '#94a3b8',
                        background: '#f1f5f9'
                      }}
                    >
                      <AlertOctagon size={16} />
                      Out of Stock
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(book)}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomeCatalog;
