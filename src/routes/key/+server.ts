import type { RequestHandler } from './$types';
import key from '$lib/assets/key/frkri.asc?raw';

export const GET: RequestHandler = async () => {
	return new Response(key, { headers: { 'Content-Type': 'text/plain' } });
};
