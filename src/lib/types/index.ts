export type FileType = 'product' | 'price' | 'sale' | 'unknown';

export type ExploreTab = 'products' | 'prices' | 'sales' | 'summary';

export interface PreprocessResult {
	headers: string[];
	rows: Record<string, string | null>[];
}

export interface DetectionResult {
	fileType: FileType;
	confidence: 'high' | 'low';
}

export interface ETLResult {
	fileType: FileType;
	inserted: number;
	updated: number;
	skipped: number;
	duplicatesSkipped: number;
	errors: number;
	storeCodesFound: string[];
	messages: string[];
}

export interface ETLFileResult extends ETLResult {
	filename: string;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobFileStatus {
	filename: string;
	status: JobStatus;
	result?: ETLFileResult;
}

export interface ETLJob {
	id: string;
	status: JobStatus;
	files: JobFileStatus[];
	summary?: ETLSummary;
	createdAt: string; // ISO date from API
}

export interface ETLSummary {
	totalInserted: number;
	totalUpdated: number;
	totalSkipped: number;
	totalDuplicatesSkipped: number;
	totalErrors: number;
	filesProcessed: number;
	results: ETLFileResult[];
}

export interface ETLRequest {
	files: ETLFileInput[];
}

export interface ETLFileInput {
	path: string;
	filename: string;
	customerId: number;
	typeOverride?: FileType;
}

export interface UploadedFile {
	filename: string;
	path: string;
	detectedType: FileType;
	size: number;
	typeOverride?: FileType;
	customerId?: number | null;
}

export interface Customer {
	id: number;
	name: string;
}

export interface CustomerWithStores extends Customer {
	stores: Store[];
}

export interface Store {
	id: number;
	storeCode: string;
	name?: string | null;
}

export interface PaginatedResponse<T = unknown> {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	data: T[];
}

export interface SalesAggregateRow {
	upc_plu: string;
	description: string | null;
	store_code: string;
	customer_name: string;
	transaction_count: number;
	total_units_sold: number;
	total_revenue: number;
	avg_unit_price: number;
	first_sale: string | null;
	last_sale: string | null;
}
