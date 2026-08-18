import type { SupabaseClient } from '@supabase/supabase-js';
import type { DbProject, Inserts, Updates } from '$lib/types';
import { Ok, Err, type Result } from '$lib/utils/result';
import { DatabaseError, NotFoundError } from '$lib/types/errors';

type Project = DbProject;
type ProjectInput = Inserts<'projects'>;

export async function getAllProjects(
	supabase: SupabaseClient
): Promise<Result<Project[], DatabaseError>> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.order('order_index', { ascending: true })
		.order('created_at', { ascending: false });

	if (error) return Err(DatabaseError.fromSupabaseError(error));
	return Ok(data ?? []);
}

export async function getPublishedProjects(
	supabase: SupabaseClient, 
	locale = 'en'
): Promise<Result<Project[], DatabaseError>> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('is_published', true)
		.eq('locale', locale)
		.order('order_index', { ascending: true });

	if (error) return Err(DatabaseError.fromSupabaseError(error));
	return Ok(data ?? []);
}

export async function getFeaturedProjects(
	supabase: SupabaseClient, 
	locale = 'en'
): Promise<Result<Project[], DatabaseError>> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('is_published', true)
		.eq('is_featured', true)
		.eq('locale', locale)
		.order('order_index', { ascending: true })
		.limit(6);

	if (error) return Err(DatabaseError.fromSupabaseError(error));
	return Ok(data ?? []);
}

export async function getProjectBySlug(
	supabase: SupabaseClient,
	slug: string,
	locale = 'en'
): Promise<Result<Project, DatabaseError | NotFoundError>> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('slug', slug)
		.eq('locale', locale)
		.single();

	if (error) return Err(DatabaseError.fromSupabaseError(error));
	if (!data) return Err(new NotFoundError(`Project with slug "${slug}" not found`));
	return Ok(data);
}

export async function getProjectById(
	supabase: SupabaseClient,
	id: string
): Promise<Result<Project, DatabaseError | NotFoundError>> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('id', id)
		.single();

	if (error) return Err(DatabaseError.fromSupabaseError(error));
	if (!data) return Err(new NotFoundError(`Project with id "${id}" not found`));
	return Ok(data);
}

export async function createProject(
	supabase: SupabaseClient,
	input: ProjectInput
): Promise<Result<Project, DatabaseError>> {
	const { data, error } = await supabase
		.from('projects')
		.insert(input)
		.select()
		.single();

	if (error) return Err(DatabaseError.fromSupabaseError(error));
	return Ok(data);
}

export async function updateProject(
	supabase: SupabaseClient,
	id: string,
	input: Partial<ProjectInput>
): Promise<Result<Project, DatabaseError>> {
	const { data, error } = await supabase
		.from('projects')
		.update(input)
		.eq('id', id)
		.select()
		.single();

	if (error) return Err(DatabaseError.fromSupabaseError(error));
	return Ok(data);
}

export async function deleteProject(
	supabase: SupabaseClient, 
	id: string
): Promise<Result<void, DatabaseError>> {
	const { error } = await supabase
		.from('projects')
		.delete()
		.eq('id', id);

	if (error) return Err(DatabaseError.fromSupabaseError(error));
	return Ok(undefined);
}
