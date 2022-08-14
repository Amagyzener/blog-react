import { createAction, createReducer } from '@reduxjs/toolkit';
import type { SerializedError, AsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '../store'; // it’s a circular import, but the TypeScript compiler can correctly handle that for types


/* type QueryRecord = {
	//[queryId in keyof T]?: T[queryId];
	//[queryId in keyof T]?: 'pending' | 'rejected' | 'fulfilled';
	[queryId: string]: 'pending' | 'rejected' | 'fulfilled';
} */

interface AppStates {
	loading: boolean;
	error: SerializedError | null;
	[key: string]: unknown;
}

const initialState: AppStates /* | QueryRecord */ = {
	loading: false, // global app state
	error: null // global app state
	//'some_id': 'pending' | 'rejected' | 'fulfilled'
};

interface RejectedValue {
	payload: {
		error: string;
		status: string;
	}
}
function hasError(obj: unknown): obj is RejectedValue {
	return 'payload' in (obj as RejectedValue);
}

type GenericAsyncThunk = AsyncThunk<unknown, unknown, Record<string, unknown>>; // <unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

export const forceError = createAction<string>('states/forceError');

const loadingReducer = createReducer(initialState, (builder) => {
	builder.addCase(forceError, (state, action) => {
		state.loading = false;
		state.error = { name: 'ForcedError', message: action.payload } as SerializedError;
	});
	builder.addMatcher<PendingAction>(
		(action) => {
			return action.type.endsWith('/pending') && ![
				'favorite',
				'unfavorite'
			].includes(action.meta.arg.endpointName); // exceptions
		},
		(state, action) => {
			console.log(action);
			state.loading = true;
			state.error = null;
			state[action.meta.requestId] = 'pending';
		}
	);
	builder.addMatcher<RejectedAction>(
		(action) => action.type.endsWith('/rejected'),
		(state, action) => {
			if (action.meta.rejectedWithValue && hasError(action)) {
				console.log(action.payload);
				const errorFullMsg = action.payload.error;
				const sep = ': ', sepIdx = errorFullMsg.indexOf(sep);
				const [name, message] = [
					errorFullMsg.slice(0, sepIdx),
					errorFullMsg.slice(sepIdx + sep.length)
				];
				state.error = { name, message } as SerializedError;
			}
			// this is an internal rejection that RTK Query uses to track component subscriptions and not an actual error
			if (action.error.name == 'ConditionError') return;
			state.loading = false;
			// this can possibly be an HTTP error like 404 and etc.
			if (!action.error.name && action.error.message == 'Rejected') return;
			//console.log('rejected', action.error); // { message: 'Rejected' }
			state.error = action.error as SerializedError;
			state[action.meta.requestId] = 'rejected';
		}
	);
	builder.addMatcher<FulfilledAction>(
		(action) => action.type.endsWith('/fulfilled'),
		(state, action) => {
			//console.log('fulfilled');
			state.loading = false;
			state.error = null;
			state[action.meta.requestId] = 'fulfilled';
		}
	);
});

export default loadingReducer;
export const isLoading = (state: RootState) => state.states.loading;
export const isError = (state: RootState) => state.states.error;