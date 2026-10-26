<script lang="ts">
	import { onMount } from 'svelte';

	let {
		disabled = false,
		onmove
	}: { disabled?: boolean; onmove: (direction: { x: number; y: number }) => void } = $props();
	let control: HTMLButtonElement;
	let pointer: number | null = null;
	let x = $state(0);
	let y = $state(0);
	const travel = 26;
	const deadZone = 0.16;
	const keys = new Set<string>();
	const movementKeys = new Set([
		'arrowup',
		'arrowdown',
		'arrowleft',
		'arrowright',
		'w',
		'a',
		's',
		'd'
	]);

	function stop() {
		const captured = pointer;
		pointer = null;
		keys.clear();
		x = y = 0;
		onmove({ x: 0, y: 0 });
		if (captured !== null && control?.hasPointerCapture(captured))
			control.releasePointerCapture(captured);
	}
	function drag(event: PointerEvent) {
		if (event.pointerId !== pointer) return;
		const box = control.getBoundingClientRect();
		const dx = (event.clientX - box.left - box.width / 2) / travel;
		const dy = (event.clientY - box.top - box.height / 2) / travel;
		const distance = Math.hypot(dx, dy);
		const radius = Math.min(distance, 1);
		x = distance ? (dx / distance) * radius * travel : 0;
		y = distance ? (dy / distance) * radius * travel : 0;
		const speed = Math.max(0, (radius - deadZone) / (1 - deadZone));
		onmove(distance ? { x: (dx / distance) * speed, y: (dy / distance) * speed } : { x: 0, y: 0 });
	}
	function start(event: PointerEvent) {
		if (disabled || !event.isPrimary || event.button !== 0 || pointer !== null) return;
		event.preventDefault();
		control.focus({ preventScroll: true });
		pointer = event.pointerId;
		control.setPointerCapture(event.pointerId);
		drag(event);
	}
	function end(event: PointerEvent) {
		if (event.pointerId === pointer) stop();
	}
	function keyboard() {
		const dx =
			Number(keys.has('d') || keys.has('arrowright')) -
			Number(keys.has('a') || keys.has('arrowleft'));
		const dy =
			Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
		const magnitude = Math.max(1, Math.hypot(dx, dy));
		x = (dx / magnitude) * travel;
		y = (dy / magnitude) * travel;
		onmove({ x: dx / magnitude, y: dy / magnitude });
	}
	function keyDown(event: KeyboardEvent) {
		if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
		const key = event.key.toLowerCase();
		if (movementKeys.has(key)) {
			event.preventDefault();
			keys.add(key);
			keyboard();
		} else if (key === 'escape' || key === ' ') {
			event.preventDefault();
			stop();
		}
	}
	function keyUp(event: KeyboardEvent) {
		if (!movementKeys.has(event.key.toLowerCase())) return;
		event.preventDefault();
		keys.delete(event.key.toLowerCase());
		keyboard();
	}
	$effect(() => {
		if (disabled) stop();
	});
	onMount(() => {
		const visibility = () => {
			if (document.hidden) stop();
		};
		window.addEventListener('blur', stop);
		window.addEventListener('resize', stop);
		document.addEventListener('visibilitychange', visibility);
		return () => {
			stop();
			window.removeEventListener('blur', stop);
			window.removeEventListener('resize', stop);
			document.removeEventListener('visibilitychange', visibility);
		};
	});
</script>

<button
	bind:this={control}
	class="joystick"
	class:active={x !== 0 || y !== 0}
	{disabled}
	aria-label="Movement joystick"
	aria-describedby="joystick-help"
	onpointerdown={start}
	onpointermove={drag}
	onpointerup={end}
	onpointercancel={end}
	onlostpointercapture={end}
	onkeydown={keyDown}
	onkeyup={keyUp}
	onblur={stop}
>
	<svg viewBox="0 0 80 80" aria-hidden="true">
		<path d="m36 11 4-4 4 4m25 25 4 4-4 4M44 69l-4 4-4-4M11 44l-4-4 4-4" />
	</svg>
	<span class="thumb" style:transform={`translate(${x}px, ${y}px)`} aria-hidden="true"></span>
</button>
<span id="joystick-help" class="sr-only"
	>Drag in the direction you want to walk. Release to stop. You can also use the arrow keys while
	this control is focused, or tap the floor.</span
>

<style>
	.joystick {
		position: relative;
		flex: none;
		width: 96px;
		height: 96px;
		padding: 0;
		border: 1px solid var(--color-hairline-strong);
		border-radius: 50%;
		background: #faf7edda;
		color: var(--color-accent);
		box-shadow: 0 4px 14px #263b3312;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		pointer-events: auto;
		cursor: grab;
	}
	.joystick.active {
		cursor: grabbing;
	}
	.joystick:disabled {
		opacity: 0.45;
		cursor: default;
	}
	svg {
		width: 100%;
		height: 100%;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.25;
		opacity: 0.6;
	}
	.thumb {
		position: absolute;
		left: calc(50% - 19px);
		top: calc(50% - 19px);
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: var(--color-accent);
		box-shadow: 0 2px 5px #263b3324;
		transition: transform 120ms ease-out;
	}
	.active .thumb {
		transition: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.thumb {
			transition: none;
		}
	}
</style>
