import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from 'antd';
import { SerializedError } from '@reduxjs/toolkit';

import IconHeart from '../components/IconHeart';
import { useAppDispatch , useAppSelector } from '../_hooks';
import { limitString, dateFormat, tagListFormat, imgFallback } from '../_utils';
import { getPage, setPage, setArticles, getArticles, setFavorite } from '../features/articlesSlice';
import { forceError } from '../features/statesSlice';
import { getCurrentUser } from '../features/authSlice';
import { useGetArticlesQuery, useFavoriteMutation, useUnfavoriteMutation } from '../blogAPI';

import css from './Articles.module.scss';


export default function Articles(): JSX.Element | null {
	const [page, user] = [useAppSelector(getPage), useAppSelector(getCurrentUser)];
	const dispatch = useAppDispatch();
	const [[favorite], [unfavorite]] = [useFavoriteMutation(), useUnfavoriteMutation()];
	const { data } = useGetArticlesQuery({ page, pageSize: 10 }, /* { pollingInterval: 60000 } */); // (1) fetch articles
	const { /* articles, */ articlesCount: dataTotal } = data ?? {};
	const articles = useAppSelector(getArticles); // (3) get articles from the state

	useEffect(() => {
		data && dispatch(setArticles(data.articles)); // (2) write articles in the state
	}, [page]);

	async function voteClick(e: React.MouseEvent, slug: string, favorited: boolean) {
		if (!user) return;
		try {
			let response;
			if (!favorited)
				response = await favorite(slug).unwrap();
			else
				response = await unfavorite(slug).unwrap();
			//console.log(response);
			if ('article' in response)
				dispatch(setFavorite(response));
			if ('errors' in response)
				throw new Error(Object.entries(response.errors)[0].join(' '));
		} catch (e) {
			const err = e as SerializedError;
			err.message && dispatch(forceError(err.message));
		}
	}

	const articles_render: JSX.Element[] = articles && articles.map((article) => {
		const tags: JSX.Element[] = article.tagList.reduce<JSX.Element[]>((array, tag, index) => {
			const format = tagListFormat(tag);
			return format.length && array.concat(<span key={index}>{format}</span>) || array;
		}, []);

		return (
			<div className={css.article} key={article.slug}>
				<div className={css.article_cap}>
					<div className={css.article_title}>
						<div className='flex-container'>
							<div className={css.article_votes} onClick={(e) => voteClick(e, article.slug, article.favorited)}>
								<IconHeart filled={article.favorited} />
								<span>{article.favoritesCount}</span>
							</div>
							<h2>
								<Link to={`/articles/${article.slug}`}>
									{article.title.length && limitString(article.title, 100) || '[No title]'}
								</Link>
							</h2>
						</div>
						{tags.length && <div className={css.article_tags}>{tags}</div> || null}
					</div>
					<div className='flex-container-column'>
						<div className={css.article_info}>
							<div className={css.article_meta}>
								<h3>{article.author.username}</h3>
								<span>{dateFormat.format(new Date(article.createdAt))}</span>
							</div>
							<img src={article.author.image} onError={imgFallback} />
						</div>
					</div>
				</div>
				<p className={css.article_description}>{limitString(article.description, 512)}</p>
			</div>
		);
	}) || [];

	return articles && (
		<>
			{articles_render}
			<div className='centered'>
				<Pagination
					size='small'
					total={dataTotal}
					showSizeChanger={false}
					current={page}
					onChange={(n) => dispatch(setPage(n))}
				/>
			</div>
		</>
	) || null;
}