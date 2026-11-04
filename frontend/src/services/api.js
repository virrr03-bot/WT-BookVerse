const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic request helper with automatic JSON handling and Auth header
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('bv_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.warn(`[API] Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication Endpoints
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),

    getProfile: () => request('/auth/me')
  },

  // Books Catalog & Inventory Endpoints
  books: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.q) query.append('q', params.q);
      if (params.condition && params.condition !== 'ALL') query.append('condition', params.condition);
      if (params.seller_id) query.append('seller_id', params.seller_id);

      const qs = query.toString();
      return request(`/books${qs ? `?${qs}` : ''}`);
    },

    getById: (id) => request(`/books/${id}`),

    create: (bookData) =>
      request('/books', {
        method: 'POST',
        body: JSON.stringify(bookData)
      }),

    updateStock: (id, quantity) =>
      request(`/books/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity })
      }),

    delete: (id) =>
      request(`/books/${id}`, {
        method: 'DELETE'
      })
  },

  // Orders & Checkout Endpoints
  orders: {
    getAll: (buyerId) => {
      const qs = buyerId ? `?buyer_id=${buyerId}` : '';
      return request(`/orders${qs}`);
    },

    create: (orderData) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      }),

    updateStatus: (id, status) =>
      request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  },

  // Marketing Promotions Endpoints
  promotions: {
    getActive: () => request('/promotions'),

    update: (promoData) =>
      request('/promotions', {
        method: 'PUT',
        body: JSON.stringify(promoData)
      })
  },

  // Support Tickets Endpoints
  tickets: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.userId) query.append('user_id', params.userId);
      if (params.status && params.status !== 'ALL') query.append('status', params.status);

      const qs = query.toString();
      return request(`/tickets${qs ? `?${qs}` : ''}`);
    },

    create: (ticketData) =>
      request('/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketData)
      }),

    updateStatus: (id, status) =>
      request(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  },

  // User Lookup
  users: {
    lookup: (query) =>
      request(`/users/lookup?query=${encodeURIComponent(query)}`)
  }
};

export default api;
