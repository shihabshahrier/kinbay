import { AppShell, Group, Button, Text, Avatar, Menu, UnstyledButton, Flex } from '@mantine/core';
import { IconPlus, IconList, IconHistory, IconLogout, IconUser, IconLogin, IconCheck } from '@tabler/icons-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <AppShell
            header={{ height: { base: 60, sm: 70 } }}
            navbar={{
                width: 280,
                breakpoint: 'sm'
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between" className="glass-navbar" gap="sm">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to="/products" style={{ textDecoration: 'none' }}>
                            <div className="kinbay-logo">
                                <span className="letter-k">K</span>
                                <span className="letter-i">i</span>
                                <span className="letter-n">n</span>
                                <span className="letter-b">b</span>
                                <span className="letter-a">a</span>
                                <span className="letter-y">y</span>
                            </div>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {isAuthenticated ? (
                            <Menu shadow="md" width={220}>
                                <Menu.Target>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <UnstyledButton className="profile-button">
                                            <Group gap="sm" wrap="nowrap">
                                                <div className="avatar-glow">
                                                    <Avatar
                                                        size="md"
                                                        radius="xl"
                                                        variant="gradient"
                                                        gradient={{ from: '#3B82F6', to: '#9333EA', deg: 135 }}
                                                    >
                                                        {user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}
                                                    </Avatar>
                                                </div>
                                                <div className="hidden lg:block profile-text">
                                                    <Text size="sm" fw={600} style={{ color: 'white', lineHeight: 1.2 }}>
                                                        {user?.firstname} {user?.lastname}
                                                    </Text>
                                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.2 }}>
                                                        View Profile
                                                    </Text>
                                                </div>
                                            </Group>
                                        </UnstyledButton>
                                    </motion.div>
                                </Menu.Target>
                                <Menu.Dropdown className="profile-dropdown">
                                    <div className="profile-dropdown-header">
                                        <Group gap="sm">
                                            <Avatar
                                                size="lg"
                                                radius="xl"
                                                variant="gradient"
                                                gradient={{ from: '#3B82F6', to: '#9333EA', deg: 135 }}
                                            >
                                                {user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}
                                            </Avatar>
                                            <div>
                                                <Text size="md" fw={700} style={{ color: 'white' }}>
                                                    {user?.firstname} {user?.lastname}
                                                </Text>
                                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                    {user?.email}
                                                </Text>
                                            </div>
                                        </Group>
                                    </div>
                                    <Menu.Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                    <Menu.Item
                                        leftSection={<IconUser size={18} />}
                                        onClick={() => navigate('/profile')}
                                        className="profile-menu-item"
                                    >
                                        <div>
                                            <Text fw={600} size="sm">My Profile</Text>
                                            <Text size="xs" c="dimmed">View and edit your profile</Text>
                                        </div>
                                    </Menu.Item>
                                    <Menu.Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                    <Menu.Item
                                        leftSection={<IconLogout size={18} />}
                                        onClick={handleLogout}
                                        className="profile-menu-item logout-item"
                                    >
                                        <div>
                                            <Text fw={600} size="sm">Logout</Text>
                                            <Text size="xs" c="dimmed">Sign out of your account</Text>
                                        </div>
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        ) : (
                            <Group gap="xs">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="subtle"
                                        component={Link}
                                        to="/login"
                                        leftSection={<IconLogin size={16} />}
                                        className="nav-button-secondary"
                                        size="sm"
                                        style={{
                                            fontSize: '0.875rem',
                                            padding: '0.5rem 1rem'
                                        }}
                                    >
                                        Login
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        component={Link}
                                        to="/register"
                                        className="nav-button-primary"
                                        size="sm"
                                        style={{
                                            fontSize: '0.875rem',
                                            padding: '0.5rem 1rem'
                                        }}
                                    >
                                        Register
                                    </Button>
                                </motion.div>
                            </Group>
                        )}
                    </motion.div>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md" className="glass-sidebar">
                <Flex direction="column" gap="sm">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <Button
                            variant={isActive('/products') ? 'filled' : 'light'}
                            leftSection={<IconList size={18} />}
                            component={Link}
                            to="/products"
                            fullWidth
                            justify="flex-start"
                            className={`rounded-xl transition-all duration-300 ${isActive('/products') ? 'glass-button' : 'glass hover:bg-white/20'}`}
                            size="md"
                        >
                            All Products
                        </Button>
                    </motion.div>

                    {isAuthenticated && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <Button
                                    variant={isActive('/add-product') ? 'filled' : 'light'}
                                    leftSection={<IconPlus size={18} />}
                                    component={Link}
                                    to="/add-product"
                                    fullWidth
                                    justify="flex-start"
                                    className={`rounded-xl transition-all duration-300 ${isActive('/add-product') ? 'glass-button' : 'glass hover:bg-white/20'}`}
                                    size="md"
                                >
                                    Add Product
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            >
                                <Button
                                    variant={isActive('/dashboard') ? 'filled' : 'light'}
                                    leftSection={<IconUser size={18} />}
                                    component={Link}
                                    to="/dashboard"
                                    fullWidth
                                    justify="flex-start"
                                    className={`rounded-xl transition-all duration-300 ${isActive('/dashboard') ? 'glass-button' : 'glass hover:bg-white/20'}`}
                                    size="md"
                                >
                                    My Products
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.4 }}
                            >
                                <Button
                                    variant={isActive('/my-transactions') ? 'filled' : 'light'}
                                    leftSection={<IconHistory size={18} />}
                                    component={Link}
                                    to="/my-transactions"
                                    fullWidth
                                    justify="flex-start"
                                    className={`rounded-xl transition-all duration-300 ${isActive('/my-transactions') ? 'glass-button' : 'glass hover:bg-white/20'}`}
                                    size="md"
                                >
                                    My Transactions
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.5 }}
                            >
                                <Button
                                    variant={isActive('/pending-approvals') ? 'filled' : 'light'}
                                    leftSection={<IconCheck size={18} />}
                                    component={Link}
                                    to="/pending-approvals"
                                    fullWidth
                                    justify="flex-start"
                                    className={`rounded-xl transition-all duration-300 ${isActive('/pending-approvals') ? 'glass-button' : 'glass hover:bg-white/20'}`}
                                    size="md"
                                >
                                    Pending Approvals
                                </Button>
                            </motion.div>
                        </>
                    )}
                </Flex>
            </AppShell.Navbar>

            <AppShell.Main>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </AppShell.Main>

            {/* Mobile Bottom Navigation */}
            <div className="mobile-nav md:hidden">
                <Group justify="space-around" gap={0} style={{ width: '100%' }}>
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <UnstyledButton
                            component={Link}
                            to="/products"
                            className="flex flex-col items-center gap-1 px-2 py-2"
                            style={{
                                color: isActive('/products') ? '#3B82F6' : 'rgba(255,255,255,0.7)',
                                transition: 'color 0.2s'
                            }}
                        >
                            <IconList size={24} />
                            <Text size="xs" style={{ color: 'inherit' }}>Products</Text>
                        </UnstyledButton>
                    </motion.div>

                    {isAuthenticated && (
                        <>
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <UnstyledButton
                                    component={Link}
                                    to="/add-product"
                                    className="flex flex-col items-center gap-1 px-2 py-2"
                                    style={{
                                        color: isActive('/add-product') ? '#3B82F6' : 'rgba(255,255,255,0.7)',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    <IconPlus size={24} />
                                    <Text size="xs" style={{ color: 'inherit' }}>Add</Text>
                                </UnstyledButton>
                            </motion.div>

                            <motion.div whileTap={{ scale: 0.9 }}>
                                <UnstyledButton
                                    component={Link}
                                    to="/dashboard"
                                    className="flex flex-col items-center gap-1 px-2 py-2"
                                    style={{
                                        color: isActive('/dashboard') ? '#3B82F6' : 'rgba(255,255,255,0.7)',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    <IconUser size={24} />
                                    <Text size="xs" style={{ color: 'inherit' }}>My Products</Text>
                                </UnstyledButton>
                            </motion.div>

                            <motion.div whileTap={{ scale: 0.9 }}>
                                <UnstyledButton
                                    component={Link}
                                    to="/my-transactions"
                                    className="flex flex-col items-center gap-1 px-2 py-2"
                                    style={{
                                        color: isActive('/my-transactions') ? '#3B82F6' : 'rgba(255,255,255,0.7)',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    <IconHistory size={24} />
                                    <Text size="xs" style={{ color: 'inherit' }}>Transactions</Text>
                                </UnstyledButton>
                            </motion.div>

                            <motion.div whileTap={{ scale: 0.9 }}>
                                <UnstyledButton
                                    component={Link}
                                    to="/pending-approvals"
                                    className="flex flex-col items-center gap-1 px-2 py-2"
                                    style={{
                                        color: isActive('/pending-approvals') ? '#3B82F6' : 'rgba(255,255,255,0.7)',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    <IconCheck size={24} />
                                    <Text size="xs" style={{ color: 'inherit', fontSize: '0.7rem' }}>Approvals</Text>
                                </UnstyledButton>
                            </motion.div>
                        </>
                    )}
                </Group>
            </div>
        </AppShell>
    );
};

export default Layout;