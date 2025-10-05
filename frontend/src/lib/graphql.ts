import { gql } from '@apollo/client';

// Auth Mutations
export const CREATE_USER = gql`
  mutation CreateUser($email: String!, $firstname: String!, $lastname: String!, $address: String!, $phone: String!, $password: String!) {
    createUser(email: $email, firstname: $firstname, lastname: $lastname, address: $address, phone: $phone, password: $password)
  }
`;

export const GET_TOKEN = gql`
  query GetToken($email: String!, $password: String!) {
    getToken(email: $email, password: $password)
  }
`;

// User Queries
export const GET_CURRENT_USER = gql`
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

export const UPDATE_USER = gql`
  mutation UpdateUser($email: String, $firstname: String, $lastname: String, $address: String, $phone: String, $password: String) {
    updateUser(email: $email, firstname: $firstname, lastname: $lastname, address: $address, phone: $phone, password: $password) {
      id
      email
      firstname
      lastname
      address
      phone
    }
  }
`;

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    getCategories {
      id
      name
    }
  }
`;

// Product Mutations and Queries
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $description: String!, $priceBuy: Float, $priceRent: Float, $rentOption: RentOption, $categoryIds: [ID!]) {
    createProduct(name: $name, description: $description, priceBuy: $priceBuy, priceRent: $priceRent, rentOption: $rentOption, categoryIds: $categoryIds) {
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
      updatedAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $name: String, $description: String, $priceBuy: Float, $priceRent: Float, $rentOption: RentOption, $categoryIds: [ID!]) {
    updateProduct(id: $id, name: $name, description: $description, priceBuy: $priceBuy, priceRent: $priceRent, rentOption: $rentOption, categoryIds: $categoryIds) {
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

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
      name
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
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
      updatedAt
    }
  }
`;

export const GET_PRODUCTS_BY_OWNER = gql`
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
      updatedAt
    }
  }
`;

// Alias for component clarity
export const GET_MY_PRODUCTS = GET_PRODUCTS_BY_OWNER;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    getProductById(id: $id) {
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
      updatedAt
    }
  }
`;

// Transaction Mutations and Queries
export const BUY_PRODUCT = gql`
  mutation BuyProduct($productId: ID!, $price: Float!) {
    buyProduct(productId: $productId, price: $price) {
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

export const RENT_PRODUCT = gql`
  mutation RentProduct($productId: ID!, $price: Float!, $startDate: String!, $endDate: String!) {
    rentProduct(productId: $productId, price: $price, startDate: $startDate, endDate: $endDate) {
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

export const COMPLETE_TRANSACTION = gql`
  mutation CompleteTransaction($id: ID!) {
    completeTransaction(id: $id) {
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

export const GET_USER_TRANSACTIONS = gql`
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

// Alias for MyTransactions component
export const GET_MY_TRANSACTIONS = GET_USER_TRANSACTIONS;

export const GET_TRANSACTION_BY_ID = gql`
  query GetTransactionById($id: ID!) {
    getTransactionById(id: $id) {
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

export const CHECK_PRODUCT_AVAILABILITY = gql`
  query CheckProductAvailability($productId: ID!, $startDate: String, $endDate: String) {
    checkProductAvailability(productId: $productId, startDate: $startDate, endDate: $endDate) {
      available
      reason
      conflictingRentals {
        id
        startDate
        endDate
        user {
          firstname
          lastname
        }
      }
    }
  }
`;

export const GET_PENDING_TRANSACTIONS_FOR_OWNER = gql`
  query GetPendingTransactionsForOwner {
    getPendingTransactionsForOwner {
      id
      type
      status
      price
      startDate
      endDate
      createdAt
      user {
        id
        firstname
        lastname
        email
      }
      product {
        id
        name
        description
        priceBuy
        priceRent
        rentOption
      }
    }
  }
`;