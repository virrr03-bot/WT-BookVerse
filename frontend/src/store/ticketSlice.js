import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const defaultTickets = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Alice Customer',
    user_email: 'customer@bookverse.com',
    user_role: 'customer',
    order_id: 'ORD-9821',
    subject: 'Inquiry regarding shipment delivery timeframe',
    message: 'Hello, when can I expect my order for Clean Code to be dispatched?',
    status: 'Open',
    created_at: '2026-10-28 15:30'
  },
  {
    id: 2,
    user_id: 3,
    user_name: 'Bob Vintage Corner',
    user_email: 'usedseller@bookverse.com',
    user_role: 'used_seller',
    order_id: 'N/A',
    subject: 'Bulk inventory listing question',
    message: 'Can I upload a CSV of secondhand book titles with condition gradings?',
    status: 'In Progress',
    created_at: '2026-10-27 11:20'
  },
  {
    id: 3,
    user_id: 1,
    user_name: 'Alice Customer',
    user_email: 'customer@bookverse.com',
    user_role: 'customer',
    order_id: 'ORD-9750',
    subject: 'Book receipt confirmation',
    message: 'The delivered Pragmatic Programmer book is in pristine condition. Thank you!',
    status: 'Resolved',
    created_at: '2026-10-23 18:00'
  }
];

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await api.tickets.getAll(params);
      return data.tickets;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitTicket = createAsyncThunk(
  'tickets/submitTicket',
  async (ticketData, { rejectWithValue }) => {
    try {
      const data = await api.tickets.create(ticketData);
      return data.ticket;
    } catch (err) {
      return { id: Date.now(), status: 'Open', created_at: new Date().toLocaleString(), ...ticketData };
    }
  }
);

export const changeTicketStatus = createAsyncThunk(
  'tickets/changeTicketStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await api.tickets.updateStatus(id, status);
      return data.ticket;
    } catch (err) {
      return { id, status };
    }
  }
);

export const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: defaultTickets,
    loading: false,
    error: null
  },
  reducers: {
    addTicket: (state, action) => {
      const newTicket = {
        id: Date.now(),
        status: 'Open',
        created_at: new Date().toLocaleString(),
        ...action.payload
      };
      state.tickets.unshift(newTicket);
    },
    updateTicketStatus: (state, action) => {
      const { id, status } = action.payload;
      const target = state.tickets.find((t) => t.id === id);
      if (target) {
        target.status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.tickets = action.payload;
        }
      })
      .addCase(submitTicket.fulfilled, (state, action) => {
        if (action.payload) {
          state.tickets.unshift(action.payload);
        }
      })
      .addCase(changeTicketStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const target = state.tickets.find((t) => t.id === updated.id);
        if (target) {
          target.status = updated.status;
        }
      });
  }
});

export const { addTicket, updateTicketStatus } = ticketSlice.actions;
export const selectAllTickets = (state) => state.tickets.tickets;
export default ticketSlice.reducer;
