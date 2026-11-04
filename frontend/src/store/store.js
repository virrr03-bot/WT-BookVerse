import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import bookReducer from './bookSlice';
import orderReducer from './orderSlice';
import ticketReducer from './ticketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    books: bookReducer,
    orders: orderReducer,
    tickets: ticketReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;
