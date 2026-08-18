import type { PageServerLoad } from './$types';
import { getPublishedProjects } from '$lib/server/db/projects';
import { getLocaleFromCookies } from '$lib/i18n/server';
import { unwrapOr } from '$lib/utils/result';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const locale = getLocaleFromCookies(cookies);
	const projectsResult = await getPublishedProjects(locals.supabase, locale);
	return { projects: unwrapOr(projectsResult, []) };
};