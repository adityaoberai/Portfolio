<script lang="ts">
	import ModeSwitch from './ModeSwitch.svelte';
</script>

<header class="v3-header">
	<a href="/index" class="identity">Aditya Oberai<span>Bengaluru, India</span></a>
	<ModeSwitch />
</header>

<style>
	.v3-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 14px;
		padding: 22px clamp(20px, 4vw, 64px);
		background: #f8f5ed;
		border-bottom: 1px solid #dedbcf;
	}
	.identity {
		font-size: 24px;
		line-height: 1.15;
		letter-spacing: -0.04em;
	}
	.identity span {
		display: block;
		margin-top: 5px;
		font:
			10px/1.4 system-ui,
			sans-serif;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: #606456;
	}
	@media (max-width: 480px) {
		.v3-header {
			padding: 16px;
		}
		.identity {
			font-size: 21px;
		}
	}
</style>
