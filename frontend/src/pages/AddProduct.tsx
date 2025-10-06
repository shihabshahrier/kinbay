import { useState, useCallback } from 'react';
import { Container, Title, Button, Group, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useProductMutations } from '../hooks/useCacheUpdates';
import type { ProductFormData } from '../types';
import ProductNameStep from '../components/product/ProductNameStep';
import CategoriesForm from '../components/product/CategoriesForm';
import ProductDescriptionStep from '../components/product/ProductDescriptionStep';
import ProductPricingStep from '../components/product/ProductPricingStep';
import ProductSummaryStep from '../components/product/ProductSummaryStep';

const AddProduct = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        priceBuy: undefined,
        priceRent: undefined,
        rentOption: undefined,
        categoryIds: []
    });

    const { createProduct, createLoading } = useProductMutations();

    const stepTitles = [
        'Select a title for your product',
        'Select categories',
        'Select description',
        'Select price',
        'Summary'
    ];

    const totalSteps = stepTitles.length;

    const updateFormData = useCallback((data: Partial<ProductFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    }, []);

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: // Name step
                return formData.name.trim().length > 0;
            case 1: // Categories step
                return formData.categoryIds.length > 0;
            case 2: // Description step
                return formData.description.trim().length > 0;
            case 3: // Pricing step
                return formData.priceBuy || formData.priceRent;
            case 4: // Summary step
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        if (formData.priceRent && !formData.rentOption) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please select a rent option when setting rent price',
                color: 'red'
            });
            return;
        }

        try {
            await createProduct({
                variables: {
                    name: formData.name,
                    description: formData.description,
                    priceBuy: formData.priceBuy,
                    priceRent: formData.priceRent,
                    rentOption: formData.rentOption,
                    categoryIds: formData.categoryIds
                }
            });
            notifications.show({
                title: 'Success',
                message: 'Product created successfully!',
                color: 'green'
            });
            navigate('/dashboard');
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Failed to create product',
                color: 'red'
            });
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return <ProductNameStep data={formData} onChange={updateFormData} />;
            case 1:
                return <CategoriesForm data={formData} onChange={updateFormData} />;
            case 2:
                return <ProductDescriptionStep data={formData} onChange={updateFormData} />;
            case 3:
                return <ProductPricingStep data={formData} onChange={updateFormData} />;
            case 4:
                return <ProductSummaryStep data={formData} />;
            default:
                return null;
        }
    };

    return (
        <Container size="lg">
            <Group justify="space-between" align="center" mb="xl">
                <Title order={2}>Create product</Title>
                <Text c="dimmed">PART {currentStep + 1}</Text>
            </Group>

            {/* Progress indicator */}
            <Group justify="center" mb="lg">
                {Array.from({ length: totalSteps }, (_, index) => (
                    <div
                        key={index}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: index <= currentStep ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-gray-3)',
                            margin: '0 4px',
                        }}
                    />
                ))}
            </Group>

            {/* Step title */}
            <Title order={3} ta="center" mb="xl">
                {stepTitles[currentStep]}
            </Title>

            {/* Current step content */}
            {renderCurrentStep()}

            {/* Navigation buttons */}
            <Group justify="center" mt="xl">
                {currentStep > 0 && (
                    <Button
                        variant="light"
                        onClick={prevStep}
                        size="md"
                    >
                        Back
                    </Button>
                )}

                {currentStep < totalSteps - 1 ? (
                    <Button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        size="md"
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        loading={createLoading}
                        color="green"
                        size="md"
                    >
                        Create Product
                    </Button>
                )}
            </Group>
        </Container>
    );
};

export default AddProduct;