import { useState } from 'react';
import { Container, Title, Card, Text, Button, Group, Alert, TextInput, Stack, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@apollo/client';
import { notifications } from '@mantine/notifications';
import { IconUser, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { UPDATE_USER } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import ChangePassword from '../components/ChangePassword';
import type { User } from '../types';

const Profile = () => {
    const { user, refetchUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
        onCompleted: () => {
            notifications.show({
                title: 'Success',
                message: 'Profile updated successfully!',
                color: 'green'
            });
            setIsEditing(false);
            refetchUser();
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        }
    });

    const form = useForm<Omit<User, 'id'>>({
        initialValues: {
            email: user?.email || '',
            firstname: user?.firstname || '',
            lastname: user?.lastname || '',
            address: user?.address || '',
            phone: user?.phone || '',
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            firstname: (value) => (value.trim().length > 0 ? null : 'First name is required'),
            lastname: (value) => (value.trim().length > 0 ? null : 'Last name is required'),
            phone: (value) => (value.trim().length > 0 ? null : 'Phone number is required'),
            address: (value) => (value.trim().length > 0 ? null : 'Address is required'),
        },
    });

    const handleSave = (values: Omit<User, 'id'>) => {
        updateUser({
            variables: {
                email: values.email,
                firstname: values.firstname,
                lastname: values.lastname,
                address: values.address,
                phone: values.phone,
            }
        });
    };

    const handleCancel = () => {
        form.reset();
        setIsEditing(false);
    };

    const startEditing = () => {
        form.setValues({
            email: user?.email || '',
            firstname: user?.firstname || '',
            lastname: user?.lastname || '',
            address: user?.address || '',
            phone: user?.phone || '',
        });
        setIsEditing(true);
    };

    if (!user) {
        return (
            <Container size="sm">
                <Alert color="orange">
                    Please log in to view your profile.
                </Alert>
            </Container>
        );
    }

    return (
        <Container size="sm">
            <Group justify="space-between" align="center" mb="xl">
                <Group>
                    <IconUser size={28} />
                    <Title order={2}>My Profile</Title>
                </Group>
                {!isEditing && (
                    <Button
                        leftSection={<IconEdit size={16} />}
                        onClick={startEditing}
                        variant="light"
                    >
                        Edit Profile
                    </Button>
                )}
            </Group>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
                {!isEditing ? (
                    <Stack gap="md">
                        <div>
                            <Text size="sm" c="dimmed" mb={5}>Email</Text>
                            <Text fw={500}>{user.email}</Text>
                        </div>

                        <Divider />

                        <Group grow>
                            <div>
                                <Text size="sm" c="dimmed" mb={5}>First Name</Text>
                                <Text fw={500}>{user.firstname}</Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed" mb={5}>Last Name</Text>
                                <Text fw={500}>{user.lastname}</Text>
                            </div>
                        </Group>

                        <Divider />

                        <div>
                            <Text size="sm" c="dimmed" mb={5}>Phone Number</Text>
                            <Text fw={500}>{user.phone}</Text>
                        </div>

                        <div>
                            <Text size="sm" c="dimmed" mb={5}>Address</Text>
                            <Text fw={500}>{user.address}</Text>
                        </div>
                    </Stack>
                ) : (
                    <form onSubmit={form.onSubmit(handleSave)}>
                        <Stack gap="md">
                            <TextInput
                                label="Email"
                                placeholder="Enter your email"
                                {...form.getInputProps('email')}
                                required
                            />

                            <Group grow>
                                <TextInput
                                    label="First Name"
                                    placeholder="Enter your first name"
                                    {...form.getInputProps('firstname')}
                                    required
                                />
                                <TextInput
                                    label="Last Name"
                                    placeholder="Enter your last name"
                                    {...form.getInputProps('lastname')}
                                    required
                                />
                            </Group>

                            <TextInput
                                label="Phone Number"
                                placeholder="Enter your phone number"
                                {...form.getInputProps('phone')}
                                required
                            />

                            <TextInput
                                label="Address"
                                placeholder="Enter your address"
                                {...form.getInputProps('address')}
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
                                    Save Changes
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                )}
            </Card>

            {/* Change Password Section */}
            <div style={{ marginTop: '1.5rem' }}>
                <ChangePassword />
            </div>
        </Container>
    );
};

export default Profile;