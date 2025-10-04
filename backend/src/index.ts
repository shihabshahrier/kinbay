import express from 'express';
import { createGraphQLServer } from './graphql/index.js';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import { Getenv } from './config/config.js';
import { verifyToken } from './lib/jwt.js';




async function main(PORT: number) {
    const app = express();

    app.use(cors());
    app.use(express.json());



    app.get('/', (req, res) => {
        res.send('Hello, World!');
    });

    app.use(
        '/graphql',
        expressMiddleware(await createGraphQLServer(), {
            context: async ({ req }) => {
                const token = req.headers['authorization'];
                try {
                    if (token) {
                        const user = verifyToken(token.replace('Bearer ', ''));
                        return { user };
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                }

                return {};
            },
        }),
    );

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

}

const PORT: string | number = Number(Getenv('PORT'));
main(PORT);
