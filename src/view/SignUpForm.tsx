import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SerializedError } from '@reduxjs/toolkit';
import { Alert } from 'antd';

import FormCreator from '../components/FormCreator';
import { useRegisterMutation } from '../blogAPI';
import { SignUpProps } from '../_types';
import { useAppDispatch, useAppSelector } from '../_hooks';
import { setAuthError, isAuthError } from '../features/authSlice';

import css from './FormSmallWnd.module.scss';


export default function SignUpForm(): JSX.Element {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const isError = useAppSelector(isAuthError);

	const [register] = useRegisterMutation();
	const submitData = async (data: SignUpProps) => {
		try {
			//const response = await dispatch(blogAPI.endpoints.register.initiate(data));
			const user = await register(data).unwrap();
			if ('errors' in user)
				throw new Error(Object.entries(user.errors)[0].join(' '));
			//console.log('[SIGN UP]', user);
			navigate('/sign-in');
		} catch(e) {
			const err = e as SerializedError;
			dispatch(setAuthError({ name: err.name, message: err.message }));
			//console.log('[SIGN UP ERROR]', e);
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
				caption='Create new account'
				action='Create'
				inputs={[
					{ name: 'username', label: 'User name', options: { minLength: 3, maxLength: 20 } },
					{ type: 'email', name: 'email', label: 'Email address', /* options: {} */ },
					{ name: 'password_a', label: 'Password', options: {
						minLength: 6, maxLength: 40
					}, matches: ['password_b', 'Passwords must match.'] },
					{ name: 'password_b', label: 'Repeat password', options: {
						minLength: 6, maxLength: 40
					}, matches: ['password_a', 'Passwords must match.'] }
				]}
				extra={[
					{
						type: 'checkbox',
						name: 'agreement',
						label: 'I agree to the processing of my personal information.',
						options: { required: 'Agreement is required.' }
					}
				]}
				commentary={
					<div>Already have an account? <Link to='/sign-in'>Sign In</Link>.</div>
				}
				onSubmit={(data) => {
					const { username, email, password_a: password } = data;
					submitData({ user: { username, email, password } });
				}}
				styles={css}
			/>
		</>
	);
}