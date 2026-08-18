import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { supabase } from '$lib/supabase';
import type { BlogPost, BlogPostInput } from '$lib/types';
import { getLocale } from '$paraglide/runtime';

export function useBlogPosts() {
	return createQuery(() => ({
		queryKey: ['blog-posts', getLocale()],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('blog_posts')
				.select(`
					*,
					tags: blog_post_tags(
						tag: tags(*)
					)
				`)
				.eq('is_published', true)
				.eq('locale', getLocale())
				.order('published_at', { ascending: false });
			
			if (error) throw error;
			return data as BlogPost[];
		}
	}));
}

export function useBlogPostBySlug(slug: string) {
	return createQuery(() => ({
		queryKey: ['blog-post', slug, getLocale()],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('blog_posts')
				.select(`
					*,
					tags: blog_post_tags(
						tag: tags(*)
					)
				`)
				.eq('slug', slug)
				.eq('locale', getLocale())
				.single();
			
			if (error) throw error;
			return data as BlogPost;
		},
		enabled: !!slug
	}));
}

export function useCreateBlogPost() {
	const queryClient = useQueryClient();
	
	return createMutation(() => ({
		mutationFn: async (input: BlogPostInput) => {
			const { data, error } = await supabase
				.from('blog_posts')
				.insert(input)
				.select()
				.single();
			
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
		}
	}));
}

export function useUpdateBlogPost(id: string) {
	const queryClient = useQueryClient();
	
	return createMutation(() => ({
		mutationFn: async (input: Partial<BlogPostInput>) => {
			const { data, error } = await supabase
				.from('blog_posts')
				.update(input)
				.eq('id', id)
				.select()
				.single();
			
			if (error) throw error;
			return data;
		},
		onMutate: async (newData) => {
			await queryClient.cancelQueries({ queryKey: ['blog-post', id] });
			
			const previous = queryClient.getQueryData(['blog-post', id]);
			
			queryClient.setQueryData(['blog-post', id], (old: any) => ({
				...old,
				...newData
			}));
			
			return { previous };
		},
		onError: (err, variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(['blog-post', id], context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
			queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
		}
	}));
}

export function useDeleteBlogPost() {
	const queryClient = useQueryClient();
	
	return createMutation(() => ({
		mutationFn: async (id: string) => {
			const { error } = await supabase
				.from('blog_posts')
				.delete()
				.eq('id', id);
			
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
		}
	}));
}

export function useToggleBlogPostPublish(id: string) {
	const queryClient = useQueryClient();
	
	return createMutation(() => ({
		mutationFn: async (isPublished: boolean) => {
			const { data, error } = await supabase
				.from('blog_posts')
				.update({ is_published: isPublished })
				.eq('id', id)
				.select()
				.single();
			
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
			queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
		}
	}));
}
