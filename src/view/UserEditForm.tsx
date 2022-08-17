import { useEffect, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Alert } from 'antd';

import FormCreator from '../components/FormCreator';
import { useGetQuery, useUpdateMutation } from '../blogAPI';
import { UserEditProps, ErrorResponse } from '../_types';
import { useAppDispatch, useAppSelector } from '../_hooks';
import { isValidHttpURL } from '../_utils';
import { setCredentials, setAuthError, isAuthError, isAuthSuccess, setAuthSuccess } from '../features/authSlice';

import css from './FormSmallWnd.module.scss';


export default function SignInForm(): JSX.Element {
	const dispatch = useAppDispatch();
	const [isError, isSuccess] = [useAppSelector(isAuthError), useAppSelector(isAuthSuccess)];
	const { data } = useGetQuery();

	const [update] = useUpdateMutation();
	const submitData = async (data: UserEditProps) => {
		try {
			const user = await update(data).unwrap();
			if ('user' in user)
				dispatch(setCredentials(user));
			if ('errors' in user) {
				console.log('[UPDATE ERROR]', user.errors);
				serverValidate(user);
				throw new Error(Object.entries(user.errors)[0].join(' '));
			}
			console.log('[UPDATE]', user);
			dispatch(setAuthSuccess('Profile has been updated.'));
		} catch(e) {
			const err = e as SerializedError;
			dispatch(setAuthError({ name: err.name, message: err.message }));
		}
	};

	const [serverErrors, setServerErrors] = useState<string[]>([]);
	const serverValidate = ({ errors }: ErrorResponse): void => {
		setServerErrors(Object.keys(errors));
		setTimeout(() => console.warn(errors, serverErrors), 200);
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
			{isSuccess && !isError && success || null}
			<FormCreator
				caption='Edit Profile'
				action='Save'
				inputs={[
					{ name: 'username', label: 'User name', value: data && data.user.username, options: {
						minLength: 3, maxLength: 20, validate: {
							checkServerError: () => {
								return serverErrors.includes('username') && 'Username is invalid' || true;
							}
						}
					}, onChange: () => setServerErrors([]) },
					{ type: 'email', name: 'email', label: 'Email address', value: data && data.user.email },
					{ name: 'password', label: 'New password', options: { minLength: 6, maxLength: 40 } },
					{ name: 'avatar_url', label: 'Avatar (URL)', value: data && data.user.image, options: {
						// validate: { anyDescriptor: (value) => string | true }; string is any message shown for failed validation
						validate: { checkURL: (value) => !isValidHttpURL(value) && 'Avatar path must be correct URL.' || true }
					} }
				]}
				onSubmit={(data) => {
					const { username, email, password, avatar_url: image } = data;
					submitData({ user: { username, email, password, image } });
				}}
				styles={css}
				isFormValid={!serverErrors.length}
			/>
		</>
	);
}