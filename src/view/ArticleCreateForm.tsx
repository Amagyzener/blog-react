import { useNavigate } from 'react-router-dom';
import type { SerializedError } from '@reduxjs/toolkit';

import FormCreator from '../components/FormCreator';
import { useCreateArticleMutation } from '../blogAPI';
import type { ArticleProps } from '../_types';
import { forceError } from '../features/statesSlice';
import { useAppDispatch } from '../_hooks';
import type { FormItemProps, InputsType } from '../components/FormCreator';

import css from './FormFullWnd.module.scss';


export default function ArticleCreateForm(): JSX.Element {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const [create] = useCreateArticleMutation();
	const submitData = async (data: ArticleProps) => {
		let response;
		try {
			response = await create(data).unwrap();
			/* if ('article' in response)
				dispatch(addArticle(response)); */
			if ('errors' in response)
				throw new Error(Object.entries(response.errors)[0].join(' '));
		} catch (e) {
			const err = e as SerializedError;
			err.message && dispatch(forceError(err.message));
		}
		console.log('[CREATE]', response);
		navigate('/');
		window.location.reload();
	};

	const inputs_render: FormItemProps[] = [
		{ name: 'title', label: 'Title' },
		{ name: 'description', label: 'Short description' },
		{ type: 'multiline', name: 'text', label: 'Text' },
		{ name: 'tags', label: 'Tags', options: { required: false }, binder: {
			// { fn: (currentValue) => boolean, bind: 'inputName' }
			fn: (v) => v.search(/\p{Pattern_Syntax}/u) != -1,
			bind: 'tagList'
		} },
		// been using the imperative 'disabled' attribute instead of the one of React Hook Form
		{ type: 'taglist', name: 'tagList', disabled: true, options: { required: 'Tag list is required.' } }
	];

	const submitCallback = (data: InputsType) => {
		const { title, description, text: body, tagList } = data;
		submitData({
			article: { title, description, body, tagList: tagList.split(' | ') }
		});
	};

	return (
		<FormCreator
			caption='Create an Article'
			action='Send'
			inputs={inputs_render}
			onSubmit={submitCallback}
			styles={css}
		/>
	);
}