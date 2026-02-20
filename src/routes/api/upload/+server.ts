import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { preprocess } from '$lib/etl/preprocess';
import { detectFileType } from '$lib/etl/detectType';
import { apiError } from '$lib/utils/api';
import type { UploadedFile } from '$lib/types';

const UPLOAD_DIR = 'uploads';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		if (files.length === 0) {
			return json({ error: 'No files provided' }, { status: 400 });
		}

		await mkdir(UPLOAD_DIR, { recursive: true });

		const results: UploadedFile[] = [];

		for (const file of files) {
			const content = await file.text();
			const filename = file.name;
			const filepath = join(UPLOAD_DIR, `${Date.now()}-${filename}`).replace(/\\/g, '/');

			await writeFile(filepath, content, 'utf-8');

			const preprocessed = preprocess(content);
			const { fileType } = detectFileType(preprocessed.headers);

			results.push({
				filename,
				path: filepath,
				detectedType: fileType,
				size: content.length
			});
		}

		return json({ files: results });
	} catch (e) {
		return apiError('upload files', e);
	}
};
