import { Router } from 'express';
import { ObjectId } from "mongodb";

const router = Router();

// POST /customers (protected)
router.post('/customers', async (req, res) => {
  try {
    const {
      buyer_id,
      buyer_name,
      buyer_contact_number,
      buyer_village,
      buyer_refer_name,
      buyer_date,
    } = req.body;


    const customers = req.app.locals.customers;

    /* ================================
       UPDATE CUSTOMER (buyer_id exists)
       ================================ */
    if (buyer_id) {
      const updateResult = await customers.updateOne(
        { buyer_id: buyer_id },
        {
          $set: {
            buyer_name,
            buyer_contact_number,
            buyer_village,
            buyer_refer_name,
            buyer_date,
            updated_at: new Date(),
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }

      return res.status(200).json({
        message: "Customer updated successfully",
      });
    }
  
else{
    const existingCustomer = await customers.findOne({
      buyer_name,
      buyer_contact_number,
    });

    if (existingCustomer) {
      return res.status(400).json({
        message: "Customer already exists",
      });
    }

    // generate new buyer_id
    const newBuyerId = new ObjectId().toString()

   await customers.insertOne({
      buyer_id: newBuyerId,
      buyer_name,
      buyer_contact_number,
      buyer_village,
      buyer_refer_name,
      buyer_date,
      created_at: new Date(),
    });

    return res.status(201).json({
      message: "Customer created successfully",
      buyer_id: newBuyerId
    });
}

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put('/updateBuyingRate', async (req, res) => {
  try {
    const {
      buyer_contact,
      variety,
      from_date,
      to_date,
      new_rate
    } = req.body;

    if (!buyer_contact || !variety || !from_date || !new_rate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const coll = req.app.locals.buyingStockByCustomer;
    if (!coll) {
      return res.status(500).json({ message: 'Collection not initialized' });
    }

    // ---- DATE RANGE ----
    const start = new Date(from_date);
    const end = to_date ? new Date(to_date) : new Date(from_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // ---- FIND MATCHING DOCUMENTS ----
    const docs = await coll.find({
      buyer_contact,
      date: { $gte: start, $lte: end },
      "details.variety_details.variety": variety
    }).toArray();

    if (!docs.length) {
      return res.status(404).json({ message: 'No matching records found' });
    }

    // ---- UPDATE EACH DOCUMENT ----
    for (const doc of docs) {
      let totalBasePrice = 0;

      for (const detail of doc.details) {
        for (const v of detail.variety_details) {
          // Update rate for matching variety
          if (v.variety === variety) {
            v.rate = Number(new_rate);
          }

          // Calculate base price
          const weight = parseFloat(v.weight || 0);
          totalBasePrice += v.rate * weight;
        }
      }

      // ---- CALCULATIONS ----
      const commission = +(totalBasePrice * 0.03).toFixed(2);
      const totalNetAmount =
        +(totalBasePrice + commission + (doc.bags_price || 0)).toFixed(2);

      // ---- UPDATE DB ----
      await coll.updateOne(
        { _id: doc._id },
        {
          $set: {
            details: doc.details,
            total_base_price: +totalBasePrice.toFixed(2),
            commission,
            total_net_amount: totalNetAmount
          }
        }
      );
    }

    return res.status(200).json({
      message: 'Rate updated successfully',
      updated_count: docs.length
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


export default router;
