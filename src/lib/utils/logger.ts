import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';

const LOG_DIR = 'logs';
const LOG_FILE = join(LOG_DIR, 'etl.log');

async function ensureLogDir() {
	await mkdir(LOG_DIR, { recursive: true });
}

function timestamp(): string {
	return new Date().toISOString();
}

function formatEntry(level: string, context: string, message: string, detail?: unknown): string {
	const base = `[${timestamp()}] [${level}] [${context}] ${message}`;
	if (detail !== undefined) {
		const detailStr = detail instanceof Error ? detail.stack ?? detail.message : JSON.stringify(detail);
		return `${base}\n  ${detailStr}\n`;
	}
	return `${base}\n`;
}

async function write(entry: string) {
	try {
		await ensureLogDir();
		await appendFile(LOG_FILE, entry, 'utf-8');
	} catch {
		// Fallback silently if file logging fails
	}
}

export const logger = {
	info(context: string, message: string, detail?: unknown) {
		const entry = formatEntry('INFO', context, message, detail);
		console.log(entry.trimEnd());
		write(entry);
	},

	warn(context: string, message: string, detail?: unknown) {
		const entry = formatEntry('WARN', context, message, detail);
		console.warn(entry.trimEnd());
		write(entry);
	},

	error(context: string, message: string, detail?: unknown) {
		const entry = formatEntry('ERROR', context, message, detail);
		console.error(entry.trimEnd());
		write(entry);
	}
};
