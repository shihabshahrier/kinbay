# Kinbay Backend

A robust Node.js GraphQL API backend for the Kinbay marketplace application. Built with Express, Apollo Server, Prisma ORM, and PostgreSQL for scalable product trading and rental management.

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Apollo Server** - GraphQL server implementation
- **Prisma ORM** - Modern database toolkit
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe development
- **JWT** - JSON Web Token authentication
- **Jest** - Testing framework

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd kinbay/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/kinbay?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Database Setup:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   
   # (Optional) Seed the database with sample data
   npx prisma db seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Access the API:**
   - GraphQL Playground: `http://localhost:3000/graphql`
   - API Endpoint: `http://localhost:3000/graphql`

## 🏗️ Project Structure

```
backend/
├── prisma/                    # Database configuration
│   ├── schema.prisma         # Database schema
│   ├── seed.ts              # Database seeding
│   └── migrations/          # Database migrations
├── src/
│   ├── config/              # Configuration files
│   │   └── config.ts        # Environment configuration
│   ├── graphql/             # GraphQL schema and resolvers
│   │   ├── index.ts         # GraphQL server setup
│   │   ├── product/         # Product-related GraphQL
│   │   │   ├── index.ts
│   │   │   ├── mutations.ts # Product mutations
│   │   │   ├── queries.ts   # Product queries
│   │   │   ├── resolvers.ts # Product resolvers
│   │   │   └── typedef.ts   # Product type definitions
│   │   └── user/           # User-related GraphQL
│   │       ├── index.ts
│   │       ├── mutations.ts
│   │       ├── queries.ts
│   │       ├── resolvers.ts
│   │       └── typedef.ts
│   ├── lib/                # Utility libraries
│   │   ├── db.ts          # Database connection
│   │   ├── hash.ts        # Password hashing
│   │   └── jwt.ts         # JWT utilities
│   ├── services/          # Business logic services
│   │   ├── product.ts     # Product service
│   │   └── user.ts        # User service
│   └── test/             # Test files
│       ├── setup.ts
│       ├── user.test.ts
│       └── simple.test.ts
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

## 🎯 Core Features

### Authentication & Authorization
- **JWT-based Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for secure password storage
- **Protected Endpoints** - Authorization middleware for GraphQL
- **User Registration & Login** - Complete auth flow

### Product Management
- **CRUD Operations** - Create, read, update, delete products
- **Category System** - Organize products by categories
- **Product Ownership** - Users can only modify their own products
- **Soft Deletion** - Products are marked as deleted, not removed
- **Product Availability** - Smart filtering of sold/unavailable products

### Transaction System
- **Buy/Rent Workflow** - Complete transaction lifecycle
- **Approval System** - Product owners approve transactions
- **Status Management** - PENDING → COMPLETED transaction flow
- **Rental Conflict Prevention** - No overlapping rental periods
- **Transaction History** - Comprehensive tracking of all transactions

### Advanced Features
- **Product Availability Checking** - Real-time availability validation
- **Rental Date Validation** - Prevent booking conflicts
- **Transaction Categorization** - Bought/Sold/Borrowed/Lent organization
- **Owner Approval System** - Product owners control transaction completion

## 📊 Database Schema

### Core Models

**Users**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  firstname String
  lastname  String?
  password  String
  salt      String
  address   String?
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deleted   Boolean  @default(false)
  
  // Relations
  products      Product[]
  transactions  Transaction[]
}
```

**Products**
```prisma
model Product {
  id            Int         @id @default(autoincrement())
  name          String
  description   String
  priceBuy      Float?
  priceRent     Float?
  rentOption    RentOption?
  owner         User        @relation(fields: [ownerId], references: [id])
  ownerId       Int
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  deleted       Boolean     @default(false)
  
  // Relations
  categories    ProductCategory[]
  transactions  Transaction[]
}
```

