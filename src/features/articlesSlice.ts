import { createSlice, /* createAsyncThunk */ } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../store'; // it’s a circular import, but the TypeScript compiler can correctly handle that for types
import type { Article } from '../_types';
//import { sendRequest } from '../_utils';


/* Each slice file should define a type for its initial state value,
	so that 'createSlice' can correctly infer the type of state in each case reducer.
 All generated actions should be defined using the PayloadAction<T> type from Redux Toolkit,
	which takes the type of the 'action.payload' field as its generic argument. */
interface ArticlesState {
	data: Array<Article>;
	needToUpdate: boolean;
}

// a type predicate
/* function isCorrectResponse(response: unknown): response is ArticlesResponse {
	//return (response as ArticlesResponse).articles != undefined;
	return 'articles' in (response as ArticlesResponse) && 'articlesCount' in (response as ArticlesResponse);
} */


// <ReturnType, ArgType, StateType>
/* export const fetchArticles = createAsyncThunk<void, [number, number], {
	state: { articles: { page: number } } // optional fields for defining thunkAPI field types
}>(
	'fetchArticles',
	async ([page = 1, pageSize = 0]: [number?, number?] = [], { dispatch }): Promise<void> => { // arg, thunkAPI
		const offset = (page - 1) * pageSize; // количество статей, на которое нужно сместиться
		//console.log('page: %i, offset: %i', page, offset);
		const articleList = await sendRequest<ArticlesResponse>(`https://blog.kata.academy/api/articles?limit=${pageSize}&offset=${offset}`);
		//if (!isCorrectResponse(articleList)) throw new TypeError('Incorrect response body');
		//console.log(articleList);
		dispatch(setDataTotal(Math.ceil(articleList.articlesCount / 10) * 10));
		dispatch(setArticles(articleList.articles));
	}
); */


const articlesSlice = createSlice({
	name: 'articles',
	initialState: {
		data: [],
		needToUpdate: false
	} as ArticlesState,
	reducers: {
		setPage: (_, action: PayloadAction<number>) => {
			//state.page = action.payload;
			window.sessionStorage.setItem('page', String(action.payload));
			//window.scrollTo({ top: 0, behavior: 'smooth' });
		},
		setArticles: (state, action: PayloadAction<Array<Article>>) => {
			state.data = action.payload;
			state.needToUpdate = false;
		},
		setFavorite: (state, { payload }: PayloadAction<{ article: Article }>) => {
			const idx = state.data.findIndex((article) => article.slug == payload.article.slug);
			idx != -1 && (
				state.data[idx] = payload.article,
				state.needToUpdate = true
			);
		}
	},
	/* extraReducers: (builder) => {
		builder.addCase(fetchArticles.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(fetchArticles.fulfilled, (state) => {
			state.loading = false;
		});
		builder.addCase(fetchArticles.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error;
		});
	} */
});

export const { setPage, setArticles, setFavorite } = articlesSlice.actions;
// other code such as selectors can use the imported 'RootState' type
export const getArticles = (state: RootState) => state.articles.data;
export const getPage = () => Number(window.sessionStorage.getItem('page')) || 1;
export const needsUpdate = (state: RootState) => state.articles.needToUpdate;
export default articlesSlice.reducer;