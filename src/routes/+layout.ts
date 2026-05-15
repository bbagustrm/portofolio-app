import { dev } from '$app/environment';
import { injectAnalytics } from '@vercel/analytics/sveltekit';
import { onNavigate } from '$app/navigation';

injectAnalytics({ mode: dev ? 'development' : 'production' });

export function load() {
	return {};
}