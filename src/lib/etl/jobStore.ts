import { randomUUID } from 'crypto';
import { prisma } from '$lib/db';
import type {
	ETLFileInput,
	ETLFileResult,
	ETLJob,
	ETLSummary,
	JobFileStatus,
	JobStatus
} from '$lib/types';

/** Stored in DB: display fields + input for worker */
interface StoredFileEntry extends JobFileStatus {
	path?: string;
	customerId?: number;
	typeOverride?: import('$lib/types').FileType;
}

function toStoredFiles(files: ETLFileInput[]): StoredFileEntry[] {
	return files.map((f) => ({
		filename: f.filename,
		status: 'pending' as const,
		path: f.path,
		customerId: f.customerId,
		typeOverride: f.typeOverride
	}));
}

export async function createJob(files: ETLFileInput[]): Promise<ETLJob> {
	const id = randomUUID();
	const stored = toStoredFiles(files);
	await prisma.importJob.create({
		data: {
			id,
			status: 'pending',
			files: stored as object
		}
	});
	return {
		id,
		status: 'pending',
		files: stored.map(({ path, customerId, typeOverride, ...rest }) => rest),
		createdAt: new Date().toISOString()
	};
}

function stripPayload(files: StoredFileEntry[]): JobFileStatus[] {
	return files.map(({ path, customerId, typeOverride, ...rest }) => rest);
}

export async function getJob(id: string): Promise<ETLJob | null> {
	const row = await prisma.importJob.findUnique({ where: { id } });
	if (!row) return null;
	const stored = row.files as unknown as StoredFileEntry[];
	return {
		id: row.id,
		status: row.status as JobStatus,
		files: stripPayload(stored),
		summary: row.summary as unknown as ETLSummary | undefined,
		createdAt: row.createdAt.toISOString()
	};
}

/** Returns job with file inputs (path, customerId, typeOverride) for the worker. */
export async function getJobForProcessing(id: string): Promise<{
	id: string;
	status: string;
	files: StoredFileEntry[];
} | null> {
	const row = await prisma.importJob.findUnique({ where: { id } });
	if (!row) return null;
	return {
		id: row.id,
		status: row.status,
		files: row.files as unknown as StoredFileEntry[]
	};
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<void> {
	await prisma.importJob.update({
		where: { id },
		data: { status }
	});
}

export async function updateFileStatus(
	id: string,
	filename: string,
	status: JobStatus,
	result?: ETLFileResult
): Promise<void> {
	const row = await prisma.importJob.findUnique({ where: { id } });
	if (!row) return;
	const files = row.files as unknown as StoredFileEntry[];
	const next = files.map((f) =>
		f.filename === filename ? { ...f, status, ...(result && { result }) } : f
	);
	await prisma.importJob.update({
		where: { id },
		data: { files: next as object, ...(status === 'processing' && { status: 'processing' }) }
	});
}

export async function completeJob(id: string, summary: ETLSummary): Promise<void> {
	await prisma.importJob.update({
		where: { id },
		data: { status: 'completed', summary: summary as object }
	});
}

export async function failJob(id: string): Promise<void> {
	await prisma.importJob.update({
		where: { id },
		data: { status: 'failed' }
	});
}

export async function listJobs(limit = 50): Promise<ETLJob[]> {
	const rows = await prisma.importJob.findMany({
		orderBy: { createdAt: 'desc' },
		take: limit
	});
	return rows.map((row) => ({
		id: row.id,
		status: row.status as JobStatus,
		files: stripPayload(row.files as unknown as StoredFileEntry[]),
		summary: row.summary as unknown as ETLSummary | undefined,
		createdAt: row.createdAt.toISOString()
	}));
}
