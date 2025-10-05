import { useState, useEffect } from 'react';
import { Container, Title, Card, Text, Button, Group, Alert, LoadingOverlay, TextInput, Textarea, NumberInput, Select, MultiSelect, Stack } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { GET_PRODUCT_BY_ID, UPDATE_PRODUCT, GET_CATEGORIES } from '../lib/graphql';
import type { ProductFormData, Category } from '../types';
import { RentOption } from '../types';

const EditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        priceBuy: undefined,
        priceRent: undefined,
        rentOption: undefined,
        categoryIds: []
    });

    const { data: productData, loading: productLoading, error: productError } = useQuery(GET_PRODUCT_BY_ID, {
        variables: { id },
        skip: !id,
        errorPolicy: 'all'
    });

    const { data: categoriesData } = useQuery(GET_CATEGORIES);

    const [updateProduct, { loading: updateLoading }] = useMutation(UPDATE_PRODUCT, {
        onCompleted: () => {
            notifications.show({
                title: 'Success',
                message: 'Product updated successfully!',
                color: 'green'
            });
            navigate('/dashboard');
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        }
    });

    useEffect(() => {
        if (productData?.getProductById) {
            const product = productData.getProductById;
            setFormData({
                name: product.name,
                description: product.description,
                priceBuy: product.priceBuy || undefined,
                priceRent: product.priceRent || undefined,
                rentOption: product.rentOption || undefined,
                categoryIds: product.categories.map((cat: { id: string }) => cat.id)
            });
        }
    }, [productData]);

    const handleSubmit = () => {
        if (!id) return;

        // Validate final form
        if (!formData.name || !formData.description) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please fill in all required fields',
                color: 'red'
            });
            return;
        }

        if (!formData.priceBuy && !formData.priceRent) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please set at least one price (buy or rent)',
                color: 'red'
            });
            return;
        }

        if (formData.priceRent && !formData.rentOption) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please select a rent option when setting rent price',
                color: 'red'
            });
            return;
        }

        updateProduct({
            variables: {
                id,
                name: formData.name,
                description: formData.description,
                priceBuy: formData.priceBuy,
                priceRent: formData.priceRent,
                rentOption: formData.rentOption,
                categoryIds: formData.categoryIds
            }
        });
    };

    const rentOptions = [
        { value: RentOption.DAILY, label: 'Per Day' },
        { value: RentOption.WEEKLY, label: 'Per Week' },
        { value: RentOption.MONTHLY, label: 'Per Month' },
    ];

    const categories = categoriesData?.getCategories || [];
    const categoryOptions = categories.map((category: Category) => ({
        value: category.id,
        label: category.name
    }));

    if (productLoading) return <LoadingOverlay visible />;

    if (productError) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
                    Failed to load product: {productError.message}
                </Alert>
            </Container>
        );
    }

    if (!productData?.getProductById) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Not Found!" color="red">
                    Product not found
                </Alert>
            </Container>
        );
    }

    return (
        <Container size="md">
            <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate('/dashboard')}
                mb="lg"
            >
                Back to Dashboard
            </Button>

            <Title mb="xl">Edit Product</Title>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack gap="lg">
                    {/* Basic Information */}
                    <div>
                        <Text fw={500} size="lg" mb="md">Basic Information</Text>
                        <Stack gap="md">
                            <TextInput
                                label="Product Name"
                                placeholder="Enter product name"
                                value={formData.name}
                                onChange={(event) => setFormData(prev => ({ ...prev, name: event.currentTarget.value }))}
                                required
                            />
                            <Textarea
                                label="Description"
                                placeholder="Enter product description"
                                value={formData.description}
                                onChange={(event) => setFormData(prev => ({ ...prev, description: event.currentTarget.value }))}
                                minRows={4}
                                required
                            />
                        </Stack>
                    </div>

                    {/* Categories */}
                    <div>
                        <Text fw={500} size="lg" mb="md">Categories</Text>
                        <MultiSelect
                            label="Product Categories"
                            placeholder="Select categories"
                            value={formData.categoryIds}
                            onChange={(value) => setFormData(prev => ({ ...prev, categoryIds: value }))}
                            data={categoryOptions}
                            searchable
                            clearable
                            required
                        />
                    </div>

                    {/* Pricing */}
                    <div>
                        <Text fw={500} size="lg" mb="md">Pricing</Text>
                        <Stack gap="md">
                            <NumberInput
                                label="Sale Price (Optional)"
                                placeholder="0.00"
                                value={formData.priceBuy || ''}
                                onChange={(value) => setFormData(prev => ({ ...prev, priceBuy: Number(value) || undefined }))}
                                min={0}
                                prefix="$"
                                decimalScale={2}
                            />
                            <NumberInput
                                label="Rent Price (Optional)"
                                placeholder="0.00"
                                value={formData.priceRent || ''}
                                onChange={(value) => setFormData(prev => ({ ...prev, priceRent: Number(value) || undefined }))}
                                min={0}
                                prefix="$"
                                decimalScale={2}
                            />
                            {formData.priceRent && (
                                <Select
                                    label="Rent Period"
                                    placeholder="Select rent period"
                                    value={formData.rentOption || null}
                                    onChange={(value) => setFormData(prev => ({ ...prev, rentOption: value as RentOption || undefined }))}
                                    data={rentOptions}
                                />
                            )}
                        </Stack>
                    </div>

                    <Group justify="flex-end" mt="xl">
                        <Button
                            variant="light"
                            onClick={() => navigate('/dashboard')}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            loading={updateLoading}
                            color="blue"
                        >
                            Update Product
                        </Button>
                    </Group>
                </Stack>
            </Card>
        </Container>
    );
};

export default EditProduct;