import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NyaySetu API',
            version: '1.0.0',
            description: 'Backend REST API for the NyaySetu legal services platform',
        },
        servers: [
            { url: 'http://localhost:5000', description: 'Local development' },
            { url: 'https://your-production-url.com', description: 'Production' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token from login/signup response',
                },
            },
        },
        security: [{ bearerAuth: [] }], // Apply globally (most routes need auth)
    },
    // Point to route files — swagger-jsdoc scans these for JSDoc comments
    apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/config/swaggerSchemas.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
