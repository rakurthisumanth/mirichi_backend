import { Router } from 'express';

const router = Router();

function toNumber(val) {
  if (val == null) return undefined;
  if (typeof val === 'object' && ('$numberInt' in val || '$numberDouble' in val)) {
    const n = val.$numberInt ?? val.$numberDouble;
    const parsed = Number(n);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  const parsed = Number(val);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// POST /createBuyingStockByCustomer
// Inserts a billing document into buying_stock_by_customer
router.post('/createBuyingStockByCustomer', async (req, res) => {
  try {
    const coll = req.app.locals.buyingStockByCustomer;
    const farmersColl = req.app.locals.farmers;
    if (!coll || !farmersColl) return res.status(500).json({ message: 'Collection not initialized' });

    const {
      bill_id,
      buyer_name,
      buyer_contact,
      details,
      total_base_price,
      commission,
      bags_price,
      total_net_amount,
    } = req.body || {};

    if (!buyer_name || !buyer_contact || !Array.isArray(details)) {
      return res.status(400).json({ message: 'buyer_name, buyer_contact, and details array are required' });
    }

    // 1. Insert the billing record as before
    const doc = {
      bill_id: String(bill_id).trim(),
      buyer_name: String(buyer_name).trim(),
      buyer_contact: String(buyer_contact).trim(),
      details: details,
      total_base_price: toNumber(total_base_price),
      commission: toNumber(commission),
      bags_price: toNumber(bags_price),
      total_net_amount: toNumber(total_net_amount),
      date: new Date(),
    };
    const result = await coll.insertOne(doc);

    // 2. For each farmer_id/variety, decrement bags in farmers_data
    const updateOps = [];
    let opIndex = 0;
    for (const d of details) {
      const { farmer_id, variety_details } = d || {};
      if (!farmer_id || !Array.isArray(variety_details)) continue;
      for (const v of variety_details) {
        const { variety, bags } = v || {};
        const bagsToDecrement = toNumber(bags);
        if (!variety || !bagsToDecrement) continue;
        // Use a unique array filter name for each update
        const filterName = `vb${opIndex}`;
        const incPath = `variety_bags.$[${filterName}].no_of_bags`;

        // 1. Fallback: If no_of_bags is an object with $numberInt or $numberDouble, convert it to a number (preserve value)
        updateOps.push(
          farmersColl.updateOne(
            { farmer_id },
            {
              $set: {
                [incPath]: {
                  $cond: [
                    { $and: [
                      { $isObject: `$${incPath}` },
                      { $ne: [ { $type: `$${incPath}.$numberInt` }, "missing" ] }
                    ] },
                    { $toInt: `$${incPath}.$numberInt` },
                    {
                      $cond: [
                        { $and: [
                          { $isObject: `$${incPath}` },
                          { $ne: [ { $type: `$${incPath}.$numberDouble` }, "missing" ] }
                        ] },
                        { $toDouble: `$${incPath}.$numberDouble` },
                        `$${incPath}`
                      ]
                    }
                  ]
                }
              }
            },
            {
              arrayFilters: [
                {
                  [`${filterName}.variety_name`]: variety,
                  $or: [
                    { [`${filterName}.no_of_bags.$numberInt`]: { $exists: true } },
                    { [`${filterName}.no_of_bags.$numberDouble`]: { $exists: true } }
                  ]
                }
              ]
            }
          )
        );

        // 2. Now always decrement (after conversion, so $inc always works)
        updateOps.push(
          farmersColl.updateOne(
            { farmer_id },
            {
              $inc: { [incPath]: -bagsToDecrement },
            },
            {
              arrayFilters: [
                { [`${filterName}.variety_name`]: variety, [`${filterName}.no_of_bags`]: { $type: 'number' } },
              ],
            }
          )
        );
        opIndex++;
      }
    }
    // Run all updates in parallel
    const updateResults = await Promise.all(updateOps);

    return res.status(201).json({ _id: result.insertedId, message: 'Created billing record and updated farmer bag counts', updateResults });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
