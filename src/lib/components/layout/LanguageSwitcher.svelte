<script lang="ts">
	import { getLocale, locales } from '$paraglide/runtime';
	import { switchLanguage } from '$lib/i18n/init';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Globe } from 'phosphor-svelte';

	type Locale = typeof locales[number];

	const languages: Record<Locale, string> = {
		en: 'English',
		id: 'Indonesia'
	};

	let currentLanguage = $derived(languages[getLocale() as Locale]);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="ghost" size="sm" class="gap-2">
			<Globe class="size-4" />
			<span class="hidden sm:inline">{currentLanguage}</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>Language / Bahasa</DropdownMenu.Label>
		<DropdownMenu.Separator />
		{#each locales as lang}
			<DropdownMenu.Item
				onclick={() => switchLanguage(lang as Locale)}
				class={getLocale() === lang ? 'bg-muted' : ''}
			>
				<span class="flex items-center gap-2">
					{languages[lang as Locale]}
					{#if getLocale() === lang}
						<span class="text-primary">✓</span>
					{/if}
				</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
