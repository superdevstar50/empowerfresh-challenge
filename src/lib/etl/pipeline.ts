import { prisma } from '$lib/db';
import type { FileType, ETLResult, PreprocessResult } from '$lib/types';
import { toFloat, normalizeTimestamp, toTitleCase, isInvalidUpc } from './cleaners';
import { logger } from '$lib/utils/logger';

type Row = Record<string, string | null>;

const PRODUCT_KEY_FIELDS = new Set([
	'upc_plu', 'description', 'department', 'category', 'unit_size', 'pack_size'
]);
const PRICE_KEY_FIELDS = new Set([
	'store', 'upc_plu', 'price', 'price_type', 'start_date', 'end_date'
]);
const SALE_KEY_FIELDS = new Set([
	'store', 'upc_plu', 'sale_time', 'unit_price', 'units_sold', 'total_sale'
]);

export function createETLResult(fileType: FileType, overrides: Partial<ETLResult> = {}): ETLResult {
	return {
		fileType,
		inserted: 0,
		updated: 0,
		skipped: 0,
		duplicatesSkipped: 0,
		errors: 0,
		storeCodesFound: [],
		messages: [],
		...overrides
	};
}

function extractMetadata(row: Row, keyFields: Set<string>): Record<string, string | null> {
	const metadata: Record<string, string | null> = {};
	for (const [key, value] of Object.entries(row)) {
		if (!keyFields.has(key) && value !== null) {
			metadata[key] = value;
		}
	}
	return Object.keys(metadata).length > 0 ? metadata : {};
}

async function resolveStores(
	rows: Row[],
	customerId: number
): Promise<{ storeMap: Map<string, number>; storeCodesFound: string[] }> {
	const codes = new Set<string>();
	for (const row of rows) {
		const code = row.store?.trim();
		if (code) codes.add(code);
	}

	const existing = await prisma.store.findMany({
		where: { customerId, storeCode: { in: [...codes] } }
	});
	const storeMap = new Map(existing.map((s) => [s.storeCode, s.id]));

	const missing = [...codes].filter((c) => !storeMap.has(c));
	for (const code of missing) {
		const store = await prisma.store.create({
			data: { customerId, storeCode: code, name: code }
		});
		storeMap.set(code, store.id);
	}

	return { storeMap, storeCodesFound: [...codes] };
}

async function importProducts(rows: Row[], customerId: number): Promise<ETLResult> {
	const result = createETLResult('product');

	const validRows: Array<{ upcPlu: string; row: Row }> = [];
	for (const row of rows) {
		if (isInvalidUpc(row.upc_plu)) {
			result.skipped++;
			continue;
		}
		validRows.push({ upcPlu: row.upc_plu!.trim(), row });
	}

	const existingProducts = await prisma.product.findMany({
		where: {
			customerId,
			upcPlu: { in: validRows.map((r) => r.upcPlu) }
		},
		select: { id: true, upcPlu: true }
	});
	const existingMap = new Map(existingProducts.map((p) => [p.upcPlu, p.id]));

	const toCreate: Array<{
		customerId: number;
		upcPlu: string;
		description: string | null;
		department: string | null;
		category: string | null;
		unitSize: string | null;
		packSize: string | null;
		metadata: Record<string, string | null>;
	}> = [];

	for (const { upcPlu, row } of validRows) {
		try {
			const data = {
				description: toTitleCase(row.description),
				department: row.department?.toLowerCase() ?? null,
				category: row.category?.toLowerCase() ?? null,
				unitSize: row.unit_size,
				packSize: row.pack_size,
				metadata: extractMetadata(row, PRODUCT_KEY_FIELDS)
			};

			if (existingMap.has(upcPlu)) {
				await prisma.product.update({
					where: { customerId_upcPlu: { customerId, upcPlu } },
					data
				});
				result.updated++;
			} else {
				toCreate.push({ customerId, upcPlu, ...data });
			}
		} catch (e) {
			result.errors++;
			const msg = `Product error (upc=${upcPlu}): ${(e as Error).message}`;
			result.messages.push(msg);
			logger.error('ETL:product', msg, e);
		}
	}

	if (toCreate.length > 0) {
		try {
			const created = await prisma.product.createMany({ data: toCreate });
			result.inserted += created.count;
		} catch (e) {
			result.errors += toCreate.length;
			const msg = `Bulk product insert failed: ${(e as Error).message}`;
			result.messages.push(msg);
			logger.error('ETL:product', msg, e);
		}
	}

	logger.info('ETL:product', `Completed: ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`);
	return result;
}

