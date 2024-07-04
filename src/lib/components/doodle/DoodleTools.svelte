<script lang="ts">
	import { Eraser, Pencil, Undo2 } from 'lucide-svelte';
</script>

<div>
	<button><Pencil size="2.5ch" absoluteStrokeWidth={true} /></button>
	<button><Undo2 size="2.5ch" absoluteStrokeWidth={true} /></button>
	<button><Eraser size="2.5ch" absoluteStrokeWidth={true} /></button>
</div>

<style>
	div {
		display: flex;
		justify-content: space-between;
		gap: 0.2rem;

		max-width: fit-content;
		position: fixed;
		bottom: 1rem;
		right: 1rem;

		border-radius: 0.2rem;
		border-style: solid;
		border-width: 1px;

		border-color: var(--background-tertiary);
		background-color: var(--background-primary);

		& button {
			position: relative;

			display: flex;
			align-items: center;
			justify-content: center;

			border: none;
			border-radius: 0.1rem;
			padding: 0.3rem;

			color: var(--text-secondary);
			background-color: var(--background-primary);
			transition-property: color, background-color;
			transition: 150ms ease-in-out;

			&:hover,
			&:focus {
				color: var(--text-primary);
				background-color: var(--background-secondary);
			}
		}

		& button:not(:last-child)::after {
			position: absolute;
			top: 10%;
			left: calc(100% + 0.1rem);

			display: block;
			content: '';

			background-color: var(--background-tertiary);
			height: 80%;
			width: 0.5px;

			border-radius: 1rem;
		}
	}
</style>
