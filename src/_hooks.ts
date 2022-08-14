import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import type { Theme } from './_types';

// to use throughout the app instead of plain 'useDispatch' and 'useSelector'
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* While it’s possible to import the RootState and AppDispatch types into each component,
	it’s better to create typed versions of the 'useDispatch' and 'useSelector' hooks for usage in an application.
	This is important for a couple reasons:
		• for 'useSelector', it eliminates the need to type (state: RootState) every time;
		• for 'useDispatch', the default Dispatch type does not know about thunks
			(in order to correctly dispatch thunks, we need to use the specific customized AppDispatch type from the store
			that includes the thunk middleware types, and use that with 'useDispatch';
			adding a pre-typed 'useDispatch' hook keeps from forgetting to import AppDispatch where it’s needed).
	Since these are actual variables, not types, it’s important to define them in a separate file such as 'app/hooks.ts', not the store setup file.
	This allows us to import them into any component file that needs to use the hooks, and avoids potential circular import dependency issues.
*/

export function useDarkMode(): [Theme, React.Dispatch<void>] {
	const [theme, setTheme] = useState<Theme>(getMode());

	function getMode(): Theme {
		const localTheme = window.localStorage.getItem('theme');
		if (localTheme)
			return localTheme as Theme;
		// если в localStorage не хранится информация о теме, обращаемся к настройкам браузера
		return (window.matchMedia('(prefers-color-scheme: light)').matches && 'light' || 'dark') as Theme;
	}
	function setMode(mode: Theme) {
		window.localStorage.setItem('theme', mode);
		setTheme(mode);
	}

	function themeToggler(): void {
		theme == 'light' ? setMode('dark') : setMode('light');
	}

	useEffect(() => {
		setMode(theme);
	}, []);

	return [theme, themeToggler];
}