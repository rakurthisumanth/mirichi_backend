import swaggerUi from 'swagger-ui-express';

// Minimal OpenAPI spec covering existing endpoints
const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Mirichi API',
    version: '1.0.0',
  },
  servers: [
    { url: 'http://0.0.0.0:{port}', variables: { port: { default: '3000' } } },
  ],
  paths: {
    '/api/createBuyingStockByCustomer': {
      post: {
        summary: 'Create a billing record (customer buying stock)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  buyer_name: { type: 'string' },
                  buyer_contact: { type: 'string' },
                  date: { type: 'string', description: 'Client-provided date (optional); server sets date=now' },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        farmer_name: { type: 'string' },
                        variety_details: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              variety: { type: 'string' },
                              rate: { oneOf: [{ type: 'number' }, { type: 'string' }] },
                              bags: { oneOf: [{ type: 'number' }, { type: 'string' }] },
                              weight: { oneOf: [{ type: 'number' }, { type: 'string' }] }
                            }
                          }
                        }
                      }
                    }
                  },
                  total_base_price: { oneOf: [{ type: 'number' }, { type: 'string' }] },
                  commission: { oneOf: [{ type: 'number' }, { type: 'string' }] },
                  bags_price: { oneOf: [{ type: 'number' }, { type: 'string' }] },
                  total_net_amount: { oneOf: [{ type: 'number' }, { type: 'string' }] }
                },
                required: ['buyer_name', 'buyer_contact', 'details']
              }
            }
          }
        },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Validation error' }
        }
      }
    },
    '/api/getBuyingStockByCustomerByDate': {
      post: {
        summary: 'List customer buying stock between dates (inclusive)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  from_date: { type: 'string', example: '2025-10-01' },
                  to_date: { type: 'string', example: '2025-10-24' }
                },
                required: ['from_date']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Results returned' },
          '400': { description: 'Validation error' }
        }
      }
    },
    '/api/getBagsByFarmerName': {
      post: {
        summary: 'Count total bags by farmer name (prefix match)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { farmer_name: { type: 'string' } },
                required: ['farmer_name']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Total bags computed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    farmer_name_query: { type: 'string' },
                    total_bags: { type: 'integer' }
                  }
                }
              }
            }
          },
          '404': { description: 'No farmers found' }
        }
      }
    },
    '/api/getCustomersByName': {
      post: {
        summary: 'Find customers by buyer_name',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  buyer_name: { type: 'string' }
                },
                required: ['buyer_name']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Customers found' },
          '404': { description: 'No customers found' }
        }
      }
    },
    '/api/login': {
      post: {
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['username', 'password'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/farmers': {
      post: {
        summary: 'Create farmer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  mobile_number: { type: 'string' },
                  village: { type: 'string' },
                  no_of_bags: { type: 'number' },
                },
                required: ['name', 'mobile_number', 'village', 'no_of_bags'],
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/customers': {
      post: {
        summary: 'Create customer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customer_name: { type: 'string' },
                  phone_number: { type: 'string' },
                  buy_bags: { type: 'number' },
                },
                required: ['customer_name', 'phone_number', 'buy_bags'],
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
  },
};

export function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
}
