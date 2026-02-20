import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import { preprocess } from '$lib/etl/preprocess';
import { detectFileType } from '$lib/etl/detectType';
import { runPipeline, createETLResult } from '$lib/etl/pipeline';
import { logger } from '$lib/utils/logger';
import type { ETLRequest, ETLFileResult, ETLSummary } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: ETLRequest = await request.json();

		if (!body.customerId || !body.files?.length) {
			return json({ error: 'customerId and files are required' }, { status: 400 });
		}

		const results: ETLFileResult[] = [];

		logger.info('ETL:route', `Starting ETL for ${body.files.length} file(s), customerId=${body.customerId}`);

	for (const file of body.files) {
		try {
			logger.info('ETL:route', `Processing "${file.filename}"...`);
			const content = await readFile(file.path, 'utf-8');
			const preprocessed = preprocess(content);
			const fileType = file.typeOverride ?? detectFileType(preprocessed.headers).fileType;
			logger.info('ETL:route', `Detected type="${fileType}" for "${file.filename}" (${preprocessed.rows.length} rows)`);
			const result = await runPipeline(preprocessed, fileType, body.customerId);
			results.push({ ...result, filename: file.filename });
		} catch (e) {
			const msg = `Failed to process "${file.filename}": ${(e as Error).message}`;
			logger.error('ETL:route', msg, e);
			results.push({
				...createETLResult('unknown', { errors: 1, messages: [msg] }),
				filename: file.filename
			});
		}
	}

	const summary: ETLSummary = {
		totalInserted: results.reduce((s, r) => s + r.inserted, 0),
		totalUpdated: results.reduce((s, r) => s + r.updated, 0),
		totalSkipped: results.reduce((s, r) => s + r.skipped, 0),
		totalDuplicatesSkipped: results.reduce((s, r) => s + r.duplicatesSkipped, 0),
		totalErrors: results.reduce((s, r) => s + r.errors, 0),
		filesProcessed: results.length,
		results
	};

	return json(summary);
	} catch (e) {
		logger.error('ETL:route', `ETL request failed: ${(e as Error).message}`, e);
		return json({ error: `ETL processing failed: ${(e as Error).message}` }, { status: 500 });
	}
};
