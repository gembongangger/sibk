import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		csrf: {
			origin: process.env.ORIGIN || 'http://192.168.10.3'
		}
	}
};

export default config;
