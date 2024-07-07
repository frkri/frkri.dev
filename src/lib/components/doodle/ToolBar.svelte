<script lang="ts">
	import { Eraser, Pencil, Undo2, X } from 'lucide-svelte';
	import { CanvasMode } from '$lib/types/doodle';

	let {
		isOpen,
		mode = $bindable(),
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
			<Pencil size="30px" absoluteStrokeWidth={true} />
		</button>
	{:else}
		<label class="selected color-wrap">
			<input type="color" title="Pencil color" bind:value={color} />
		</label>
	{/if}
	{#if isOpen}
		<button class:selected={mode === CanvasMode.ERASE} onclick={() => (mode = CanvasMode.ERASE)}>
			<Eraser size="30px" absoluteStrokeWidth={true} />
		</button>
		<button><Undo2 size="30px" absoluteStrokeWidth={true} /></button>
		<button onclick={close}>
			<X size="30px" absoluteStrokeWidth={true} />
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

			border: none;
			padding: 0.4rem;

			transition-property: all;
			transition: 150ms ease-in-out;
		}

		& button {
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
		max-width: 42.8px;
		max-height: 42.8px;

		& input {
			min-height: 30px;
			min-width: 30px;

			margin: 0px;
			padding: 0px;

			opacity: 0.8;
			clip-path: circle(30%);

			&:hover {
				opacity: 1;
			}
		}
	}
</style>
