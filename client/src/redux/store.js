import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './Slide/CounterSlide'
import userPreducer from './Slide/userSlide'

export const store = configureStore({
  reducer: {
    counter : counterReducer,
    user : userPreducer
  },
})