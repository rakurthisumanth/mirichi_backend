import { Router } from 'express';

const router = Router();

// POST /getBuyingStockByCustomerByDate
// Body: { from_date: 'YYYY-MM-DD' | ISO, to_date?: 'YYYY-MM-DD' | ISO }
// Returns all docs from buying_stock_by_customer with date between [from_date, to_date] inclusive
router.post('/getBuyingStockByCustomerByDate', async (req, res) => {
  try {
    const { from_date, to_date } = req.body || {};
    if (!from_date) {
      return res.status(400).json({ message: 'from_date is required' });
    }

    const coll = req.app.locals.buyingStockByCustomer;
    if (!coll) return res.status(500).json({ message: 'Collection not initialized' });

    const start = new Date(from_date);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: 'from_date is invalid' });
    }

    let end;
    if (to_date) {
      end = new Date(to_date);
      if (isNaN(end.getTime())) return res.status(400).json({ message: 'to_date is invalid' });
    } else {
      end = new Date(start);
    }

    // Set to inclusive day range
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = { date: { $gte: startOfDay, $lte: endOfDay } };
    const results = await coll.find(filter).toArray();
    return res.status(200).json({ count: results.length, data: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
