import { AppShell, Group, Button, Text, Avatar, Menu, UnstyledButton, Flex } from '@mantine/core';
import { IconPlus, IconList, IconHistory, IconLogout, IconUser, IconLogin } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 250,
                breakpoint: 'sm'
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Text size="xl" fw={700} c="blue">
                        Kinbay
                    </Text>

                    {isAuthenticated ? (
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group>
                                        <Avatar size="sm" />
                                        <Text size="sm">{user?.firstname} {user?.lastname}</Text>
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconUser size={14} />}
                                    onClick={() => navigate('/profile')}
                                >
                                    Profile
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    leftSection={<IconLogout size={14} />}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <Group>
                            <Button variant="subtle" component={Link} to="/login" leftSection={<IconLogin size={16} />}>
                                Login
                            </Button>
                            <Button component={Link} to="/register">
                                Register
                            </Button>
                        </Group>
                    )}
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Flex direction="column" gap="sm">
                    <Button
                        variant="light"
                        leftSection={<IconList size={16} />}
                        component={Link}
                        to="/products"
                        fullWidth
                        justify="flex-start"
                    >
                        All Products
                    </Button>

                    {isAuthenticated && (
                        <>
                            <Button
                                variant="light"
                                leftSection={<IconPlus size={16} />}
                                component={Link}
                                to="/add-product"
                                fullWidth
                                justify="flex-start"
                            >
                                Add Product
                            </Button>

                            <Button
                                variant="light"
                                leftSection={<IconUser size={16} />}
                                component={Link}
                                to="/dashboard"
                                fullWidth
                                justify="flex-start"
                            >
                                My Products
                            </Button>

                            <Button
                                variant="light"
                                leftSection={<IconHistory size={16} />}
                                component={Link}
                                to="/my-transactions"
                                fullWidth
                                justify="flex-start"
                            >
                                My Transactions
                            </Button>
                        </>
                    )}
                </Flex>
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
};

export default Layout;