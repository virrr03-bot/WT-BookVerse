import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartTotalAmount,
  selectCartDiscountAmount,
  selectCartGrandTotal,
  selectCartPromotion,
  updateQuantity,
  removeFromCart,
  clearCart
} from '../store/cartSlice';
import { selectCurrentUser } from '../store/authSlice';
import { placeOrder } from '../store/orderSlice';
import { reduceStockAfterPurchase } from '../store/bookSlice';
import {
  ShoppingCart,
  Trash2,
  Tag,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const CartCheckout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const items = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const discountAmount = useSelector(selectCartDiscountAmount);
  const grandTotal = useSelector(selectCartGrandTotal);
  const promotion = useSelector(selectCartPromotion);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const handleSimulatePayment = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);

    try {
      const generatedOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      // Post order to backend API & SQLite database
      await dispatch(
        placeOrder({
          buyer_id: user?.id || 1,
          items: items.map((item) => ({
            book_id: item.id,
            quantity: item.quantity,
            total_price: parseFloat((item.price * item.quantity).toFixed(2))
          }))
        })
      );

      // Reduce inventory in local cache
      dispatch(
        reduceStockAfterPurchase(
          items.map((i) => ({ id: i.id, quantity: i.quantity }))
        )
      );

      // Clear shopping cart
      dispatch(clearCart());

      setPlacedOrderId(generatedOrderId);
      setOrderComplete(true);
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setIsProcessing(false);
    }
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
    <div className="container" style={{ maxWidth: '1000px' }}>
      {/* SUCCESS SCREEN */}
      {orderComplete ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <CheckCircle size={36} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#166534' }}>
            Payment Successful & Order Placed!
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.5rem' }}>
            Your transaction was processed. Reference Batch ID: <strong>{placedOrderId}</strong>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Status: <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pending</span>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/orders" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
              View in Customer Orders
            </Link>
            <Link to="/" className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : items.length === 0 ? (
        /* EMPTY CART VIEW */
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            background: '#f1f5f9',
            color: '#94a3b8',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <ShoppingCart size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Your cart is empty</h2>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
            Looks like you haven't added any books yet. Check out our fresh arrivals and vintage classics.
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            Explore Catalog
          </Link>
        </div>
      ) : (
        /* ACTIVE CART & CHECKOUT SPLIT */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Shopping Cart</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Review selected book editions before proceeding to payment
              </p>
            </div>
            <button
              onClick={() => dispatch(clearCart())}
              className="btn btn-secondary btn-sm"
              style={{ color: '#ef4444' }}
            >
              <Trash2 size={14} />
              Clear Cart
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
            {/* Added Books Table */}
            <div className="card" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Book Details</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>by {item.author}</div>
                          <div style={{ marginTop: '0.25rem' }}>
                            <span className={`badge ${getConditionBadgeClass(item.condition)}`}>
                              {item.condition}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}
                            title="Remove from cart"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Summary & Payment Simulation */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={18} color="#4f46e5" />
                Order & Price Summary
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Catalog Subtotal</span>
                <span style={{ fontWeight: 600 }}>${totalAmount.toFixed(2)}</span>
              </div>

              {/* Festival Discount Calculation */}
              {promotion && promotion.is_active === 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  background: '#f0fdf4',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={14} />
                    <span>{promotion.sale_name} ({promotion.discount_percent}%)</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Standard Shipping</span>
                <span style={{ color: '#166534', fontWeight: 600 }}>FREE</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Grand Total</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Includes all taxes and discounts</div>
                </div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4f46e5' }}>
                  ${grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Payment Simulation Button */}
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isProcessing ? (
                  <span>Processing Secure Checkout...</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Place Order (${grandTotal.toFixed(2)})
                  </>
                )}
              </button>

              <div style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                textAlign: 'center',
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}>
                <ShieldCheck size={14} />
                Instant checkout simulation — orders recorded with Pending status
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartCheckout;
