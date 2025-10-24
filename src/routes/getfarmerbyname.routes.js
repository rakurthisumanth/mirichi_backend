import { Router } from 'express';

const router = Router();

// POST /getFarmersByName
// Searches in farmer_data collection for documents where buyer_name (or customer_name) matches, case-insensitive
router.post('/getFarmersByName', async (req, res) => {
  try {
    const { farmer_name } = req.body || {};
    if (!farmer_name ) {
      return res.status(400).json({ message: 'farmer_name is required' });
    }

    const farmers = req.app.locals.farmers; // mapped to customer_data
    if (!farmers) {
      return res.status(500).json({ message: 'farmer_name collection not initialized' });
    }

  const name = farmer_name.trim();
  // Anchor to start (prefix match): ^<escaped>
  const regex = new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const filter = { $or: [ { farmer_name: { $regex: regex } } ] };
    console.log(filter,"filter filter filter")
    const results = await farmers.find(filter).toArray();
    if (!results.length) {
      return res.status(404).json({ message: 'No farmers found' });
    }
    return res.status(200).json({ count: results.length, data: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
