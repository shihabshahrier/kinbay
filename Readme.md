# Kinbay 🛒

A modern marketplace application for buying, selling, and renting products built with React, TypeScript, GraphQL, and PostgreSQL.

## 🌟 Features

- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Product Management**: Create, edit, and manage product listings
- **Marketplace**: Browse and search through available products
- **Buy & Rent**: Support for both purchasing and rental transactions
- **Transaction Tracking**: Comprehensive transaction history and management
- **Real-time Updates**: Apollo Client with optimistic updates and cache management
- **Responsive Design**: Mobile-first design with glassmorphism UI
- **Category System**: Organized product categorization
- **Admin Panel**: Product approval workflow

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Mantine UI** for component library
- **Apollo Client** for GraphQL state management
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **Apollo Server** for GraphQL API
- **Prisma ORM** with PostgreSQL database
- **JWT** authentication with refresh tokens
- **bcrypt** for password hashing
- **CORS** configuration for cross-origin requests

### Database
- **PostgreSQL** (Neon Database)
- **Prisma** migrations and schema management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or Neon account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shihabshahrier/kinbay.git
   cd kinbay
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

#### Backend Environment
Create `.env` file in the `backend` directory:
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_ACCESS_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
PORT=3000
```

#### Frontend Environment
Create `.env` file in the `frontend` directory:
```env
VITE_GRAPHQL_URI=http://localhost:3000/graphql
```

### Database Setup

1. **Generate Prisma Client**
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

### Development

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend GraphQL Playground: http://localhost:3000/graphql

## 📁 Project Structure

```
kinbay/
├── backend/                    # Node.js GraphQL API
│   ├── src/
│   │   ├── graphql/           # GraphQL schemas and resolvers
│   │   │   ├── user/          # User-related GraphQL operations
│   │   │   └── product/       # Product-related GraphQL operations
│   │   ├── lib/               # Database and utility libraries
│   │   ├── services/          # Business logic services
│   │   └── middleware/        # Authentication middleware
│   ├── prisma/                # Database schema and migrations
│   └── test/                  # Test files and configuration
├── frontend/                  # React TypeScript application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Apollo Client and GraphQL queries
│   │   ├── hooks/             # Custom React hooks
│   │   ├── contexts/          # React context providers
│   │   └── types/             # TypeScript type definitions
│   └── public/                # Static assets
└── README.md                  # Project documentation
```

## 🔧 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

The application uses a dual-token JWT authentication system:
- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for refreshing access tokens
- **HTTP-only Cookies**: Secure token storage

## 📊 Database Schema

### Core Entities
- **User**: User accounts and profiles
- **Product**: Product listings with buy/rent options
- **Category**: Product categorization
- **Transaction**: Purchase and rental records
- **RefreshToken**: Token management for authentication

## 🎨 UI Design

The application features a modern glassmorphism design with:
- **Dark Theme**: Elegant dark color scheme
- **Glass Effects**: Backdrop blur and transparency
- **Responsive Layout**: Mobile-first responsive design
- **Smooth Animations**: Framer Motion transitions
- **Accessible Components**: Mantine UI accessibility features

## 🚀 Deployment

### Backend Deployment (Google Cloud Run)
1. Build Docker image
2. Deploy to Cloud Run
3. Configure environment variables
4. Set up custom domain

### Frontend Deployment (Cloudflare Pages)
1. Build production bundle
2. Deploy to Cloudflare Pages
3. Configure custom domain
4. Set up redirects

## 🧪 Testing

- **Backend**: Jest integration tests
- **Frontend**: Component and integration testing setup
- **API Testing**: GraphQL query validation

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Secure HTTP-only cookies
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Shihab Shahrier** - *Initial work* - [@shihabshahrier](https://github.com/shihabshahrier)

## 🙏 Acknowledgments

- Mantine UI for the component library
- Apollo GraphQL for the excellent developer experience
- Neon Database for PostgreSQL hosting
- Cloudflare for frontend hosting
- Google Cloud for backend hosting

## 📞 Support

For support, email shahrier2k@gmail.com or create an issue in this repository.

## 🗺️ Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Image upload and management
- [ ] Advanced search and filtering
- [ ] User reviews and ratings
- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Multi-language support