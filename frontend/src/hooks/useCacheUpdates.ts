import { useMutation, useApolloClient, gql } from '@apollo/client';
import {
    DELETE_PRODUCT,
    CREATE_PRODUCT,
    UPDATE_PRODUCT,
    COMPLETE_TRANSACTION,
    BUY_PRODUCT,
    RENT_PRODUCT,
    GET_ALL_PRODUCTS,
    GET_USER_TRANSACTIONS,
    GET_PENDING_TRANSACTIONS_FOR_OWNER,
    GET_MY_PRODUCTS
} from '../lib/graphql';

// Fragment definitions for cache operations
const PRODUCT_FRAGMENT = gql`
  fragment ProductDetails on Product {
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
    }
    categories {
      category {
        id
        name
      }
    }
    createdAt
    updatedAt
  }
`;

const TRANSACTION_FRAGMENT = gql`
  fragment TransactionDetails on Transaction {
    id
    type
    status
    price
    startDate
    endDate
    createdAt
    product {
      id
      name
    }
    user {
      id
      firstname
      lastname
    }
  }
`;

export const useProductMutations = () => {
    // Delete Product with Cache Update
    const [deleteProduct, { loading: deleteLoading }] = useMutation(DELETE_PRODUCT, {
        update(cache, { data }) {
            if (data?.deleteProduct) {
                const deletedProductId = data.deleteProduct.id;

                // Remove from getAllProducts
                cache.modify({
                    fields: {
                        getAllProducts(existingProducts = [], { readField }) {
                            return existingProducts.filter(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (productRef: any) => readField('id', productRef) !== deletedProductId
                            );
                        }
                    }
                });

                // Remove from getProductsByOwner (my products)
                cache.modify({
                    fields: {
                        getProductsByOwner(existingProducts = [], { readField }) {
                            return existingProducts.filter(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (productRef: any) => readField('id', productRef) !== deletedProductId
                            );
                        }
                    }
                });

                // Remove product from cache completely
                cache.evict({
                    id: cache.identify({ __typename: 'Product', id: deletedProductId })
                });
                cache.gc(); // Garbage collect orphaned references
            }
        },
        onError: (error) => {
            console.error('Error deleting product:', error);
        }
    });

    // Create Product with Cache Update  
    const [createProduct, { loading: createLoading }] = useMutation(CREATE_PRODUCT, {
        update(cache, { data }) {
            if (data?.createProduct) {
                const newProduct = data.createProduct;

                // Write the new product to cache using fragment
                const newProductRef = cache.writeFragment({
                    data: newProduct,
                    fragment: PRODUCT_FRAGMENT
                });

                if (newProductRef) {
                    // Add to BOTH getAllProducts and getProductsByOwner lists
                    cache.modify({
                        fields: {
                            getAllProducts(existingProducts = []) {
                                return [...existingProducts, newProductRef];
                            },
                            getProductsByOwner(existingProducts = []) {
                                return [...existingProducts, newProductRef];
                            }
                        }
                    });
                }
            }
        },
        onError: (error) => {
            console.error('Error creating product:', error);
        }
    });

    // Update Product with Cache Update
    const [updateProduct, { loading: updateLoading }] = useMutation(UPDATE_PRODUCT, {
        update(cache, { data }) {
            if (data?.updateProduct) {
                // Update existing product in cache
                cache.writeFragment({
                    id: cache.identify({ __typename: 'Product', id: data.updateProduct.id }),
                    fragment: PRODUCT_FRAGMENT,
                    data: data.updateProduct
                });
            }
        },
        onError: (error) => {
            console.error('Error updating product:', error);
        }
    });

    return {
        deleteProduct,
        deleteLoading,
        createProduct,
        createLoading,
        updateProduct,
        updateLoading
    };
};

