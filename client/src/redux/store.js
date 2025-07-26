import { configureStore } from '@reduxjs/toolkit'

import counterReducer from './Slide/CounterSlide'
import userPreducer from './Slide/userSlide'
import favoriteReducer from './favoriteSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userPreducer,
    favorite: favoriteReducer,
  },
})