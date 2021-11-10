import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: adapter(),
		target: '#svelte',
		vite: {
			adapter: adapter(),
			resolve: {
				alias: {
					$lib: path.resolve('src/lib/')
				}
			}
		}
	}
};

export default config;
