<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Eye, EyeSlash, SignIn } from 'phosphor-svelte';
	import { reveal, revealStagger } from '$lib/actions/reveal';

	let { form } = $props();

	let loading = $state(false);
	let showPassword = $state(false);

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>Login — Portfolio</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 bg-background">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
			<p class="text-muted-foreground mt-2">Sign in to access your dashboard</p>
		</div>

		<div use:reveal={{ y: 24, duration: 0.5 }}>
			<Card class="shadow-lg">
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
				<CardDescription>Enter your credentials to continue</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}
					use:revealStagger={{ stagger: 0.08, y: 16 }}
					class="space-y-4"
				>
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="you@example.com"
							required
							autocomplete="email"
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<div class="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								required
								autocomplete="current-password"
								class="pr-10"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Toggle password visibility"
							>
								{#if showPassword}
									<EyeSlash size={16} />
								{:else}
									<Eye size={16} />
								{/if}
							</button>
						</div>
					</div>

					<Button type="submit" class="w-full gap-2" disabled={loading}>
						{#if loading}
							<span class="animate-spin">⏳</span> Signing in...
						{:else}
							<SignIn size={16} />
							Sign In
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>
		</div>
	</div>
</div>