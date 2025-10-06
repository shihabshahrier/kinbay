import { NumberInput, Select, Stack, Text, Group, Card } from '@mantine/core';
import { useState, useEffect } from 'react';
import type { ProductFormData } from '../../types';
import { RentOption } from '../../types';

interface ProductPricingStepProps {
    data: ProductFormData;
    onChange: (data: Partial<ProductFormData>) => void;
}

const ProductPricingStep = ({ data, onChange }: ProductPricingStepProps) => {
    const [pricingType, setPricingType] = useState<'buy' | 'rent' | 'both'>(() => {
        if (data.priceBuy && data.priceRent) return 'both';
        if (data.priceBuy) return 'buy';
        if (data.priceRent) return 'rent';
        return 'buy';
    });

    useEffect(() => {
        // Clear irrelevant fields when pricing type changes
        if (pricingType === 'buy') {
            onChange({ priceRent: undefined, rentOption: undefined });
        } else if (pricingType === 'rent') {
            onChange({ priceBuy: undefined });
        }
    }, [pricingType, onChange]);

    const rentOptions = [
        { value: RentOption.DAILY, label: 'Per Day' },
        { value: RentOption.WEEKLY, label: 'Per Week' },
        { value: RentOption.MONTHLY, label: 'Per Month' },
    ];

    return (
        <Stack align="center" mt="xl" px={{ base: "md", sm: 0 }}>
            <Text size="lg" fw={500} mb="md">Select Pricing Options</Text>

            <Group mb="xl" justify="center" wrap="wrap" gap="sm">
                <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                        cursor: 'pointer',
                        backgroundColor: pricingType === 'buy' ? 'var(--mantine-color-blue-0)' : undefined,
                        borderColor: pricingType === 'buy' ? 'var(--mantine-color-blue-5)' : undefined,
                    }}
                    onClick={() => setPricingType('buy')}
                >
                    <Text fw={500} ta="center">Sale Only</Text>
                </Card>

                <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                        cursor: 'pointer',
                        backgroundColor: pricingType === 'rent' ? 'var(--mantine-color-blue-0)' : undefined,
                        borderColor: pricingType === 'rent' ? 'var(--mantine-color-blue-5)' : undefined,
                    }}
                    onClick={() => setPricingType('rent')}
                >
                    <Text fw={500} ta="center">Rent Only</Text>
                </Card>

                <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                        cursor: 'pointer',
                        backgroundColor: pricingType === 'both' ? 'var(--mantine-color-blue-0)' : undefined,
                        borderColor: pricingType === 'both' ? 'var(--mantine-color-blue-5)' : undefined,
                    }}
                    onClick={() => setPricingType('both')}
                >
                    <Text fw={500} ta="center">Sale & Rent</Text>
                </Card>
            </Group>

            <Stack w={{ base: "100%", sm: 400 }} maw={400}>
                {(pricingType === 'buy' || pricingType === 'both') && (
                    <NumberInput
                        label="Sale Price"
                        placeholder="0.00"
                        value={data.priceBuy || ''}
                        onChange={(value) => onChange({ priceBuy: Number(value) || undefined })}
                        min={0}
                        prefix="$"
                        decimalScale={2}
                        size="lg"
                    />
                )}

                {(pricingType === 'rent' || pricingType === 'both') && (
                    <>
                        <NumberInput
                            label="Rent Price"
                            placeholder="0.00"
                            value={data.priceRent || ''}
                            onChange={(value) => onChange({ priceRent: Number(value) || undefined })}
                            min={0}
                            prefix="$"
                            decimalScale={2}
                            size="lg"
                        />

                        <Select
                            label="Rent Period"
                            placeholder="Select rent period"
                            value={data.rentOption || null}
                            onChange={(value) => onChange({ rentOption: value as RentOption || undefined })}
                            data={rentOptions}
                            size="lg"
                        />
                    </>
                )}
            </Stack>
        </Stack>
    );
};

export default ProductPricingStep;