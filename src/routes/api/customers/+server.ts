import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { apiError } from '$lib/utils/api';

export const GET: RequestHandler = async () => {
	try {
		const customers = await prisma.customer.findMany({
			include: { stores: true, _count: { select: { products: true } } },
			orderBy: { name: 'asc' }
		});
		return json(customers);
	} catch (e) {
		return apiError('fetch customers', e);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name } = await request.json();
		if (!name || typeof name !== 'string' || !name.trim()) {
			return json({ error: 'Customer name is required' }, { status: 400 });
		}

		const customer = await prisma.customer.upsert({
			where: { name: name.trim() },
			update: {},
			create: { name: name.trim() }
		});
		return json(customer, { status: 201 });
	} catch (e) {
		return apiError('create customer', e);
	}
};
