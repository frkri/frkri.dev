<script lang="ts">
	import { browser } from '$app/environment';
	import { CanvasMode } from '$lib/types/doodle';
	import Canvas from './Canvas.svelte';
	import CanvasWorker from './Canvas.worker?worker';
	import ToolBar from './ToolBar.svelte';

	let mode = $state(CanvasMode.IDLE);
	let color = $state('#FFFFFF');
	let pencilRadius = $state(5);
	let worker: Worker = $state(browser ? new CanvasWorker() : null) as Worker;
</script>

<div id="doodle">
	<noscript>
		<style>
			#doodle {
				display: none !important;
			}
		</style>
	</noscript>

	<Canvas {worker} {mode} {color} {pencilRadius} />
	<ToolBar {worker} bind:mode bind:color bind:pencilRadius />
</div>
