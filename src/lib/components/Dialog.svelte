<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		title = '',
		isOpen = $bindable(false),
		children
	}: {
		title?: string;
		isOpen?: boolean;
		children: Snippet;
	} = $props();
	let dialog: HTMLDialogElement;

	$effect(() => {
		if (isOpen) dialog.showModal();
		else dialog.close();
	});

	function handleClickOutside(event: MouseEvent) {
		if (!isOpen || event.target !== dialog) return;

		const rect = dialog.getBoundingClientRect();
		if (
			event.clientX < rect.left ||
			event.clientX >= rect.right ||
			event.clientY < rect.top ||
			event.clientY >= rect.bottom
		)
			isOpen = false;
	}

	// Dialog handles the escape key itself, but we need to still update our own state
	function handleKeyDown(event: KeyboardEvent) {
		if (!isOpen || event.key !== 'Escape') return;
		isOpen = false;
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeyDown} />
<dialog bind:this={dialog}>
	<button title="Close" aria-label="close" onclick={() => (isOpen = false)}>
		<X size="15px" color="var(--text-primary)" />
	</button>
	<header>
		<h2>{title}</h2>
	</header>
	<div>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		width: 90vw;
		max-width: 700px;
		padding: 1.4rem;
		padding-top: 0px;

		border: none;
		border-radius: 0.8rem;

		background-color: var(--background-secondary);
		animation: slideOut 150ms ease-out;

		&::backdrop {
			background-color: rgba(0, 0, 0, 0.4);
		}

		&[open] {
			animation: slideIn 150ms ease-out;
		}

		& > button {
			position: sticky;
			top: 7px;
			right: 7px;
			margin-left: calc(100% - 7px);

			width: calc(15px + 0.2rem);
			height: calc(15px + 0.2rem);
			padding: 0.1rem;

			border: none;
			border-radius: 0.2rem;

			opacity: 60%;
			background: none;
			cursor: pointer;

			transition: 150ms ease-in-out;

			&:hover,
			&:focus {
				background-color: var(--background-tertiary);
				opacity: 100%;
			}
		}

		& > header {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			margin: 0px;

			color: var(--text-primary);

			& h2 {
				flex-grow: 1;
				margin: 0px;
				text-align: justify;
				line-height: 1.2;

				font-size: 1.4rem;
				font-weight: 600;
			}
		}

		& > div {
			color: var(--text-secondary);
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideOut {
		from {
			opacity: 1;
			display: block;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			display: none;
			transform: translateY(1rem);
		}
	}
</style>
