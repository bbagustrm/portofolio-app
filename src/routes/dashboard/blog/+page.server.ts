import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllPosts, deletePost, updatePost } from '$lib/server/db/blog';

export const load: PageServerLoad = async ({ locals }) => {
	const posts = await getAllPosts(locals.supabase);
	return { posts };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID' });
		try {
			await deletePost(locals.supabase, id);
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	},

	toggle_published: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const current = form.get('current') === 'true';
		if (!id) return fail(400, { error: 'Missing ID' });
		try {
			const is_published = !current;
			await updatePost(locals.supabase, id, {
				is_published,
				published_at: is_published ? new Date().toISOString() : null
			});
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	}
};