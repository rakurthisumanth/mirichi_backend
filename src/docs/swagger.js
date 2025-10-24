import swaggerUi from 'swagger-ui-express';

// Build servers based on current env
const PORT = process.env.PORT || '3002';
const HOST = process.env.HOST || 'localhost';

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Mirichi API',
    version: '1.0.0',
  },
  servers: [
    { url: `http://${HOST}:${PORT}` },
    { url: `http://localhost:${PORT}` },
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
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { type: 'object', properties: { _id: { type: 'string' }, message: { type: 'string' } } } } }
          },
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
          '200': {
            description: 'Results returned',
            content: { 'application/json': { schema: { type: 'object', properties: { count: { type: 'integer' }, data: { type: 'array', items: { type: 'object' } } } } } }
          },
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
          '200': {
            description: 'Customers found',
            content: { 'application/json': { schema: { type: 'object', properties: { count: { type: 'integer' }, data: { type: 'array', items: { type: 'object' } } } } } }
          },
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
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        username: { type: 'string' },
                        id: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
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
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' }, mobile_number: { type: 'string' }, village: { type: 'string' }, no_of_bags: { type: 'number' } } } } }
          }
        },
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
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { type: 'object', properties: { _id: { type: 'string' }, customer_name: { type: 'string' }, phone_number: { type: 'string' }, buy_bags: { type: 'number' } } } } }
          }
        },
      },
    },
  },
};

export function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
}
