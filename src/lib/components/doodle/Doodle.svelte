<script lang="ts">
	import { CanvasMode } from '$lib/types/doodle';
	import Canvas from './Canvas.svelte';
	import ToolBar from './ToolBar.svelte';

	let doodleState = $state({
		mode: CanvasMode.IDLE,
		color: '#FFFFFF'
	});
	let mode = $state(CanvasMode.IDLE);
	let color = $state('#FFFFFF');
</script>

<div id="doodle">
	<noscript>
		<style>
			#doodle {
				display: none !important;
			}
		</style>
	</noscript>

	<Canvas bind:mode bind:color />
	<ToolBar bind:mode bind:color />
</div>
