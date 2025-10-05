# Kinbay Frontend

A modern React-based marketplace application for buying, selling, and renting products. Built with React, TypeScript, and Vite for optimal performance and developer experience.

## 🚀 Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Mantine** - Beautiful React components library
- **Apollo Client** - GraphQL client for data fetching
- **React Router** - Client-side routing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API running (see backend documentation)

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shihabshahrier/kinbay.git
   cd kinbay/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the frontend root:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.tsx    # Main layout wrapper
│   │   └── product/      # Product-specific components
│   ├── contexts/         # React context providers
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/              # Library configurations
│   │   ├── apollo-client.ts
│   │   └── graphql.ts    # GraphQL queries & mutations
│   ├── pages/            # Route components (pages)
│   │   ├── Login.tsx
│   │   ├── Products.tsx
│   │   ├── MyTransactions.tsx
│   │   └── PendingApprovals.tsx
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   └── dateUtils.ts  # Date formatting utilities
│   └── App.tsx           # Main application component
├── package.json
└── vite.config.ts
```

## 🎯 Key Features

### Authentication & User Management
- **User Registration & Login** - Secure authentication system
- **Profile Management** - Update user information and change password
- **Protected Routes** - Authentication-based access control

### Product Management
- **Browse Products** - View all available products with filtering
- **Add Products** - List your items for sale or rent
- **Edit Products** - Update your product listings
- **Product Details** - Comprehensive product information pages
- **Categories** - Organized product categorization

### Transaction System
- **Buy Products** - Purchase items directly
- **Rent Products** - Flexible rental system with date ranges
- **Transaction History** - Track all your transactions
  - Bought items
  - Sold items
  - Borrowed items
  - Lent items
- **Pending Approvals** - Product owners can approve/reject transactions

### Smart Features
- **Availability Management** - Sold products automatically hidden
- **Rental Conflict Prevention** - No overlapping rental bookings
- **Real-time Updates** - Instant UI updates after actions
- **Responsive Design** - Works on all device sizes

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🌐 API Integration

The frontend integrates with a GraphQL backend API. Key GraphQL operations include:

### Queries
- `getAllProducts` - Fetch all available products
- `getUserTransactions` - Get user's transaction history
- `getPendingTransactionsForOwner` - Get transactions awaiting approval
- `checkProductAvailability` - Verify product availability for rentals

### Mutations
- `createProduct` - Add new products
- `buyProduct` / `rentProduct` - Create transactions
- `completeTransaction` - Approve pending transactions
- `updateUser` - Update user profile

## 🔐 Authentication Flow

1. User registers/logs in through the auth forms
2. JWT token is stored in localStorage
3. Apollo Client includes the token in GraphQL requests
4. Protected routes check authentication status
5. Users are redirected appropriately based on auth state

## 📱 Page Components

### Public Pages
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user signup
- **Products** (`/products`) - Browse all products (public)

### Protected Pages
- **Dashboard** (`/dashboard`) - User's own products
- **Add Product** (`/add-product`) - Create new listings
- **Edit Product** (`/edit-product/:id`) - Modify existing products
- **My Transactions** (`/my-transactions`) - Transaction history
- **Pending Approvals** (`/pending-approvals`) - Approve transactions
- **Profile** (`/profile`) - User account management

## 🎨 UI Components

Built with Mantine for consistent, accessible design:

- **Cards** - Product displays and transaction items
- **Forms** - Product creation, user auth, profile updates
- **Modals** - Transaction confirmations, rental date selection
- **Notifications** - Success/error feedback
- **Tables & Lists** - Transaction histories, product lists
- **Navigation** - Responsive sidebar and header

## 🛡️ Error Handling

- **Network Errors** - Graceful handling of API failures
- **Validation Errors** - Form validation with clear feedback
- **Authentication Errors** - Automatic token refresh and logout
- **Loading States** - Proper loading indicators throughout the app

## 🔧 Configuration

### Environment Variables
```env
VITE_BACKEND_URL=http://localhost:3000    # Backend GraphQL endpoint
```

### Apollo Client Setup
- Automatic authentication header injection
- Error handling for expired tokens
- Optimistic updates for better UX

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service (Vercel, Netlify, etc.)

3. **Update environment variables** for production backend URL

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Add proper error handling for new features
4. Test all new functionality thoroughly
5. Update documentation for new features

## 📝 Development Notes

- **Fast Refresh** - Instant updates during development
- **Type Safety** - Full TypeScript coverage for better development experience
- **Modern React** - Uses hooks, context, and modern patterns
- **Performance** - Optimized with Vite bundler and code splitting

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
- Check TypeScript types are correct
- Ensure all imports have proper file extensions

**API Connection Issues:**
- Verify backend is running
- Check VITE_BACKEND_URL environment variable
- Confirm GraphQL endpoint is accessible

**Authentication Problems:**
- Clear localStorage and try logging in again
- Check JWT token expiration
- Verify backend authentication is working

## 📞 Support

For issues and feature requests, please refer to the project repository or contact the development team.
