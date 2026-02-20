import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { parsePagination, paginatedResponse, apiError } from '$lib/utils/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const { page, limit, offset } = parsePagination(url);
		const customerId = url.searchParams.get('customerId');
		const search = url.searchParams.get('search');
		const department = url.searchParams.get('department');
		const category = url.searchParams.get('category');

		const where: Record<string, unknown> = {};
		if (customerId) where.customerId = parseInt(customerId);
		if (department) where.department = { contains: department, mode: 'insensitive' };
		if (category) where.category = { contains: category, mode: 'insensitive' };
		if (search) where.description = { contains: search, mode: 'insensitive' };

		const [products, total] = await Promise.all([
			prisma.product.findMany({
				where,
				include: { customer: { select: { name: true } } },
				skip: offset,
				take: limit,
				orderBy: { description: 'asc' }
			}),
			prisma.product.count({ where })
		]);

		return paginatedResponse({ products }, total, page, limit);
	} catch (e) {
		return apiError('fetch products', e);
	}
};
