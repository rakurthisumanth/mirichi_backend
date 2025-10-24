import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { swaggerDocs } from './docs/swagger.js';

import authRoutes from './routes/auth.routes.js';
import farmerRoutes from './routes/farmers.routes.js';
import customerRoutes from './routes/customers.routes.js';
import getCustomersByNameRoutes from './routes/getcustomersbyname.routes.js';
import getFarmerByNameRoutes from './routes/getfarmerbyname.routes.js';
import getBagsByFarmerNameRoutes from './routes/getbagsbyfarmername.routes.js';
import getBuyingStockByCustomerRoutes from './routes/getbuyingstockbycustomer.routes.js';
import createBuyingStockByCustomerRoutes from './routes/createbuyingstockbycustomer.routes.js';
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes (mounted at root as specified)
app.use('/', authRoutes);
app.use('/', farmerRoutes);
app.use('/', customerRoutes);
app.use('/', getCustomersByNameRoutes);
app.use('/', getFarmerByNameRoutes);
app.use('/', getBagsByFarmerNameRoutes);
app.use('/', getBuyingStockByCustomerRoutes);
app.use('/', createBuyingStockByCustomerRoutes);

// Also mount under /api to match Swagger paths
app.use('/api', authRoutes);
app.use('/api', farmerRoutes);
app.use('/api', customerRoutes);
app.use('/api', getCustomersByNameRoutes);
app.use('/api', getFarmerByNameRoutes);
app.use('/api', getBagsByFarmerNameRoutes);
app.use('/api', getBuyingStockByCustomerRoutes);
app.use('/api', createBuyingStockByCustomerRoutes);


// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
// Swagger UI
swaggerDocs(app);

// app.use((req, res) => {
//   res.status(404).json({ message: 'Not Found' });
// });

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;
