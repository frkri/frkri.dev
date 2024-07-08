<script lang="ts">
	import HelloHeader from '$lib/assets/media/HelloHeader.svelte';
	import LinkButton from '$lib/components/LinkButton.svelte';
</script>

<header>
	<h1>
		<HelloHeader />
	</h1>
	<p>I'm Frkri, a software developer who makes some stuff online</p>
</header>

<section>
	<h2>Some Stuff</h2>
	<ul>
		<li><LinkButton name="ModelRunner" href="https://github.com/frkri/ModelRunner" /></li>
		<li>
			<LinkButton
				name="Nook"
				href="https://nook.frkri.dev?import=https://raw.githubusercontent.com/frkri/Nook/master/examples/NookGuide.json"
			/>
		</li>
	</ul>
</section>

<section>
	<h2>Contact me</h2>
	<ul>
		<li><LinkButton name="KeyBase" href="https://keybase.io/frkri" /></li>
		<li>
			<LinkButton name="Discord" href="https://discord.com/users/192707706434486273" />
		</li>
		<li><LinkButton name="GitHub" href="https://github.com/frkri" /></li>
		<li><LinkButton name="GitLab" href="https://gitlab.com/frkri" /></li>
		<li><LinkButton name="Email" href="/mail" /></li>
	</ul>
</section>

<section>
	<h2>Other</h2>
	<ul>
		<li><LinkButton name="PGP Key" rel="pgpkey" href="/key" /></li>
	</ul>
</section>

<style>
	header {
		margin-bottom: 4em;

		h1 {
			max-width: 20em;
			margin: 0.5rem auto;
		}

		p {
			font-size: 1.2em;
			text-align: center;
			max-width: 30em;
			margin: 0px auto;
		}
	}

	section {
		margin-bottom: 3rem;

		h2 {
			font-size: 1.6rem;
			margin-bottom: 1.2rem;
		}

		ul {
			list-style-type: none;
			padding: 0px 1.2rem;

			li {
				margin: 0.4rem 0px;
			}
		}
	}
</style>
