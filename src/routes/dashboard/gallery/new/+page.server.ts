import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createPost, addMedia } from '$lib/server/db/gallery';
import { uploadFile, validateFile, getFileType } from '$lib/utils/upload';

export const load: PageServerLoad = async () => ({});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const caption = (form.get('caption') as string)?.trim() || null;
		const mood = (form.get('mood') as string)?.trim() || null;
		const is_published = form.get('is_published') === 'on';
		const files = form.getAll('media') as File[];

		const validFiles = files.filter((f) => f.size > 0);
		if (validFiles.length === 0) {
			return fail(400, { error: 'Please select at least one file.' });
		}

		// Validate all files first
		for (const file of validFiles) {
			const validation = validateFile(file);
			if (!validation.valid) return fail(400, { error: validation.error });
		}

		// Create post
		let post;
		try {
			post = await createPost(locals.supabase, {
				caption,
				mood,
				is_published,
				is_archived: false
			});
		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		// Upload all files
		const mediaItems = [];
		for (let i = 0; i < validFiles.length; i++) {
			const file = validFiles[i];
			try {
				const result = await uploadFile(locals.supabase, file, 'gallery', post.id);
				mediaItems.push({
					post_id: post.id,
					storage_path: result.path,
					url: result.url,
					type: getFileType(file),
					size: file.size,
					order_index: i
				});
			} catch (e: any) {
				return fail(500, { error: `Failed to upload ${file.name}: ${e.message}` });
			}
		}

		try {
			await addMedia(locals.supabase, mediaItems);
		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		redirect(303, '/dashboard/gallery');
	}
};