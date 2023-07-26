import { writable } from 'svelte/store';

export const storeThemes = writable("light");

export default {
	subscribe: storeThemes.subscribe,
	toggleThemeLight: () => storeThemes.update((themeColor) => "light"),
	toggleThemeDark: () => storeThemes.update((themeColor) => "dark"),
}