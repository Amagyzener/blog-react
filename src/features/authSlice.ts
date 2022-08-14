import { createSlice, SerializedError } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../store';
import type { AuthenticationResponse, User } from '../_types';


interface AuthState {
	user: User | null; // поле-пустышка; используется, чтобы побудить React перерисовать заголовок приложения
	authError: SerializedError | null;
	authSuccess: string | null;
}

const authSlice = createSlice({
	name: 'auth',
	initialState: { user: null, authError: null } as AuthState,
	reducers: {
		setCredentials: (state, { payload: { user } }: PayloadAction<AuthenticationResponse>) => {
			state.user = user; // бессмысленная запись в 'user'
			const { username, image } = user;
			window.localStorage.setItem('token', user.token);
			window.localStorage.setItem('user', JSON.stringify({ username, image }));
			state.authError = null;
		},
		clearCredentials: (state) => {
			state.user = null; // бессмысленная очистка 'user'
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('user');
		},
		setAuthError: (state, { payload }: PayloadAction<SerializedError | null>) => {
			state.authError = payload;
		},
		setAuthSuccess: (state, { payload }: PayloadAction<string | null>) => {
			state.authSuccess = payload;
		}
	}
});

export const { setCredentials, clearCredentials, setAuthError, setAuthSuccess } = authSlice.actions;
export const getCurrentUser = (state: RootState) => {
	if (state.auth.user) return state.auth.user;
	const user = window.localStorage.getItem('user');
	return (user && JSON.parse(user) as Pick<User, 'username' | 'image'>) || null;
};
export const isAuthError = (state: RootState) => state.auth.authError;
export const isAuthSuccess = (state: RootState) => state.auth.authSuccess;
export default authSlice.reducer;