import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { supabase } from '$lib/supabase';
import type { Profile, ProfileInput } from '$lib/types';

export function useProfile(userId: string) {
	return createQuery(() => ({
		queryKey: ['profile', userId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single();
			
			if (error) throw error;
			return data as Profile;
		},
		enabled: !!userId
	}));
}

export function useUpdateProfile(userId: string) {
	const queryClient = useQueryClient();
	
	return createMutation(() => ({
		mutationFn: async (input: Partial<ProfileInput>) => {
			const { data, error } = await supabase
				.from('profiles')
				.update(input)
				.eq('id', userId)
				.select()
				.single();
			
			if (error) throw error;
			return data;
		},
		onMutate: async (newData) => {
			await queryClient.cancelQueries({ queryKey: ['profile', userId] });
			
			const previous = queryClient.getQueryData(['profile', userId]);
			
			queryClient.setQueryData(['profile', userId], (old: any) => ({
				...old,
				...newData
			}));
			
			return { previous };
		},
		onError: (err, variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(['profile', userId], context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['profile', userId] });
		}
	}));
}
