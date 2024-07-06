<script lang="ts">
	import { Eraser, Pencil, Undo2 } from 'lucide-svelte';

	let { isActive }: { isActive?: boolean } = $props();
</script>

<div id="toolbar" class:inactive={!isActive}>
	<button onclick={() => (isActive = !isActive)}>
		<Pencil size="3.5ch" absoluteStrokeWidth={true} />
	</button>
	{#if isActive}
		<button><Undo2 size="3.5ch" absoluteStrokeWidth={true} /></button>
		<button><Eraser size="3.5ch" absoluteStrokeWidth={true} /></button>
	{/if}
</div>

<noscript>
	<style>
		#toolbar {
			display: none !important;
		}
	</style>
</noscript>

<style>
	.inactive {
		opacity: 0.3;
	}

	div {
		display: flex;
		justify-content: space-between;

		max-width: fit-content;
		position: fixed;
		bottom: 1em;
		right: 1em;

		border-radius: 0.2rem;
		border-style: solid;
		border-width: 1px;

		transition-property: all;
		transition: 150ms ease-in-out;

		border-color: var(--background-tertiary);

		& button {
			position: relative;

			display: flex;
			align-items: center;
			justify-content: center;

			border: none;
			padding: 0.4rem;

			transition-property: all;
			transition: 150ms ease-in-out;

			color: var(--text-secondary);
			background-color: var(--background-primary);

			&:hover {
				color: var(--text-primary);
				background-color: var(--background-secondary);
			}
		}

		& :first-child {
			border-top-left-radius: 0.15rem;
			border-bottom-left-radius: 0.15rem;
		}

		& :last-child {
			border-top-right-radius: 0.15rem;
			border-bottom-right-radius: 0.15rem;
		}
	}
</style>
