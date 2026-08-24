<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Camera, ArrowLeft } from '@lucide/svelte';
	import { reveal, revealStagger } from '$lib/actions/reveal';
	import { hoverLift } from '$lib/actions/hover';

	let { data, form } = $props();
	let profile = $derived(data.profile);

	let loading = $state(false);
	let avatarPreview = $state<string | null>(null);

	$effect(() => {
		if (form?.error) toast.error(form.error);
		if (form?.success) toast.success('Profile updated!');
	});

	function onAvatarChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) avatarPreview = URL.createObjectURL(file);
	}
</script>

<svelte:head><title>Profile — Dashboard</title></svelte:head>

<div class="max-w-2xl space-y-6">
	<div use:reveal={{ y: 16 }} class="flex items-center gap-3 mb-6">
		<a href="/dashboard">
			<Button variant="ghost" size="icon">
				<ArrowLeft class="size-4" />
			</Button>
		</a>
		<div>
			<h1 class="text-2xl font-bold">Profile</h1>
			<p class="text-muted-foreground text-sm mt-0.5">Update your public profile information.</p>
		</div>
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update({ reset: false });
				loading = false;
			};
		}}
		use:revealStagger={{ stagger: 0.1, y: 20 }}
		class="space-y-6"
	>
		<!-- Avatar -->
		<Card>
			<CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
			<CardContent class="flex items-center gap-6">
				<div class="relative shrink-0">
					<div class="size-24 rounded-full overflow-hidden bg-muted border">
						{#if avatarPreview || profile?.avatar_url}
							<img
								src={avatarPreview ?? profile?.avatar_url}
								alt="Avatar"
								class="w-full h-full object-cover"
							/>
						{:else}
							<div class="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
								{profile?.full_name?.[0]?.toUpperCase() ?? '?'}
							</div>
						{/if}
					</div>
					<label class="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors shadow">
						<Camera class="size-3.5" />
						<input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" class="hidden" onchange={onAvatarChange} />
					</label>
				</div>
				<div>
					<p class="text-sm font-medium">Profile Photo</p>
					<p class="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP — max 10MB</p>
				</div>
			</CardContent>
		</Card>

		<!-- Info -->
		<Card>
			<CardHeader><CardTitle>Information</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="full_name">Full Name</Label>
					<Input id="full_name" name="full_name" value={profile?.full_name ?? ''} placeholder="Your Name" />
				</div>
				<div class="space-y-2">
					<Label for="bio">Bio</Label>
					<Textarea
						id="bio"
						name="bio"
						value={profile?.bio ?? ''}
						placeholder="Full Stack Developer passionate about building..."
						rows={4}
					/>
				</div>
			</CardContent>
		</Card>

		<!-- Links -->
		<Card>
			<CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="github_url">GitHub</Label>
					<Input id="github_url" name="github_url" type="url" value={profile?.github_url ?? ''} placeholder="https://github.com/username" />
				</div>
				<div class="space-y-2">
					<Label for="linkedin_url">LinkedIn</Label>
					<Input id="linkedin_url" name="linkedin_url" type="url" value={profile?.linkedin_url ?? ''} placeholder="https://linkedin.com/in/username" />
				</div>
				<div class="space-y-2">
					<Label for="website_url">Website</Label>
					<Input id="website_url" name="website_url" type="url" value={profile?.website_url ?? ''} placeholder="https://yoursite.com" />
				</div>
			</CardContent>
		</Card>

		<div use:hoverLift={{ y: -2, duration: 0.15 }} class="inline-block">
			<Button type="submit" disabled={loading}>
				{loading ? 'Saving...' : 'Save Profile'}
			</Button>
		</div>
	</form>
</div>