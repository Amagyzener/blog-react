import { useEffect } from 'react';
import { useRoutes, Link } from 'react-router-dom';
import { Spin, Button, Result } from 'antd';

import { useAppDispatch, useAppSelector, useDarkMode } from './_hooks';
import { imgFallback } from './_utils';
import { isLoading, isError } from './features/statesSlice';
import { getCurrentUser, clearCredentials } from './features/authSlice';

import NetworkDetector from './hoc/NetworkDetector';
import DayNightSwitch from './components/DayNightSwitch';
import PrivateRoute from './components/PrivateRoute';
import { Articles, ArticleFull, SignUpForm, SignInForm, UserEditForm, ArticleCreateForm, ArticleEditForm } from './view/index';

import 'antd/dist/antd.min.css';
import css from './App.module.scss';


function App(): JSX.Element {
	const [theme, changeTheme] = useDarkMode();
	const dispatch = useAppDispatch();
	const [loadingState, errorState] = [useAppSelector(isLoading), useAppSelector(isError)];
	const user = useAppSelector(getCurrentUser);
	//console.warn(loadingState, errorState);
	//user && console.log(user);

	const spinner = (
		<div className='centered-abs-vh'>
			<Spin size='large' />
		</div>
	);

	const error = (
		<Result
			status='error'
			title='Bad news'
			subTitle='Something went wrong :('
			extra={[
				errorState && <p key='error_msg'>{`${errorState.name || 'InternalError'}: ${errorState.message}`}</p>,
				<Button key='reload' onClick={() => window.location.href = '/'}>Go to main page</Button>
			]}
		/>
	);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);

	const routes = useRoutes([
		{ path: '/', index: true, element: <Articles /> },
		{ path: '/articles', element: <Articles /> },
		{ path: '/articles/:id', element: <ArticleFull user={user} /> },
		{ path: '/sign-up', element: (
			<PrivateRoute redirect={!user}>
				<SignUpForm />
			</PrivateRoute>
		) },
		{ path: '/sign-in', element: (
			<PrivateRoute redirect={!user}>
				<SignInForm />
			</PrivateRoute>
		) },
		{ path: '/profile', element: (
			<PrivateRoute redirect={!!user}>
				<UserEditForm />
			</PrivateRoute>
		) },
		{ path: '/new-article', element: (
			<PrivateRoute redirect={!!user}>
				<ArticleCreateForm />
			</PrivateRoute>
		) },
		{ path: '/articles/:id/edit', element: (
			<PrivateRoute redirect={!!user}>
				<ArticleEditForm user={user} />
			</PrivateRoute>
		) },
		{ path: '*' || '/404', element:
			<Result
				status='404'
				title='404'
				subTitle='Woops, we have no such page :('
				extra={<Button><Link to='/'>Go back</Link></Button>}
			/>
		}
	]);

	return (
		<div>
			<header className={css.header}>
				<h1>
					<Link to='/'>Realworld Blog</Link>
				</h1>
				<div>
					<DayNightSwitch
						style={{ marginRight: '18px' }}
						defaultChecked={theme == 'dark'}
						onChange={() => changeTheme()}
					/>
					{user && (
						<>
							<Button type='default' className='green'>
								<Link to='/new-article'>Create article</Link>
							</Button>
							<Link to='/profile'>
								<div className={css.user}>
									<span>{user.username}</span>
									<img src={user.image || ''} onError={imgFallback} />
								</div>
							</Link>
							<Button type='default' size='large' onClick={() => dispatch(clearCredentials())}>
								<Link to='/'>Log Out</Link>
							</Button>
						</>
					) || (
						<>
							<Button type='text' size='large'>
								<Link to='/sign-in'>Sign In</Link>
							</Button>
							<Button type='default' size='large' className='green'>
								<Link to='/sign-up'>Sign Up</Link>
							</Button>
						</>
					)}
				</div>
			</header>
			<section className={css.main}>
				{!loadingState && (errorState && error || routes)}
				{loadingState && spinner || null}
			</section>
		</div>
	);
}

export default NetworkDetector(App);