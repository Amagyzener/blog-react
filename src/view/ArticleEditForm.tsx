import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { SerializedError } from '@reduxjs/toolkit';

import FormCreator from '../components/FormCreator';
import { useGetArticleByPathQuery, useUpdateArticleMutation } from '../blogAPI';
import { forceError } from '../features/statesSlice';
import { useAppDispatch } from '../_hooks';
import type { User, ArticleEditProps } from '../_types';
import type { FormItemProps, InputsType } from '../components/FormCreator';

import css from './FormFullWnd.module.scss';


export default function ArticleEditForm({ user }: { user: Pick<User, 'username'> | null }): JSX.Element {
	const { id } = useParams() as { id: string };
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const [update] = useUpdateArticleMutation();
	const { data } = useGetArticleByPathQuery(id);

	useEffect(() => {
		data && user && data.article.author.username != user.username && navigate('/', { replace: true });
		//console.warn(user);
	}, []);

	const submitData = async (data: ArticleEditProps) => {
		try {
			const response = await update({ path: id, content: data }).unwrap();
			console.log('[UPDATE]', response);
			if ('errors' in response)
				throw new Error(Object.entries(response.errors)[0].join(' '));
		} catch (e) {
			const err = e as SerializedError;
			err.message && dispatch(forceError(err.message));
		}
		navigate('/');
	};

	const inputs_render: FormItemProps[] = [
		{ name: 'title', label: 'Title', value: (data && data.article.title || '') },
		{ name: 'description', label: 'Short description', value: (data && data.article.description || '') },
		{ type: 'multiline', name: 'text', label: 'Text', value: (data && data.article.body || '') }
	];

	const submitCallback = (data: InputsType) => {
		const { title, description, text: body } = data;
		submitData({ article: { title, description, body } });
	};

	return (
		<FormCreator
			caption='Edit Article'
			action='Send'
			inputs={inputs_render}
			onSubmit={submitCallback}
			styles={css}
		/>
	);
}