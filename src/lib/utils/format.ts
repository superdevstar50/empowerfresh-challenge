export function formatCurrency(val: unknown): string {
	const n = Number(val);
	if (isNaN(n)) return '-';
	return `$${n.toFixed(2)}`;
}

export function formatNumber(val: unknown): string {
	const n = Number(val);
	if (isNaN(n)) return '-';
	return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