async function importPrices(rows: Row[], customerId: number): Promise<ETLResult> {
	const result = createETLResult('price');

	const { storeMap, storeCodesFound } = await resolveStores(rows, customerId);
	result.storeCodesFound = storeCodesFound;

	const existingPrices = await prisma.price.findMany({
		where: { storeId: { in: [...storeMap.values()] } },
		select: { storeId: true, upcPlu: true, priceType: true, startDate: true }
	});
	const existingKeys = new Set(
		existingPrices.map((p) => `${p.storeId}:${p.upcPlu}:${p.priceType}:${p.startDate}`)
	);

	const seenKeys = new Set<string>();
	const toCreate: Array<{
		storeId: number;
		upcPlu: string;
		price: number | null;
		priceType: string | null;
		startDate: string | null;
		endDate: string | null;
		metadata: Record<string, string | null>;
	}> = [];

	for (const row of rows) {
		if (isInvalidUpc(row.upc_plu)) {
			result.skipped++;
			continue;
		}

		const storeCode = row.store?.trim();
		if (!storeCode || !storeMap.has(storeCode)) {
			result.skipped++;
			continue;
		}
		const storeId = storeMap.get(storeCode)!;
		const upcPlu = row.upc_plu!.trim();
		const priceType = row.price_type?.trim().toUpperCase() ?? null;
		const startDate = row.start_date?.trim() ?? null;
		const dedupeKey = `${storeId}:${upcPlu}:${priceType}:${startDate}`;

		if (seenKeys.has(dedupeKey) || existingKeys.has(dedupeKey)) {
			result.duplicatesSkipped++;
			continue;
		}
		seenKeys.add(dedupeKey);

		toCreate.push({
			storeId,
			upcPlu,
			price: toFloat(row.price),
			priceType,
			startDate,
			endDate: row.end_date?.trim() ?? null,
			metadata: extractMetadata(row, PRICE_KEY_FIELDS)
		});
	}

	if (toCreate.length > 0) {
		try {
			const created = await prisma.price.createMany({ data: toCreate });
			result.inserted = created.count;
		} catch (e) {
			result.errors += toCreate.length;
			const msg = `Bulk price insert failed: ${(e as Error).message}`;
			result.messages.push(msg);
			logger.error('ETL:price', msg, e);
		}
	}

	logger.info('ETL:price', `Completed: ${result.inserted} inserted, ${result.skipped} skipped, ${result.duplicatesSkipped} dupes, ${result.errors} errors`);
	return result;
}

async function importSales(rows: Row[], customerId: number): Promise<ETLResult> {
	const result = createETLResult('sale');

	const { storeMap, storeCodesFound } = await resolveStores(rows, customerId);
	result.storeCodesFound = storeCodesFound;

	const existingSales = await prisma.sale.findMany({
		where: { storeId: { in: [...storeMap.values()] } },
		select: { storeId: true, upcPlu: true, saleTime: true, totalSale: true }
	});
	const existingKeys = new Set(
		existingSales.map((s) => `${s.storeId}:${s.upcPlu}:${s.saleTime}:${s.totalSale}`)
	);

	const seenKeys = new Set<string>();
	const toCreate: Array<{
		storeId: number;
		upcPlu: string;
		saleTime: string | null;
		unitPrice: number | null;
		unitsSold: number | null;
		totalSale: number | null;
		metadata: Record<string, string | null>;
	}> = [];

	for (const row of rows) {
		if (isInvalidUpc(row.upc_plu)) {
			result.skipped++;
			continue;
		}

		const storeCode = row.store?.trim();
		if (!storeCode || !storeMap.has(storeCode)) {
			result.skipped++;
			continue;
		}
		const storeId = storeMap.get(storeCode)!;
		const upcPlu = row.upc_plu!.trim();
		const saleTime = normalizeTimestamp(row.sale_time);
		const totalSale = toFloat(row.total_sale);
		const dedupeKey = `${storeId}:${upcPlu}:${saleTime}:${totalSale}`;

		if (seenKeys.has(dedupeKey) || existingKeys.has(dedupeKey)) {
			result.duplicatesSkipped++;
			continue;
		}
		seenKeys.add(dedupeKey);

		if (row.price_type) row.price_type = row.price_type.trim().toUpperCase();

		toCreate.push({
			storeId,
			upcPlu,
			saleTime,
			unitPrice: toFloat(row.unit_price),
			unitsSold: toFloat(row.units_sold),
			totalSale,
			metadata: extractMetadata(row, SALE_KEY_FIELDS)
		});
	}

	if (toCreate.length > 0) {
		try {
			const created = await prisma.sale.createMany({ data: toCreate });
			result.inserted = created.count;
		} catch (e) {
			result.errors += toCreate.length;
			const msg = `Bulk sale insert failed: ${(e as Error).message}`;
			result.messages.push(msg);
			logger.error('ETL:sale', msg, e);
		}
	}

	logger.info('ETL:sale', `Completed: ${result.inserted} inserted, ${result.skipped} skipped, ${result.duplicatesSkipped} dupes, ${result.errors} errors`);
	return result;
}

export async function runPipeline(
	preprocessed: PreprocessResult,
	fileType: FileType,
	customerId: number
): Promise<ETLResult> {
	switch (fileType) {
		case 'product':
			return importProducts(preprocessed.rows, customerId);
		case 'price':
			return importPrices(preprocessed.rows, customerId);
		case 'sale':
			return importSales(preprocessed.rows, customerId);
		default:
			return createETLResult('unknown', {
				skipped: preprocessed.rows.length,
				messages: ['Unknown file type — cannot process']
			});
	}
}
