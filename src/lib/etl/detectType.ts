import type { DetectionResult, FileType } from '$lib/types';

/**
 * Detects file type purely from canonical header names.
 * Checked in order of specificity: sale > price > product.
 */
export function detectFileType(headers: string[]): DetectionResult {
	const h = new Set(headers);

	if (h.has('sale_time') && (h.has('units_sold') || h.has('total_sale'))) {
		return { fileType: 'sale', confidence: 'high' };
	}

	if (h.has('price') && h.has('price_type') && (h.has('start_date') || h.has('end_date'))) {
		return { fileType: 'price', confidence: 'high' };
	}

	if (h.has('upc_plu') && h.has('description') && (h.has('department') || h.has('category'))) {
		return { fileType: 'product', confidence: 'high' };
	}

	return { fileType: 'unknown', confidence: 'low' };
}
