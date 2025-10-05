import { Textarea, Stack } from '@mantine/core';
import type { ProductFormData } from '../../types';

interface ProductDescriptionStepProps {
    data: ProductFormData;
    onChange: (data: Partial<ProductFormData>) => void;
}

const ProductDescriptionStep = ({ data, onChange }: ProductDescriptionStepProps) => {
    return (
        <Stack align="center" mt="xl">
            <Textarea
                label="Product Description"
                placeholder="Enter product description"
                value={data.description}
                onChange={(event) => onChange({ description: event.currentTarget.value })}
                minRows={6}
                maxRows={8}
                required
                size="lg"
                w={500}
            />
        </Stack>
    );
};

export default ProductDescriptionStep;