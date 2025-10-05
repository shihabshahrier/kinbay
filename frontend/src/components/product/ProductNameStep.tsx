import { TextInput, Stack } from '@mantine/core';
import type { ProductFormData } from '../../types';

interface ProductNameStepProps {
    data: ProductFormData;
    onChange: (data: Partial<ProductFormData>) => void;
}

const ProductNameStep = ({ data, onChange }: ProductNameStepProps) => {
    return (
        <Stack align="center" mt="xl">
            <TextInput
                label="Product Name"
                placeholder="Enter product name"
                value={data.name}
                onChange={(event) => onChange({ name: event.currentTarget.value })}
                required
                size="lg"
                w={400}
            />
        </Stack>
    );
};

export default ProductNameStep;