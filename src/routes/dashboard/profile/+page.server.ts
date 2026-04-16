import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProfile, updateProfile } from '$lib/server/db/profile';
import { uploadFile } from '$lib/utils/upload';
import { OWNER_ID } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	const profile = await getProfile(locals.supabase, OWNER_ID);
	return { profile };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();

		const full_name = (form.get('full_name') as string)?.trim() || null;
		const bio = (form.get('bio') as string)?.trim() || null;
		const github_url = (form.get('github_url') as string)?.trim() || null;
		const linkedin_url = (form.get('linkedin_url') as string)?.trim() || null;
		const website_url = (form.get('website_url') as string)?.trim() || null;
		const avatarFile = form.get('avatar') as File | null;

		const updateData: Record<string, any> = {
			full_name,
			bio,
			github_url,
			linkedin_url,
			website_url
		};

		if (avatarFile && avatarFile.size > 0) {
			try {
				const result = await uploadFile(locals.supabase, avatarFile, 'avatars', '');
				updateData.avatar_url = result.url;
			} catch (e: any) {
				return fail(400, { error: `Avatar upload failed: ${e.message}` });
			}
		}

		try {
			await updateProfile(locals.supabase, OWNER_ID, updateData);
		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		return { success: true };
	}
};