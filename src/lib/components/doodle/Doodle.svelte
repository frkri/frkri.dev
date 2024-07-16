<script lang="ts">
	import { CanvasMode } from '$lib/types/doodle';
	import Canvas from './Canvas.svelte';
	import ToolBar from './ToolBar.svelte';

	let mode = $state(CanvasMode.IDLE);
	let color = $state('#FFFFFF');
	let pencilRadius = $state(5);
</script>

<div id="doodle">
	<noscript>
		<style>
			#doodle {
				display: none !important;
			}
		</style>
	</noscript>

	<Canvas {mode} {color} {pencilRadius} />
	<ToolBar bind:mode bind:color bind:pencilRadius />
</div>