**Transactions**
```prisma
model Transaction {
  id        Int               @id @default(autoincrement())
  product   Product           @relation(fields: [productId], references: [id])
  productId Int
  user      User              @relation(fields: [userId], references: [id])
  userId    Int
  type      TransactionType   // BUY or RENT
  status    TransactionStatus // PENDING or COMPLETED
  price     Float
  startDate DateTime?         // For rentals
  endDate   DateTime?         // For rentals
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
  deleted   Boolean           @default(false)
}
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with watch mode
npm start           # Start production server
npm run build       # Compile TypeScript to JavaScript

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Create and apply new migration
npx prisma migrate deploy # Apply migrations to production
npx prisma db seed     # Seed database with sample data
npx prisma studio      # Open Prisma Studio (database GUI)

# Testing
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
```

## 🌐 GraphQL API

### Authentication
```graphql
# Register new user
mutation CreateUser($email: String!, $firstname: String!, $lastname: String!, 
                   $address: String!, $phone: String!, $password: String!) {
  createUser(email: $email, firstname: $firstname, lastname: $lastname,
            address: $address, phone: $phone, password: $password)
}

# Login
query GetToken($email: String!, $password: String!) {
  getToken(email: $email, password: $password)
}
```

### Products
```graphql
# Get all available products
query GetAllProducts {
  getAllProducts {
    id name description priceBuy priceRent
    owner { firstname lastname }
    categories { category { name } }
  }
}

# Create product
mutation CreateProduct($name: String!, $description: String!, 
                      $priceBuy: Float, $priceRent: Float, 
                      $rentOption: RentOption, $categoryIds: [Int]) {
  createProduct(name: $name, description: $description, 
               priceBuy: $priceBuy, priceRent: $priceRent,
               rentOption: $rentOption, categoryIds: $categoryIds) {
    id name description
  }
}
```

### Transactions
```graphql
# Create purchase transaction
mutation BuyProduct($productId: ID!, $price: Float!) {
  buyProduct(productId: $productId, price: $price) {
    id type status price
  }
}

# Create rental transaction
mutation RentProduct($productId: ID!, $price: Float!, 
                    $startDate: String!, $endDate: String!) {
  rentProduct(productId: $productId, price: $price,
             startDate: $startDate, endDate: $endDate) {
    id type status startDate endDate
  }
}

# Approve transaction (product owners only)
mutation CompleteTransaction($id: ID!) {
  completeTransaction(id: $id) {
    id status
  }
}

# Get user transactions
query GetUserTransactions {
  getUserTransactions {
    bought { id type status price product { name } }
    sold { id type status price product { name } user { firstname } }
    borrowed { id type status price startDate endDate product { name } }
    lent { id type status price startDate endDate user { firstname } }
  }
}

# Get pending approvals for product owner
query GetPendingTransactionsForOwner {
  getPendingTransactionsForOwner {
    id type status price startDate endDate
    user { firstname lastname email }
    product { name }
  }
}
```

### Product Availability
```graphql
# Check product availability
query CheckProductAvailability($productId: ID!, $startDate: String, $endDate: String) {
  checkProductAvailability(productId: $productId, startDate: $startDate, endDate: $endDate) {
    available
    reason
    conflictingRentals { id startDate endDate }
  }
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```javascript
{
  "email": "user@example.com",
  "iat": 1633024800,
  "exp": 1633111200
}
```

### Protected Resolvers
- Product creation/modification requires authentication
- Transaction operations require authentication
- User profile operations require authentication
- Only product owners can approve their transactions

### Authorization Headers
```
Authorization: Bearer <jwt-token>
```

## 🛡️ Business Rules

### Product Availability
1. **Sold Products**: Products with completed BUY transactions are hidden from listings
2. **Rental Conflicts**: Products cannot be rented if already rented during overlapping periods
3. **Owner Restrictions**: Users cannot buy/rent their own products

### Transaction Workflow
1. **Transaction Creation**: All transactions start as PENDING status
2. **Owner Approval**: Product owners must approve transactions to complete them
3. **Status Updates**: Only COMPLETED transactions affect product availability
4. **Soft Deletion**: Transactions are marked as deleted, never physically removed

### Rental System
- **Date Validation**: End date must be after start date
- **Conflict Prevention**: Check for overlapping rental periods
- **Pricing Options**: Daily, weekly, or monthly rental rates

## 🔧 Configuration

### Environment Variables
```env
PORT=3000                                    # Server port
DATABASE_URL="postgresql://..."              # PostgreSQL connection string
JWT_SECRET="your-super-secret-key"          # JWT signing secret
```

### Database Configuration
- **Connection Pool**: Configured in Prisma for optimal performance
- **Migrations**: Versioned database schema changes
- **Indexing**: Optimized indexes for frequent queries

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# The docker-compose.yml includes PostgreSQL setup
```

