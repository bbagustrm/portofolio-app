import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project, ProjectInput } from '$lib/types';

export async function getAllProjects(supabase: SupabaseClient): Promise<Project[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.order('order_index', { ascending: true })
		.order('created_at', { ascending: false });

	if (error) throw new Error(error.message);
	return data ?? [];
}

export async function getPublishedProjects(supabase: SupabaseClient): Promise<Project[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('is_published', true)
		.order('order_index', { ascending: true });

	if (error) throw new Error(error.message);
	return data ?? [];
}

export async function getFeaturedProjects(supabase: SupabaseClient): Promise<Project[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('is_published', true)
		.eq('is_featured', true)
		.order('order_index', { ascending: true })
		.limit(6);

	if (error) throw new Error(error.message);
	return data ?? [];
}

export async function getProjectBySlug(
	supabase: SupabaseClient,
	slug: string
): Promise<Project | null> {
	const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).single();

	if (error) return null;
	return data;
}

export async function getProjectById(
	supabase: SupabaseClient,
	id: string
): Promise<Project | null> {
	const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

	if (error) return null;
	return data;
}

export async function createProject(
	supabase: SupabaseClient,
	input: ProjectInput
): Promise<Project> {
	const { data, error } = await supabase.from('projects').insert(input).select().single();

	if (error) throw new Error(error.message);
	return data;
}

export async function updateProject(
	supabase: SupabaseClient,
	id: string,
	input: Partial<ProjectInput>
): Promise<Project> {
	const { data, error } = await supabase
		.from('projects')
		.update(input)
		.eq('id', id)
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}

export async function deleteProject(supabase: SupabaseClient, id: string): Promise<void> {
	const { error } = await supabase.from('projects').delete().eq('id', id);

	if (error) throw new Error(error.message);
}
