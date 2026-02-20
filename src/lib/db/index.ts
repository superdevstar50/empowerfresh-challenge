import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { DATABASE_URL } from '$env/static/private';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

function createClient() {
	const connStr = DATABASE_URL;
	const adapter = new PrismaPg({ connectionString: connStr });
	return new PrismaClient({ adapter });
}

if (!globalForPrisma.prisma) {
	globalForPrisma.prisma = createClient();
}

export const prisma = globalForPrisma.prisma;