export const useTransactionMutations = () => {
    // Buy Product with Cache Update
    const [buyProduct, { loading: buyLoading }] = useMutation(BUY_PRODUCT, {
        update(cache, { data }) {
            if (data?.buyProduct) {
                const newTransactionRef = cache.writeFragment({
                    data: data.buyProduct,
                    fragment: TRANSACTION_FRAGMENT
                });

                // Update the nested getUserTransactions structure
                cache.modify({
                    fields: {
                        getUserTransactions(existingTransactions = { bought: [], sold: [], borrowed: [], lent: [] }) {
                            return {
                                ...existingTransactions,
                                bought: [...existingTransactions.bought, newTransactionRef]
                            };
                        }
                    }
                });

                // If transaction is completed (bought), remove product from getAllProducts
                if (data.buyProduct.status === 'COMPLETED') {
                    const productId = data.buyProduct.product.id;
                    cache.modify({
                        fields: {
                            getAllProducts(existingProducts = [], { readField }) {
                                return existingProducts.filter(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (productRef: any) => readField('id', productRef) !== productId
                                );
                            }
                        }
                    });
                }
            }
        },
        // Remove refetchQueries since cache updates should handle it
        onError: (error) => {
            console.error('Error buying product:', error);
        }
    });

    // Rent Product with Cache Update
    const [rentProduct, { loading: rentLoading }] = useMutation(RENT_PRODUCT, {
        update(cache, { data }) {
            if (data?.rentProduct) {
                const newTransactionRef = cache.writeFragment({
                    data: data.rentProduct,
                    fragment: TRANSACTION_FRAGMENT
                });

                // Update the nested getUserTransactions structure
                cache.modify({
                    fields: {
                        getUserTransactions(existingTransactions = { bought: [], sold: [], borrowed: [], lent: [] }) {
                            return {
                                ...existingTransactions,
                                borrowed: [...existingTransactions.borrowed, newTransactionRef]
                            };
                        }
                    }
                });
            }
        },
        // Remove refetchQueries since cache updates should handle it
        onError: (error) => {
            console.error('Error renting product:', error);
        }
    });

    // Complete Transaction with Cache Update
    const [completeTransaction, { loading: completeLoading }] = useMutation(COMPLETE_TRANSACTION, {
        update(cache, { data }) {
            if (data?.completeTransaction) {
                const completedTransaction = data.completeTransaction;

                // Remove from pending transactions
                cache.modify({
                    fields: {
                        getPendingTransactionsForOwner(existingPending = [], { readField }) {
                            return existingPending.filter(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (transactionRef: any) => readField('id', transactionRef) !== completedTransaction.id
                            );
                        }
                    }
                });

                // If it's a buy transaction, remove product from getAllProducts
                if (completedTransaction.type === 'BUY') {
                    const productId = completedTransaction.product?.id;
                    cache.modify({
                        fields: {
                            getAllProducts(existingProducts = [], { readField }) {
                                return existingProducts.filter(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (productRef: any) => readField('id', productRef) !== productId
                                );
                            }
                        }
                    });
                }
            }
        },
        refetchQueries: [
            GET_USER_TRANSACTIONS,
            GET_PENDING_TRANSACTIONS_FOR_OWNER,
            GET_ALL_PRODUCTS
        ],
        onError: (error) => {
            console.error('Error completing transaction:', error);
        }
    });

    return {
        buyProduct,
        buyLoading,
        rentProduct,
        rentLoading,
        completeTransaction,
        completeLoading
    };
};

export const useCacheManagement = () => {
    const client = useApolloClient();

    const clearUserSpecificData = () => {
        // Clear user-specific data from cache on logout
        client.cache.modify({
            fields: {
                getUserTransactions: () => [],
                getPendingTransactionsForOwner: () => [],
                getProductsByOwner: () => []
            }
        });

        // Remove user-specific cache entries
        client.cache.gc();
    };

    const refreshProductsList = async () => {
        // Force refresh products list
        try {
            await client.refetchQueries({
                include: [GET_ALL_PRODUCTS, GET_MY_PRODUCTS]
            });
        } catch (error) {
            console.error('Error refreshing products:', error);
        }
    };

    const refreshTransactions = async () => {
        // Force refresh transaction lists
        try {
            await client.refetchQueries({
                include: [GET_USER_TRANSACTIONS, GET_PENDING_TRANSACTIONS_FOR_OWNER]
            });
        } catch (error) {
            console.error('Error refreshing transactions:', error);
        }
    };

    const clearEntireCache = () => {
        // Clear all cache data
        client.cache.reset();
    };

    const optimisticProductDelete = (productId: string) => {
        // Optimistically remove product from cache before server response
        client.cache.modify({
            fields: {
                getAllProducts(existingProducts = [], { readField }) {
                    return existingProducts.filter(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (productRef: any) => readField('id', productRef) !== productId
                    );
                },
                getProductsByOwner(existingProducts = [], { readField }) {
                    return existingProducts.filter(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (productRef: any) => readField('id', productRef) !== productId
                    );
                }
            }
        });
    };

    return {
        clearUserSpecificData,
        refreshProductsList,
        refreshTransactions,
        clearEntireCache,
        optimisticProductDelete
    };
};

// Helper function to get cache statistics (for debugging)
export const useCacheStats = () => {
    const client = useApolloClient();

    const getCacheStats = () => {
        try {
            const cacheData = client.cache.extract();
            const entries = Object.keys(cacheData);

            return {
                totalEntries: entries.length,
                productCount: entries.filter(key => key.startsWith('Product:')).length,
                transactionCount: entries.filter(key => key.startsWith('Transaction:')).length,
                userCount: entries.filter(key => key.startsWith('User:')).length,
                categoryCount: entries.filter(key => key.startsWith('Category:')).length
            };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return { totalEntries: 0, productCount: 0, transactionCount: 0, userCount: 0, categoryCount: 0 };
        }
    };

    return { getCacheStats };
};

