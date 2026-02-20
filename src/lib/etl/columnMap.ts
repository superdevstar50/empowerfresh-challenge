/**
 * Maps variant column names (lowercased, trimmed) to canonical names.
 * This is the single extension point for supporting new stores with different headers.
 */
const COLUMN_ALIASES: Record<string, string> = {
	// Product identifiers
	upc_plu: 'upc_plu',
	upcplu: 'upc_plu',
	upc: 'upc_plu',
	plu: 'upc_plu',
	upc_code: 'upc_plu',
	item_upc: 'upc_plu',
	product_code: 'upc_plu',
	sku: 'upc_plu',
	item_code: 'upc_plu',

	// Product description
	description: 'description',
	desc: 'description',
	item_description: 'description',
	item_desc: 'description',
	product_name: 'description',
	product_description: 'description',
	name: 'description',
	item_name: 'description',

	// Product categorization
	department: 'department',
	dept: 'department',
	dept_name: 'department',
	department_name: 'department',
	category: 'category',
	cat: 'category',
	category_name: 'category',
	sub_department: 'category',
	subcategory: 'category',

	// Product sizing
	unit_size: 'unit_size',
	unitsize: 'unit_size',
	size: 'unit_size',
	item_size: 'unit_size',
	pack_size: 'pack_size',
	packsize: 'pack_size',
	pack: 'pack_size',
	case_size: 'pack_size',
	link_code: 'link_code',
	linkcode: 'link_code',

	// Store
	store: 'store',
	store_code: 'store',
	storecode: 'store',
	store_id: 'store',
	store_number: 'store',
	store_no: 'store',
	store_num: 'store',
	location: 'store',
	location_id: 'store',

	// Price fields
	price: 'price',
	retail_price: 'price',
	selling_price: 'price',
	item_price: 'price',
	price_type: 'price_type',
	pricetype: 'price_type',
	type: 'price_type',
	price_priority: 'price_priority',
	pricepriority: 'price_priority',
	price_multiple: 'price_multiple',
	pricemultiple: 'price_multiple',
	unit_multiple: 'unit_multiple',
	unitmultiple: 'unit_multiple',

	// Price dates
	start_date: 'start_date',
	startdate: 'start_date',
	effective_date: 'start_date',
	eff_date: 'start_date',
	begin_date: 'start_date',
	from_date: 'start_date',
	end_date: 'end_date',
	enddate: 'end_date',
	expiry_date: 'end_date',
	exp_date: 'end_date',
	expire_date: 'end_date',
	to_date: 'end_date',

	// Sale time
	sale_time: 'sale_time',
	saletime: 'sale_time',
	transaction_time: 'sale_time',
	transaction_date: 'sale_time',
	trans_time: 'sale_time',
	date_time: 'sale_time',
	datetime: 'sale_time',
	timestamp: 'sale_time',
	sale_date: 'sale_time',
	sale_time_zone: 'sale_time_zone',
	saletimezone: 'sale_time_zone',
	timezone: 'sale_time_zone',

	// Sale amounts
	unit_price: 'unit_price',
	unitprice: 'unit_price',
	selling_unit_price: 'unit_price',
	units_sold: 'units_sold',
	unitssold: 'units_sold',
	qty: 'units_sold',
	quantity: 'units_sold',
	qty_sold: 'units_sold',
	quantity_sold: 'units_sold',
	total_sale: 'total_sale',
	totalsale: 'total_sale',
	sales_total: 'total_sale',
	total: 'total_sale',
	amount: 'total_sale',
	sales_amount: 'total_sale',
	line_total: 'total_sale',
	ext_price: 'total_sale'
};

export function mapColumnName(rawName: string): string {
	const normalized = rawName.trim().toLowerCase().replace(/\s+/g, '_');
	return COLUMN_ALIASES[normalized] ?? normalized;
}

export function mapHeaders(headers: string[]): string[] {
	return headers.map(mapColumnName);
}
