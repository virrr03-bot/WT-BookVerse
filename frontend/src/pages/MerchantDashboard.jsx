import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectCurrentRole } from '../store/authSlice';
import {
  selectAllBooks,
  fetchBooks,
  createBook,
  adjustStock,
  removeBook
} from '../store/bookSlice';
import {
  Package,
  PlusCircle,
  Tag,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Building2,
  BookOpen,
  Layers
} from 'lucide-react';

export const MerchantDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const currentRole = useSelector(selectCurrentRole) || 'fresh_seller';
  const allBooks = useSelector(selectAllBooks);

  const isFreshSeller = currentRole === 'fresh_seller';

  // Load books from backend on mount
  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  // Filter books posted by this seller or by role
  const inventory = allBooks.filter((b) =>
    isFreshSeller ? b.seller_role === 'fresh_seller' : b.seller_role === 'used_seller'
  );

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [condition, setCondition] = useState(isFreshSeller ? 'New' : 'Good');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handlePostBook = (e) => {
    e.preventDefault();

    const newBook = {
      seller_id: user?.id || (isFreshSeller ? 2 : 3),
      seller_role: currentRole,
      seller_name: user?.name || (isFreshSeller ? 'Nova Press Publishers' : 'Bob Vintage Corner'),
      title,
      author,
      condition: isFreshSeller ? 'New' : condition,
      original_price: parseFloat(originalPrice),
      discount_price: discountPrice ? parseFloat(discountPrice) : null,
      quantity: parseInt(quantity, 10)
    };

    dispatch(createBook(newBook));

    setSuccessNotice(`Successfully listed "${title}" in active inventory & catalog!`);
    setTitle('');
    setAuthor('');
    if (!isFreshSeller) setCondition('Good');
    setOriginalPrice('');
    setDiscountPrice('');
    setQuantity('');

    setTimeout(() => setSuccessNotice(''), 3000);
  };

  const handleAdjustStock = (bookId, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    dispatch(adjustStock({ id: bookId, quantity: newQty }));
  };

  const handleDelete = (bookId, bookTitle) => {
    if (window.confirm(`Delete listing "${bookTitle}"?`)) {
      dispatch(removeBook(bookId));
    }
  };


  return (
    <div className="container">
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: isFreshSeller ? '#dcfce7' : '#fef3c7',
            color: isFreshSeller ? '#166534' : '#92400e',
            padding: '0.65rem',
            borderRadius: '12px'
          }}>
            {isFreshSeller ? <Building2 size={28} /> : <BookOpen size={28} />}
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {isFreshSeller ? 'Fresh Publisher Merchant Dashboard' : '2nd Hand / Pre-Owned Merchant Dashboard'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Logged in as: <strong>{user?.name || (isFreshSeller ? 'Nova Press' : 'Vintage Seller Bob')}</strong> | 
              Condition permission: <span className={`badge ${isFreshSeller ? 'badge-fresh_seller' : 'badge-used_seller'}`}>
                {isFreshSeller ? 'Strictly Brand New' : 'New, Like New, Good, Acceptable'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {successNotice && (
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
          <CheckCircle size={18} />
          {successNotice}
        </div>
      )}

      {/* Main Grid: Inventory Table & Post Book Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
        {/* ACTIVE INVENTORY LIST */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={18} color="#4f46e5" />
              <span style={{ fontWeight: 700 }}>Active Merchant Inventory ({inventory.length} Titles)</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Total stock: {inventory.reduce((acc, curr) => acc + curr.quantity, 0)} units
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title & Author</th>
                  <th>Condition</th>
                  <th>Pricing</th>
                  <th>Units in Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No inventory listed yet. Use the form to list your first book!
                    </td>
                  </tr>
                ) : (
                  inventory.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>by {b.author}</div>
                      </td>
                      <td>
                        <span className={`badge ${b.condition === 'New' ? 'badge-fresh_seller' : 'badge-used_seller'}`}>
                          {b.condition}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>${b.original_price.toFixed(2)}</div>
                        {b.discount_price && (
                          <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                            Sale: ${b.discount_price.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ width: '24px', height: '24px', padding: 0 }}
                            onClick={() => handleAdjustStock(b.id, b.quantity, -1)}
                            title="Decrease stock"
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                            {b.quantity}
                          </span>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ width: '24px', height: '24px', padding: 0 }}
                            onClick={() => handleAdjustStock(b.id, b.quantity, +1)}
                            title="Restock +1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(b.id, b.title)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          title="Delete Listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* POST BOOK FORM */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PlusCircle size={20} color={isFreshSeller ? '#166534' : '#92400e'} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {isFreshSeller ? 'Publish New Book' : 'List Pre-Owned / Used Book'}
            </h2>
          </div>

          <form onSubmit={handlePostBook}>
            <div className="form-group">
              <label className="form-label">Book Title</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Modern Software Engineering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Author Name</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Dave Farley"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            {/* Condition Tag: Handled for 2nd-hand vs fresh seller */}
            <div className="form-group">
              <label className="form-label">
                Condition Grading {isFreshSeller && '(Locked for Publishers)'}
              </label>
              {isFreshSeller ? (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span className="badge badge-fresh_seller">New</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Fresh sellers are authorized to publish Brand New copies only.
                  </span>
                </div>
              ) : (
                <select
                  className="form-select"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="New">New (Surplus / Uncirculated)</option>
                  <option value="Like New">Like New (Mint cover and crisp pages)</option>
                  <option value="Good">Good (Light spine crease or minor shelf wear)</option>
                  <option value="Acceptable">Acceptable (Readable copy with notations/wear)</option>
                </select>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Original Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  className="form-input"
                  required
                  placeholder="39.99"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discount Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="Optional sale price"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity Available</label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                placeholder="e.g. 15"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={`btn ${isFreshSeller ? 'btn-success' : 'btn-primary'}`}
              style={{
                width: '100%',
                padding: '0.7rem',
                backgroundColor: isFreshSeller ? '#166534' : '#b45309'
              }}
            >
              <PlusCircle size={16} />
              List Book in Store
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
