import { redirect } from '@sveltejs/kit';
import { OWNER_ID } from '$env/static/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	// Tidak ada session → redirect ke login
	if (!session || !user) {
		redirect(303, '/login');
	}

	// Bukan owner → redirect ke home
	if (user.id !== OWNER_ID) {
		redirect(303, '/');
	}

	return { session, user };
};