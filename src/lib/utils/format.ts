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

export function formatDate(val: unknown): string {
	if (!val) return '-';
	const d = new Date(val as string | number);
	if (isNaN(d.getTime())) return String(val);
	return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(val: unknown): string {
	if (!val) return '-';
	const d = new Date(val as string | number);
	if (isNaN(d.getTime())) return String(val);
	return d.toLocaleString(undefined, {
		year: 'numeric', month: 'short', day: 'numeric',
		hour: '2-digit', minute: '2-digit'
	});
}
