import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	const userAgent = request.headers.get('User-Agent');
	const goodUA = ['Mozilla', 'Safari', 'Chrome'];

	if (!userAgent || !goodUA.some((ua) => userAgent.includes(ua)))
		return new Response('Sorry, this is not for you. 🤖', { status: 403 });

	return new Response('Hello, friend! 👋', {
		status: 301,
		headers: { Location: 'mailto:' + env.EMAIL }
	});
};
