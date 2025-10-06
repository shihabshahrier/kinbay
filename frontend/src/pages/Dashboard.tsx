import { Container, Title, Card, Text, Badge, Button, Grid, Group, Alert, LoadingOverlay, Menu } from '@mantine/core';
import { useQuery } from '@apollo/client';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconEdit, IconTrash, IconPlus, IconDots } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GET_MY_PRODUCTS } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import { useProductMutations } from '../hooks/useCacheUpdates';
import type { Product } from '../types';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data, loading, error } = useQuery(GET_MY_PRODUCTS, {
        errorPolicy: 'all',
        skip: !user?.id
    });

    const { deleteProduct, deleteLoading } = useProductMutations();

    const handleEdit = (productId: string) => {
        navigate(`/edit-product/${productId}`);
    };

    const handleDelete = async (product: Product) => {
        modals.openConfirmModal({
            title: 'Delete Product',
            children: (
                <Text size="sm">
                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await deleteProduct({ variables: { id: product.id } });
                    notifications.show({
                        title: 'Success',
                        message: 'Product deleted successfully',
                        color: 'green',
                    });
                } catch {
                    notifications.show({
                        title: 'Error',
                        message: 'Failed to delete product',
                        color: 'red',
                    });
                }
            },
        });
    };

    const handleAddProduct = () => {
        navigate('/add-product');
    };

    if (loading) return <LoadingOverlay visible />;

    if (error) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
                    Failed to load your products: {error.message}
                </Alert>
            </Container>
        );
    }

    const products = data?.getProductsByOwner || [];

    return (
        <Container size="xl" className="pb-20 md:pb-0">
            <Group justify="space-between" mb="xl">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Title className="text-white text-4xl font-bold">My Products</Title>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Button
                        leftSection={<IconPlus size={18} />}
                        onClick={handleAddProduct}
                        size="md"
                        className="glass-button"
                    >
                        Add Product
                    </Button>
                </motion.div>
            </Group>

            {products.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card shadow="sm" padding="xl" radius="xl" className="glass-card text-center">
                        <Text size="xl" className="text-white/80 mb-4">
                            You haven't created any products yet.
                        </Text>
                        <Group justify="center" mt="md">
                            <Button
                                onClick={handleAddProduct}
                                size="lg"
                                className="glass-button"
                                leftSection={<IconPlus size={20} />}
                            >
                                Create Your First Product
                            </Button>
                        </Group>
                    </Card>
                </motion.div>
            ) : (
                <Grid>
                    {products.map((product: Product, index: number) => (
                        <Grid.Col key={product.id} span={{ base: 12, md: 6, lg: 4 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, y: -8 }}
                            >
                                <Card shadow="sm" padding="lg" radius="xl" className="glass-card h-full">
                                    <Group justify="space-between" mb="xs">
                                        <Text fw={600} size="xl" className="text-white">
                                            {product.name}
                                        </Text>
                                        <Menu shadow="md" width={200} position="bottom-end">
                                            <Menu.Target>
                                                <Button
                                                    variant="subtle"
                                                    size="compact-sm"
                                                    p={4}
                                                    className="glass hover:bg-white/20 rounded-lg"
                                                >
                                                    <IconDots size={20} className="text-white" />
                                                </Button>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item
                                                    leftSection={<IconEdit size={16} />}
                                                    onClick={() => handleEdit(product.id)}
                                                >
                                                    Edit
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconTrash size={16} />}
                                                    color="red"
                                                    onClick={() => handleDelete(product)}
                                                >
                                                    Delete
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Group>

                                    <Text size="sm" c="dimmed" mb="sm" className="text-white/80">
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
                                            {!product.priceBuy && !product.priceRent && (
                                                <Text size="sm" className="text-orange-400">Not for sale/rent</Text>
                                            )}
                                        </div>
                                    </Group>

                                    <Group mt="md" gap="xs">
                                        <Button
                                            size="sm"
                                            variant="light"
                                            leftSection={<IconEdit size={16} />}
                                            onClick={() => handleEdit(product.id)}
                                            className="glass hover:bg-white/20 flex-1"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="red"
                                            variant="light"
                                            leftSection={<IconTrash size={16} />}
                                            onClick={() => handleDelete(product)}
                                            loading={deleteLoading}
                                            className="glass hover:bg-red-500/30 flex-1"
                                        >
                                            Delete
                                        </Button>
                                    </Group>
                                </Card>
                            </motion.div>
                        </Grid.Col>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Dashboard;