import { Router } from 'express';

const router = Router();

// POST /getBuyingStockByCustomerByDate
// Body: { from_date: 'YYYY-MM-DD' | ISO, to_date?: 'YYYY-MM-DD' | ISO }
// Returns all docs from buying_stock_by_customer with date between [from_date, to_date] inclusive
router.post('/getBuyingStockByCustomerByDate', async (req, res) => {
  try {
    const { from_date, to_date, buyer_name } = req.body || {};
    if (!from_date) {
      return res.status(400).json({ message: 'from_date is required' });
    }

    const coll = req.app.locals.buyingStockByCustomer;
    if (!coll) {
      return res.status(500).json({ message: 'Collection not initialized' });
    }

    const start = new Date(from_date);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: 'from_date is invalid' });
    }

    let end;
    if (to_date) {
      end = new Date(to_date);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: 'to_date is invalid' });
      }
    } else {
      end = new Date(start);
    }

    // Inclusive date range
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    // Match filter
    const matchStage = {
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    if (buyer_name && buyer_name.trim()) {
      matchStage.buyer_name = {
        $regex: buyer_name.trim(),
        $options: "i",
      };
    }

    const pipeline = [
      { $match: matchStage },

      // Sort by latest date first
      { $sort: { date: -1 } },

      {
        $group: {
          _id: "$buyer_contact",

          buyer_name: { $first: "$buyer_name" },
          buyer_contact: { $first: "$buyer_contact" },

          // LATEST values
          date: { $first: "$date" },
          bill_id: { $first: "$bill_id" },

          // COMBINED details
          detailsArrays: { $push: "$details" },

          // SUM totals
          total_base_price: { $sum: "$total_base_price" },
          commission: { $sum: "$commission" },
          bags_price: { $sum: "$bags_price" },
          total_net_amount: { $sum: "$total_net_amount" },
        }
      },

      {
        $addFields: {
          details: {
            $reduce: {
              input: "$detailsArrays",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },

      {
        $project: {
          _id: 0,
          buyer_name: 1,
          buyer_contact: 1,
          date: 1,
          bill_id: 1,
          total_base_price: 1,
          commission: 1,
          bags_price: 1,
          total_net_amount: 1,
          details: 1
        }
      }
    ];

    const results = await coll.aggregate(pipeline).toArray();

    return res.status(200).json({
      count: results.length,
      data: results
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});




export default router;
