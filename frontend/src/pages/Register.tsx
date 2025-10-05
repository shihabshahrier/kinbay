import { useState } from 'react';
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Alert, Grid } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { CREATE_USER } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import type { RegisterFormData } from '../types';

const Register = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [createUser, { loading }] = useMutation(CREATE_USER, {
        onCompleted: (data) => {
            if (data.createUser) {
                setSuccess(true);
                login(data.createUser);
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const form = useForm<RegisterFormData>({
        initialValues: {
            email: '',
            firstname: '',
            lastname: '',
            address: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            firstname: (value) => (value.length < 2 ? 'First name must have at least 2 letters' : null),
            lastname: (value) => (value.length < 2 ? 'Last name must have at least 2 letters' : null),
            address: (value) => (value.length < 5 ? 'Address must be at least 5 characters' : null),
            phone: (value) => (!value ? 'Phone number is required' : null),
            password: (value) => (value.length < 6 ? 'Password must have at least 6 letters' : null),
            confirmPassword: (value, values) =>
                value !== values.password ? 'Passwords did not match' : null,
        },
    });

    const handleSubmit = (values: RegisterFormData) => {
        setError(null);
        createUser({
            variables: {
                email: values.email,
                firstname: values.firstname,
                lastname: values.lastname,
                address: values.address,
                phone: values.phone,
                password: values.password,
            }
        });
    };

    return (
        <Container size={500} my={40}>
            <Title ta="center" mb="xl">
                Join Kinbay
            </Title>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {error && (
                        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" mb="md">
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert icon={<IconCheck size="1rem" />} title="Success!" color="green" mb="md">
                            Account created successfully!
                        </Alert>
                    )}

                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="First Name"
                                placeholder="John"
                                required
                                {...form.getInputProps('firstname')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Last Name"
                                placeholder="Doe"
                                required
                                {...form.getInputProps('lastname')}
                            />
                        </Grid.Col>
                    </Grid>

                    <TextInput
                        label="Email"
                        placeholder="your@email.com"
                        required
                        mt="md"
                        {...form.getInputProps('email')}
                    />

                    <TextInput
                        label="Address"
                        placeholder="123 Main Street, City"
                        required
                        mt="md"
                        {...form.getInputProps('address')}
                    />

                    <TextInput
                        label="Phone"
                        placeholder="+1 234 567 8900"
                        required
                        mt="md"
                        {...form.getInputProps('phone')}
                    />

                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        required
                        mt="md"
                        {...form.getInputProps('password')}
                    />

                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        required
                        mt="md"
                        {...form.getInputProps('confirmPassword')}
                    />

                    <Button type="submit" fullWidth mt="xl" loading={loading}>
                        Create Account
                    </Button>
                </form>

                <Text c="dimmed" size="sm" ta="center" mt={30}>
                    Already have an account?{' '}
                    <Text component={Link} to="/login" c="blue" style={{ cursor: 'pointer' }}>
                        Sign in
                    </Text>
                </Text>
            </Paper>
        </Container>
    );
};

export default Register;