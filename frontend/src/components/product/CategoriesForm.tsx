import { useState, useEffect } from 'react';
import { MultiSelect, Stack, Alert, LoadingOverlay } from '@mantine/core';
import { useQuery } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { GET_CATEGORIES } from '../../lib/graphql';
import type { ProductFormData, Category } from '../../types';

interface CategoriesFormProps {
    data: ProductFormData;
    onChange: (data: Partial<ProductFormData>) => void;
}

const CategoriesForm = ({ data, onChange }: CategoriesFormProps) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(data.categoryIds);

    const { data: categoriesData, loading, error } = useQuery(GET_CATEGORIES);

    useEffect(() => {
        onChange({ categoryIds: selectedCategories });
    }, [selectedCategories, onChange]);

    if (loading) return <LoadingOverlay visible />;

    if (error) {
        return (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
                Failed to load categories: {error.message}
            </Alert>
        );
    }

    const categories = categoriesData?.getCategories || [];
    const categoryOptions = categories.map((category: Category) => ({
        value: category.id,
        label: category.name
    }));

    return (
        <Stack align="center" mt="xl">
            <MultiSelect
                label="Select Categories"
                placeholder="Choose categories for your product"
                value={selectedCategories}
                onChange={setSelectedCategories}
                data={categoryOptions}
                searchable
                clearable
                required
                size="lg"
                w={500}
            />
        </Stack>
    );
};

export default CategoriesForm;