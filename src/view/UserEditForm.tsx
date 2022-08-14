import { useEffect } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Alert } from 'antd';

import FormCreator from '../components/FormCreator';
import { useUpdateMutation } from '../blogAPI';
import { UserEditProps } from '../_types';
import { useAppDispatch, useAppSelector } from '../_hooks';
import { isValidHttpURL } from '../_utils';
import { setCredentials, setAuthError, isAuthError, isAuthSuccess, setAuthSuccess } from '../features/authSlice';

import css from './FormSmallWnd.module.scss';


export default function SignInForm(): JSX.Element {
	const dispatch = useAppDispatch();
	const [isError, isSuccess] = [useAppSelector(isAuthError), useAppSelector(isAuthSuccess)];

	const [update] = useUpdateMutation();
	const submitData = async (data: UserEditProps) => {
		try {
			const user = await update(data).unwrap();
			if ('user' in user)
				dispatch(setCredentials(user));
			if ('errors' in user)
				throw new Error(Object.entries(user.errors)[0].join(' '));
			//console.log('[UPDATE]', user);
			dispatch(setAuthSuccess('Profile has been updated.'));
		} catch(e) {
			const err = e as SerializedError;
			dispatch(setAuthError({ name: err.name, message: err.message }));
			//console.log('[UPDATE ERROR]', err);
		}
	};

	useEffect(() => {
		isError && dispatch(setAuthError(null));
		isSuccess && dispatch(setAuthSuccess(null));
	}, []);

	const alert = (
		<Alert
			description={isError && isError.message?.toUpperCase() || 'UNEXPECTED ERROR'}
			type='error'
			showIcon
		/>
	);

	const success = (
		<Alert
			description={isSuccess && isSuccess.toUpperCase() || 'SUCCESS!'}
			type='success'
			showIcon
		/>
	);

	return (
		<>
			{isError && alert || null}
			{isSuccess && success || null}
			<FormCreator
				caption='Edit Profile'
				action='Save'
				inputs={[
					{ name: 'username', label: 'User name', options: { minLength: 3, maxLength: 20 } },
					{ type: 'email', name: 'email', label: 'Email address' },
					{ name: 'password', label: 'New password', options: { minLength: 6, maxLength: 40 } },
					{ name: 'avatar_url', label: 'Avatar (URL)', options: {
						// validate: { anyDescriptor: (value) => string | true }; string is any message shown for failed validation
						validate: { checkURL: (value) => !isValidHttpURL(value) && 'Avatar path must be correct URL.' || true }
					} }
				]}
				onSubmit={(data) => {
					const { username, email, password, avatar_url: image } = data;
					submitData({ user: { username, email, password, image } });
				}}
				styles={css}
			/>
		</>
	);
}