### Database Migrations
```bash
# Apply all pending migrations
npx prisma migrate deploy

# Generate fresh Prisma client
npx prisma generate
```

## 🧪 Testing

### Test Structure
- **Unit Tests**: Service layer testing
- **Integration Tests**: GraphQL resolver testing
- **Database Tests**: Prisma operations testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Database
- Separate test database configuration
- Automatic cleanup between tests
- Mock data generation utilities

## 📊 Performance Considerations

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried fields
- **Relations**: Efficient JOIN operations via Prisma
- **Query Optimization**: Selective field loading with GraphQL

### Caching Strategy
- **Database Connection Pooling**: Prisma connection management
- **Query Results**: Apollo Server built-in caching
- **JWT Verification**: Efficient token validation

## 🐛 Error Handling

### GraphQL Errors
- **Authentication Errors**: Clear error messages for auth failures
- **Validation Errors**: Field-level validation error responses
- **Business Logic Errors**: Meaningful error descriptions

### Database Errors
- **Connection Issues**: Graceful database connection handling
- **Constraint Violations**: User-friendly constraint error messages
- **Transaction Failures**: Proper rollback mechanisms

## 📝 Development Guidelines

### Code Structure
- **Service Layer**: Business logic separated from GraphQL layer
- **Type Safety**: Full TypeScript coverage
- **Error Boundaries**: Comprehensive error handling
- **Validation**: Input validation at multiple levels

### Best Practices
- **Async Operations**: Proper async/await usage
- **Database Transactions**: Use Prisma transactions for data consistency
- **Security**: Input sanitization and SQL injection prevention
- **Logging**: Structured logging for debugging and monitoring

## 🔍 Debugging

### GraphQL Playground
Access the GraphQL Playground at `http://localhost:3000/graphql` to:
- Test queries and mutations
- Explore the schema documentation
- Debug GraphQL operations

### Database Debugging
```bash
# View database content with Prisma Studio
npx prisma studio

# Check database schema
npx prisma db pull

# View migration status
npx prisma migrate status
```

### Logging
- **Request Logging**: All GraphQL operations are logged
- **Error Logging**: Comprehensive error tracking
- **Database Queries**: Prisma query logging in development

## 🤝 Contributing

1. **Code Standards**: Follow TypeScript and Prisma best practices
2. **Testing**: Add tests for new features and bug fixes
3. **Documentation**: Update GraphQL schema documentation
4. **Database Changes**: Create proper Prisma migrations
5. **Security**: Follow authentication and authorization patterns

## 📞 Support

For backend-specific issues:
- Check the IMPLEMENTATION_REPORT.md for detailed technical information
- Review test files for usage examples
- Use Prisma Studio for database inspection
- Consult GraphQL Playground for API exploration

## 📚 Additional Resources

- [Prisma Documentation](https://prisma.io/docs)
- [Apollo Server Documentation](https://apollographql.com/docs/apollo-server)
- [GraphQL Specification](https://graphql.org/learn)
- [JWT Documentation](https://jwt.io/introduction)