import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Seeding categories...');
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
            console.log(`Created category: ${categoryName}`);
        }
        else {
            console.log(`Category already exists: ${categoryName}`);
        }
    }
    console.log('Seeding completed!');
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map