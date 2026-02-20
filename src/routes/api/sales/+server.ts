import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { parsePagination, paginatedResponse, apiError } from '$lib/utils/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const { page, limit, offset } = parsePagination(url);
		const customerId = url.searchParams.get('customerId');
		const storeId = url.searchParams.get('storeId');
		const aggregate = url.searchParams.get('aggregate') === 'true';

		if (aggregate) {
			return handleAggregate(customerId, storeId, page, limit, offset);
		}

		const where: Record<string, unknown> = {};
		if (storeId) where.storeId = parseInt(storeId);
		if (customerId) where.store = { customerId: parseInt(customerId) };

		const [sales, total] = await Promise.all([
			prisma.sale.findMany({
				where,
				include: {
					store: { select: { storeCode: true, customer: { select: { name: true } } } }
				},
				skip: offset,
				take: limit,
				orderBy: { saleTime: 'desc' }
			}),
			prisma.sale.count({ where })
		]);

		return paginatedResponse({ sales }, total, page, limit);
	} catch (e) {
		return apiError('fetch sales', e);
	}
};

async function handleAggregate(
	customerId: string | null,
	storeId: string | null,
	page: number,
	limit: number,
	offset: number
) {
	const conditions: string[] = [];
	const params: unknown[] = [];
	let paramIdx = 1;

	if (customerId) {
		conditions.push(`st.customer_id = $${paramIdx++}`);
		params.push(parseInt(customerId));
	}
	if (storeId) {
		conditions.push(`s.store_id = $${paramIdx++}`);
		params.push(parseInt(storeId));
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
		`SELECT COUNT(*) as count FROM (
			SELECT s.upc_plu, s.store_id
			FROM sales s
			JOIN stores st ON s.store_id = st.id
			${whereClause}
			GROUP BY s.upc_plu, s.store_id
		) sub`,
		...params
	);
	const total = Number(countResult[0].count);

	params.push(limit, offset);
	const limitParam = `$${paramIdx++}`;
	const offsetParam = `$${paramIdx++}`;

	const aggregates = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
		`SELECT
			s.upc_plu,
			p.description,
			st.store_code,
			c.name AS customer_name,
			COUNT(*)::int AS transaction_count,
			SUM(s.units_sold) AS total_units_sold,
			SUM(s.total_sale) AS total_revenue,
			AVG(s.unit_price) AS avg_unit_price,
			MIN(s.sale_time) AS first_sale,
			MAX(s.sale_time) AS last_sale
		FROM sales s
		JOIN stores st ON s.store_id = st.id
		JOIN customers c ON st.customer_id = c.id
		LEFT JOIN products p ON p.upc_plu = s.upc_plu AND p.customer_id = c.id
		${whereClause}
		GROUP BY s.upc_plu, s.store_id, st.store_code, c.name, p.description
		ORDER BY SUM(s.total_sale) DESC NULLS LAST
		LIMIT ${limitParam} OFFSET ${offsetParam}`,
		...params
	);

	return json({
		aggregates,
		total,
		page,
		limit,
		totalPages: Math.ceil(total / limit)
	});
}
