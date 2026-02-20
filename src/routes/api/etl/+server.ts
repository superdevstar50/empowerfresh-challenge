import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createJob } from '$lib/etl/jobStore';
import { processJob } from '$lib/etl/processJob';
import { logger } from '$lib/utils/logger';
import type { ETLRequest } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: ETLRequest = await request.json();

		if (!body.files?.length) {
			return json({ error: 'files are required' }, { status: 400 });
		}

		const missingCustomer = body.files.filter((f) => !f.customerId);
		if (missingCustomer.length > 0) {
			return json({
				error: `Missing customerId for: ${missingCustomer.map((f) => f.filename).join(', ')}`
			}, { status: 400 });
		}

		const job = await createJob(body.files);
		processJob(job.id).catch((e) => logger.error('ETL:route', `processJob error: ${(e as Error).message}`, e));

		logger.info('ETL:route', `Created job ${job.id} for ${body.files.length} file(s)`);
		return json({ jobId: job.id });
	} catch (e) {
		logger.error('ETL:route', `ETL request failed: ${(e as Error).message}`, e);
		return json({ error: `ETL processing failed: ${(e as Error).message}` }, { status: 500 });
	}
};
