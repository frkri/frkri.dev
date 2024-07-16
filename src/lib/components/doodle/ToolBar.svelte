<script lang="ts">
	import { PENCIL_MAX_RADIUS, PENCIL_MIN_RADIUS, PENCIL_DEFAULT_RADIUS } from './Canvas';
	import { Eraser, Pencil, X, CircleHelp } from 'lucide-svelte';
	import { CanvasMode } from '$lib/types/doodle';

	let {
		mode = $bindable(),
		color = $bindable(),
		pencilRadius = $bindable()
	}: { mode: CanvasMode; color: string; pencilRadius: number } = $props();

	async function handleKey(e: KeyboardEvent) {
		if (mode === CanvasMode.IDLE || e.ctrlKey) return;

		switch (e.key) {
			case 'Escape':
				mode = CanvasMode.IDLE;
				break;
			case '+':
				pencilRadius = Math.min(pencilRadius + 1, PENCIL_MAX_RADIUS);
				break;
			case '-':
				pencilRadius = Math.max(pencilRadius - 1, PENCIL_MIN_RADIUS);
				break;
			case '=':
				pencilRadius = PENCIL_DEFAULT_RADIUS;
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKey} />

{#if mode !== CanvasMode.IDLE}
	<menu id="left">
		<label class:limit-max={pencilRadius === PENCIL_MAX_RADIUS} title="Pencil radius">
			<input
				type="range"
				min={PENCIL_MIN_RADIUS}
				max={PENCIL_MAX_RADIUS}
				bind:value={pencilRadius}
			/>
			<button ondblclick={() => (pencilRadius = PENCIL_DEFAULT_RADIUS)}>
				{pencilRadius}
			</button>
		</label>
		<button title="Help">
			<CircleHelp size="30px" absoluteStrokeWidth={true} />
		</button>
	</menu>
{/if}

<menu id="right" class:inactive={mode === CanvasMode.IDLE}>
	{#if mode !== CanvasMode.DRAW}
		<button title="Pencil" onclick={() => (mode = CanvasMode.DRAW)}>
			<Pencil size="30px" absoluteStrokeWidth={true} />
		</button>
	{:else}
		<label title="Color selection" class="selected color-wrap">
			<input type="color" title="Pencil color" bind:value={color} />
		</label>
	{/if}
	{#if mode !== CanvasMode.IDLE}
		<button
			title="Eraser"
			class:selected={mode === CanvasMode.ERASE}
			onclick={() => (mode = CanvasMode.ERASE)}
		>
			<Eraser size="30px" absoluteStrokeWidth={true} />
		</button>
		<button title="Close" onclick={() => (mode = CanvasMode.IDLE)}>
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

	.limit-max {
		&:hover button,
		&:focus button {
			color: #df9292 !important;
		}
	}

	#left {
		gap: 0.4rem;
		flex-direction: column;
		left: 0.8em;

		background-color: transparent;
		border-color: transparent;

		& > * {
			border-radius: 0.2rem;
			border-style: solid;
			border-width: 1.5px;
			width: 3rem;

			border-color: var(--background-tertiary);
			background-color: var(--background-primary);
		}

		& label {
			display: flex;
			flex-direction: column;

			&:hover button {
				color: #ffffff;
			}

			& button {
				width: 2rem;
				height: 2rem;

				font-size: 1rem;
				font-weight: 600;
			}

			& input {
				height: 0rem;
				width: min-content;

				margin: 0px;
				padding: 0px;
				opacity: 0;

				writing-mode: vertical-lr;
				direction: rtl;

				accent-color: var(--text-secondary);

				&:hover,
				&:focus {
					height: 8rem;
					margin: 0.6rem 0px;

					opacity: 1;
				}
			}
		}

		@media screen and (max-height: 250px) and (min-width: 300px) {
			flex-direction: row;
			flex-flow: row-reverse;

			& label {
				flex-direction: row;
				flex-flow: row-reverse;
				width: fit-content;

				& input {
					height: fit-content;
					width: 0rem;

					writing-mode: horizontal-tb;
					direction: initial;

					&:hover,
					&:focus {
						height: min-content;
						width: min-content;

						margin: 0px;
					}
				}
			}
		}

		@media screen and (max-height: 250px) and (max-width: 450px) {
			& > button {
				display: none;
			}
		}
	}

	#right {
		right: 0.8em;

		border-color: var(--background-tertiary);
		background-color: var(--background-primary);

		& :first-child {
			border-top-left-radius: 0.15rem;
			border-bottom-left-radius: 0.15rem;
		}

		& :last-child {
			border-top-right-radius: 0.15rem;
			border-bottom-right-radius: 0.15rem;
		}
	}

	menu {
		display: flex;
		justify-content: space-between;
		flex-direction: row;
		align-items: center;
		z-index: 2;

		position: fixed;
		bottom: 0.8em;

		margin: 0px;
		padding: 0px;

		border-radius: 0.2rem;
		border-style: solid;
		border-width: 1.5px;

		& * {
			display: flex;
			align-items: center;
			justify-content: center;

			border: none;
			padding: 0.4rem;

			transition: 100ms ease-in-out;
		}

		& button {
			color: var(--text-secondary);
			background-color: var(--background-primary);

			&:hover {
				color: #ffffff;
			}
		}

		@media screen and (max-width: 300px) {
			flex-direction: column;
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
