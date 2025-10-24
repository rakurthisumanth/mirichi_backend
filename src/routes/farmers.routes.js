import { Router } from 'express';

const router = Router();

// POST /farmers (protected)
router.post('/farmers', async (req, res) => {
  try {
    const { farmer_name, farmer_phone, farmer_village } = req.body || {};
    if (!farmer_name || !farmer_phone || !farmer_village) {
      return res.status(400).json({ message: 'name, mobile_number, village, no_of_bags required' });
    }

    const farmers =req.app.locals.farmers;
    const user= await farmers.findOne({farmer_name:farmer_name,farmer_phone:farmer_phone});
    console.log(user,"useruseruser")
    if(user){
         return res.status(400).json({ message: 'Farmer already exists' });
    }
    else{
    const result = await farmers.insertOne(req.body);
    return res.status(201).json({ _id: result.insertedId ,message:'Farmer created successfully'});
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
