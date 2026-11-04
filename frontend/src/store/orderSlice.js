import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const defaultOrders = [
  {
    id: 'ORD-9821',
    buyer_id: 1,
    buyer_name: 'Alice Customer',
    book_id: 1,
    book_title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    quantity: 1,
    total_price: 39.99,
    status: 'Pending',
    created_at: '2026-10-28 14:15'
  },
  {
    id: 'ORD-9750',
    buyer_id: 1,
    buyer_name: 'Alice Customer',
    book_id: 2,
    book_title: 'The Pragmatic Programmer: Your Journey to Mastery',
    quantity: 1,
    total_price: 44.99,
    status: 'Delivered',
    created_at: '2026-10-22 09:30'
  },
  {
    id: 'ORD-9610',
    buyer_id: 1,
    buyer_name: 'Alice Customer',
    book_id: 4,
    book_title: 'To Kill a Mockingbird',
    quantity: 2,
    total_price: 25.98,
    status: 'Shipped',
    created_at: '2026-10-24 16:40'
  }
];

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (buyerId, { rejectWithValue }) => {
    try {
      const data = await api.orders.getAll(buyerId);
      return data.orders;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderPayload, { rejectWithValue }) => {
    try {
      const data = await api.orders.create(orderPayload);
      return data.orders;
    } catch (err) {
      return orderPayload.items || [orderPayload];
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  'orders/changeOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await api.orders.updateStatus(id, status);
      return data.order;
    } catch (err) {
      return { id, status };
    }
  }
);

export const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: defaultOrders,
    loading: false,
    error: null
  },
  reducers: {
    createOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
    cancelOrder: (state, action) => {
      const orderId = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order && order.status === 'Pending') {
        order.status = 'Cancelled';
      }
    },
    requestReturn: (state, action) => {
      const orderId = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order && order.status === 'Delivered') {
        order.status = 'Returned';
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.orders = action.payload;
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.orders = [...action.payload, ...state.orders];
        } else if (action.payload) {
          state.orders.unshift(action.payload);
        }
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const target = state.orders.find((o) => o.id === updated.id);
        if (target) {
          target.status = updated.status;
        }
      });
  }
});

export const { createOrder, cancelOrder, requestReturn } = orderSlice.actions;
export const selectAllOrders = (state) => state.orders.orders;
export default orderSlice.reducer;
