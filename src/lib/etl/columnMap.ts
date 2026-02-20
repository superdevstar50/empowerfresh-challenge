/**
 * Maps variant column names (lowercased, trimmed) to canonical names.
 * This is the single extension point for supporting new stores with different headers.
 */
const COLUMN_ALIASES: Record<string, string> = {
	// Product fields
	upc_plu: 'upc_plu',
	upcplu: 'upc_plu',
	upc: 'upc_plu',
	plu: 'upc_plu',
	description: 'description',
	department: 'department',
	category: 'category',
	unit_size: 'unit_size',
	unitsize: 'unit_size',
	pack_size: 'pack_size',
	packsize: 'pack_size',
	pack: 'pack_size',
	link_code: 'link_code',
	linkcode: 'link_code',

	// Price fields
	store: 'store',
	price: 'price',
	price_type: 'price_type',
	pricetype: 'price_type',
	price_priority: 'price_priority',
	pricepriority: 'price_priority',
	price_multiple: 'price_multiple',
	pricemultiple: 'price_multiple',
	unit_multiple: 'unit_multiple',
	unitmultiple: 'unit_multiple',
	start_date: 'start_date',
	startdate: 'start_date',
	end_date: 'end_date',
	enddate: 'end_date',

	// Sale fields
	sale_time: 'sale_time',
	saletime: 'sale_time',
	sale_time_zone: 'sale_time_zone',
	saletimezone: 'sale_time_zone',
	unit_price: 'unit_price',
	unitprice: 'unit_price',
	units_sold: 'units_sold',
	unitssold: 'units_sold',
	total_sale: 'total_sale',
	totalsale: 'total_sale',
	sales_total: 'total_sale'
};

export function mapColumnName(rawName: string): string {
	const normalized = rawName.trim().toLowerCase().replace(/\s+/g, '_');
	return COLUMN_ALIASES[normalized] ?? normalized;
}

export function mapHeaders(headers: string[]): string[] {
	return headers.map(mapColumnName);
}
