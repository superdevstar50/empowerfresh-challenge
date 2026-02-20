import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listJobs } from '$lib/etl/jobStore';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 100);
		const jobs = await listJobs(limit);
		return json({ jobs });
	} catch (e) {
		return json({ error: (e as Error).message }, { status: 500 });
	}
};
