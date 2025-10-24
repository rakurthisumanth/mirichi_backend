import { Router } from 'express';

const router = Router();

// POST /customers (protected)
router.post('/customers', async (req, res) => {
  try {
    const { buyer_name, buyer_contact_number } = req.body ;
    if (!buyer_name || !buyer_contact_number ) {
      return res.status(400).json({ message: 'customer_name, phone_number, buy_bags required' });
    }
    const customers = req.app.locals.customers;
    let user= await customers.findOne({buyer_name:buyer_name,buyer_contact_number:buyer_contact_number});
    if(user){
         return res.status(400).json({ message: 'Customer already exists' });
    }
    else{
            const result = await customers.insertOne(req.body);
            return res.status(201).json({ _id: result.insertedId });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
