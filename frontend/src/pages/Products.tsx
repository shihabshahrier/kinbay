import { useState } from 'react';
import { Container, Title, Card, Text, Badge, Button, Grid, Group, Alert, LoadingOverlay, NumberInput, Modal, Select } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { DatePickerInput } from '@mantine/dates';
import { useQuery, ApolloError } from '@apollo/client';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconShoppingCart, IconCalendar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { GET_ALL_PRODUCTS } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import { useTransactionMutations } from '../hooks/useCacheUpdates';
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

    const handleBuy = async () => {
        if (!selectedProduct || !isAuthenticated) return;

        try {
            await buyProduct({
                variables: {
                    productId: selectedProduct.id,
                    price: buyPrice || selectedProduct.priceBuy || 0
                }
            });
            notifications.show({
                title: 'Success',
                message: 'Purchase request sent successfully!',
                color: 'green'
            });
            setActionType(null);
            setSelectedProduct(null);
        } catch (error) {
            // Handle Apollo GraphQL errors
            let errorMessage = 'Failed to send purchase request';

            if (error instanceof ApolloError) {
                if (error.graphQLErrors.length > 0) {
                    errorMessage = error.graphQLErrors[0].message;
                } else if (error.networkError) {
                    errorMessage = 'Network error occurred';
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            notifications.show({
                title: 'Purchase Failed',
                message: errorMessage,
                color: 'red'
            });
        }
    };

    const handleRent = async (values: RentFormData) => {
        if (!selectedProduct || !isAuthenticated || !values.startDate) return;

        // Ensure startDate is a proper Date object
        const startDate = values.startDate instanceof Date ? values.startDate : new Date(values.startDate);
        const endDate = calculateEndDate(startDate, values.duration, values.rentOption);
        const totalPrice = calculateTotalPrice();

        try {
            const result = await rentProduct({
                variables: {
                    productId: selectedProduct.id,
                    price: totalPrice,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });

            // Check for GraphQL errors first
            if (result.errors && result.errors.length > 0) {
                notifications.show({
                    title: 'Rental Failed',
                    message: result.errors[0].message,
                    color: 'red'
                });
                return;
            }

            // Check if the mutation actually succeeded
            if (result.data?.rentProduct) {
                notifications.show({
                    title: 'Success',
                    message: 'Rental request sent successfully!',
                    color: 'green'
                });
                setActionType(null);
                setSelectedProduct(null);
                rentForm.reset();
            } else {
                // If data is null, there was an error but no exception was thrown
                notifications.show({
                    title: 'Rental Failed',
                    message: 'Failed to send rental request',
                    color: 'red'
                });
            }
        } catch (error) {
            // Handle Apollo GraphQL errors
            console.log('Rental error caught:', error);
            let errorMessage = 'Failed to send rental request';

            if (error instanceof ApolloError) {
                console.log('Apollo error detected:', error.graphQLErrors);
                if (error.graphQLErrors.length > 0) {
                    errorMessage = error.graphQLErrors[0].message;
                    console.log('Using GraphQL error message:', errorMessage);
                } else if (error.networkError) {
                    errorMessage = 'Network error occurred';
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
                console.log('Using standard error message:', errorMessage);
            }

            notifications.show({
                title: 'Rental Failed',
                message: errorMessage,
                color: 'red'
            });
        }
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
        <Container size="xl" className="pb-20 md:pb-0">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Title mb="xl" className="text-white text-4xl font-bold">All Products</Title>
            </motion.div>

            <Grid>
                {products.map((product: Product, index: number) => (
                    <Grid.Col key={product.id} span={{ base: 12, md: 6, lg: 4 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                                scale: 1.02,
                                y: -8
                            }}
                        >
                            <Card
                                shadow="sm"
                                padding="lg"
                                radius="xl"
                                className="glass-card cursor-pointer h-full"
                                onClick={() => navigate(`/products/${product.id}`)}
                            >
                                <Text fw={600} size="xl" mb="xs" className="text-white">
                                    {product.name}
                                </Text>

                                <Text size="sm" c="dimmed" mb="sm" className="text-white/80 line-clamp-2">
                                    {product.description}
                                </Text>

                                <Group mb="sm" gap="xs">
                                    {product.categories.map((category) => (
                                        <Badge
                                            key={category.id}
                                            variant="light"
                                            className="glass-badge"
                                            size="lg"
                                        >
                                            {category.name}
                                        </Badge>
                                    ))}
                                </Group>

                                <Text size="sm" mb="sm" className="text-white/70">
                                    <span className="font-semibold">Owner:</span> {product.owner.firstname} {product.owner.lastname}
                                </Text>

                                <Group justify="space-between" mt="md" className="pt-3 border-t border-white/20">
                                    <div>
                                        {product.priceBuy && (
                                            <Text size="md" fw={600} className="text-white">
                                                Buy: <span className="text-ebay-yellow">${product.priceBuy}</span>
                                            </Text>
                                        )}
                                        {product.priceRent && (
                                            <Text size="md" fw={600} className="text-white">
                                                Rent: <span className="text-ebay-green">${product.priceRent}</span>
                                                <span className="text-white/60">/{product.rentOption?.toLowerCase()}</span>
                                            </Text>
                                        )}
                                    </div>
                                    <Text size="xs" className="text-white/80 underline hover:text-white transition-colors">
                                        View Details →
                                    </Text>
                                </Group>

                                {isAuthenticated && user?.id !== product.ownerId && (
                                    <Group mt="md" gap="xs">
                                        {product.priceBuy && (
                                            <Button
                                                size="sm"
                                                leftSection={<IconShoppingCart size={16} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openBuyModal(product);
                                                }}
                                                className="glass-button flex-1"
                                            >
                                                Buy Now
                                            </Button>
                                        )}
                                        {product.priceRent && (
                                            <Button
                                                size="sm"
                                                variant="light"
                                                leftSection={<IconCalendar size={16} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openRentModal(product);
                                                }}
                                                className="glass hover:bg-white/20 flex-1"
                                            >
                                                Rent
                                            </Button>
                                        )}
                                    </Group>
                                )}
                            </Card>
                        </motion.div>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Buy Modal */}
            <Modal
                opened={actionType === 'buy'}
                onClose={() => setActionType(null)}
                title="Purchase Product"
                centered
                radius="xl"
                overlayProps={{ blur: 4 }}
            >
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Text mb="md" className="text-white text-lg">
                            Are you sure you want to buy <span className="font-semibold">"{selectedProduct.name}"</span>?
                        </Text>
                        <NumberInput
                            label="Price"
                            value={buyPrice}
                            onChange={(value) => setBuyPrice(Number(value) || 0)}
                            min={0}
                            prefix="$"
                            mb="md"
                            size="md"
                            className="glass-input"
                        />
                        <Group justify="flex-end" gap="sm">
                            <Button
                                variant="light"
                                onClick={() => setActionType(null)}
                                className="glass hover:bg-white/20"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBuy}
                                loading={buyLoading}
                                className="glass-button"
                            >
                                Confirm Purchase
                            </Button>
                        </Group>
                    </motion.div>
                )}
            </Modal>

            {/* Rent Modal */}
            <Modal
                opened={actionType === 'rent'}
                onClose={() => setActionType(null)}
                title="Rent Product"
                centered
                radius="xl"
                overlayProps={{ blur: 4 }}
            >
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={rentForm.onSubmit(handleRent)}>
                            <Text mb="md" className="text-white text-lg">
                                Rent <span className="font-semibold">"{selectedProduct.name}"</span> -
                                <span className="text-ebay-green"> ${selectedProduct.priceRent}</span>
                                <span className="text-white/70">/{selectedProduct.rentOption?.toLowerCase()}</span>
                            </Text>

                            <DatePickerInput
                                label="Start Date"
                                placeholder="Pick start date"
                                {...rentForm.getInputProps('startDate')}
                                mb="md"
                                minDate={new Date()}
                                size="md"
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
                                size="md"
                            />

                            <NumberInput
                                label={`Duration (${rentForm.values.rentOption.toLowerCase()}s)`}
                                placeholder="Enter duration"
                                {...rentForm.getInputProps('duration')}
                                min={1}
                                mb="md"
                                size="md"
                            />

                            {rentForm.values.startDate && rentForm.values.duration > 0 && (
                                <div className="glass rounded-xl p-4 mb-md">
                                    <Text size="sm" className="text-white/90 mb-2">
                                        <span className="font-semibold">End Date:</span> {calculateEndDate(rentForm.values.startDate, rentForm.values.duration, rentForm.values.rentOption).toLocaleDateString()}
                                    </Text>
                                    <Text size="md" fw={600} className="text-ebay-yellow">
                                        Total: ${calculateTotalPrice()}
                                    </Text>
                                </div>
                            )}

                            <Group justify="flex-end" gap="sm" mt="lg">
                                <Button
                                    variant="light"
                                    onClick={() => setActionType(null)}
                                    className="glass hover:bg-white/20"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={rentLoading}
                                    className="glass-button"
                                >
                                    Confirm Rental
                                </Button>
                            </Group>
                        </form>
                    </motion.div>
                )}
            </Modal>
        </Container>
    );
};

export default Products;