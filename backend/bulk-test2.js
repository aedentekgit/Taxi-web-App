const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const randStr = Math.random().toString(36).substring(7);
const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const testModels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mytaxi');
    const fs = require('fs');
    const path = require('path');
    const modelsPath = path.join(__dirname, 'models');
    
    const generators = {
      Customer: () => ({ name: 'Cust', email: 'c'+randNum(1,999999)+'@test.com', phone: '9'+randNum(10000000,99999999), referralCode: 'R'+randNum(1,999999) }),
      Driver: () => ({ name: 'Driver', email: 'd'+randNum(1,999999)+'@t.com', phone: '8'+randNum(10000000,99999999) }),
      User: () => ({ name: 'Emp', email: 'e'+randNum(1,999999)+'@t.com', password: 'pwd', role: 'admin' }),
      Service: () => ({ title: 'Service', slug: 's'+randNum(1,999999), content: 'x' }),
      Destination: () => ({ name: 'Dest', slug: 'd'+randNum(1,999999), country: 'Ind', state: 'x', image: 'url', description: 'x' }),
      Package: () => ({ title: 'Pkg', slug: 'p'+randNum(1,999999), destination: 'Dest', days: 3, nights: 2, price: 1000, includes: ['x'] }),
      Coupon: () => ({ code: 'C'+randNum(1,999999), title: 'xx', validUntil: new Date(Date.now()*2) }),
      RentalPackage: () => ({ package_name: 'rp'+randNum(1,999999), hours: 2, km: 20, price: 1000, isActive: true }),
      DriverIncentive: () => ({ title: 'Inc', targetValue: 10, incentiveType: 'rides', type: 'daily', targetRides: 10, rewardAmount: 50, startDate: new Date(), endDate: new Date(Date.now()*2) }),
      Pricing: () => ({ vehicle_type: 'sedan', status: 1, baseFare: 100, rental_price: 1000, roundtrip_price: 15, perKmRate: 10, perMinuteRate: 2, minimumFare: 150 }),
      Booking: (refs) => ({ customer: refs.Customer, vehicleType: 'sedan', pickupLocation: { address: 'A', coordinates: [0,0] }, dropLocation: { address: 'B', coordinates: [1,1] } }),
      IntercityBooking: (refs) => ({ customer: refs.Customer, vehicleType: 'sedan', tripType: 'oneway', pickupCity: 'A', dropCity: 'B' }),
      RentalBooking: (refs) => ({ customer: refs.Customer, vehicleType: 'sedan', pickupLocation: 'x', hours: 4, km: 40 }),
      SOSAlert: (refs) => ({ bookingId: '60c72b2f9b1d8b001c8e4a5d', raisedBy: 'customer', userId: refs.Customer, userType: 'Customer', location: { coordinates: [0,0] }, status: 'new' }),
      SupportTicket: (refs) => ({ customerId: refs.Customer, category: 'trip', raisedBy: 'customer', subject: 'x', description: 'x' }),
    };

    const runReport = {};
    const modelInstances = {};
    for (const file of fs.readdirSync(modelsPath)) {
        if (!file.endsWith('.js') || file.includes('Settings')) continue;
        const Model = require(path.join(modelsPath, file));
        modelInstances[Model.modelName] = Model;
    }

    const order = ['Customer', 'Driver', 'User', 'Service', 'Destination', 'Package', 'Coupon', 'RentalPackage', 'DriverIncentive', 'Pricing', 'Booking', 'IntercityBooking', 'RentalBooking', 'SOSAlert', 'SupportTicket'];
    const refs = {};

    for (const name of order) {
      if (!generators[name] || !modelInstances[name]) continue;
      const Model = modelInstances[name];
      const genObj = generators[name];

      try {
          // 1. ADD 50
          const toInsert = [];
          for (let i = 0; i < 50; i++) toInsert.push(genObj(refs));
          const inserted = await Model.insertMany(toInsert);
          
          if (inserted.length > 0) refs[name] = inserted[0]._id;

          runReport[name] = { add50: '✅' };

          // 2. UPDATE 20
          const toUpdate = inserted.slice(0, 20);
          for (let doc of toUpdate) {
             await Model.updateOne({ _id: doc._id }, { $set: { updatedAt: new Date() } });
          }
          runReport[name].update20 = '✅';

          // 3. DELETE 10
          const toDelete = inserted.slice(20, 30);
          const delIds = toDelete.map(d => d._id);
          const delRes = await Model.deleteMany({ _id: { $in: delIds } });
          runReport[name].delete10 = '✅';

      } catch (err) {
          runReport[name] = { error: err.message };
      }
    }

    console.table(runReport);
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
};
testModels();
