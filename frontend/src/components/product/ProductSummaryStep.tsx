import { Stack, Text, Card, Group, Badge } from '@mantine/core';
import type { ProductFormData } from '../../types';

interface ProductSummaryStepProps {
    data: ProductFormData;
}

const ProductSummaryStep = ({ data }: ProductSummaryStepProps) => {
    return (
        <Stack align="center" mt="xl">
            <Text size="xl" fw={600} mb="lg">Product Summary</Text>

            <Card shadow="md" padding="xl" radius="md" withBorder w={500}>
                <Stack gap="md">
                    <div>
                        <Text fw={500} size="sm" c="dimmed" mb={4}>Product Name</Text>
                        <Text size="lg" fw={500}>{data.name || 'Not specified'}</Text>
                    </div>

                    <div>
                        <Text fw={500} size="sm" c="dimmed" mb={4}>Description</Text>
                        <Text>{data.description || 'Not specified'}</Text>
                    </div>

                    <div>
                        <Text fw={500} size="sm" c="dimmed" mb={4}>Categories</Text>
                        <Group>
                            {data.categoryIds && data.categoryIds.length > 0 ? (
                                data.categoryIds.map((categoryId) => (
                                    <Badge key={categoryId} variant="light">
                                        Category {categoryId}
                                    </Badge>
                                ))
                            ) : (
                                <Text c="dimmed">No categories selected</Text>
                            )}
                        </Group>
                    </div>

                    <div>
                        <Text fw={500} size="sm" c="dimmed" mb={4}>Pricing</Text>
                        {data.priceBuy && (
                            <Text>Sale Price: <Text span fw={500}>${data.priceBuy}</Text></Text>
                        )}
                        {data.priceRent && (
                            <Text>Rent Price: <Text span fw={500}>${data.priceRent}/{data.rentOption?.toLowerCase()}</Text></Text>
                        )}
                        {!data.priceBuy && !data.priceRent && (
                            <Text c="dimmed">No pricing set</Text>
                        )}
                    </div>
                </Stack>
            </Card>
        </Stack>
    );
};

export default ProductSummaryStep;