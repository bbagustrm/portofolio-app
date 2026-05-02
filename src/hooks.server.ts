import { createSupabaseServerClient, createSupabaseAdminClient } from '$lib/server/supabase';
import type { Handle } from '@sveltejs/kit';

function shouldTrack(pathname: string): boolean {
	if (['/','/ portfolio','/blog','/gallery'].includes(pathname)) return true;
	if (pathname.startsWith('/portfolio/')) return true;
	if (pathname.startsWith('/blog/')) return true;
	if (pathname.startsWith('/gallery/')) return true;
	return false;
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient(event.cookies);

	event.locals.safeGetSession = async () => {
		const { data: { user }, error } = await event.locals.supabase.auth.getUser();
		if (error || !user) return { session: null, user: null };
		const { data: { session } } = await event.locals.supabase.auth.getSession();
		return { session, user };
	};

	// Track page views
	const { pathname } = event.url;
	if (
		event.request.method === 'GET' &&
		shouldTrack(pathname) &&
		!pathname.startsWith('/dashboard') &&
		!pathname.startsWith('/api')
	) {
		const admin = createSupabaseAdminClient();
		admin.from('page_views').insert({
			path: pathname,
			referrer: event.request.headers.get('referer') ?? null
		}).then(() => {});
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};