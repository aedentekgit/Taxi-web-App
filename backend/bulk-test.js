const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Auto-generate some safe dummy strings
const randStr = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 7)}_${Date.now()}`;
const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randPhone = () => `9${Math.floor(Math.random() * 900000000 + 100000000)}`;

const testModels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mytaxi');
    console.log('Connected to DB');

    // We will dynamically load all models
    const fs = require('fs');
    const path = require('path');
    const modelsPath = path.join(__dirname, 'models');
    
    // Some static test objects mapped by Model name
    const generators = {
      Customer: () => ({ name: randStr('Cust'), email: randStr('email') + '@test.com', phone: randPhone(), totalRides: randNum(0, 10), walletBalance: randNum(0, 500) }),
      Driver: () => ({ name: randStr('Driver'), email: randStr('email') + '@test.com', phone: randPhone(), vehicleNumber: randStr('TN'), vehicleType: 'sedan', vehicleModel: 'Dzire', totalRides: randNum(0, 10), avgRating: 4.5, status: ['pending', 'approved', 'blocked'][randNum(0,2)] }),
      User: () => ({ name: randStr('Emp'), email: randStr('email') + '@dev.com', password: 'password123', phone: randPhone(), role: 'admin' }),
      Service: () => ({ title: randStr('Service'), slug: randStr('slug'), content: 'Test detail description', isActive: true }),
      Destination: () => ({ name: randStr('Dest'), state: 'State', description: 'desc', image: 'url' }),
      Package: () => ({ title: randStr('Pkg'), destination: randStr('Dest'), days: 3, nights: 2, price: randNum(1000, 5000), image: 'url', includes: ['Travel', 'Stay'] }),
      Coupon: () => ({ code: randStr('CODE').toUpperCase(), description: 'Desc', discountType: 'percentage', discountValue: randNum(10, 30), maxDiscount: 100, validUntil: new Date(Date.now() + 864000000) }),
      FAQ: () => undefined, // skip
      RentalPackage: () => ({ hours: randNum(1, 10), km: randNum(10, 100), price: randNum(500, 3000), isActive: true, vehicleType: 'sedan' }),
      Role: () => ({ name: randStr('Role'), permissions: ['dashboard'], isActive: true }),
      DriverIncentive: () => ({ title: randStr('Inc'), type: 'daily', targetRides: 10, rewardAmount: 500, startDate: new Date(), endDate: new Date(Date.now() + 864000000) }),
      Pricing: () => ({ vehicleType: randStr('vhc'), baseFare: 100, perKmRate: 10, perMinuteRate: 2, minimumFare: 120, status: 'active' }),
      Booking: (refs) => ({ customerId: refs.Customer, pickupLocation: { address: 'A', coordinates: [0,0] }, dropLocation: { address: 'B', coordinates: [1,1] }, distance: 10, duration: 20, estimatedFare: 200, status: 'started' }),
      SOSAlert: (refs) => ({ bookingId: refs.Booking, raisedBy: 'customer', userId: refs.Customer, userType: 'Customer', location: { coordinates: [0,0] }, status: 'open' }),
      SupportTicket: (refs) => ({ customerId: refs.Customer, subject: 'Issue', description: 'Desc', status: 'open', priority: 'medium' }),
    };

    const runReport = {};

    // First create references
    const modelInstances = {};
    for (const file of fs.readdirSync(modelsPath)) {
        if (!file.endsWith('.js') || file.includes('Settings')) continue;
        const Model = require(path.join(modelsPath, file));
        modelInstances[Model.modelName] = Model;
    }

    // Insert order (base first)
    const order = ['Role', 'Customer', 'Driver', 'User', 'Service', 'Destination', 'Package', 'Coupon', 'RentalPackage', 'DriverIncentive', 'Pricing', 'Booking', 'SOSAlert', 'SupportTicket'];

    const refs = {};

    for (const name of order) {
      if (!generators[name] || !modelInstances[name]) continue;
      const Model = modelInstances[name];
      const genObj = generators[name];
      console.log(`Testing ${name}...`);

      try {
          // 1. ADD 50
          const toInsert = [];
          for (let i = 0; i < 50; i++) toInsert.push(genObj(refs));
          const inserted = await Model.insertMany(toInsert);
          
          if (inserted.length > 0) refs[name] = inserted[0]._id; // save first as ref

          if (inserted.length !== 50) throw new Error(`Inserted ${inserted.length} != 50`);
          runReport[name] = { add50: '✅' };

          // 2. UPDATE 20
          const toUpdate = inserted.slice(0, 20);
          for (let doc of toUpdate) {
             await Model.updateOne({ _id: doc._id }, { $set: { updatedAt: new Date() } }); // gentle update
          }
          runReport[name].update20 = '✅';

          // 3. DELETE 10
          const toDelete = inserted.slice(20, 30);
          const delIds = toDelete.map(d => d._id);
          const delRes = await Model.deleteMany({ _id: { $in: delIds } });
          if (delRes.deletedCount !== 10) throw new Error(`Deleted ${delRes.deletedCount} != 10`);
          runReport[name].delete10 = '✅';

          console.log(`[PASS] ${name}`);

      } catch (err) {
          console.error(`[FAIL] ${name}`, err.message);
          runReport[name] = { error: err.message };
      }
    }

    console.log('\n--- REPORT ---');
    console.table(runReport);
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
};
testModels();
