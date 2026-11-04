import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllOrders, fetchOrders, changeOrderStatus } from '../store/orderSlice';
import { submitTicket } from '../store/ticketSlice';
import { selectCurrentUser } from '../store/authSlice';
import {
  Package,
  XCircle,
  RotateCcw,
  LifeBuoy,
  CheckCircle,
  AlertCircle,
  Clock,
  Send
} from 'lucide-react';

export const CustomerOrders = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const allOrders = useSelector(selectAllOrders);

  // Fetch orders from backend on mount
  useEffect(() => {
    dispatch(fetchOrders(user?.id));
  }, [dispatch, user?.id]);

  // Filter orders for current user or show all orders
  const orders = allOrders.filter(
    (o) => !user || o.buyer_id === user.id || o.buyer_name === user.name
  );

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || 'General');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleCancel = (orderId) => {
    if (window.confirm(`Are you sure you want to cancel order ${orderId}?`)) {
      dispatch(changeOrderStatus({ id: orderId, status: 'Cancelled' }));
    }
  };

  const handleReturn = (orderId) => {
    if (window.confirm(`Submit a return request for order ${orderId}?`)) {
      dispatch(changeOrderStatus({ id: orderId, status: 'Returned' }));
    }
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    dispatch(
      submitTicket({
        user_id: user?.id || 1,
        user_name: user?.name || 'Alice Customer',
        user_email: user?.email || 'customer@bookverse.com',
        user_role: 'customer',
        order_id: selectedOrderId,
        subject: ticketSubject,
        message: ticketMessage
      })
    );


    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSubmitted(false), 3500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return { bg: '#fef3c7', text: '#92400e', icon: <Clock size={12} /> };
      case 'Shipped':
        return { bg: '#e0f2fe', text: '#0369a1', icon: <Package size={12} /> };
      case 'Delivered':
        return { bg: '#dcfce7', text: '#166534', icon: <CheckCircle size={12} /> };
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#991b1b', icon: <XCircle size={12} /> };
      case 'Returned':
        return { bg: '#f3e8ff', text: '#7e22ce', icon: <RotateCcw size={12} /> };
      default:
        return { bg: '#f1f5f9', text: '#475569', icon: null };
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Orders & Purchases</h1>
        <p style={{ color: '#64748b' }}>
          Track book dispatch statuses, initiate cancellations or returns, and request order support
        </p>
      </div>

      {/* 1. ORDERS TABLE */}
      <div className="card" style={{ padding: 0, marginBottom: '2.5rem' }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>Placed Orders ({orders.length})</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Updated in real-time</span>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No orders found. Add books from the catalog to place your first order!
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Book Title</th>
                  <th>Quantity</th>
                  <th>Total Cost</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const isPending = ord.status === 'Pending';
                  const isDelivered = ord.status === 'Delivered';

                  return (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 700, color: '#4f46e5' }}>{ord.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{ord.book_title}</div>
                      </td>
                      <td>{ord.quantity}</td>
                      <td style={{ fontWeight: 700 }}>${Number(ord.total_price).toFixed(2)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{ord.created_at}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {badge.icon}
                          {ord.status}
                        </span>
                      </td>
                      <td>
                        {/* Red Cancel Button if Pending */}
                        {isPending && (
                          <button
                            onClick={() => handleCancel(ord.id)}
                            className="btn btn-danger btn-sm"
                            title="Cancel this pending order"
                          >
                            <XCircle size={14} />
                            Cancel Order
                          </button>
                        )}

                        {/* Request Return Button if Delivered */}
                        {isDelivered && (
                          <button
                            onClick={() => handleReturn(ord.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ borderColor: '#a855f7', color: '#7e22ce' }}
                            title="Request a return for this delivered item"
                          >
                            <RotateCcw size={14} />
                            Request Return
                          </button>
                        )}

                        {!isPending && !isDelivered && (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. SUBMIT CUSTOMER SUPPORT TICKET FORM */}
      <div className="card" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.45rem', borderRadius: '8px' }}>
            <LifeBuoy size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submit Support Inquiry</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Have questions regarding condition discrepancies, logistics, or returns? Let us know.
            </p>
          </div>
        </div>

        {ticketSubmitted && (
          <div style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={18} />
            Support ticket opened! Our helpdesk staff has received it with status: <strong>Open</strong>.
          </div>
        )}

        <form onSubmit={handleTicketSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                placeholder="e.g. Delayed delivery or damaged page report"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Related Order</label>
              <select
                className="form-select"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
              >
                <option value="General">General Inquiries / Account</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} ({o.book_title.substring(0, 20)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message Details</label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder="Describe your issue or return inquiry..."
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Send size={15} />
            Submit Support Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerOrders;
