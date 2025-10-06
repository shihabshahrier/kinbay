import { useState } from 'react';
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { GET_TOKEN } from '../lib/graphql';
import { useAuth } from '../hooks/useAuth';
import { AuthService } from '../services/auth';
import type { LoginFormData } from '../types';

const Login = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login, loginNew } = useAuth();
    const navigate = useNavigate();

    // Legacy login query for fallback
    const [getToken] = useLazyQuery(GET_TOKEN, {
        onCompleted: (data) => {
            if (data.getToken) {
                login(data.getToken);
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            setError(error.message);
            setLoading(false);
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

    const handleSubmit = async (values: LoginFormData) => {
        setError(null);
        setLoading(true);

        try {
            if (AuthService.shouldUseNewAuth()) {
                // Use new 2-token authentication system
                await loginNew(values.email, values.password);
                navigate('/dashboard');
            } else {
                // Fallback to legacy system
                getToken({
                    variables: {
                        email: values.email,
                        password: values.password,
                    }
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div
            className="mobile-full-height"
            style={{
                minHeight: '100dvh', // Use dynamic viewport height for mobile (fallback to 100vh automatically)
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                position: 'relative',
                overflow: 'auto',
                width: '100%'
            }}
        >
            <Container size={480} style={{ width: '100%', maxWidth: '480px' }}>
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        padding: '1rem 0',
                        minHeight: 'fit-content',
                        width: '100%'
                    }}
                >
                    <div className="text-center mb-8">
                        <div className="kinbay-logo text-5xl mb-4 inline-block">
                            <span className="letter-k">K</span>
                            <span className="letter-i">i</span>
                            <span className="letter-n">n</span>
                            <span className="letter-b">b</span>
                            <span className="letter-a">a</span>
                            <span className="letter-y">y</span>
                        </div>
                        <Title ta="center" className="text-white text-3xl">
                            Welcome back
                        </Title>
                    </div>

                    <Paper className="glass-card" p={{ base: 20, sm: 40 }} radius="xl">
                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            {error && (
                                <Alert
                                    icon={<IconAlertCircle size="1rem" />}
                                    title="Error!"
                                    color="red"
                                    mb="md"
                                    className="glass"
                                    radius="lg"
                                >
                                    {error}
                                </Alert>
                            )}

                            <TextInput
                                label="Email"
                                placeholder="your@email.com"
                                required
                                size="md"
                                {...form.getInputProps('email')}
                                classNames={{
                                    label: 'text-white font-semibold mb-2',
                                }}
                            />

                            <PasswordInput
                                label="Password"
                                placeholder="Your password"
                                required
                                mt="md"
                                size="md"
                                {...form.getInputProps('password')}
                                classNames={{
                                    label: 'text-white font-semibold mb-2',
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                mt="xl"
                                loading={loading}
                                size="lg"
                                className="glass-button"
                            >
                                Sign in
                            </Button>
                        </form>

                        <Text size="sm" ta="center" mt={30} className="text-white/80">
                            Don't have an account yet?{' '}
                            <Text
                                component={Link}
                                to="/register"
                                className="text-ebay-blue font-semibold hover:underline"
                                style={{ cursor: 'pointer' }}
                            >
                                Create account
                            </Text>
                        </Text>
                    </Paper>
                </motion.div>
            </Container>
        </div>
    );
};

export default Login;