const NULL_PATTERNS = new Set(['null', 'n/a', 'na', 'none', 'undefined', '']);

export function normalizeNull(value: string | null | undefined): string | null {
	if (value === null || value === undefined) return null;
	const trimmed = value.trim();
	if (NULL_PATTERNS.has(trimmed.toLowerCase())) return null;
	return trimmed;
}

export function toFloat(value: string | null): number | null {
	if (value === null) return null;
	const cleaned = value.replace(/[,$]/g, '').trim();
	if (cleaned === '') return null;
	const num = parseFloat(cleaned);
	return isNaN(num) ? null : num;
}

export function toInt(value: string | null): number | null {
	if (value === null) return null;
	const num = parseInt(value.trim(), 10);
	return isNaN(num) ? null : num;
}

/**
 * Auto-detects timestamp format and normalizes to ISO 8601.
 * - All digits and > 1_000_000_000 -> Unix milliseconds
 * - Otherwise -> parse as date string
 */
export function normalizeTimestamp(value: string | null): string | null {
	if (value === null) return null;
	const trimmed = value.trim();
	if (trimmed === '') return null;

	if (/^\d+$/.test(trimmed)) {
		const num = parseInt(trimmed, 10);
		const ms = num > 1_000_000_000_000 ? num : num * 1000;
		return new Date(ms).toISOString();
	}

	const date = new Date(trimmed);
	if (isNaN(date.getTime())) return trimmed;
	return date.toISOString();
}

export function toTitleCase(value: string | null): string | null {
	if (value === null) return null;
	return value
		.toLowerCase()
		.replace(/(?:^|\s|[-/])\w/g, (match) => match.toUpperCase());
}

/**
 * Checks whether a UPC is an invalid placeholder.
 */
export function isInvalidUpc(upc: string | null): boolean {
	if (upc === null) return true;
	const trimmed = upc.trim();
	if (trimmed === '') return true;
	if (/^9{6,}$/.test(trimmed)) return true;
	return false;
}
