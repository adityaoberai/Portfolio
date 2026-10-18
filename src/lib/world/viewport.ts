export interface PanelBounds {
	left: number;
	top: number;
	width: number;
	height: number;
}
// Place a subject in the real uncovered area, including a mobile preview sheet.
export function focusViewport(
	width: number,
	height: number,
	topInset: number,
	panel: PanelBounds | null
) {
	const left = 20;
	const top = Math.min(Math.max(20, topInset + 12), height / 2);
	const right = panel && width > 820 ? panel.left - 20 : width - 20;
	const bottom = panel && width <= 820 ? panel.top - 16 : height - 24;
	return {
		x: (left + right) / 2,
		y: (top + bottom) / 2,
		usable: right - left >= 160 && bottom - top >= 120
	};
}
