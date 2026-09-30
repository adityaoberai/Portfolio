<script lang="ts">
	// A graded card slab drawn in CSS: case, label, and an abstract card face.
	// No official artwork; the tilt is decorative and disabled for reduced motion.
	let { name, grade = 'FAVOURITE' }: { name: string; grade?: string } = $props();
	let rx = $state(0);
	let ry = $state(0);

	function move(event: PointerEvent) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		ry = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
		rx = -((event.clientY - rect.top) / rect.height - 0.5) * 14;
	}
	function leave() {
		rx = 0;
		ry = 0;
	}
</script>

<figure class="slab" onpointermove={move} onpointerleave={leave}>
	<div class="case" style="--rx: {rx}deg; --ry: {ry}deg; --shine: {50 + ry * 3}%">
		<div class="label">
			<span>{name.toUpperCase()}</span><span>{grade}</span>
		</div>
		<div class="card">
			<div class="art" aria-hidden="true">
				<span class="shell"></span><span class="cannon left"></span><span class="cannon right"
				></span>
			</div>
			<p class="card-name">{name}</p>
		</div>
	</div>
	<figcaption>A {name} slab in pride of place on the shelf.</figcaption>
</figure>

<style>
	.slab {
		perspective: 700px;
		margin: 0;
	}
	.case {
		width: 180px;
		padding: 10px;
		border-radius: 8px;
		background: linear-gradient(
			115deg,
			#eef3f3 0%,
			#dbe5e6 calc(var(--shine) - 20%),
			#ffffff var(--shine),
			#dbe5e6 calc(var(--shine) + 20%),
			#e9eff0 100%
		);
		border: 1px solid #b9c7c9;
		box-shadow: 0 10px 24px #2a3f3a2e;
		transform: rotateX(var(--rx)) rotateY(var(--ry));
		transition: transform 120ms ease-out;
	}
	.label {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		padding: 6px 8px;
		background: #b8382f;
		color: #fff8ef;
		border-radius: 3px;
		font:
			700 9px/1.2 system-ui,
			sans-serif;
		letter-spacing: 0.08em;
	}
	.card {
		margin-top: 8px;
		padding: 8px;
		border-radius: 6px;
		background: #e8c85a;
	}
	.art {
		position: relative;
		height: 120px;
		border-radius: 3px;
		background: linear-gradient(160deg, #9fc4e4, #4f7fb8);
		overflow: hidden;
	}
	.shell {
		position: absolute;
		left: 50%;
		top: 54%;
		width: 64px;
		height: 64px;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: #8a6a45;
		box-shadow: inset 0 0 0 10px #6f5436;
	}
	.cannon {
		position: absolute;
		top: 28%;
		width: 34px;
		height: 12px;
		background: #9aa3a8;
		border-radius: 6px;
	}
	.cannon.left {
		left: 22%;
		transform: rotate(-20deg);
	}
	.cannon.right {
		right: 22%;
		transform: rotate(20deg);
	}
	.card-name {
		margin-top: 6px;
		font:
			700 12px/1.2 system-ui,
			sans-serif;
		color: #3b3320;
	}
	figcaption {
		margin-top: 12px;
		font-size: 14px;
		color: #606456;
	}
	@media (prefers-reduced-motion: reduce) {
		.case {
			transform: none;
			transition: none;
		}
	}
</style>
