import { Router } from 'express';
import { ObjectId } from 'mongodb';

const router = Router();

// POST /farmers
router.post('/farmers', async (req, res) => {
  try {
    const farmers = req.app.locals.farmers;
    const { farmer_id } = req.body;
    console.log(req.body),"Request Body";

    // Only perform update if farmer_id is a valid, non-empty string
    if (typeof farmer_id === 'string' && farmer_id.trim() && /^[a-fA-F0-9]{24}$/.test(farmer_id)) {
      const _id = new ObjectId(farmer_id);

      // Build update doc excluding identifiers
      const updateDoc = { ...req.body };
      delete updateDoc._id;
      delete updateDoc.farmer_id;

      if (Object.keys(updateDoc).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      const result = await farmers.updateOne({ _id }, { $set: updateDoc });
      if (result.matchedCount === 0) {
        // Try legacy match by stored farmer_id string just in case
        const altResult = await farmers.updateOne({ farmer_id }, { $set: updateDoc });
        if (altResult.matchedCount === 0) {
          return res.status(404).json({ message: 'Farmer not found for farmer_id' });
        }
      }
      return res.status(200).json({ farmer_id, message: 'Farmer updated successfully' });
    }

    // CREATE flow (no farmer_id provided) → enforce required fields
    const { farmer_name, farmer_phone, farmer_village ,farmer_date} = req.body || {};
    if (!farmer_name || !farmer_phone || !farmer_village || !farmer_date) {
      console.log("Missing Fields");
      return res.status(400).json({ message: 'farmer_name, farmer_phone, farmer_village are required' });
    }

    // Deduplicate by name+phone
    const existing = await farmers.findOne({ farmer_name, farmer_phone });
    if (existing) {
      return res.status(400).json({ message: 'Farmer already exists' });
    }
    let arr_bags=req.body.variety_bags;
    console.log(arr_bags,"arr_bags")

    // Generate an ObjectId and mirror it in farmer_id for easy reference
    const _id = new ObjectId();
    const doc = {
      _id,
      farmer_id: _id.toHexString(),
      farmer_name: req.body.farmer_name,
      farmer_phone: req.body.farmer_phone,
      farmer_village: req.body.farmer_village,
      farmer_date: req.body.farmer_date,
      variety_bags: req.body.variety_bags,
    };

    const result = await farmers.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, farmer_id: doc.farmer_id, message: 'Farmer created successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
