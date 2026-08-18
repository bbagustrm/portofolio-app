<script lang="ts">
	import { languageTag, setLanguageTag, availableLanguageTags } from '$paraglide/runtime';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Globe } from 'phosphor-svelte';

	const languages = {
		en: 'English',
		id: 'Indonesia'
	};

	function switchLanguage(lang: 'en' | 'id') {
		setLanguageTag(lang);
		document.cookie = `locale=${lang}; path=/; max-age=31536000`;
	}

	$: currentLanguage = languages[languageTag() as 'en' | 'id'];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" size="sm" class="gap-2">
			<Globe class="size-4" />
			<span class="hidden sm:inline">{currentLanguage}</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>Language / Bahasa</DropdownMenu.Label>
		<DropdownMenu.Separator />
		{#each availableLanguageTags as lang}
			<DropdownMenu.Item
				on:click={() => switchLanguage(lang)}
				class={languageTag() === lang ? 'bg-muted' : ''}
			>
				<span class="flex items-center gap-2">
					{languages[lang]}
					{#if languageTag() === lang}
						<span class="text-primary">✓</span>
					{/if}
				</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
