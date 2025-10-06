import { useState } from 'react';
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Alert, Grid } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
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
            <Container size={580} style={{ width: '100%', maxWidth: '580px' }}>
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
                            Join Kinbay
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

                            {success && (
                                <Alert
                                    icon={<IconCheck size="1rem" />}
                                    title="Success!"
                                    color="green"
                                    mb="md"
                                    className="glass"
                                    radius="lg"
                                >
                                    Account created successfully!
                                </Alert>
                            )}

                            <Grid>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="First Name"
                                        placeholder="John"
                                        required
                                        size="md"
                                        {...form.getInputProps('firstname')}
                                        classNames={{
                                            label: 'text-white font-semibold mb-2',
                                        }}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Last Name"
                                        placeholder="Doe"
                                        required
                                        size="md"
                                        {...form.getInputProps('lastname')}
                                        classNames={{
                                            label: 'text-white font-semibold mb-2',
                                        }}
                                    />
                                </Grid.Col>
                            </Grid>

                            <TextInput
                                label="Email"
                                placeholder="your@email.com"
                                required
                                mt="md"
                                size="md"
                                {...form.getInputProps('email')}
                                classNames={{
                                    label: 'text-white font-semibold mb-2',
                                }}
                            />

                            <TextInput
                                label="Address"
                                placeholder="123 Main Street, City"
                                required
                                mt="md"
                                size="md"
                                {...form.getInputProps('address')}
                                classNames={{
                                    label: 'text-white font-semibold mb-2',
                                }}
                            />

                            <TextInput
                                label="Phone"
                                placeholder="+1 234 567 8900"
                                required
                                mt="md"
                                size="md"
                                {...form.getInputProps('phone')}
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

                            <PasswordInput
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                required
                                mt="md"
                                size="md"
                                {...form.getInputProps('confirmPassword')}
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
                                Create Account
                            </Button>
                        </form>

                        <Text size="sm" ta="center" mt={30} className="text-white/80">
                            Already have an account?{' '}
                            <Text
                                component={Link}
                                to="/login"
                                className="text-ebay-blue font-semibold hover:underline"
                                style={{ cursor: 'pointer' }}
                            >
                                Sign in
                            </Text>
                        </Text>
                    </Paper>
                </motion.div>
            </Container>
        </div>
    );
};

export default Register;