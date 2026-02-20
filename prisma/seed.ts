import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const customers = ['J&A Grocers', "Colin's Market", "Steven's Produce"];

async function main() {
	for (const name of customers) {
		const customer = await prisma.customer.upsert({
			where: { name },
			update: {},
			create: { name }
		});
		console.log(`Customer: ${customer.name} (id=${customer.id})`);
	}
}

main()
	.then(() => console.log('Seed complete.'))
	.catch((e) => { console.error(e); process.exit(1); })
	.finally(() => prisma.$disconnect());
