<script lang="ts">
	import { Eraser, Pencil, Undo2, X } from 'lucide-svelte';
	import { CanvasMode } from '$lib/types/doodle';

	let {
		isOpen,
		mode = $bindable(CanvasMode.IDLE),
		color = $bindable()
	}: { isOpen?: boolean; mode: CanvasMode; color: string } = $props();

	function close() {
		isOpen = false;
		mode = CanvasMode.IDLE;
	}
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Escape') close();
	}}
/>

<menu id="toolbar" class:inactive={!isOpen}>
	{#if mode !== CanvasMode.DRAW}
		<button
			onclick={() => {
				isOpen = true;
				mode = CanvasMode.DRAW;
			}}
		>
			<Pencil size="3.5ch" absoluteStrokeWidth={true} />
		</button>
	{:else}
		<div class="selected color-wrap">
			<input type="color" bind:value={color} />
		</div>
	{/if}
	{#if isOpen}
		<button class:selected={mode === CanvasMode.ERASE} onclick={() => (mode = CanvasMode.ERASE)}>
			<Eraser size="3.5ch" absoluteStrokeWidth={true} />
		</button>
		<button><Undo2 size="3.5ch" absoluteStrokeWidth={true} /></button>
		<button onclick={close}>
			<X size="3.5ch" absoluteStrokeWidth={true} />
		</button>
	{/if}
</menu>

<style>
	.inactive {
		opacity: 0.4;
	}

	.selected {
		color: var(--text-primary);
		background-color: var(--background-secondary);
	}

	menu {
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 2;

		max-width: fit-content;
		position: fixed;
		bottom: 0.8em;
		right: 0.8em;

		margin: 0px;
		padding: 0px;

		border-radius: 0.2rem;
		border-style: solid;
		border-width: 1px;

		border-color: var(--background-tertiary);
		background-color: var(--background-primary);

		& * {
			display: flex;
			align-items: center;
			justify-content: center;

			transition-property: all;
			transition: 150ms ease-in-out;

			border: none;
		}

		& button {
			padding: 0.4rem;

			color: var(--text-secondary);
			background-color: var(--background-primary);

			&:hover {
				color: #ffffff;
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

	.color-wrap {
		& input {
			height: 3.5ch;
			width: 3.5ch;

			margin: 0.4rem;
			padding: 0px;

			opacity: 0.8;
			clip-path: circle(45%);

			&:hover {
				opacity: 1;
			}
		}
	}
</style>
