import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllPostsForDashboard, updatePost, deletePost } from '$lib/server/db/gallery';

export const load: PageServerLoad = async ({ locals }) => {
	const posts = await getAllPostsForDashboard(locals.supabase);
	return { posts };
};

export const actions: Actions = {
	toggle_published: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const current = form.get('current') === 'true';
		if (!id) return fail(400, { error: 'Missing ID' });
		try {
			await updatePost(locals.supabase, id, { is_published: !current });
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	},

	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID' });
		try {
			await deletePost(locals.supabase, id);
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	}
};