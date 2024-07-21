<script lang="ts">
	import {
		PENCIL_MAX_RADIUS,
		PENCIL_MIN_RADIUS,
		PENCIL_DEFAULT_RADIUS,
		KEYS_UP,
		KEYS_DOWN,
		KEYS_LEFT,
		KEYS_RIGHT
	} from './Canvas';
	import { Eraser, Pencil, X, CircleHelp, Undo2, ChevronUp } from 'lucide-svelte';
	import { CanvasMode } from '$lib/types/doodle';
	import Dialog from '$lib/components/Dialog.svelte';

	let {
		worker,
		mode = $bindable(),
		color = $bindable(),
		pencilRadius = $bindable()
	}: { worker: Worker; mode: CanvasMode; color: string; pencilRadius: number } = $props();

	let pencilRadiusInput: HTMLInputElement | null = $state(null);
	let isHelpDialogOpen = $state(false);
	let altMode = false;

	function handleKeyDown(e: KeyboardEvent) {
		if (mode === CanvasMode.IDLE || isHelpDialogOpen || e.altKey) return;
		const key = e.key.toLowerCase();

		// Keyboard specific actions
		if (key === 'shift') {
			handleAltMode(true);
			return;
		}

		if ((e.ctrlKey && key === 'z') || key === 'u') {
			worker.postMessage({ type: 'undoPath', data: { shouldRedraw: true } });
			return;
		}

		switch (key) {
			case 'escape':
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

	function handleKeyUp(e: KeyboardEvent) {
		if (mode === CanvasMode.IDLE || isHelpDialogOpen || e.ctrlKey || e.altKey) return;
		const key = e.key.toLowerCase();

		// Keyboard specific actions
		if (key === 'shift') handleAltMode(false);
	}

	async function handleAltMode(isActive: boolean) {
		if (isActive && !altMode) {
			mode = mode === CanvasMode.DRAW ? CanvasMode.ERASE : CanvasMode.DRAW;
			altMode = true;
		} else if (!isActive && altMode) {
			mode = mode === CanvasMode.DRAW ? CanvasMode.ERASE : CanvasMode.DRAW;
			altMode = false;
		}
	}

	async function handleFocus() {
		if (!pencilRadiusInput) return;
		pencilRadiusInput.focus();
		pencilRadiusInput.select();
	}
</script>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} />

{#if mode !== CanvasMode.IDLE}
	<menu id="left">
		<label
			class:limit-max={pencilRadius === PENCIL_MAX_RADIUS}
			onmouseover={handleFocus}
			onfocus={handleFocus}
			title="Pencil radius"
		>
			<input
				type="range"
				min={PENCIL_MIN_RADIUS}
				max={PENCIL_MAX_RADIUS}
				bind:value={pencilRadius}
				bind:this={pencilRadiusInput}
			/>
			<button ondblclick={() => (pencilRadius = PENCIL_DEFAULT_RADIUS)}>
				<ChevronUp size="30px" absoluteStrokeWidth={true} />
				{pencilRadius}
			</button>
		</label>
		<button title="Help" onclick={() => (isHelpDialogOpen = true)}>
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
		{#if mode === CanvasMode.ERASE}
			<button
				class="selected"
				title="Undo"
				onclick={() => worker.postMessage({ type: 'undoPath', data: { shouldRedraw: false } })}
			>
				<Undo2 size="30px" absoluteStrokeWidth={true} />
			</button>
		{:else}
			<button title="Eraser" onclick={() => (mode = CanvasMode.ERASE)}>
				<Eraser size="30px" absoluteStrokeWidth={true} />
			</button>
		{/if}
		<button title="Close" onclick={() => (mode = CanvasMode.IDLE)}>
			<X size="30px" absoluteStrokeWidth={true} />
		</button>
	{/if}
</menu>

<Dialog title="Doodle Canvas" bind:isOpen={isHelpDialogOpen}>
	<p>
		Welcome to the doodle canvas! Here you can draw to your heart's content. Use the toolbar to
		select your color and pencil radius. This canvas also captures pressure sensitivity if your
		input device supports it.
	</p>
	<p>
		Your doodles are saved automatically in your browser's local storage, so you can come back to
		them later. Each page has its own canvas, so you can have multiple doodles saved at once.
	</p>
	<h3>Keyboard support</h3>
	<p>Move the pencil with:</p>
	<ul>
		<li>
			<span>
				{#each KEYS_UP as key, i}
					<kbd>{key}</kbd>{i === KEYS_UP.length - 1 ? ' ' : ' or '}
				{/each}
				to move the pencil up.
			</span>
		</li>
		<li>
			<span>
				{#each KEYS_DOWN as key, i}
					<kbd>{key}</kbd>{i === KEYS_DOWN.length - 1 ? ' ' : ' or '}
				{/each}
				to move the pencil down.
			</span>
		</li>
		<li>
			<span>
				{#each KEYS_LEFT as key, i}
					<kbd>{key}</kbd>{i === KEYS_LEFT.length - 1 ? ' ' : ' or '}
				{/each}
				to move the pencil left.
			</span>
		</li>
		<li>
			<span>
				{#each KEYS_RIGHT as key, i}
					<kbd>{key}</kbd>{i === KEYS_RIGHT.length - 1 ? ' ' : ' or '}
				{/each}
				to move the pencil right.
			</span>
		</li>
	</ul>
	<p>Additionally, you can use the following shortcuts:</p>
	<ul>
		<li>
			<kbd>escape</kbd> Close the doodle canvas.
		</li>
		<li>
			<kbd>shift</kbd> Toggle between drawing and erasing.
		</li>
		<li>
			<kbd>ctrl</kbd> + <kbd>z</kbd> or <kbd>u</kbd> Undo the last action.
		</li>
		<li>
			<kbd>+</kbd> Increase the pencil radius.
		</li>
		<li>
			<kbd>-</kbd> Decrease the pencil radius.
		</li>
		<li>
			<kbd>=</kbd> Reset the pencil radius.
		</li>
	</ul>
</Dialog>

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
		flex-direction: column;
		gap: 0.4rem;
		left: 0.4em;

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
			justify-content: start;
			flex-direction: column;

			&:hover button,
			&:focus button {
				color: #ffffff;
			}

			& button {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: center;

				width: 2rem;
				height: 3.5rem;
				padding-top: 0px;

				user-select: none;

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
				touch-action: none;

				accent-color: var(--text-secondary);

				&:hover,
				&:focus {
					width: 100%;
					height: 8rem;

					opacity: 1;
				}
			}
		}

		@media screen and (max-height: 250px) {
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
						width: 100%;
					}
				}

				& button {
					flex-direction: row;
					flex-flow: row-reverse;

					height: min-content;
					min-width: 3.2rem;
					padding: 0px;

					& :global(.lucide-chevron-up) {
						transform: rotate(90deg);
					}
				}
			}
		}

		@media screen and (max-height: 250px) and (max-width: 450px) {
			@media screen and (min-width: 150px) {
				& label {
					max-width: 40vw;
				}
			}

			& > button {
				display: none;
			}
		}
	}

	#right {
		right: 0.4em;

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
		bottom: 0.4em;

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

		@media screen and (min-height: 250px) and (max-width: 300px) {
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
