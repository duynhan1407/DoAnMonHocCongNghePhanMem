import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('cart_items') || '[]'),
};

const saveToStorage = (items) => {
  localStorage.setItem('cart_items', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const idx = state.items.findIndex(i => i.product._id === product._id);
      if (idx > -1) {
        state.items[idx].quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      saveToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.product._id !== action.payload);
      saveToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const idx = state.items.findIndex(i => i.product._id === productId);
      if (idx > -1) {
        state.items[idx].quantity = quantity;
      }
      saveToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveToStorage([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
