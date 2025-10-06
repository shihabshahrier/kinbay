import { Container, Title, Card, Text, Badge, Button, Group, Alert, LoadingOverlay, Stack } from '@mantine/core';
import { useQuery } from '@apollo/client';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconShoppingCart, IconCalendar, IconCheck } from '@tabler/icons-react';
import { GET_PENDING_TRANSACTIONS_FOR_OWNER } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import { useTransactionMutations } from '../hooks/useCacheUpdates';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { formatDate, formatDateRange } from '../utils/dateUtils';

const PendingApprovals = () => {
    const { user } = useAuth();

    const { data, loading, error } = useQuery(GET_PENDING_TRANSACTIONS_FOR_OWNER, {
        errorPolicy: 'all',
        skip: !user?.id
    });

    const { completeTransaction, completeLoading } = useTransactionMutations();

    // Using shared date utility functions

    const handleApprove = async (transactionId: string) => {
        try {
            await completeTransaction({
                variables: { id: transactionId }
            });
            notifications.show({
                title: 'Success',
                message: 'Transaction approved successfully!',
                color: 'green'
            });
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Failed to approve transaction',
                color: 'red'
            });
        }
    };

    if (loading) return <LoadingOverlay visible />;

    if (error) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
                    Failed to load pending approvals: {error.message}
                </Alert>
            </Container>
        );
    }

    const pendingTransactions = data?.getPendingTransactionsForOwner || [];

    const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
        const isRental = transaction.type === TransactionType.RENT;

        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                <Group justify="space-between" align="flex-start" mb="xs">
                    <Group>
                        {isRental ? <IconCalendar size={20} /> : <IconShoppingCart size={20} />}
                        <div>
                            <Text fw={500} size="lg">
                                {transaction.product?.name || 'Unknown Product'}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {isRental ? 'Rental Request' : 'Purchase Request'}
                            </Text>
                        </div>
                    </Group>
                    <Badge color="orange">Pending Approval</Badge>
                </Group>

                <Text size="sm" mb="sm">
                    <strong>Customer:</strong> {transaction.user?.firstname} {transaction.user?.lastname} ({transaction.user?.email})
                </Text>

                <Group justify="space-between" mb="sm">
                    <Text size="sm" fw={500}>
                        Price: ${transaction.price || 0}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Requested: {formatDate(transaction.createdAt)}
                    </Text>
                </Group>

                {isRental && (
                    <Text size="sm" c="dimmed" mb="sm">
                        <strong>Rental Period:</strong> {formatDateRange(transaction.startDate, transaction.endDate)}
                    </Text>
                )}

                <Group justify="flex-end" mt="md">
                    <Button
                        leftSection={<IconCheck size={16} />}
                        color="green"
                        loading={completeLoading}
                        onClick={() => handleApprove(transaction.id)}
                    >
                        Approve
                    </Button>
                </Group>
            </Card>
        );
    };

    return (
        <Container size="md">
            <Title mb="xl">Pending Approvals</Title>
            <Text size="sm" c="dimmed" mb="lg">
                Approve purchase and rental requests for your products
            </Text>

            {pendingTransactions.length === 0 ? (
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Text ta="center" c="dimmed">
                        No pending transactions to approve.
                    </Text>
                </Card>
            ) : (
                <Stack>
                    {pendingTransactions.map((transaction: Transaction) => (
                        <TransactionCard key={transaction.id} transaction={transaction} />
                    ))}
                </Stack>
            )}
        </Container>
    );
};

export default PendingApprovals;