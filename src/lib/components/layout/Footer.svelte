<script lang="ts">
	import { GithubLogo, LinkedinLogo, DribbbleLogo, Envelope } from 'phosphor-svelte';
	import * as m from '$paraglide/messages';
	import { onMount } from 'svelte';

	const year = new Date().getFullYear();

	let isMobile = $state(false);

	onMount(() => {
		isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	});

	const socials = [
		{ href: 'https://github.com/bbagustrm', label: 'GitHub', icon: GithubLogo, type: 'link' },
		{
			href: 'https://linkedin.com/in/bagus-tri-atmojo',
			label: 'LinkedIn',
			icon: LinkedinLogo,
			type: 'link'
		},
		{ href: 'https://dribbble.com/bbagustrm', label: 'Dribbble', icon: DribbbleLogo, type: 'link' },
		{ href: 'mailto:bbagustrm@gmail.com', label: 'Email', icon: Envelope, type: 'email' }
	];
</script>

<footer class="border-t bg-background">
	<div class="container mx-auto max-w-6xl px-4 py-8">
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
			<p class="text-sm text-muted-foreground">
				© {year} atmojo<span class="font-bold text-primary">.</span>pro — {m.footer_rights()}
			</p>

			<div class="flex items-center gap-2">
				{#each socials as social (social.href)}
					{@const Icon = social.icon}

					{#if social.type === 'email'}
						<button
							onclick={() => {
								if (isMobile) {
									window.location.href = social.href;
								} else {
									navigator.clipboard.writeText('bbagustrm@gmail.com');
									alert('✓ Email copied to clipboard!\n\nbbagustrm@gmail.com');
								}
							}}
							aria-label={social.label}
							class="cursor-pointer rounded-md p-2 text-muted-foreground transition-all hover:scale-110 hover:bg-muted hover:text-foreground"
						>
							<Icon size={18} weight="fill" />
						</button>
					{:else}
						<a
							href={social.href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={social.label}
							class="rounded-md p-2 text-muted-foreground transition-all hover:scale-110 hover:bg-muted hover:text-foreground"
						>
							<Icon size={18} weight="fill" />
						</a>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</footer>
