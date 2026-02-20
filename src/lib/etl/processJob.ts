import { readFile } from 'fs/promises';
import { preprocess } from './preprocess';
import { detectFileType } from './detectType';
import { runPipeline, createETLResult } from './pipeline';
import {
	getJobForProcessing,
	updateFileStatus,
	completeJob,
	failJob
} from './jobStore';
import { logger } from '$lib/utils/logger';
import type { ETLFileResult, ETLSummary } from '$lib/types';

export async function processJob(jobId: string): Promise<void> {
	const job = await getJobForProcessing(jobId);
	if (!job) return;

	const results: ETLFileResult[] = [];

	try {
		for (const file of job.files) {
			const path = file.path;
			const customerId = file.customerId;
			if (!path || customerId == null) {
				await updateFileStatus(jobId, file.filename, 'failed', {
					...createETLResult('unknown', { errors: 1, messages: ['Missing path or customerId'] }),
					filename: file.filename
				});
				results.push({
					...createETLResult('unknown', { errors: 1, messages: ['Missing path or customerId'] }),
					filename: file.filename
				});
				continue;
			}

			await updateFileStatus(jobId, file.filename, 'processing');

			try {
				const content = await readFile(path, 'utf-8');
				const preprocessed = preprocess(content);
				const fileType = file.typeOverride ?? detectFileType(preprocessed.headers).fileType;
				logger.info('ETL:processJob', `Processing "${file.filename}" (customerId=${customerId})...`);
				const result = await runPipeline(preprocessed, fileType, customerId);
				const withFilename = { ...result, filename: file.filename };
				results.push(withFilename);
				await updateFileStatus(jobId, file.filename, 'completed', withFilename);
			} catch (e) {
				const msg = `Failed: ${(e as Error).message}`;
				logger.error('ETL:processJob', `"${file.filename}": ${msg}`, e);
				const errResult = {
					...createETLResult('unknown', { errors: 1, messages: [msg] }),
					filename: file.filename
				};
				results.push(errResult);
				await updateFileStatus(jobId, file.filename, 'failed', errResult);
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
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
		await completeJob(jobId, summary);
		logger.info('ETL:processJob', `Job ${jobId} completed.`);
	} catch (e) {
		logger.error('ETL:processJob', `Job ${jobId} failed: ${(e as Error).message}`, e);
		await failJob(jobId);
	}
}
