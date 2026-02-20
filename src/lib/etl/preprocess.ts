import Papa from 'papaparse';
import { mapColumnName } from './columnMap';
import { normalizeNull } from './cleaners';
import type { PreprocessResult } from '$lib/types';

const JUNK_ROW_PATTERN = /^[\s\-=_|+,]+$/;

/**
 * Generic CSV pre-processor.
 * Takes raw CSV text from any store and produces normalized row objects
 * with canonical column names and cleaned values.
 */
export function preprocess(rawCsv: string): PreprocessResult {
	const lines = rawCsv.split(/\r?\n/);
	const cleanedLines = lines.filter((line) => !JUNK_ROW_PATTERN.test(line));
	const cleanedCsv = cleanedLines.join('\n');

	const parsed = Papa.parse<Record<string, string>>(cleanedCsv, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: false,
		transformHeader: (header: string) => mapColumnName(header)
	});

	const headers = parsed.meta.fields ?? [];

	const rows = parsed.data.map((row) => {
		const normalized: Record<string, string | null> = {};
		for (const key of headers) {
			normalized[key] = normalizeNull(row[key]);
		}
		return normalized;
	});

	return { headers, rows };
}
