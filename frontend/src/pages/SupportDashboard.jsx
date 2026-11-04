import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllTickets, fetchTickets, changeTicketStatus } from '../store/ticketSlice';
import { selectCurrentUser } from '../store/authSlice';
import api from '../services/api';
import {
  LifeBuoy,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Filter,
  MessageSquare
} from 'lucide-react';

export const SupportDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const tickets = useSelector(selectAllTickets);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // User Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchTickets({ status: statusFilter }));
  }, [dispatch, statusFilter]);

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (ticketId, newStatus) => {
    dispatch(changeTicketStatus({ id: ticketId, status: newStatus }));
  };

  const handleUserLookup = async (e) => {
    e.preventDefault();
    const query = lookupQuery.toLowerCase().trim();

    try {
      const data = await api.users.lookup(query);
      if (data.users && data.users.length > 0) {
        const u = data.users[0];
        setSearchedUser({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          ordersCount: u.orders_count || 0,
          ticketsCount: u.tickets_count || 0,
          status: 'Active Member'
        });
      } else {
        setSearchedUser('NOT_FOUND');
      }
    } catch (err) {
      // Fallback local search
      const mockDatabaseUsers = [
        { id: 1, name: 'Alice Customer', email: 'customer@bookverse.com', role: 'customer', ordersCount: 3, ticketsCount: 2, status: 'Active' },
        { id: 2, name: 'Nova Press Publishers', email: 'freshseller@bookverse.com', role: 'fresh_seller', ordersCount: 42, ticketsCount: 0, status: 'Verified Merchant' },
        { id: 3, name: 'Bob Vintage Corner', email: 'usedseller@bookverse.com', role: 'used_seller', ordersCount: 19, ticketsCount: 1, status: 'Verified Merchant' }
      ];
      const match = mockDatabaseUsers.find(
        (u) => u.email.toLowerCase().includes(query) || u.name.toLowerCase().includes(query)
      );
      setSearchedUser(match || 'NOT_FOUND');
    }
  };


  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Open':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'In Progress':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'Resolved':
        return { bg: '#dcfce7', text: '#166534' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.65rem', borderRadius: '12px' }}>
            <LifeBuoy size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Support Helpdesk & Ticket Console</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Manage inquiries from both customers and marketplace merchants in one central queue
            </p>
          </div>
        </div>

        {/* Status Counters */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'Open', 'In Progress', 'Resolved'].map((st) => {
            const count = st === 'ALL' ? tickets.length : tickets.filter((t) => t.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* 1. TICKETS TABLE */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <MessageSquare size={18} color="#0284c7" />
              <span>Grievance & Support Tickets ({filteredTickets.length})</span>
            </div>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '8px', top: '9px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search ticket subject..."
                className="form-input"
                style={{ padding: '0.35rem 0.5rem 0.35rem 1.8rem', fontSize: '0.8rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User & Role</th>
                  <th>Order Ref</th>
                  <th>Subject & Inquiry</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No support tickets found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const badge = getStatusBadgeStyle(t.status);
                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.user_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.user_email}</div>
                          <span
                            className="badge"
                            style={{
                              marginTop: '0.2rem',
                              backgroundColor: t.user_role === 'customer' ? '#e0e7ff' : '#fef3c7',
                              color: t.user_role === 'customer' ? '#3730a3' : '#92400e'
                            }}
                          >
                            {t.user_role === 'customer' ? 'Buyer / Reader' : 'Merchant'}
                          </span>
                        </td>

                        <td style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                          {t.order_id || 'General'}
                        </td>

                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{t.subject}</div>
                          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                            {t.message}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                            Opened: {t.created_at}
                          </div>
                        </td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.text
                            }}
                          >
                            {t.status}
                          </span>
                        </td>

                        {/* Status Change Dropdown */}
                        <td>
                          <select
                            className="form-select"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', minWidth: '110px' }}
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. USER LOOKUP TOOL */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <Users size={18} color="#0284c7" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Account & Order Lookup</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            Inspect buyer profile details, role permissions, and active order counts to troubleshoot tickets.
          </p>

          <form onSubmit={handleUserLookup}>
            <div className="form-group">
              <label className="form-label">User Email or Name</label>
              <input
                className="form-input"
                placeholder="e.g. customer@bookverse.com"
                required
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', backgroundColor: '#0284c7' }}
            >
              <Search size={15} />
              Search Member Record
            </button>
          </form>

          {searchedUser === 'NOT_FOUND' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#fef2f2',
              color: '#991b1b',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}>
              No member account matching "{lookupQuery}" was found.
            </div>
          )}

          {searchedUser && searchedUser !== 'NOT_FOUND' && (
            <div style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                    {searchedUser.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{searchedUser.email}</div>
                </div>
                <span className={`badge badge-${searchedUser.role}`}>{searchedUser.role}</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.75rem 0' }} />

              <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>Orders placed / handled: <strong>{searchedUser.ordersCount}</strong></div>
                <div>Support tickets on file: <strong>{searchedUser.ticketsCount}</strong></div>
                <div>Account status: <span style={{ color: '#166534', fontWeight: 600 }}>{searchedUser.status}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
