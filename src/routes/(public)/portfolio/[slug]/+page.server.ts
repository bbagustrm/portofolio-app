import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectBySlug } from '$lib/server/db/projects';
import { getLocaleFromCookies } from '$lib/i18n/server';
import { NotFoundError } from '$lib/types/errors';

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
	const locale = getLocaleFromCookies(cookies);
	const projectResult = await getProjectBySlug(locals.supabase, params.slug, locale);

	if (!projectResult.ok) {
		if (projectResult.error instanceof NotFoundError) {
			error(404, 'Project not found');
		}
		error(500, 'Failed to load project');
	}

	if (!projectResult.value.is_published) {
		error(404, 'Project not found');
	}

	return { project: projectResult.value };
};