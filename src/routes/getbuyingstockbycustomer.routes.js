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

    // ---- DATE VALIDATION ----
    const start = new Date(from_date);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: 'from_date is invalid' });
    }

    const end = to_date ? new Date(to_date) : new Date(start);
    if (isNaN(end.getTime())) {
      return res.status(400).json({ message: 'to_date is invalid' });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // ---- MATCH STAGE ----
    const matchStage = {
      date: { $gte: start, $lte: end }
    };

    if (buyer_name && buyer_name.trim()) {
      matchStage.buyer_name = {
        $regex: buyer_name.trim(),
        $options: 'i'
      };
    }

    // ---- AGGREGATION PIPELINE ----
    const pipeline = [
      { $match: matchStage },

      // Latest record first
      { $sort: { date: -1 } },

      // Group by buyer
      {
        $group: {
          _id: "$buyer_contact",

          buyer_name: { $first: "$buyer_name" },
          buyer_contact: { $first: "$buyer_contact" },
          date: { $first: "$date" },
          bill_id: { $first: "$bill_id" },

          total_base_price: { $sum: "$total_base_price" },
          commission: { $sum: "$commission" },
          bags_price: { $sum: "$bags_price" },
          total_net_amount: { $sum: "$total_net_amount" },

          details: { $push: "$details" }
        }
      },

      // Flatten details array
      {
        $addFields: {
          details: {
            $reduce: {
              input: "$details",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },

      // Unwind details
      { $unwind: "$details" },
      { $unwind: "$details.variety_details" },

      // 🔥 Merge same farmer + variety + rate
      {
        $group: {
          _id: {
            buyer_contact: "$buyer_contact",
            farmer_id: "$details.farmer_id",
            farmer_name: "$details.farmer_name",
            variety: "$details.variety_details.variety",
            rate: "$details.variety_details.rate"
          },

          buyer_name: { $first: "$buyer_name" },
          buyer_contact: { $first: "$buyer_contact" },
          date: { $first: "$date" },
          bill_id: { $first: "$bill_id" },

          total_base_price: { $first: "$total_base_price" },
          commission: { $first: "$commission" },
          bags_price: { $first: "$bags_price" },
          total_net_amount: { $first: "$total_net_amount" },

          bags: { $sum: "$details.variety_details.bags" },
          weight: {
            $sum: { $toDouble: "$details.variety_details.weight" }
          }
        }
      },

      // Build variety_details array
      {
        $group: {
          _id: {
            buyer_contact: "$buyer_contact",
            farmer_id: "$_id.farmer_id",
            farmer_name: "$_id.farmer_name"
          },

          buyer_name: { $first: "$buyer_name" },
          buyer_contact: { $first: "$buyer_contact" },
          date: { $first: "$date" },
          bill_id: { $first: "$bill_id" },

          total_base_price: { $first: "$total_base_price" },
          commission: { $first: "$commission" },
          bags_price: { $first: "$bags_price" },
          total_net_amount: { $first: "$total_net_amount" },

          variety_details: {
            $push: {
              variety: "$_id.variety",
              rate: "$_id.rate",
              bags: "$bags",
              weight: { $toString: "$weight" }
            }
          }
        }
      },

      // Build details array
      {
        $group: {
          _id: "$buyer_contact",

          buyer_name: { $first: "$buyer_name" },
          buyer_contact: { $first: "$buyer_contact" },
          date: { $first: "$date" },
          bill_id: { $first: "$bill_id" },

          total_base_price: { $first: "$total_base_price" },
          commission: { $first: "$commission" },
          bags_price: { $first: "$bags_price" },
          total_net_amount: { $first: "$total_net_amount" },

          details: {
            $push: {
              farmer_id: "$_id.farmer_id",
              farmer_name: "$_id.farmer_name",
              variety_details: "$variety_details"
            }
          }
        }
      },

      // Final output
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

    const data = await coll.aggregate(pipeline).toArray();

    return res.status(200).json({
      count: data.length,
      data
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});





export default router;
