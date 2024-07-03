import type { Handle } from '@sveltejs/kit';

const headers = {
	'Content-Security-Policy': `default-src 'none'; font-src 'self'; img-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; frame-ancestors 'none';`,
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Embedder-Policy': 'require-corp',
	'Cross-Origin-Resource-Policy': 'same-site',
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
	'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()'
};

export const handle: Handle = async ({ event, resolve }) => {
	const res = await resolve(event);
	for (const [key, value] of Object.entries(headers)) {
		res.headers.set(key, value);
	}

	return res;
};
