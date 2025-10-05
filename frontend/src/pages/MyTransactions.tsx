import { Container, Title, Card, Text, Badge, Group, Alert, LoadingOverlay, Stack, Tabs } from '@mantine/core';
import { useQuery } from '@apollo/client';
import { IconAlertCircle, IconShoppingCart, IconCalendar, IconCash, IconHandGrab } from '@tabler/icons-react';
import { GET_USER_TRANSACTIONS } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import type { Transaction } from '../types';
import { TransactionType, TransactionStatus } from '../types';
import { formatDate, formatDateRange } from '../utils/dateUtils';

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

    // Using the shared date utility function

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

    // Calculate total transactions for empty state check
    const totalTransactions = (userTransactions.bought || []).length +
        (userTransactions.sold || []).length +
        (userTransactions.borrowed || []).length +
        (userTransactions.lent || []).length;

    const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
        // Handle cases where product or owner might be null/undefined
        const productName = transaction.product?.name || 'Unknown Product';

        // Handle different data structures for different transaction types
        let otherPartyName = 'Unknown';
        let labelText = '';

        // Determine if this is a bought/borrowed transaction (user is buyer) or sold/lent transaction (user is seller)
        const isBoughtOrBorrowed = (userTransactions.bought || []).some((t: Transaction) => t.id === transaction.id) ||
            (userTransactions.borrowed || []).some((t: Transaction) => t.id === transaction.id);

        if (isBoughtOrBorrowed) {
            // For bought/borrowed items, show the seller/owner
            otherPartyName = transaction.product?.owner
                ? `${transaction.product.owner.firstname || ''} ${transaction.product.owner.lastname || ''}`.trim() || 'Unknown'
                : 'Unknown';
            labelText = transaction.type === TransactionType.BUY ? 'Purchased from' : 'Rented from';
        } else {
            // For sold/lent items, show the buyer/borrower
            const transactionWithUser = transaction as Transaction & {
                user?: { firstname?: string; lastname?: string }
            };
            otherPartyName = transactionWithUser.user
                ? `${transactionWithUser.user.firstname || ''} ${transactionWithUser.user.lastname || ''}`.trim() || 'Unknown'
                : 'Unknown';
            labelText = transaction.type === TransactionType.BUY ? 'Sold to' : 'Lent to';
        }

        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                <Group justify="space-between" mb="xs">
                    <Group>
                        {getTypeIcon(transaction.type)}
                        <Text fw={500}>
                            {productName}
                        </Text>
                    </Group>
                    <Badge color={getStatusColor(transaction.status)}>
                        {transaction.status.toLowerCase()}
                    </Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="sm">
                    {labelText}: {otherPartyName}
                </Text>

                <Group justify="space-between" mb="sm">
                    <Text size="sm" fw={500}>
                        Price: ${transaction.price || 0}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {formatDate(transaction.createdAt)}
                    </Text>
                </Group>

                {transaction.type === TransactionType.RENT && (
                    <Text size="sm" c="dimmed">
                        Period: {formatDateRange(transaction.startDate, transaction.endDate)}
                    </Text>
                )}
            </Card>
        );
    };

    return (
        <Container size="lg">
            <Title mb="xl">My Transactions</Title>

            {totalTransactions === 0 ? (
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Text ta="center" c="dimmed">
                        You haven't made any transactions yet.
                    </Text>
                </Card>
            ) : (
                <Tabs defaultValue="bought">
                    <Tabs.List>
                        <Tabs.Tab value="bought" leftSection={<IconShoppingCart size={16} />}>
                            Bought ({(userTransactions.bought || []).length})
                        </Tabs.Tab>
                        <Tabs.Tab value="sold" leftSection={<IconCash size={16} />}>
                            Sold ({(userTransactions.sold || []).length})
                        </Tabs.Tab>
                        <Tabs.Tab value="borrowed" leftSection={<IconCalendar size={16} />}>
                            Borrowed ({(userTransactions.borrowed || []).length})
                        </Tabs.Tab>
                        <Tabs.Tab value="lent" leftSection={<IconHandGrab size={16} />}>
                            Lent ({(userTransactions.lent || []).length})
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="bought" pt="md">
                        <Title order={3} mb="md">Items I Bought</Title>
                        <Text size="sm" c="dimmed" mb="lg">
                            Products you purchased from others
                        </Text>
                        <Stack>
                            {(userTransactions.bought || []).length === 0 ? (
                                <Text c="dimmed" ta="center">You haven't bought any items yet</Text>
                            ) : (
                                (userTransactions.bought || []).map((transaction: Transaction) =>
                                    transaction && transaction.id ? (
                                        <TransactionCard key={transaction.id} transaction={transaction} />
                                    ) : null
                                )
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="sold" pt="md">
                        <Title order={3} mb="md">Items I Sold</Title>
                        <Text size="sm" c="dimmed" mb="lg">
                            Products you sold to others
                        </Text>
                        <Stack>
                            {(userTransactions.sold || []).length === 0 ? (
                                <Text c="dimmed" ta="center">You haven't sold any items yet</Text>
                            ) : (
                                (userTransactions.sold || []).map((transaction: Transaction) =>
                                    transaction && transaction.id ? (
                                        <TransactionCard key={transaction.id} transaction={transaction} />
                                    ) : null
                                )
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="borrowed" pt="md">
                        <Title order={3} mb="md">Items I Borrowed</Title>
                        <Text size="sm" c="dimmed" mb="lg">
                            Products you rented from others
                        </Text>
                        <Stack>
                            {(userTransactions.borrowed || []).length === 0 ? (
                                <Text c="dimmed" ta="center">You haven't borrowed any items yet</Text>
                            ) : (
                                (userTransactions.borrowed || []).map((transaction: Transaction) =>
                                    transaction && transaction.id ? (
                                        <TransactionCard key={transaction.id} transaction={transaction} />
                                    ) : null
                                )
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="lent" pt="md">
                        <Title order={3} mb="md">Items I Lent</Title>
                        <Text size="sm" c="dimmed" mb="lg">
                            Products you lent to others
                        </Text>
                        <Stack>
                            {(userTransactions.lent || []).length === 0 ? (
                                <Text c="dimmed" ta="center">You haven't lent any items yet</Text>
                            ) : (
                                (userTransactions.lent || []).map((transaction: Transaction) =>
                                    transaction && transaction.id ? (
                                        <TransactionCard key={transaction.id} transaction={transaction} />
                                    ) : null
                                )
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            )}
        </Container>
    );
};

export default MyTransactions;