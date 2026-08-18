import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createPost, addMedia } from '$lib/server/db/gallery';
import { uploadFile, validateFile, getFileType } from '$lib/utils/upload';

export const load: PageServerLoad = async () => ({});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		
		// English version
		const captionEn = (form.get('caption_en') as string)?.trim() || null;
		const moodEn = (form.get('mood_en') as string)?.trim() || null;
		
		// Indonesian version
		const captionId = (form.get('caption_id') as string)?.trim() || null;
		const moodId = (form.get('mood_id') as string)?.trim() || null;
		
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

		try {
			// Create English post
			const postEn = await createPost(locals.supabase, {
				caption: captionEn,
				mood: moodEn,
				is_published,
				is_archived: false,
				locale: 'en'
			});

			// Upload media for EN post
			const mediaItemsEn = [];
			for (let i = 0; i < validFiles.length; i++) {
				const file = validFiles[i];
				const result = await uploadFile(locals.supabase, file, 'gallery', postEn.id);
				mediaItemsEn.push({
					post_id: postEn.id,
					storage_path: result.path,
					url: result.url,
					type: getFileType(file),
					size: file.size,
					order_index: i
				});
			}
			await addMedia(locals.supabase, mediaItemsEn);

			// Create Indonesian post (reuse same media URLs)
			const postId = await createPost(locals.supabase, {
				caption: captionId,
				mood: moodId,
				is_published,
				is_archived: false,
				locale: 'id'
			});

			// Link same media to ID post
			const mediaItemsId = mediaItemsEn.map((item, i) => ({
				...item,
				post_id: postId.id
			}));
			await addMedia(locals.supabase, mediaItemsId);

		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		redirect(303, '/dashboard/gallery');
	}
};