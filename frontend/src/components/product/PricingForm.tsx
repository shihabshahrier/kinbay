import { NumberInput, Select, Stack, Text, Switch, Group } from '@mantine/core';
import { useState } from 'react';
import type { ProductFormData } from '../../types';
import { RentOption } from '../../types';

interface PricingFormProps {
    data: ProductFormData;
    onChange: (data: Partial<ProductFormData>) => void;
}

const PricingForm = ({ data, onChange }: PricingFormProps) => {
    const [canBuy, setCanBuy] = useState(!!data.priceBuy);
    const [canRent, setCanRent] = useState(!!data.priceRent);

    const handleBuyToggle = (checked: boolean) => {
        setCanBuy(checked);
        if (!checked) {
            onChange({ priceBuy: undefined });
        }
    };

    const handleRentToggle = (checked: boolean) => {
        setCanRent(checked);
        if (!checked) {
            onChange({ priceRent: undefined, rentOption: undefined });
        }
    };

    const rentOptions = [
        { value: RentOption.DAILY, label: 'Per Day' },
        { value: RentOption.WEEKLY, label: 'Per Week' },
        { value: RentOption.MONTHLY, label: 'Per Month' },
    ];

    return (
        <Stack>
            <Text size="sm" c="dimmed">
                Set at least one pricing option for your product
            </Text>

            <Group>
                <Switch
                    label="Available for Purchase"
                    checked={canBuy}
                    onChange={(event) => handleBuyToggle(event.currentTarget.checked)}
                />
            </Group>

            {canBuy && (
                <NumberInput
                    label="Buy Price"
                    placeholder="0.00"
                    value={data.priceBuy || ''}
                    onChange={(value) => onChange({ priceBuy: Number(value) || undefined })}
                    min={0}
                    prefix="$"
                    decimalScale={2}
                />
            )}

            <Group>
                <Switch
                    label="Available for Rent"
                    checked={canRent}
                    onChange={(event) => handleRentToggle(event.currentTarget.checked)}
                />
            </Group>

            {canRent && (
                <>
                    <NumberInput
                        label="Rent Price"
                        placeholder="0.00"
                        value={data.priceRent || ''}
                        onChange={(value) => onChange({ priceRent: Number(value) || undefined })}
                        min={0}
                        prefix="$"
                        decimalScale={2}
                    />

                    <Select
                        label="Rent Period"
                        placeholder="Select rent period"
                        value={data.rentOption || null}
                        onChange={(value) => onChange({ rentOption: value as RentOption || undefined })}
                        data={rentOptions}
                    />
                </>
            )}
        </Stack>
    );
};

export default PricingForm;