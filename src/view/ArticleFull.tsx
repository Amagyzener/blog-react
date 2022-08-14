import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Remark } from 'react-remark';
import { SerializedError } from '@reduxjs/toolkit';
import { Button, Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import IconHeart from '../components/IconHeart';
import { useAppDispatch, useAppSelector  } from '../_hooks';
import { dateFormat, tagListFormat, imgFallback } from '../_utils';
import { forceError } from '../features/statesSlice';
import { getArticles, setArticles, setFavorite } from '../features/articlesSlice';
import { useGetArticleByPathQuery, useDeleteArticleMutation, useFavoriteMutation, useUnfavoriteMutation } from '../blogAPI';
import type { User, Article } from '../_types';

import css from './Articles.module.scss';
import md from './ArticleFull.module.scss';


/* interface IParams {
	// A common convention is that path/route params are manditory while query params are optional:
		// useParams() as { groupId: string, postId?: string }
	id: string;
} */

export default function ArticleFull({ user }: { user: Pick<User, 'username' | 'image'> | null }): JSX.Element | null {
	const { id } = useParams() as { id: string }; // or 'useParams<keyof IParams>() as IParams'
	const redirectTo = useNavigate();
	const [[favorite], [unfavorite]] = [useFavoriteMutation(), useUnfavoriteMutation()];
	const dispatch = useAppDispatch();
	const article = useAppSelector(getArticles).find((article: Article) => article.slug == id);

	const { data, error } = useGetArticleByPathQuery(id);
	useEffect(() => {
		//error && console.log(error);
		if (error && 'originalStatus' in error && error.originalStatus === 404)
			return redirectTo('/404', { replace: true });
		data && dispatch(setArticles([data.article]));
	}, [error]);

	/* useEffect(() => {
		if (id.length > 256) dispatch(forceError('URI is too long (status 414)'));
	}, []); */

	async function voteClick(e: React.MouseEvent, slug: string, favorited: boolean) {
		if (!user) return;
		let response;
		try {
			if (!favorited)
				response = await favorite(slug).unwrap();
			else
				response = await unfavorite(slug).unwrap();
			if ('article' in response)
				dispatch(setFavorite(response));
			if ('errors' in response)
				throw new Error(Object.entries(response.errors)[0].join(' '));
		} catch (e) {
			const err = e as SerializedError;
			err.message && dispatch(forceError(err.message));
		}
		//console.log(response);
	}

	const tags: JSX.Element[] = article && article.tagList.reduce<JSX.Element[]>((array, tag, index) => {
		const format = tagListFormat(tag);
		return format.length && array.concat(<span key={index}>{format}</span>) || array;
	}, []) || [];

	const [deleteArticle] = useDeleteArticleMutation();
	const confirm = () => {
		Modal.confirm({
			icon: <ExclamationCircleFilled />,
			content: 'Are you sure you want to delete this article?',
			okText: 'Yes',
			cancelText: 'No',
			onOk: (close) => {
				deleteArticle(id);
				close();
				redirectTo('/', { replace: true });
			}
		});
	};

	const article_controls = (
		<div className={md.article_controls}>
			<Button type='default' className='red' onClick={confirm}>
				Delete
			</Button>
			<Button type='default' className='green'>
				<Link to='edit'>Edit</Link>
			</Button>
		</div>
	);

	const article_render = article && (
		<div className={css.article}>
			<div className={css.article_cap}>
				<div className={css.article_title}>
					<div className='flex-container'>
						<div className={css.article_votes} onClick={(e) => voteClick(e, id, article.favorited)}>
							<IconHeart filled={article.favorited} />
							<span>{article.favoritesCount}</span>
						</div>
						<h2>{article.title.trim().length && article.title || '[No title]'}</h2>
					</div>
					{tags.length && <div className={css.article_tags}>{tags}</div> || null}
					<p className={md.article_description}>
						{article.description}
					</p>
				</div>
				<div className='flex-container-column shrink0'>
					<div className={css.article_info}>
						<div className={css.article_meta}>
							<h3>{article.author.username}</h3>
							<span>{dateFormat.format(new Date(article.createdAt))}</span>
						</div>
						<img src={article.author.image} onError={imgFallback} />
					</div>
					{user && user.username == article.author.username && article_controls || null}
				</div>
			</div>
			<div className={md.body}>
				<Remark>
					{article.body.trim().length && article.body || '[No content]'}
				</Remark>
			</div>
		</div>
	);

	return article && article_render || null;
}