import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getJob } from '$lib/etl/jobStore';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = params.id;
		if (!id) return json({ error: 'id required' }, { status: 400 });
		const job = await getJob(id);
		if (!job) return json({ error: 'Job not found' }, { status: 404 });
		return json(job);
	} catch (e) {
		return json({ error: (e as Error).message }, { status: 500 });
	}
};
