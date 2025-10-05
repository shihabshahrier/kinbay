import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const categories = [
        'ELECTRONICS',
        'FURNITURE',
        'HOME APPLIANCES',
        'SPORTING GOODS',
        'OUTDOOR',
        'TOYS'
    ];
    for (const categoryName of categories) {
        const existingCategory = await prisma.category.findUnique({
            where: { name: categoryName }
        });
        if (!existingCategory) {
            await prisma.category.create({
                data: { name: categoryName }
            });
        }
    }
    console.log('Database seeded successfully!');
}
main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
//# sourceMappingURL=seed.js.map