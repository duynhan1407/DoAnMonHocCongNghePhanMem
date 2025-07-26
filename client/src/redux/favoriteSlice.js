import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('favorite_items') || '[]'),
};

const saveToStorage = (items) => {
  localStorage.setItem('favorite_items', JSON.stringify(items));
};

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    addToFavorite: (state, action) => {
      const product = action.payload;
      if (!state.items.find(i => i._id === product._id)) {
        state.items.push(product);
        saveToStorage(state.items);
      }
    },
    removeFromFavorite: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
      saveToStorage(state.items);
    },
    clearFavorite: (state) => {
      state.items = [];
      saveToStorage([]);
    },
  },
});

export const { addToFavorite, removeFromFavorite, clearFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;
