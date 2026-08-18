import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { supabase } from '$lib/supabase';
import type { Project } from '$lib/types';
import { getLocale } from '$paraglide/runtime';

export function useProjects() {
	return createQuery(() => ({
		queryKey: ['projects', getLocale()],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('projects')
				.select('*')
				.eq('is_published', true)
				.eq('locale', getLocale())
				.order('order_index', { ascending: true });
			
			if (error) throw error;
			return data as Project[];
		}
	}));
}

export function useProjectBySlug(slug: string) {
	return createQuery(() => ({
		queryKey: ['project', slug, getLocale()],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('projects')
				.select('*')
				.eq('slug', slug)
				.eq('locale', getLocale())
				.single();
			
			if (error) throw error;
			return data as Project;
		},
		enabled: !!slug
	}));
}

export function useCreateProject() {
	const queryClient = useQueryClient();
	
	return createMutation(() => ({
		mutationFn: async (input: Partial<Project>) => {
			const { data, error } = await supabase
				.from('projects')
				.insert(input)
				.select()
				.single();
			
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
		}
	}));
}

export function useUpdateProject(id: string) {
	const queryClient = useQueryClient();
	
	return createMutation(() => ({
		mutationFn: async (input: Partial<Project>) => {
			const { data, error } = await supabase
				.from('projects')
				.update(input)
				.eq('id', id)
				.select()
				.single();
			
			if (error) throw error;
			return data;
		},
		onMutate: async (newData: Partial<Project>) => {
			await queryClient.cancelQueries({ queryKey: ['project', id] });
			
			const previous = queryClient.getQueryData(['project', id]);
			
			queryClient.setQueryData(['project', id], (old: any) => ({
				...old,
				...newData
			}));
			
			return { previous };
		},
		onError: (_err: any, _variables: any, context: any) => {
			if (context?.previous) {
				queryClient.setQueryData(['project', id], context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['project', id] });
			queryClient.invalidateQueries({ queryKey: ['projects'] });
		}
	}));
}

export function useDeleteProject(id: string) {
	const queryClient = useQueryClient();
	
	return createMutation(() => ({
		mutationFn: async () => {
			const { error } = await supabase
				.from('projects')
				.delete()
				.eq('id', id);
			
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
		}
	}));
}
