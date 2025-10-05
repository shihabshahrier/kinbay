/**
 * GraphQL Testing Documentation
 * 
 * This file contains test queries and mutations for testing the Kinbay backend.
 * Use these with GraphQL Playground or any GraphQL client to test the backend operations.
 */

// =====================
// USER OPERATIONS
// =====================

/**
 * 1. Create User (Registration)
 * Mutation to register a new user
 */
const CREATE_USER = `
mutation CreateUser {
  createUser(
    email: "john.doe@example.com"
    firstname: "John"
    lastname: "Doe"
    address: "123 Main St, Anytown USA"
    phone: "555-0123"
    password: "password123"
  )
}
`;

/**
 * 2. Login User
 * Query to get authentication token
 */
const LOGIN = `
query Login {
  getToken(
    email: "john.doe@example.com"
    password: "password123"
  )
}
`;

/**
 * 3. Get Current User
 * Query to get current authenticated user details
 * Requires Authorization header: Bearer <token>
 */
const GET_CURRENT_USER = `
query GetCurrentUser {
  getCurrentUser {
    id
    email
    firstname
    lastname
    address
    phone
  }
}
`;

/**
 * 4. Update User
 * Mutation to update current user details
 * Requires Authorization header: Bearer <token>
 */
const UPDATE_USER = `
mutation UpdateUser {
  updateUser(
    firstname: "Jane"
    address: "456 New St, New City"
    phone: "555-9876"
  ) {
    id
    email
    firstname
    lastname
    address
    phone
  }
}
`;

// =====================
// CATEGORY OPERATIONS
// =====================

/**
 * 5. Get All Categories
 * Query to fetch all available product categories
 */
const GET_CATEGORIES = `
query GetCategories {
  getCategories {
    id
    name
  }
}
`;

/**
 * 6. Create Category (Admin)
 * Mutation to create a new category
 * Requires Authorization header: Bearer <token>
 */
const CREATE_CATEGORY = `
mutation CreateCategory {
  createCategory(name: "BOOKS") {
    id
    name
  }
}
`;

// =====================
// PRODUCT OPERATIONS
// =====================

/**
 * 7. Create Product
 * Mutation to create a new product
 * Requires Authorization header: Bearer <token>
 */
const CREATE_PRODUCT = `
mutation CreateProduct {
  createProduct(
    name: "MacBook Pro 16-inch"
    description: "High-performance laptop for professionals"
    priceBuy: 2500.00
    priceRent: 50.00
    rentOption: DAILY
    categoryIds: ["1"]
  ) {
    id
    name
    description
    priceBuy
    priceRent
    rentOption
    ownerId
    owner {
      id
      firstname
      lastname
      email
    }
    categories {
      id
      name
    }
    createdAt
  }
}
`;

/**
 * 8. Get All Products
 * Query to fetch all products from all users
 */
const GET_ALL_PRODUCTS = `
query GetAllProducts {
  getAllProducts {
    id
    name
    description
    priceBuy
    priceRent
    rentOption
    ownerId
    owner {
      id
      firstname
      lastname
      email
    }
    categories {
      id
      name
    }
    createdAt
  }
}
`;

/**
 * 9. Get Products by Owner
 * Query to fetch products owned by current user
 * Requires Authorization header: Bearer <token>
 */
const GET_PRODUCTS_BY_OWNER = `
query GetProductsByOwner {
  getProductsByOwner {
    id
    name
    description
    priceBuy
    priceRent
    rentOption
    categories {
      id
      name
    }
    createdAt
  }
}
`;

/**
 * 10. Get Product by ID
 * Query to fetch a specific product by its ID
 */
const GET_PRODUCT_BY_ID = `
query GetProductById {
  getProductById(id: "1") {
    id
    name
    description
    priceBuy
    priceRent
    rentOption
    ownerId
    owner {
      id
      firstname
      lastname
      email
    }
    categories {
      id
      name
    }
    createdAt
  }
}
`;

/**
 * 11. Update Product
 * Mutation to update a product
 * Requires Authorization header: Bearer <token>
 */
const UPDATE_PRODUCT = `
mutation UpdateProduct {
  updateProduct(
    id: "1"
    name: "Updated MacBook Pro 16-inch"
    description: "Updated high-performance laptop"
    priceBuy: 2300.00
    priceRent: 45.00
    categoryIds: ["1", "2"]
  ) {
    id
    name
    description
    priceBuy
    priceRent
    rentOption
    categories {
      id
      name
    }
    updatedAt
  }
}
`;

/**
 * 12. Delete Product
 * Mutation to soft delete a product
 * Requires Authorization header: Bearer <token>
 */
const DELETE_PRODUCT = `
mutation DeleteProduct {
  deleteProduct(id: "1") {
    id
    name
  }
}
`;

