import { configureStore } from '@reduxjs/toolkit';
//import { setupListeners } from '@reduxjs/toolkit/query';

import { blogAPI } from './blogAPI';
//import { rtkQueryErrorLogger } from './middleware/rtkQueryMiddleware';
import articlesReducer from './features/articlesSlice';
import loadingReducer from './features/statesSlice';
import authReducer from './features/authSlice';


export const store = configureStore({
	reducer: {
		articles: articlesReducer,
		states: loadingReducer,
		auth: authReducer,
		[blogAPI.reducerPath]: blogAPI.reducer
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(blogAPI.middleware /* , rtkQueryErrorLogger */)
});

// optional, but required for 'refetchOnFocus'/'refetchOnReconnect' behaviors
//setupListeners(store.dispatch);

/* Extract the RootState type and the Dispatch type so that they can be referenced as needed.
	Inferring these types from the store itself means that they correctly update as you add more state slices or modify middleware settings. */
// Infer the 'RootState' and 'AppDispatch' types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;