<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		title = '',
		children,
		isOpen = $bindable(false)
	}: {
		children: Snippet;
		title?: string;
		isOpen: boolean;
	} = $props();
	let dialog: HTMLDialogElement;

	$effect(() => {
		if (isOpen) dialog.showModal();
		else dialog.close();
	});

	function handleClickOutside(event: MouseEvent) {
		if (event.target !== dialog && !dialog.open) return;

		const rect = dialog.getBoundingClientRect();
		if (
			event.clientX < rect.left ||
			event.clientX >= rect.right ||
			event.clientY < rect.top ||
			event.clientY >= rect.bottom
		)
			isOpen = false;
	}
</script>

<svelte:window onclick={handleClickOutside} />
<dialog bind:this={dialog}>
	<header>
		<h2>{title}</h2>
		<button title="Close" onclick={() => (isOpen = false)}>
			<X size="30px" color="var(--text-primary)" />
		</button>
	</header>
	<div>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		width: 90vw;
		max-width: 500px;
		padding: 0.8rem;

		border: none;
		border-radius: 0.5rem;

		background-color: var(--background-secondary);
		animation: slideOut 150ms ease-out;

		&[open] {
			animation: slideIn 150ms ease-out;
		}

		& > header {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			position: relative;
			margin-bottom: 0.5rem;

			color: var(--text-primary);

			& h2 {
				flex-grow: 1;
				margin: 0;

				font-size: 1.5rem;
				font-weight: 600;
			}

			& button {
				position: absolute;
				top: 0;
				right: 0;

				width: calc(30px + 0.2rem);
				height: calc(30px + 0.2rem);
				padding: 0.1rem;

				border: none;
				border-radius: 0.5rem;

				background: none;
				cursor: pointer;

				&:hover,
				&:focus {
					background-color: var(--background-tertiary);
				}
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
