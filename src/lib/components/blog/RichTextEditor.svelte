<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$paraglide/messages';

	import {
		Bold,
		Italic,
		Heading2,
		Heading3,
		List,
		ListOrdered,
		Quote,
		Code,
		Link as LinkIcon,
		Image as ImageIcon,
		Minus,
		Upload
	} from '@lucide/svelte';

	// Props
	let {
		content = '',
		name = 'content',
		onchange
	} = $props<{
		content?: string;
		name?: string;
		onchange?: (html: string) => void;
	}>();

	// Local state
	let currentContent = $state('');
	let element = $state<HTMLDivElement | null>(null);
	let editor = $state<Editor | null>(null);
	let isFocused = $state(false);
	let previewDialogOpen = $state(false);
	let previewImage = $state<string | null>(null);
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);
	let fileInputRef = $state<HTMLInputElement | null>(null);

	// Sync dari parent → local state + editor
	$effect(() => {
		currentContent = content;

		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content);
		}
	});

	onMount(() => {
		if (!element) return;

		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				Image.configure({ inline: false }),
				Link.configure({ openOnClick: false }),
				Placeholder.configure({
					placeholder: 'Start writing your article...'
				})
			],
			content: content,

			onUpdate({ editor }) {
				const html = editor.getHTML();
				currentContent = html;
				onchange?.(html);
			},

			onFocus() {
				isFocused = true;
			},

			onBlur() {
				isFocused = false;
			},

			editorProps: {
				handleDrop(view, event) {
					const files = Array.from(event.dataTransfer?.files ?? []);
					const imageFile = files.find((f) => f.type.startsWith('image/'));
					if (imageFile) {
						event.preventDefault();
						handleImageFile(imageFile);
						return true;
					}
					return false;
				},
				handlePaste(view, event) {
					const items = Array.from(event.clipboardData?.items ?? []);
					const imageItem = items.find((item) => item.type.startsWith('image/'));
					if (imageItem) {
						const file = imageItem.getAsFile();
						if (file) {
							event.preventDefault();
							handleImageFile(file);
							return true;
						}
					}
					return false;
				}
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	// File validation
	const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

	function validateFile(file: File): string | null {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return m.editor_image_error_format();
		}
		if (file.size > MAX_FILE_SIZE) {
			return m.editor_image_error_size();
		}
		return null;
	}

	// Convert file to base64
	async function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	// Handle image upload
	async function handleImageFile(file: File) {
		uploadError = null;

		const error = validateFile(file);
		if (error) {
			uploadError = error;
			return;
		}

		uploading = true;
		try {
			const base64 = await fileToBase64(file);
			previewImage = base64;
			previewDialogOpen = true;
		} catch (err) {
			uploadError = 'Failed to process image.';
		} finally {
			uploading = false;
		}
	}

	// Insert image into editor
	function insertImage() {
		if (!editor || !previewImage) return;
		editor.chain().focus().setImage({ src: previewImage }).run();
		previewDialogOpen = false;
		previewImage = null;
	}

	function toggleLink() {
		if (!editor) return;

		const url = window.prompt('Enter URL:');
		if (!url) return;

		editor.chain().focus().setLink({ href: url }).run();
	}

	type ToolbarItem =
		| { type: 'button'; action: () => void; active: () => boolean; icon: any; title: string }
		| { type: 'separator' };

	function getToolbar(): ToolbarItem[] {
		if (!editor) return [];

		return [
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleBold().run(),
				active: () => editor!.isActive('bold'),
				icon: Bold,
				title: 'Bold'
			},
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleItalic().run(),
				active: () => editor!.isActive('italic'),
				icon: Italic,
				title: 'Italic'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleHeading({ level: 2 }).run(),
				active: () => editor!.isActive('heading', { level: 2 }),
				icon: Heading2,
				title: 'Heading 2'
			},
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleHeading({ level: 3 }).run(),
				active: () => editor!.isActive('heading', { level: 3 }),
				icon: Heading3,
				title: 'Heading 3'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleBulletList().run(),
				active: () => editor!.isActive('bulletList'),
				icon: List,
				title: 'Bullet List'
			},
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleOrderedList().run(),
				active: () => editor!.isActive('orderedList'),
				icon: ListOrdered,
				title: 'Ordered List'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleBlockquote().run(),
				active: () => editor!.isActive('blockquote'),
				icon: Quote,
				title: 'Blockquote'
			},
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleCodeBlock().run(),
				active: () => editor!.isActive('codeBlock'),
				icon: Code,
				title: 'Code Block'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: toggleLink,
				active: () => editor!.isActive('link'),
				icon: LinkIcon,
				title: 'Link'
			},
			{
				type: 'button',
				action: () => fileInputRef?.click(),
				active: () => false,
				icon: ImageIcon,
				title: 'Image'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: () => editor!.chain().focus().setHorizontalRule().run(),
				active: () => false,
				icon: Minus,
				title: 'Divider'
			}
		];
	}
</script>

<div class="overflow-hidden rounded-xl border {isFocused ? 'ring-2 ring-ring' : ''}">
	<!-- Toolbar -->
	{#if editor}
		{@const toolbar = getToolbar()}
		<div class="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-2">
			{#each toolbar as item}
				{#if item.type === 'separator'}
					<div class="mx-1 h-5 w-px bg-border"></div>
				{:else}
					{@const Icon = item.icon}
					<button
						type="button"
						onclick={item.action}
						title={item.title}
						class="rounded-md p-1.5 text-sm transition-colors
						{item.active()
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
					>
						<Icon class="size-4" />
					</button>
				{/if}
			{/each}
		</div>
	{/if}

	<!-- Editor -->
	<div
		bind:this={element}
		class="prose min-h-64 max-w-none p-4 prose-neutral focus-within:outline-none
		dark:prose-invert prose-headings:font-bold
		prose-a:text-primary [&_.ProseMirror]:min-h-64
		[&_.ProseMirror]:outline-none"
	></div>
</div>

<!-- Hidden file input -->
<input
	bind:this={fileInputRef}
	type="file"
	accept="image/jpeg,image/png,image/webp,image/gif"
	class="hidden"
	onchange={(e) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) handleImageFile(file);
	}}
/>

<!-- Upload status -->
{#if uploading}
	<p class="mt-2 text-sm text-muted-foreground">{m.editor_image_uploading()}</p>
{/if}
{#if uploadError}
	<p class="mt-2 text-sm text-destructive">{uploadError}</p>
{/if}

<!-- Preview Dialog -->
<Dialog.Root bind:open={previewDialogOpen}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{m.editor_image_preview_title()}</Dialog.Title>
			<Dialog.Description>
				{m.editor_image_preview_description()}
			</Dialog.Description>
		</Dialog.Header>

		{#if previewImage}
			<div class="mt-4">
				<img src={previewImage} alt="Preview" class="w-full rounded-lg border" />
			</div>
		{/if}

		<Dialog.Footer class="mt-6">
			<Button
				variant="outline"
				onclick={() => {
					previewDialogOpen = false;
					previewImage = null;
				}}
			>
				{m.editor_image_preview_cancel()}
			</Button>
			<Button onclick={insertImage}>
				{m.editor_image_preview_confirm()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Hidden input -->
<input type="hidden" {name} bind:value={currentContent} />

<style>
	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: var(--color-muted-foreground);
		pointer-events: none;
		height: 0;
	}
</style>
