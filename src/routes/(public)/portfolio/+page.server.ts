import type { PageServerLoad } from './$types';
import { getPublishedProjects } from '$lib/server/db/projects';

export const load: PageServerLoad = async ({ locals }) => {
	const projects = await getPublishedProjects(locals.supabase);
	return { projects };
};