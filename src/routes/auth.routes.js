import { Router } from 'express';
import bcrypt from 'bcrypt';

const router = Router();

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body || {};
    if (!phone_number || !password) {
      return res.status(400).json({ message: 'phone number and password are required' });
    }
    const users = req.app.locals.users;
    const user = await users.findOne({phone_number:phone_number,Password:password});
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if(user){
       return res.json({status:200, message: 'Login successful', user: { phone_number: user.phone_number, user_id: user.user_id } });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
