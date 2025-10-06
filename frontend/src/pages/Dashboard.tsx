import { Container, Title, Card, Text, Badge, Button, Grid, Group, Alert, LoadingOverlay, Menu } from '@mantine/core';
import { useQuery } from '@apollo/client';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconEdit, IconTrash, IconPlus, IconDots } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useNavigate } from 'react-router-dom';
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
        <Container size="lg">
            <Group justify="space-between" mb="xl">
                <Title>My Products</Title>
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddProduct}
                >
                    Add Product
                </Button>
            </Group>

            {products.length === 0 ? (
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Text ta="center" c="dimmed">
                        You haven't created any products yet.
                    </Text>
                    <Group justify="center" mt="md">
                        <Button onClick={handleAddProduct}>
                            Create Your First Product
                        </Button>
                    </Group>
                </Card>
            ) : (
                <Grid>
                    {products.map((product: Product) => (
                        <Grid.Col key={product.id} span={{ base: 12, md: 6, lg: 4 }}>
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Group justify="space-between" mb="xs">
                                    <Text fw={500} size="lg">
                                        {product.name}
                                    </Text>
                                    <Menu shadow="md" width={200} position="bottom-end">
                                        <Menu.Target>
                                            <Button variant="subtle" size="compact-sm" p={0}>
                                                <IconDots size={16} />
                                            </Button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconEdit size={14} />}
                                                onClick={() => handleEdit(product.id)}
                                            >
                                                Edit
                                            </Menu.Item>
                                            <Menu.Item
                                                leftSection={<IconTrash size={14} />}
                                                color="red"
                                                onClick={() => handleDelete(product)}
                                            >
                                                Delete
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>

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

                                <Group justify="space-between" mt="md">
                                    <div>
                                        {product.priceBuy && (
                                            <Text size="sm" fw={500}>Buy: ${product.priceBuy}</Text>
                                        )}
                                        {product.priceRent && (
                                            <Text size="sm" fw={500}>
                                                Rent: ${product.priceRent}/{product.rentOption?.toLowerCase()}
                                            </Text>
                                        )}
                                        {!product.priceBuy && !product.priceRent && (
                                            <Text size="sm" c="orange">Not for sale/rent</Text>
                                        )}
                                    </div>
                                </Group>

                                <Group mt="md" gap="xs">
                                    <Button
                                        size="xs"
                                        variant="light"
                                        leftSection={<IconEdit size={14} />}
                                        onClick={() => handleEdit(product.id)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="xs"
                                        color="red"
                                        variant="light"
                                        leftSection={<IconTrash size={14} />}
                                        onClick={() => handleDelete(product)}
                                        loading={deleteLoading}
                                    >
                                        Delete
                                    </Button>
                                </Group>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Dashboard;