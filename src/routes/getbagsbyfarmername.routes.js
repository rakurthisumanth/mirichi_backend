import { Router } from 'express';

const router = Router();

// POST /getBagsByFarmerName
// Counts total no_of_bags for a farmer by name (prefix match, case-insensitive)
router.post('/getBagsByFarmerName', async (req, res) => {
  try {
    const { farmer_name } = req.body || {};
    if (!farmer_name || typeof farmer_name !== 'string' || !farmer_name.trim()) {
      return res.status(400).json({ message: 'farmer_name is required' });
    }

    const farmers = req.app.locals.farmers; // mapped to farmers_data
    if (!farmers) {
      return res.status(500).json({ message: 'Farmers collection not initialized' });
    }

    const name = farmer_name.trim();
    const regex = new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // Aggregate sum across variety_bags.no_of_bags (string or number)
    const pipeline = [
      { $match: { farmer_name: { $regex: regex } } },
      { $unwind: { path: '$variety_bags', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          total_bags: {
            $sum: {
              $toInt: { $ifNull: ['$variety_bags.no_of_bags', 0] }
            }
          },
          matched_count: { $sum: 1 }
        }
      }
    ];

    const agg = await farmers.aggregate(pipeline).toArray();
    if (!agg.length) {
      // No matching farmers
      return res.status(404).json({ message: 'No farmers found' });
    }

    // matched_count counts the number of variety_bags entries; derive farmer_docs count with a separate query if needed
    // For now, return total_bags and the prefix used
    const { total_bags } = agg[0];
    return res.status(200).json({ farmer_name_query: name, total_bags });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
