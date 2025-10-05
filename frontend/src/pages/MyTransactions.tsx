import { Container, Title, Card, Text, Badge, Group, Alert, LoadingOverlay, Stack, Tabs } from '@mantine/core';
import { useQuery } from '@apollo/client';
import { IconAlertCircle, IconShoppingCart, IconCalendar } from '@tabler/icons-react';
import { GET_USER_TRANSACTIONS } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import type { Transaction } from '../types';
import { TransactionType, TransactionStatus } from '../types';

const MyTransactions = () => {
    const { user } = useAuth();

    const { data, loading, error } = useQuery(GET_USER_TRANSACTIONS, {
        errorPolicy: 'all',
        skip: !user?.id
    });

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case TransactionStatus.COMPLETED:
                return 'green';
            case TransactionStatus.PENDING:
                return 'orange';
            default:
                return 'gray';
        }
    };

    const getTypeIcon = (type: TransactionType) => {
        switch (type) {
            case TransactionType.BUY:
                return <IconShoppingCart size={16} />;
            case TransactionType.RENT:
                return <IconCalendar size={16} />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    };

    if (loading) return <LoadingOverlay visible />;

    if (error) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
                    Failed to load transactions: {error.message}
                </Alert>
            </Container>
        );
    }

    const userTransactions = data?.getUserTransactions || { bought: [], sold: [], borrowed: [], lent: [] };
    const transactions = [
        ...userTransactions.bought,
        ...userTransactions.sold,
        ...userTransactions.borrowed,
        ...userTransactions.lent
    ];
    const buyTransactions = transactions.filter((t: Transaction) => t.type === TransactionType.BUY);
    const rentTransactions = transactions.filter((t: Transaction) => t.type === TransactionType.RENT);

    const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
            <Group justify="space-between" mb="xs">
                <Group>
                    {getTypeIcon(transaction.type)}
                    <Text fw={500}>
                        {transaction.product.name}
                    </Text>
                </Group>
                <Badge color={getStatusColor(transaction.status)}>
                    {transaction.status.toLowerCase()}
                </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="sm">
                Seller: {transaction.product.owner.firstname} {transaction.product.owner.lastname}
            </Text>

            <Group justify="space-between" mb="sm">
                <Text size="sm" fw={500}>
                    Price: ${transaction.price}
                </Text>
                <Text size="sm" c="dimmed">
                    {formatDate(transaction.createdAt)}
                </Text>
            </Group>

            {transaction.type === TransactionType.RENT && (
                <Text size="sm" c="dimmed">
                    Period: {formatDate(transaction.startDate)} - {formatDate(transaction.endDate)}
                </Text>
            )}
        </Card>
    );

    return (
        <Container size="lg">
            <Title mb="xl">My Transactions</Title>

            {transactions.length === 0 ? (
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Text ta="center" c="dimmed">
                        You haven't made any transactions yet.
                    </Text>
                </Card>
            ) : (
                <Tabs defaultValue="all">
                    <Tabs.List>
                        <Tabs.Tab value="all">All ({transactions.length})</Tabs.Tab>
                        <Tabs.Tab value="purchases" leftSection={<IconShoppingCart size={16} />}>
                            Purchases ({buyTransactions.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="rentals" leftSection={<IconCalendar size={16} />}>
                            Rentals ({rentTransactions.length})
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="all" pt="md">
                        <Stack>
                            {transactions.map((transaction: Transaction) => (
                                <TransactionCard key={transaction.id} transaction={transaction} />
                            ))}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="purchases" pt="md">
                        <Stack>
                            {buyTransactions.length === 0 ? (
                                <Text c="dimmed" ta="center">No purchase transactions</Text>
                            ) : (
                                buyTransactions.map((transaction: Transaction) => (
                                    <TransactionCard key={transaction.id} transaction={transaction} />
                                ))
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="rentals" pt="md">
                        <Stack>
                            {rentTransactions.length === 0 ? (
                                <Text c="dimmed" ta="center">No rental transactions</Text>
                            ) : (
                                rentTransactions.map((transaction: Transaction) => (
                                    <TransactionCard key={transaction.id} transaction={transaction} />
                                ))
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            )}
        </Container>
    );
};

export default MyTransactions;