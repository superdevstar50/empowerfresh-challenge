import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { apiError } from '$lib/utils/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const customerId = url.searchParams.get('customerId');
		const cid = customerId ? parseInt(customerId) : undefined;

		const storeWhere = cid ? { customerId: cid } : undefined;
		const relWhere = cid ? { store: { customerId: cid } } : undefined;

		const [
			customerCount,
			storeCount,
			productCount,
			priceCount,
			saleCount,
			totalRevenue
		] = await Promise.all([
			prisma.customer.count(),
			prisma.store.count({ where: storeWhere }),
			prisma.product.count({ where: cid ? { customerId: cid } : undefined }),
			prisma.price.count({ where: relWhere }),
			prisma.sale.count({ where: relWhere }),
			prisma.sale.aggregate({
				where: relWhere,
				_sum: { totalSale: true }
			})
		]);

		return json({
			customers: customerCount,
			stores: storeCount,
			products: productCount,
			prices: priceCount,
			sales: saleCount,
			totalRevenue: totalRevenue._sum.totalSale ?? 0
		});
	} catch (e) {
		return apiError('fetch stats', e);
	}
};
