import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const defaultBooks = [
  {
    id: 1,
    seller_id: 2,
    seller_role: 'fresh_seller',
    seller_name: 'Nova Press Publishers',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    condition: 'New',
    original_price: 49.99,
    discount_price: 39.99,
    quantity: 25
  },
  {
    id: 2,
    seller_id: 2,
    seller_role: 'fresh_seller',
    seller_name: 'Nova Press Publishers',
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    author: 'David Thomas, Andrew Hunt',
    condition: 'New',
    original_price: 54.99,
    discount_price: 44.99,
    quantity: 15
  },
  {
    id: 3,
    seller_id: 2,
    seller_role: 'fresh_seller',
    seller_name: 'Nova Press Publishers',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    condition: 'New',
    original_price: 59.99,
    discount_price: 49.99,
    quantity: 20
  },
  {
    id: 4,
    seller_id: 3,
    seller_role: 'used_seller',
    seller_name: 'Bob Vintage Corner',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    condition: 'Like New',
    original_price: 19.99,
    discount_price: 12.99,
    quantity: 5
  },
  {
    id: 5,
    seller_id: 3,
    seller_role: 'used_seller',
    seller_name: 'Bob Vintage Corner',
    title: '1984',
    author: 'George Orwell',
    condition: 'Good',
    original_price: 18.00,
    discount_price: 8.50,
    quantity: 8
  },
  {
    id: 6,
    seller_id: 3,
    seller_role: 'used_seller',
    seller_name: 'Bob Vintage Corner',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    condition: 'Acceptable',
    original_price: 15.00,
    discount_price: 5.00,
    quantity: 3
  }
];

// Async thunk to fetch books from backend API
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await api.books.getAll(params);
      return data.books;
    } catch (err) {
      console.warn('Backend unavailable, using local book store:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk to create a new book
export const createBook = createAsyncThunk(
  'books/createBook',
  async (bookData, { rejectWithValue }) => {
    try {
      const data = await api.books.create(bookData);
      return data.book;
    } catch (err) {
      console.warn('Could not post to backend, adding locally:', err.message);
      return { id: Date.now(), ...bookData };
    }
  }
);

// Async thunk to update stock quantity
export const adjustStock = createAsyncThunk(
  'books/adjustStock',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const data = await api.books.updateStock(id, quantity);
      return { id, quantity: data.book.quantity };
    } catch (err) {
      return { id, quantity };
    }
  }
);

// Async thunk to delete a book listing
export const removeBook = createAsyncThunk(
  'books/removeBook',
  async (id, { rejectWithValue }) => {
    try {
      await api.books.delete(id);
      return id;
    } catch (err) {
      return id;
    }
  }
);

export const bookSlice = createSlice({
  name: 'books',
  initialState: {
    books: defaultBooks,
    loading: false,
    error: null,
    searchQuery: ''
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    addBook: (state, action) => {
      state.books.unshift({ id: Date.now(), ...action.payload });
    },
    updateStock: (state, action) => {
      const { id, quantity } = action.payload;
      const target = state.books.find((b) => b.id === id);
      if (target) {
        target.quantity = quantity;
      }
    },
    reduceStockAfterPurchase: (state, action) => {
      action.payload.forEach(({ id, quantity }) => {
        const target = state.books.find((b) => b.id === id);
        if (target) {
          target.quantity = Math.max(0, target.quantity - quantity);
        }
      });
    },
    deleteBook: (state, action) => {
      state.books = state.books.filter((b) => b.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && Array.isArray(action.payload)) {
          state.books = action.payload;
        }
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createBook
      .addCase(createBook.fulfilled, (state, action) => {
        if (action.payload) {
          state.books.unshift(action.payload);
        }
      })
      // adjustStock
      .addCase(adjustStock.fulfilled, (state, action) => {
        const target = state.books.find((b) => b.id === action.payload.id);
        if (target) {
          target.quantity = action.payload.quantity;
        }
      })
      // removeBook
      .addCase(removeBook.fulfilled, (state, action) => {
        state.books = state.books.filter((b) => b.id !== action.payload);
      });
  }
});

export const {
  setSearchQuery,
  addBook,
  updateStock,
  reduceStockAfterPurchase,
  deleteBook
} = bookSlice.actions;

export const selectAllBooks = (state) => state.books.books;
export const selectBooksLoading = (state) => state.books.loading;
export const selectSearchQuery = (state) => state.books.searchQuery;

export default bookSlice.reducer;
