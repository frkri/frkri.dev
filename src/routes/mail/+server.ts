import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const goodUA = ['Mozilla', 'Safari', 'Chrome'];

export const GET: RequestHandler = async ({ request }) => {
	const userAgent = request.headers.get('User-Agent');

	if (!userAgent || !goodUA.some((ua) => userAgent.includes(ua)))
		return new Response('Sorry, this is not for you. 🤖', { status: 403 });

	return new Response(
		'Hello, friend! 👋\nYour email client should open soon. If not, try refreshing the page.',
		{
			status: 301,
			headers: { Location: 'mailto:' + env.EMAIL }
		}
	);
};
