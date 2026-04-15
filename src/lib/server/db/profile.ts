import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, ProfileInput } from '$lib/types';

export async function getProfile(
	supabase: SupabaseClient,
	userId: string
): Promise<Profile | null> {
	const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

	if (error) return null;
	return data;
}

export async function updateProfile(
	supabase: SupabaseClient,
	userId: string,
	input: Partial<ProfileInput>
): Promise<Profile> {
	const { data, error } = await supabase
		.from('profiles')
		.update(input)
		.eq('id', userId)
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}
