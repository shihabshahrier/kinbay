import { useState } from 'react';
import { Container, Title, Card, Text, Badge, Button, Group, Alert, LoadingOverlay, NumberInput, Modal, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { GET_PRODUCT_BY_ID } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import { useTransactionMutations } from '../hooks/useCacheUpdates';
import type { Product, RentFormData } from '../types';

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [actionType, setActionType] = useState<'buy' | 'rent' | null>(null);
    const [buyPrice, setBuyPrice] = useState<number>(0);

    const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
        variables: { id },
        skip: !id,
        errorPolicy: 'all'
    });


    const { buyProduct, buyLoading, rentProduct, rentLoading } = useTransactionMutations();

    const rentForm = useForm<RentFormData>({
        initialValues: {
            startDate: null,
            duration: 1,
            rentOption: 'DAILY',
        },
        validate: {
            startDate: (value) => {
                if (!value) return 'Start date is required';
                const date = value instanceof Date ? value : new Date(value);
                if (isNaN(date.getTime())) return 'Invalid start date';
                if (date < new Date()) return 'Start date cannot be in the past';
                return null;
            },
            duration: (value) => value <= 0 ? 'Duration must be at least 1' : null,
        },
    });

    if (loading) return <LoadingOverlay visible />;

    if (error) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
                    Failed to load product: {error.message}
                </Alert>
            </Container>
        );
    }

    if (!data?.getProductById) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Not Found!" color="red">
                    Product not found
                </Alert>
            </Container>
        );
    }

    const product: Product = data.getProductById;

    const handleBuy = async () => {
        if (!isAuthenticated) return;

        try {
            await buyProduct({
                variables: {
                    productId: product.id,
                    price: buyPrice || product.priceBuy || 0
                }
            });
            notifications.show({
                title: 'Success',
                message: 'Purchase request sent successfully!',
                color: 'green'
            });
            setActionType(null);
            navigate('/my-transactions');
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Failed to send purchase request',
                color: 'red'
            });
        }
    };

    // Helper function to calculate end date based on start date, duration and rent option
    const calculateEndDate = (startDate: Date | string, duration: number, rentOption: string): Date => {
        const date = startDate instanceof Date ? startDate : new Date(startDate);
        const endDate = new Date(date);
        switch (rentOption) {
            case 'DAILY':
                endDate.setDate(endDate.getDate() + duration);
                break;
            case 'WEEKLY':
                endDate.setDate(endDate.getDate() + (duration * 7));
                break;
            case 'MONTHLY':
                endDate.setMonth(endDate.getMonth() + duration);
                break;
        }
        return endDate;
    };

    // Calculate total price
    const calculateTotalPrice = (): number => {
        const { startDate, duration } = rentForm.values;
        if (!startDate || !product?.priceRent) return 0;

        const multiplier = duration;
        return multiplier * (product.priceRent || 0);
    };

    const handleRent = async (values: RentFormData) => {
        if (!isAuthenticated || !values.startDate) return;

        // Ensure startDate is a proper Date object
        const startDate = values.startDate instanceof Date ? values.startDate : new Date(values.startDate);
        const endDate = calculateEndDate(startDate, values.duration, values.rentOption);
        const totalPrice = calculateTotalPrice();

        try {
            await rentProduct({
                variables: {
                    productId: product.id,
                    price: totalPrice,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            notifications.show({
                title: 'Success',
                message: 'Rental request sent successfully!',
                color: 'green'
            });
            setActionType(null);
            rentForm.reset();
            navigate('/my-transactions');
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Failed to send rental request',
                color: 'red'
            });
        }
    };

    const openBuyModal = () => {
        setBuyPrice(product.priceBuy || 0);
        setActionType('buy');
    };

    const openRentModal = () => {
        // Set the rent option based on the product's rent option
        rentForm.setValues({
            startDate: null,
            duration: 1,
            rentOption: product.rentOption || 'DAILY'
        });
        setActionType('rent');
    };

    const isOwner = user?.id === product.ownerId;

    return (
        <Container size="md">
            <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate('/products')}
                mb="md"
            >
                Back to Products
            </Button>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Title order={1} size="2.5rem" mb="sm" ta="center">
                    {product.name}
                </Title>

                <Group justify="center" mb="lg">
                    <Text size="sm" c="dimmed">Categories:</Text>
                    {product.categories.map((category) => (
                        <Badge key={category.id} variant="light" size="md">
                            {category.name}
                        </Badge>
                    ))}
                </Group>

                {product.priceBuy && (
                    <Text size="xl" fw={600} mb="md" ta="center" c="blue">
                        Price: ${product.priceBuy}
                    </Text>
                )}

                <Text size="md" mb="xl" style={{ lineHeight: 1.6 }}>
                    {product.description}
                </Text>

                <Card withBorder p="md" mb="md">
                    <Text fw={500} mb="sm">Owner Information</Text>
                    <Text>
                        {product.owner.firstname} {product.owner.lastname}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {product.owner.email}
                    </Text>
                </Card>

                <Card withBorder p="md" mb="md">
                    <Text fw={500} mb="sm">Pricing</Text>
                    {product.priceBuy && (
                        <Text size="lg" fw={500} c="blue">
                            Buy: ${product.priceBuy}
                        </Text>
                    )}
                    {product.priceRent && (
                        <Text size="lg" fw={500} c="green">
                            Rent: ${product.priceRent}/{product.rentOption?.toLowerCase()}
                        </Text>
                    )}
                    {!product.priceBuy && !product.priceRent && (
                        <Text c="orange">Not available for purchase or rent</Text>
                    )}
                </Card>

                {isAuthenticated && !isOwner && (
                    <Group justify="center" gap="md">
                        {product.priceRent && (
                            <Button
                                size="lg"
                                variant="light"
                                onClick={openRentModal}
                                style={{ minWidth: 120 }}
                            >
                                Rent
                            </Button>
                        )}
                        {product.priceBuy && (
                            <Button
                                size="lg"
                                onClick={openBuyModal}
                                style={{ minWidth: 120 }}
                            >
                                Buy
                            </Button>
                        )}
                    </Group>
                )}

                {!isAuthenticated && (
                    <Alert color="blue" mt="md">
                        Please log in to buy or rent this product.
                    </Alert>
                )}

                {isOwner && (
                    <Alert color="orange" mt="md">
                        This is your product. You can edit it from your dashboard.
                    </Alert>
                )}
            </Card>

            {/* Buy Modal */}
            <Modal
                opened={actionType === 'buy'}
                onClose={() => setActionType(null)}
                title="Purchase Product"
            >
                <Text mb="md">
                    Are you sure you want to buy "{product.name}"?
                </Text>
                <NumberInput
                    label="Price"
                    value={buyPrice}
                    onChange={(value) => setBuyPrice(Number(value) || 0)}
                    min={0}
                    prefix="$"
                    mb="md"
                />
                <Group justify="flex-end">
                    <Button variant="light" onClick={() => setActionType(null)}>
                        Cancel
                    </Button>
                    <Button onClick={handleBuy} loading={buyLoading}>
                        Confirm Purchase
                    </Button>
                </Group>
            </Modal>

            {/* Rent Modal */}
            <Modal
                opened={actionType === 'rent'}
                onClose={() => setActionType(null)}
                title="Rent Product"
            >
                <form onSubmit={rentForm.onSubmit(handleRent)}>
                    <Text mb="md">
                        Rent "{product.name}" - ${product.priceRent}/{product.rentOption?.toLowerCase()}
                    </Text>

                    <DatePickerInput
                        label="Start Date"
                        placeholder="Pick start date"
                        {...rentForm.getInputProps('startDate')}
                        mb="md"
                        minDate={new Date()}
                    />

                    <Select
                        label="Rental Period"
                        placeholder="Select rental type"
                        data={[
                            {
                                value: product.rentOption || 'DAILY',
                                label: (product.rentOption || 'DAILY').charAt(0) + (product.rentOption || 'DAILY').slice(1).toLowerCase()
                            }
                        ]}
                        {...rentForm.getInputProps('rentOption')}
                        mb="md"
                        disabled
                    />

                    <NumberInput
                        label={`Duration (${rentForm.values.rentOption.toLowerCase()}s)`}
                        placeholder="Enter duration"
                        {...rentForm.getInputProps('duration')}
                        min={1}
                        mb="md"
                    />

                    {rentForm.values.startDate && rentForm.values.duration > 0 && (
                        <>
                            <Text size="sm" c="dimmed" mb="xs">
                                End Date: {calculateEndDate(rentForm.values.startDate, rentForm.values.duration, rentForm.values.rentOption).toLocaleDateString()}
                            </Text>
                            <Text size="sm" c="dimmed" mb="md">
                                Total: ${calculateTotalPrice()}
                            </Text>
                        </>
                    )}

                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setActionType(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={rentLoading}>
                            Confirm Rental
                        </Button>
                    </Group>
                </form>
            </Modal>
        </Container>
    );
};

export default ProductDetails;