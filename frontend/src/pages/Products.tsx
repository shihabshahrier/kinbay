import { useState } from 'react';
import { Container, Title, Card, Text, Badge, Button, Grid, Group, Alert, LoadingOverlay, NumberInput, Modal, Select } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { DatePickerInput } from '@mantine/dates';
import { useQuery, useMutation } from '@apollo/client';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconShoppingCart, IconCalendar } from '@tabler/icons-react';
import { GET_ALL_PRODUCTS, BUY_PRODUCT, RENT_PRODUCT } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import type { Product, RentFormData } from '../types';

const Products = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [actionType, setActionType] = useState<'buy' | 'rent' | null>(null);
    const [buyPrice, setBuyPrice] = useState<number>(0);

    const { data, loading, error } = useQuery(GET_ALL_PRODUCTS, {
        errorPolicy: 'all'
    });

    const [buyProduct, { loading: buyLoading }] = useMutation(BUY_PRODUCT, {
        onCompleted: () => {
            notifications.show({
                title: 'Success',
                message: 'Purchase request sent successfully!',
                color: 'green'
            });
            setActionType(null);
            setSelectedProduct(null);
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        }
    });

    const [rentProduct, { loading: rentLoading }] = useMutation(RENT_PRODUCT, {
        onCompleted: () => {
            notifications.show({
                title: 'Success',
                message: 'Rental request sent successfully!',
                color: 'green'
            });
            setActionType(null);
            setSelectedProduct(null);
            rentForm.reset();
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        }
    });

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
        if (!startDate || !selectedProduct?.priceRent) return 0;

        const multiplier = duration;
        return multiplier * (selectedProduct.priceRent || 0);
    };

    const handleBuy = () => {
        if (!selectedProduct || !isAuthenticated) return;

        buyProduct({
            variables: {
                productId: selectedProduct.id,
                price: buyPrice || selectedProduct.priceBuy || 0
            }
        });
    };

    const handleRent = (values: RentFormData) => {
        if (!selectedProduct || !isAuthenticated || !values.startDate) return;

        // Ensure startDate is a proper Date object
        const startDate = values.startDate instanceof Date ? values.startDate : new Date(values.startDate);
        const endDate = calculateEndDate(startDate, values.duration, values.rentOption);
        const totalPrice = calculateTotalPrice();

        rentProduct({
            variables: {
                productId: selectedProduct.id,
                price: totalPrice,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        });
    };

    const openBuyModal = (product: Product) => {
        setSelectedProduct(product);
        setBuyPrice(product.priceBuy || 0);
        setActionType('buy');
    };

    const openRentModal = (product: Product) => {
        setSelectedProduct(product);
        // Set the rent option based on the product's rent option
        rentForm.setValues({
            startDate: null,
            duration: 1,
            rentOption: product.rentOption || 'DAILY'
        });
        setActionType('rent');
    };

    if (loading) return <LoadingOverlay visible />;

    if (error) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
                    Failed to load products: {error.message}
                </Alert>
            </Container>
        );
    }

    const products = data?.getAllProducts || [];

    return (
        <Container size="lg">
            <Title mb="xl">All Products</Title>

            <Grid>
                {products.map((product: Product) => (
                    <Grid.Col key={product.id} span={{ base: 12, md: 6, lg: 4 }}>
                        <Card
                            shadow="sm"
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onClick={() => navigate(`/products/${product.id}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <Text fw={500} size="lg" mb="xs">
                                {product.name}
                            </Text>

                            <Text size="sm" c="dimmed" mb="sm">
                                {product.description}
                            </Text>

                            <Group mb="sm">
                                {product.categories.map((category) => (
                                    <Badge key={category.id} variant="light">
                                        {category.name}
                                    </Badge>
                                ))}
                            </Group>

                            <Text size="sm" mb="sm">
                                Owner: {product.owner.firstname} {product.owner.lastname}
                            </Text>

                            <Group justify="space-between" mt="md">
                                <div>
                                    {product.priceBuy && (
                                        <Text size="sm">Buy: ${product.priceBuy}</Text>
                                    )}
                                    {product.priceRent && (
                                        <Text size="sm">Rent: ${product.priceRent}/{product.rentOption?.toLowerCase()}</Text>
                                    )}
                                </div>
                                <Text size="xs" c="dimmed" style={{ textDecoration: 'underline' }}>
                                    View Details
                                </Text>
                            </Group>

                            {isAuthenticated && user?.id !== product.ownerId && (
                                <Group mt="md">
                                    {product.priceBuy && (
                                        <Button
                                            size="xs"
                                            leftSection={<IconShoppingCart size={16} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openBuyModal(product);
                                            }}
                                        >
                                            Buy
                                        </Button>
                                    )}
                                    {product.priceRent && (
                                        <Button
                                            size="xs"
                                            variant="light"
                                            leftSection={<IconCalendar size={16} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openRentModal(product);
                                            }}
                                        >
                                            Rent
                                        </Button>
                                    )}
                                </Group>
                            )}
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Buy Modal */}
            <Modal
                opened={actionType === 'buy'}
                onClose={() => setActionType(null)}
                title="Purchase Product"
            >
                {selectedProduct && (
                    <>
                        <Text mb="md">
                            Are you sure you want to buy "{selectedProduct.name}"?
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
                    </>
                )}
            </Modal>

            {/* Rent Modal */}
            <Modal
                opened={actionType === 'rent'}
                onClose={() => setActionType(null)}
                title="Rent Product"
            >
                {selectedProduct && (
                    <form onSubmit={rentForm.onSubmit(handleRent)}>
                        <Text mb="md">
                            Rent "{selectedProduct.name}" - ${selectedProduct.priceRent}/{selectedProduct.rentOption?.toLowerCase()}
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
                                    value: selectedProduct.rentOption || 'DAILY',
                                    label: (selectedProduct.rentOption || 'DAILY').charAt(0) + (selectedProduct.rentOption || 'DAILY').slice(1).toLowerCase()
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
                )}
            </Modal>
        </Container>
    );
};

export default Products;