import { Router } from 'express';
import authRoutes from './auth.routes.js';
import farmerRoutes from './farmers.routes.js';
import customerRoutes from './customers.routes.js';
import getcustomersbyname from './getcustomersbyname.routes.js';
import getfarmerbyname from './getfarmerbyname.routes.js';  

const router = Router();

// Compose existing route modules under a single router
router.use('/', authRoutes);
router.use('/', farmerRoutes);
router.use('/', customerRoutes);
router.use('/',getcustomersbyname)
router.use('/',getfarmerbyname)

export default router;
