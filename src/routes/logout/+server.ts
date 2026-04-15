import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	await locals.supabase.auth.signOut();

	const allCookies = cookies.getAll();
	allCookies.forEach(({ name }) => {
		if (name.includes('sb-') || name.includes('supabase')) {
			cookies.delete(name, { path: '/' });
		}
	});

	redirect(303, '/login');
};
