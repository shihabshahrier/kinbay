import { TextInput, Textarea, Stack } from '@mantine/core';
import type { ProductFormData } from '../../types';

interface BasicInfoFormProps {
    data: ProductFormData;
    onChange: (data: Partial<ProductFormData>) => void;
}

const BasicInfoForm = ({ data, onChange }: BasicInfoFormProps) => {
    return (
        <Stack>
            <TextInput
                label="Product Name"
                placeholder="Enter product name"
                value={data.name}
                onChange={(event) => onChange({ name: event.currentTarget.value })}
                required
            />

            <Textarea
                label="Description"
                placeholder="Enter product description"
                value={data.description}
                onChange={(event) => onChange({ description: event.currentTarget.value })}
                minRows={4}
                required
            />
        </Stack>
    );
};

export default BasicInfoForm;