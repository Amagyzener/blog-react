/* React-specific entry point that automatically generates hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { clearCredentials, setCredentials } from './features/authSlice';
import type {
	Article,
	ArticlesResponse,
	AuthenticationResponse,
	ErrorResponse,
	SignInProps,
	SignUpProps,
	UserEditProps,
	ArticleProps,
	ArticleEditProps
} from './_types';

//import type { RootState } from './store';
//import { sendRequest } from './_utils';


/* const baseQuery = (
	{ baseUrl }: { baseUrl: string } = { baseUrl: '' }
): BaseQueryFn<
	{
		url: string;
		method?: string;
		body?: any;
		headers?: HeadersInit;
		params?: Record<string, unknown>;
	},
	unknown,
	FetchBaseQueryError
> => async ({ url, method = 'GET', body, headers, params }) => {
	const url_params = params && (new URLSearchParams(JSON.stringify(params))) || '';
	const new_url = new URL(`${baseUrl}${url}?${url_params}`);
	console.log(new_url.href);
	try {
		const result = await sendRequest(baseUrl + url, { params: { method, body, headers } });
		return { data: result };
	} catch (e) {
		const err = e as FetchBaseQueryError;
		console.warn(e);
		return {
			error: {
				status: 'FETCH_ERROR',
				data: err.data
			} as FetchBaseQueryError
		};
	}
}; */

const baseQuery = fetchBaseQuery({
	baseUrl: 'https://blog.kata.academy/api/',
	prepareHeaders: (headers) => {
		const token = window.localStorage.getItem('token');
		if (token) headers.set('Authorization', `Bearer ${token}`);
		return headers;
	}
});
const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	let result = await baseQuery(args, api, extraOptions);
	if (result.error && result.error.status === 401) {
		// try to get a new token
		console.warn('[UNAUTHORISED] TRYING TO GET A NEW TOKEN');
		const refreshResult = await baseQuery('/user', api, extraOptions);
		if (refreshResult.data) {
			// store the new token
			api.dispatch(setCredentials(refreshResult.data as AuthenticationResponse));
			// retry the initial query
			result = await baseQuery(args, api, extraOptions);
		} else {
			api.dispatch(clearCredentials());
		}
	}
	return result;
};

const CONTENT_TYPE: HeadersInit = { 'Content-Type': 'application/json; charset=UTF-8' };
const VALIDATE_STATUS = (response: Response) => {
	const range = new Proxy({ start: 200, end: 226 }, {
		has: (target, property) => Number(property) >= target.start && Number(property) <= target.end
	});

	return response.status in range || response.status === 422;
	//[200, 422].includes(response.status);
};
// a service with a base URL and expected endpoints
export const blogAPI = createApi({
	reducerPath: 'blogAPI',
	baseQuery: baseQueryWithReauth,
	/* baseQuery: fetchBaseQuery({
		baseUrl: 'https://blog.kata.academy/api/',
		//fetchFn: (input, init) => { // 'init' is always 'undefined'! (RTK Query @bug?)
			//console.log('INIT: ', init);
			//return sendRequestRaw((input as Request).url, { params: input as Request, debug: true })
		//},
		prepareHeaders: (headers) => {
			const token = window.localStorage.getItem('token'); //(getState() as RootState).auth.user?.token;
			if (token) headers.set('Authorization', `Bearer ${token}`);
			return headers;
		}
	}),*/
	endpoints: (builder) => ({
		// name: [builder.query | builder.mutation]<ReturnType, ArgType>
		getArticles: builder.query<ArticlesResponse, { page?: number, pageSize?: number }>({
			query: ({page = 1, pageSize = 0}) => {
				const offset = (page - 1) * pageSize;
				//console.log('page: %i, page size: %i, offset: %i', page, pageSize, offset);
				return {
					url: 'articles',
					params: { limit: pageSize, offset }
				};
			}
		}),
		getArticleByPath: builder.query<{ article: Article }, string>({
			query: (path) => ({
				url: `articles/${path}`
			})
		}),
		favorite: builder.mutation<{ article: Article } | ErrorResponse, string>({
			query: (path) => ({
				url: `articles/${path}/favorite`,
				method: 'POST',
				validateStatus: VALIDATE_STATUS
			})
		}),
		unfavorite: builder.mutation<{ article: Article } | ErrorResponse, string>({
			query: (path) => ({
				url: `articles/${path}/favorite`,
				method: 'DELETE',
				validateStatus: VALIDATE_STATUS
			})
		}),

		register: builder.mutation<AuthenticationResponse | ErrorResponse, SignUpProps>({
			query: (arg) => ({
				url: 'users',
				method: 'POST',
				body: JSON.stringify(arg),
				headers: CONTENT_TYPE,
				validateStatus: VALIDATE_STATUS
			})
		}),
		login: builder.mutation<AuthenticationResponse | ErrorResponse, SignInProps>({
			query: (arg) => ({
				url: 'users/login',
				method: 'POST',
				body: JSON.stringify(arg),
				headers: CONTENT_TYPE,
				validateStatus: VALIDATE_STATUS
			})
		}),
		update: builder.mutation<AuthenticationResponse | ErrorResponse, UserEditProps>({
			query: (arg) => ({
				url: 'user',
				method: 'PUT',
				body: JSON.stringify(arg),
				headers: CONTENT_TYPE,
				validateStatus: VALIDATE_STATUS
			})
		}),
		get: builder.query<AuthenticationResponse, void>({
			query: () => ({
				url: 'user',
				method: 'GET',
				validateStatus: VALIDATE_STATUS
			})
		}),

		createArticle: builder.mutation<{ article: Article } | ErrorResponse, ArticleProps>({
			query: (content) => ({
				url: 'articles',
				method: 'POST',
				body: JSON.stringify(content),
				headers: CONTENT_TYPE,
				validateStatus: VALIDATE_STATUS
			})
		}),
		updateArticle: builder.mutation<{ article: Article } | ErrorResponse, { path: string, content: ArticleEditProps }>({
			query: ({ path, content }) => ({
				url: `articles/${path}`,
				method: 'PUT',
				body: JSON.stringify(content),
				headers: CONTENT_TYPE,
				validateStatus: VALIDATE_STATUS
			})
		}),
		deleteArticle: builder.mutation<void | ErrorResponse, string>({
			query: (path) => ({
				url: `articles/${path}`,
				method: 'DELETE',
				validateStatus: VALIDATE_STATUS
			})
		})
	})
});

// hooks for usage in functional components, which are auto-generated based on the defined endpoints
export const {
	useGetArticlesQuery,
	useGetArticleByPathQuery,
	useRegisterMutation,
	useLoginMutation,
	useUpdateMutation,
	useGetQuery,
	useFavoriteMutation,
	useUnfavoriteMutation,
	useCreateArticleMutation,
	useUpdateArticleMutation,
	useDeleteArticleMutation
} = blogAPI;