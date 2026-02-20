import { json } from '@sveltejs/kit';

export function parsePagination(url: URL, defaultLimit = 50) {
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const limit = parseInt(url.searchParams.get('limit') ?? String(defaultLimit));
	const offset = (page - 1) * limit;
	return { page, limit, offset };
}

export function paginatedResponse<T>(data: T, total: number, page: number, limit: number) {
	return json({ ...data, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export function apiError(operation: string, e: unknown) {
	return json(
		{ error: `Failed to ${operation}: ${(e as Error).message}` },
		{ status: 500 }
	);
}
