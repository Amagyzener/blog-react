import { isRejected } from '@reduxjs/toolkit';
import type { /* MiddlewareAPI, */ Middleware } from '@reduxjs/toolkit';


// MiddlewareAPI: { dispatch, getState }
export const rtkQueryErrorLogger: Middleware = (/* api: MiddlewareAPI */) => (next) => (action) => {
	// RTK Query uses 'createAsyncThunk()' from 'redux-toolkit' under the hood
	if (isRejected(action)) {
		console.warn('We got a rejected action!', action.error);
	}

	return next(action);
};