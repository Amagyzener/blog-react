import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SerializedError } from '@reduxjs/toolkit';
import { Alert } from 'antd';

import FormCreator from '../components/FormCreator';
import { useLoginMutation /* blogAPI */ } from '../blogAPI';
import { SignInProps } from '../_types';
import { useAppDispatch, useAppSelector } from '../_hooks';
import { setCredentials, setAuthError, isAuthError } from '../features/authSlice';

import css from './FormSmallWnd.module.scss';


export default function SignInForm(): JSX.Element {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const isError = useAppSelector(isAuthError);

	const [login] = useLoginMutation();
	const submitData = async (data: SignInProps) => {
		try {
			//const response = await dispatch(blogAPI.endpoints.login.initiate(data)) as { data: AuthenticationResponse };
			const user = await login(data).unwrap();
			if ('user' in user)
				dispatch(setCredentials(user));
			if ('errors' in user)
				throw new Error(Object.entries(user.errors)[0].join(' '));
			//console.log('[LOGIN]', user);
			navigate('/');
		} catch(e) {
			const err = e as SerializedError;
			dispatch(setAuthError({ name: err.name, message: err.message }));
			//console.log('[LOGIN ERROR]', err);
		}
	};

	useEffect(() => {
		isError && dispatch(setAuthError(null));
	}, []);

	const alert = (
		<Alert
			description={isError && isError.message?.toUpperCase() || 'UNEXPECTED ERROR'}
			type='error'
			showIcon
		/>
	);

	return (
		<>
			{isError && alert || null}
			<FormCreator
				caption='Sign In'
				action='Login'
				inputs={[
					{ type: 'email', name: 'email', label: 'Email address' },
					{ name: 'password', label: 'Password', options: { minLength: 6, maxLength: 40 } }
				]}
				commentary={
					<div>Don’t have an account? <Link to='/sign-up'>Sign Up</Link>.</div>
				}
				onSubmit={(data) => {
					const { email, password } = data;
					submitData({ user: { email, password } });
				}}
				styles={css}
			/>
		</>
	);
}