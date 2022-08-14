export type Theme = 'light' | 'dark';

export type Article = {
	author: {
		username: string,
		image: string,
		following: boolean,
	},
	body: string,
	createdAt: string,
	description: string,
	favorited: boolean,
	favoritesCount: number,
	slug: string,
	tagList: Array<string>,
	title: string,
	updatedAt: string
};

export interface ArticlesResponse {
	articles: Array<Article>;
	articlesCount: number;
}


export interface SignInProps {
	user: {
		email: string;
		password: string;
	};
}

export interface SignUpProps {
	user: {
		username: string;
		email: string;
		password: string;
	};
}

export type UserEditProps = {
	user: Pick<User, 'username' | 'email' | 'image'> & { password: string };
};

export type ArticleProps = {
	article: Pick<Article, 'title' | 'description' | 'body' | 'tagList'>;
};

export type ArticleEditProps = {
	article: Pick<Article, 'title' | 'description' | 'body'>;
};


export interface AuthenticationResponse {
	user: User;
}

export interface ErrorResponse {
	errors: Record<string, string>;
}

export interface User {
	email: string;
	token: string;
	username: string;
	bio: string;
	image: string;
}