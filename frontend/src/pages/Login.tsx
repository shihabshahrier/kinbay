import { useState } from 'react';
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { GET_TOKEN } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import type { LoginFormData } from '../types';

const Login = () => {
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [getToken, { loading }] = useLazyQuery(GET_TOKEN, {
        onCompleted: (data) => {
            if (data.getToken) {
                login(data.getToken);
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const form = useForm<LoginFormData>({
        initialValues: {
            email: '',
            password: '',
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: (value) => (value.length < 6 ? 'Password must have at least 6 letters' : null),
        },
    });

    const handleSubmit = (values: LoginFormData) => {
        setError(null);
        getToken({
            variables: {
                email: values.email,
                password: values.password,
            }
        });
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center" mb="xl">
                Welcome back to Kinbay
            </Title>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {error && (
                        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" mb="md">
                            {error}
                        </Alert>
                    )}

                    <TextInput
                        label="Email"
                        placeholder="your@email.com"
                        required
                        {...form.getInputProps('email')}
                    />

                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        required
                        mt="md"
                        {...form.getInputProps('password')}
                    />

                    <Button type="submit" fullWidth mt="xl" loading={loading}>
                        Sign in
                    </Button>
                </form>

                <Text c="dimmed" size="sm" ta="center" mt={30}>
                    Don't have an account yet?{' '}
                    <Text component={Link} to="/register" c="blue" style={{ cursor: 'pointer' }}>
                        Create account
                    </Text>
                </Text>
            </Paper>
        </Container>
    );
};

export default Login;