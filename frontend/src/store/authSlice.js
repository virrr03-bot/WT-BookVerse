import { createSlice } from '@reduxjs/toolkit';

// Retrieve cached auth session from localStorage safely
const getInitialAuth = () => {
  try {
    const token = localStorage.getItem('bv_token');
    const userStr = localStorage.getItem('bv_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      token: token || null,
      user: user || null,
      role: user?.role || null,
      isAuthenticated: !!(token && user)
    };
  } catch (e) {
    console.error('Failed to parse cached auth session:', e);
    return {
      token: null,
      user: null,
      role: null,
      isAuthenticated: false
    };
  }
};

const initialSession = getInitialAuth();

const initialState = {
  user: initialSession.user,
  token: initialSession.token,
  role: initialSession.role,
  isAuthenticated: initialSession.isAuthenticated,
  loading: false,
  error: null
};

// Preset demo accounts for each role for quick testing
export const DEMO_USERS = {
  customer: {
    id: 1,
    name: 'Alice Johnson',
    email: 'customer@bookverse.com',
    role: 'customer'
  },
  fresh_seller: {
    id: 2,
    name: 'Nova Press Publishers',
    email: 'freshseller@bookverse.com',
    role: 'fresh_seller'
  },
  used_seller: {
    id: 3,
    name: 'Bob Vintage Corner',
    email: 'usedseller@bookverse.com',
    role: 'used_seller'
  },
  marketing: {
    id: 4,
    name: 'Maya Marketing Lead',
    email: 'marketing@bookverse.com',
    role: 'marketing'
  },
  support: {
    id: 5,
    name: 'Sam Customer Support',
    email: 'support@bookverse.com',
    role: 'support'
  }
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = user?.role || null;
      state.isAuthenticated = !!(user && token);
      state.error = null;

      try {
        if (token) localStorage.setItem('bv_token', token);
        if (user) localStorage.setItem('bv_user', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to persist auth session:', e);
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;

      try {
        localStorage.removeItem('bv_token');
        localStorage.removeItem('bv_user');
      } catch (e) {
        console.error('Failed to clear auth session:', e);
      }
    },

    // Quick role switcher for testing multi-role routing
    switchMockRole: (state, action) => {
      const targetRole = action.payload;
      const demoUser = DEMO_USERS[targetRole] || {
        id: 99,
        name: `Test ${targetRole}`,
        email: `${targetRole}@bookverse.com`,
        role: targetRole
      };
      const mockToken = `mock_jwt_token_${targetRole}_${Date.now()}`;

      state.user = demoUser;
      state.token = mockToken;
      state.role = targetRole;
      state.isAuthenticated = true;
      state.error = null;

      try {
        localStorage.setItem('bv_token', mockToken);
        localStorage.setItem('bv_user', JSON.stringify(demoUser));
      } catch (e) {
        console.error('Failed to persist mock role session:', e);
      }
    },

    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setCredentials, logout, switchMockRole, setAuthLoading, setAuthError } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentToken = (state) => state.auth.token;

export default authSlice.reducer;
