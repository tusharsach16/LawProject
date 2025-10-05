import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 

//  Create the persist config object
const persistConfig = {
  key: 'root', // key for the root of the storage
  storage,     // storage engine to use (localStorage)
  whitelist: ['user'] // imp- only persist the 'user' slice of your state
};

//  Combine your reducers
const rootReducer = combineReducers({
  user: userReducer,
});

// Create a new persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // This is recommended to avoid warnings with redux-persist
      serializableCheck: false,
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Types for your state and dispatch (these can stay the same)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;