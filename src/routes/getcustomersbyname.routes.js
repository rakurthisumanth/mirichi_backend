import { Router } from 'express';

const router = Router();

// POST /getCustomersByName
// Searches in customer_data collection for documents where buyer_name (or customer_name) matches, case-insensitive
router.post('/getCustomersByName', async (req, res) => {
  try {
    const { buyer_name } = req.body || {};
    if (!buyer_name ) {
      return res.status(400).json({ message: 'buyer_name is required' });
    }

    const customers = req.app.locals.customers; // mapped to customer_data
    if (!customers) {
      return res.status(500).json({ message: 'Customers collection not initialized' });
    }

  const name = buyer_name.trim();
  // Anchor to start (prefix match): ^<escaped>
  const regex = new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const filter = { $or: [ { buyer_name: { $regex: regex } } ] };
    console.log(filter,"filter filter filter")
    const results = await customers.find(filter).toArray();
    if (!results.length) {
      return res.status(404).json({ message: 'No customers found' });
    }
    return res.status(200).json({ count: results.length, data: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
