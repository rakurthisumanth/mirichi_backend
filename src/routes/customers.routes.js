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

    /* ================================
       CREATE CUSTOMER (buyer_id missing)
       ================================ */

    // check duplicate customer
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

    const insertResult = await customers.insertOne({
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
