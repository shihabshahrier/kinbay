import { useState } from 'react';
import { Card, Text, Button, Stack, PasswordInput, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@apollo/client';
import { notifications } from '@mantine/notifications';
import { IconLock, IconCheck, IconX } from '@tabler/icons-react';
import { UPDATE_USER } from '../lib/graphql';

const ChangePassword = () => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [updatePassword, { loading: updateLoading }] = useMutation(UPDATE_USER, {
        onCompleted: () => {
            notifications.show({
                title: 'Success',
                message: 'Password changed successfully!',
                color: 'green'
            });
            setIsChangingPassword(false);
            form.reset();
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        }
    });

    const form = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validate: {
            newPassword: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
            confirmPassword: (value, values) =>
                value !== values.newPassword ? 'Passwords do not match' : null,
        },
    });

    const handlePasswordChange = (values: typeof form.values) => {
        updatePassword({
            variables: {
                password: values.newPassword
            }
        });
    };

    const handleCancel = () => {
        form.reset();
        setIsChangingPassword(false);
    };

    return (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Group justify="space-between" align="center" mb="md">
                <Group>
                    <IconLock size={20} />
                    <Text fw={500} size="lg">Security</Text>
                </Group>
                {!isChangingPassword && (
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => setIsChangingPassword(true)}
                    >
                        Change Password
                    </Button>
                )}
            </Group>

            {!isChangingPassword ? (
                <Text size="sm" c="dimmed">
                    Click "Change Password" to update your account password.
                </Text>
            ) : (
                <form onSubmit={form.onSubmit(handlePasswordChange)}>
                    <Stack gap="md">
                        <PasswordInput
                            label="New Password"
                            placeholder="Enter new password"
                            {...form.getInputProps('newPassword')}
                            required
                        />

                        <PasswordInput
                            label="Confirm New Password"
                            placeholder="Confirm new password"
                            {...form.getInputProps('confirmPassword')}
                            required
                        />

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="light"
                                leftSection={<IconX size={16} />}
                                onClick={handleCancel}
                                disabled={updateLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                leftSection={<IconCheck size={16} />}
                                loading={updateLoading}
                            >
                                Update Password
                            </Button>
                        </Group>
                    </Stack>
                </form>
            )}
        </Card>
    );
};

export default ChangePassword;