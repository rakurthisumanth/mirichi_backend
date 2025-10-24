import { Router } from 'express';

const router = Router();

function toNumber(val) {
  if (val == null) return undefined;
  if (typeof val === 'object' && ('$numberInt' in val || '$numberDouble' in val)) {
    const n = val.$numberInt ?? val.$numberDouble;
    const parsed = Number(n);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  const parsed = Number(val);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// POST /createBuyingStockByCustomer
// Inserts a billing document into buying_stock_by_customer
router.post('/createBuyingStockByCustomer', async (req, res) => {
  try {
    const coll = req.app.locals.buyingStockByCustomer;
    if (!coll) return res.status(500).json({ message: 'Collection not initialized' });

    const {
      buyer_name,
      buyer_contact,
      details,
      total_base_price,
      commission,
      bags_price,
      total_net_amount,
    } = req.body || {};

    if (!buyer_name || !buyer_contact || !Array.isArray(details)) {
      return res.status(400).json({ message: 'buyer_name, buyer_contact, and details array are required' });
    }

    const doc = {
      buyer_name: String(buyer_name).trim(),
      buyer_contact: String(buyer_contact).trim(),
      details: details,
      total_base_price: toNumber(total_base_price),
      commission: toNumber(commission),
      bags_price: toNumber(bags_price),
      total_net_amount: toNumber(total_net_amount),
      date: new Date(),
    };
    // Optionally store the client-provided date for reference
    const result = await coll.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, message: 'Created billing record' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
