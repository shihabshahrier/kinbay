import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { ApolloProvider } from '@apollo/client';
import { client } from './lib/apollo-client';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Products from './pages/Products.tsx';
import AddProduct from './pages/AddProduct.tsx';
import EditProduct from './pages/EditProduct.tsx';
import ProductDetails from './pages/ProductDetails.tsx';
import MyTransactions from './pages/MyTransactions.tsx';
import PendingApprovals from './pages/PendingApprovals.tsx';
import Profile from './pages/Profile.tsx';
import Layout from './components/Layout';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <Products />
            </Layout>
          }
        />
        <Route
          path="/products/:id"
          element={
            <Layout>
              <ProductDetails />
            </Layout>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <Layout>
                <AddProduct />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditProduct />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <MyTransactions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-approvals"
          element={
            <ProtectedRoute>
              <Layout>
                <PendingApprovals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <MantineProvider
        theme={{
          fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          primaryColor: 'violet',
          colors: {
            'ebay-red': ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', '#E53238'],
            'ebay-blue': ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A', '#0064D2'],
            'ebay-yellow': ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', '#F5AF02'],
            'ebay-green': ['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#86B817'],
          },
          defaultRadius: 'xl',
          components: {
            Button: {
              defaultProps: {
                radius: 'xl',
              },
            },
            Card: {
              defaultProps: {
                radius: 'xl',
              },
            },
            Modal: {
              defaultProps: {
                radius: 'xl',
                centered: true,
              },
            },
          },
        }}
      >
        <ModalsProvider>
          <Notifications position="top-right" />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </ApolloProvider>
  );
}

export default App;
