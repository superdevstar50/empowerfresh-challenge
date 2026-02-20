import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { parsePagination, paginatedResponse, apiError } from '$lib/utils/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const { page, limit, offset } = parsePagination(url);
		const customerId = url.searchParams.get('customerId');
		const storeId = url.searchParams.get('storeId');
		const priceType = url.searchParams.get('priceType');
		const search = url.searchParams.get('search');

		const where: Record<string, unknown> = {};
		if (storeId) where.storeId = parseInt(storeId);
		if (priceType) where.priceType = priceType;
		if (customerId) where.store = { customerId: parseInt(customerId) };
		if (search) where.upcPlu = { contains: search, mode: 'insensitive' };

		const [prices, total] = await Promise.all([
			prisma.price.findMany({
				where,
				include: {
					store: { select: { storeCode: true, customer: { select: { name: true } } } }
				},
				skip: offset,
				take: limit,
				orderBy: { id: 'desc' }
			}),
			prisma.price.count({ where })
		]);

		return paginatedResponse({ prices }, total, page, limit);
	} catch (e) {
		return apiError('fetch prices', e);
	}
};