// =====================
// TRANSACTION OPERATIONS
// =====================

/**
 * 13. Buy Product
 * Mutation to create a buy transaction
 * Requires Authorization header: Bearer <token>
 */
const BUY_PRODUCT = `
mutation BuyProduct {
  buyProduct(
    productId: "1"
    price: 2500.00
  ) {
    id
    type
    status
    price
    product {
      id
      name
      owner {
        firstname
        lastname
      }
    }
    user {
      id
      firstname
      lastname
    }
    createdAt
  }
}
`;

/**
 * 14. Rent Product
 * Mutation to create a rent transaction
 * Requires Authorization header: Bearer <token>
 */
const RENT_PRODUCT = `
mutation RentProduct {
  rentProduct(
    productId: "1"
    price: 350.00
    startDate: "2024-01-15T00:00:00.000Z"
    endDate: "2024-01-22T00:00:00.000Z"
  ) {
    id
    type
    status
    price
    startDate
    endDate
    product {
      id
      name
      owner {
        firstname
        lastname
      }
    }
    user {
      id
      firstname
      lastname
    }
    createdAt
  }
}
`;

/**
 * 15. Complete Transaction
 * Mutation to mark a transaction as completed (product owner only)
 * Requires Authorization header: Bearer <token>
 */
const COMPLETE_TRANSACTION = `
mutation CompleteTransaction {
  completeTransaction(id: "1") {
    id
    type
    status
    price
    product {
      id
      name
    }
    user {
      id
      firstname
      lastname
    }
    updatedAt
  }
}
`;

/**
 * 16. Get User Transactions
 * Query to get all transactions for current user (bought, sold, borrowed, lent)
 * Requires Authorization header: Bearer <token>
 */
const GET_USER_TRANSACTIONS = `
query GetUserTransactions {
  getUserTransactions {
    bought {
      id
      type
      status
      price
      startDate
      endDate
      product {
        id
        name
        owner {
          firstname
          lastname
        }
      }
      createdAt
    }
    sold {
      id
      type
      status
      price
      user {
        firstname
        lastname
      }
      product {
        id
        name
      }
      createdAt
    }
    borrowed {
      id
      type
      status
      price
      startDate
      endDate
      product {
        id
        name
        owner {
          firstname
          lastname
        }
      }
      createdAt
    }
    lent {
      id
      type
      status
      price
      startDate
      endDate
      user {
        firstname
        lastname
      }
      product {
        id
        name
      }
      createdAt
    }
  }
}
`;

/**
 * 17. Get Transaction by ID
 * Query to get a specific transaction
 */
const GET_TRANSACTION_BY_ID = `
query GetTransactionById {
  getTransactionById(id: "1") {
    id
    type
    status
    price
    startDate
    endDate
    product {
      id
      name
      description
      owner {
        firstname
        lastname
        email
      }
    }
    user {
      id
      firstname
      lastname
      email
    }
    createdAt
    updatedAt
  }
}
`;

// =====================
// TESTING WORKFLOW
// =====================

/**
 * TESTING WORKFLOW:
 * 
 * 1. Create User: Use CREATE_USER mutation
 * 2. Login: Use LOGIN query to get token
 * 3. Set Authorization header for all authenticated requests
 * 4. Get Categories: Use GET_CATEGORIES query
 * 5. Create Product: Use CREATE_PRODUCT mutation
 * 6. Get All Products: Use GET_ALL_PRODUCTS query
 * 7. Update Product: Use UPDATE_PRODUCT mutation
 * 8. Create another user for transactions
 * 9. Buy/Rent Product: Use BUY_PRODUCT or RENT_PRODUCT mutation
 * 10. Complete Transaction: Use COMPLETE_TRANSACTION mutation (as product owner)
 * 11. Check User Transactions: Use GET_USER_TRANSACTIONS query
 * 
 * AUTHENTICATION:
 * - Add Authorization header: "Bearer YOUR_JWT_TOKEN_HERE"
 * - Token is received from LOGIN query
 * 
 * ERROR TESTING:
 * - Try operations without authentication
 * - Try to buy/rent own products
 * - Try overlapping rent dates
 * - Try invalid product/user IDs
 */

export {
    CREATE_USER,
    LOGIN,
    GET_CURRENT_USER,
    UPDATE_USER,
    GET_CATEGORIES,
    CREATE_CATEGORY,
    CREATE_PRODUCT,
    GET_ALL_PRODUCTS,
    GET_PRODUCTS_BY_OWNER,
    GET_PRODUCT_BY_ID,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
    BUY_PRODUCT,
    RENT_PRODUCT,
    COMPLETE_TRANSACTION,
    GET_USER_TRANSACTIONS,
    GET_TRANSACTION_BY_ID
};