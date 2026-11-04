import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const getInitialCart = () => {
  try {
    const cachedCart = localStorage.getItem('bv_cart');
    if (cachedCart) {
      return JSON.parse(cachedCart);
    }
  } catch (e) {
    console.error('Failed to load cached cart:', e);
  }
  return {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    discountAmount: 0,
    grandTotal: 0,
    promotion: {
      id: 1,
      sale_name: 'Grand Autumn & Festival Literary Carnival',
      discount_percent: 20,
      is_active: 1
    }
  };
};

const initialCartState = getInitialCart();

const recalculateTotals = (state) => {
  state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const rawTotal = state.items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );
  state.totalAmount = parseFloat(rawTotal.toFixed(2));

  if (state.promotion && state.promotion.is_active && state.promotion.discount_percent > 0) {
    const discount = (state.totalAmount * state.promotion.discount_percent) / 100;
    state.discountAmount = parseFloat(discount.toFixed(2));
  } else {
    state.discountAmount = 0;
  }

  state.grandTotal = parseFloat(Math.max(0, state.totalAmount - state.discountAmount).toFixed(2));

  try {
    localStorage.setItem(
      'bv_cart',
      JSON.stringify({
        items: state.items,
        totalQuantity: state.totalQuantity,
        totalAmount: state.totalAmount,
        discountAmount: state.discountAmount,
        grandTotal: state.grandTotal,
        promotion: state.promotion
      })
    );
  } catch (e) {
    console.error('Failed to cache cart:', e);
  }
};

// Async thunks for promotions
export const fetchActivePromotion = createAsyncThunk(
  'cart/fetchActivePromotion',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.promotions.getActive();
      return data.promotion;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const savePromotion = createAsyncThunk(
  'cart/savePromotion',
  async (promoData, { rejectWithValue }) => {
    try {
      const data = await api.promotions.update(promoData);
      return data.promotion;
    } catch (err) {
      return promoData;
    }
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addToCart: (state, action) => {
      const { id, title, author, condition, price, quantity = 1, maxQuantity = 99 } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        existingItem.quantity = Math.min(newQty, maxQuantity);
      } else {
        state.items.push({
          id,
          title,
          author,
          condition: condition || 'New',
          price: Number(price) || 0,
          quantity: Math.min(quantity, maxQuantity),
          maxQuantity
        });
      }

      recalculateTotals(state);
    },

    removeFromCart: (state, action) => {
      const idToRemove = action.payload;
      state.items = state.items.filter((item) => item.id !== idToRemove);
      recalculateTotals(state);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const targetItem = state.items.find((item) => item.id === id);

      if (targetItem) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item.id !== id);
        } else {
          targetItem.quantity = Math.min(quantity, targetItem.maxQuantity || 99);
        }
      }

      recalculateTotals(state);
    },

    clearCart: (state) => {
      state.items = [];
      recalculateTotals(state);
    },

    applyPromotion: (state, action) => {
      state.promotion = action.payload;
      recalculateTotals(state);
    },

    removePromotion: (state) => {
      state.promotion = null;
      recalculateTotals(state);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivePromotion.fulfilled, (state, action) => {
        if (action.payload) {
          state.promotion = action.payload;
          recalculateTotals(state);
        }
      })
      .addCase(savePromotion.fulfilled, (state, action) => {
        if (action.payload) {
          state.promotion = action.payload;
          recalculateTotals(state);
        }
      });
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyPromotion,
  removePromotion
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectCartDiscountAmount = (state) => state.cart.discountAmount;
export const selectCartGrandTotal = (state) => state.cart.grandTotal;
export const selectCartPromotion = (state) => state.cart.promotion;

export default cartSlice.reducer;
