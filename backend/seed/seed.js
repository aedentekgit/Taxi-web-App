require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Zone = require('../models/Zone');
const { SubscriptionPlan } = require('../models/Subscription');
const Coupon = require('../models/Coupon');
const SupportTicket = require('../models/SupportTicket');
const SOSAlert = require('../models/SOSAlert');
const Notification = require('../models/Notification');
const AppSettings = require('../models/AppSettings');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  // Clear
  await Promise.all([
    User.deleteMany(), Customer.deleteMany(), Driver.deleteMany(),
    Booking.deleteMany(), Zone.deleteMany(), SubscriptionPlan.deleteMany(),
    Coupon.deleteMany(), SupportTicket.deleteMany(), SOSAlert.deleteMany(),
    Notification.deleteMany(), AppSettings.deleteMany(),
  ]);

  // Users
  const superAdmin = await User.create({ name: 'Super Admin', email: 'admin@mytaxi.com', password: '123456', role: 'superadmin', phone: '+91 99999 00001' });
  await User.create([
    { name: 'Rahul Manager',   email: 'rahul@mytaxi.com',   password: '123456', role: 'manager',   phone: '+91 98765 11111' },
    { name: 'Sunita Support',  email: 'sunita@mytaxi.com',  password: '123456', role: 'support',   phone: '+91 87654 22222' },
    { name: 'Vikram Finance',  email: 'vikram@mytaxi.com',  password: '123456', role: 'finance',   phone: '+91 76543 33333' },
  ]);

  // Zones
  const [z1, z2, z3] = await Zone.insertMany([
    { name: 'Mumbai Central', city: 'Mumbai', fareSlabs: [
      { vehicleType: 'sedan', baseFare: 50, perKmCharge: 12, minFare: 80 },
      { vehicleType: 'suv',   baseFare: 80, perKmCharge: 18, minFare: 120 },
      { vehicleType: 'auto',  baseFare: 30, perKmCharge: 8,  minFare: 50 },
      { vehicleType: 'bike',  baseFare: 20, perKmCharge: 5,  minFare: 30 },
    ]},
    { name: 'Andheri Zone',   city: 'Mumbai', fareSlabs: [
      { vehicleType: 'sedan', baseFare: 45, perKmCharge: 11, minFare: 75 },
      { vehicleType: 'auto',  baseFare: 28, perKmCharge: 7,  minFare: 45 },
      { vehicleType: 'bike',  baseFare: 18, perKmCharge: 5,  minFare: 28 },
    ]},
    { name: 'Thane Zone',     city: 'Thane',  fareSlabs: [
      { vehicleType: 'sedan', baseFare: 40, perKmCharge: 10, minFare: 70 },
      { vehicleType: 'auto',  baseFare: 25, perKmCharge: 6,  minFare: 40 },
      { vehicleType: 'bike',  baseFare: 15, perKmCharge: 4,  minFare: 25 },
    ]},
  ]);

  // Customers
  const customers = await Customer.insertMany([
    { name: 'Priya Sharma',  phone: '+91 98765 43210', email: 'priya@gmail.com',  city: 'Mumbai',  walletBalance: 450,  totalRides: 34,  totalSpent: 12840, status: 'active',  referralCode: 'PRIYA123' },
    { name: 'Amit Verma',    phone: '+91 87654 32109', email: 'amit@gmail.com',   city: 'Delhi',   walletBalance: 0,    totalRides: 128, totalSpent: 48920, status: 'active',  referralCode: 'AMIT456' },
    { name: 'Sneha Patel',   phone: '+91 76543 21098', email: 'sneha@gmail.com',  city: 'Pune',    walletBalance: 200,  totalRides: 12,  totalSpent: 4210,  status: 'active',  referralCode: 'SNEHA789' },
    { name: 'Rahul Gupta',   phone: '+91 65432 10987', email: 'rahulg@gmail.com', city: 'Mumbai',  walletBalance: 150,  totalRides: 67,  totalSpent: 24800, status: 'active',  referralCode: 'RAHUL012' },
    { name: 'Kavya Iyer',    phone: '+91 54321 09876', email: 'kavya@gmail.com',  city: 'Chennai', walletBalance: 75,   totalRides: 21,  totalSpent: 8400,  status: 'blocked', referralCode: 'KAVYA345' },
    { name: 'Rohan Singh',   phone: '+91 43210 98765', email: 'rohan@gmail.com',  city: 'Mumbai',  walletBalance: 0,    totalRides: 8,   totalSpent: 2100,  status: 'active',  referralCode: 'ROHAN678' },
  ]);

  // Drivers
  const drivers = await Driver.insertMany([
    { name: 'Raj Kumar',    phone: '+91 99876 54321', vehicleNumber: 'MH01AB1234', vehicleType: 'sedan', zone: z1._id, rating: 4.8, totalRides: 342, totalEarnings: 68400, isOnline: true,  status: 'approved' },
    { name: 'Suresh Nair',  phone: '+91 88765 43210', vehicleNumber: 'MH02CD5678', vehicleType: 'suv',   zone: z2._id, rating: 4.6, totalRides: 289, totalEarnings: 57800, isOnline: false, status: 'approved' },
    { name: 'Mohan Bhat',   phone: '+91 77654 32109', vehicleNumber: 'MH03EF9012', vehicleType: 'auto',  zone: z3._id, rating: 4.9, totalRides: 267, totalEarnings: 53400, isOnline: true,  status: 'approved' },
    { name: 'Anand Rao',    phone: '+91 66543 21098', vehicleNumber: 'MH04GH3456', vehicleType: 'sedan', zone: z1._id, rating: 4.7, totalRides: 251, totalEarnings: 50200, isOnline: false, status: 'approved' },
    { name: 'Ravi Sharma',  phone: '+91 55432 10987', vehicleNumber: 'MH05IJ7890', vehicleType: 'bike',  zone: z2._id, rating: 0,   totalRides: 0,   totalEarnings: 0,     isOnline: false, status: 'pending'  },
    { name: 'Priti Kale',   phone: '+91 44321 09876', vehicleNumber: 'MH06KL2345', vehicleType: 'sedan', zone: z1._id, rating: 0,   totalRides: 0,   totalEarnings: 0,     isOnline: false, status: 'pending'  },
  ]);

  // Bookings
  const statuses = ['completed','completed','completed','started','pending','cancelled'];
  const pays = ['cash','wallet','upi','card'];
  for (let i = 0; i < 20; i++) {
    const fare = Math.round((Math.random() * 800 + 80) / 10) * 10;
    const commission = Math.round(fare * 0.2);
    await Booking.create({
      customer: customers[i % customers.length]._id,
      driver:   drivers[i % 4]._id,
      vehicleType: ['sedan','suv','auto','bike'][i % 4],
      pickup: { address: 'Pickup Location ' + i },
      drop:   { address: 'Drop Location ' + i },
      distance: +(Math.random() * 20 + 1).toFixed(1),
      fare, commission, driverEarning: fare - commission,
      paymentMethod: pays[i % 4],
      paymentStatus: 'paid',
      status: statuses[i % statuses.length],
    });
  }

  // Subscription Plans
  await SubscriptionPlan.insertMany([
    { name: 'Basic',    price: 499,   durationDays: 30, ridesLimit: 100,  commissionRate: 20, features: ['100 rides/month', 'Basic support', 'Standard commission'] },
    { name: 'Standard', price: 999,   durationDays: 30, ridesLimit: 300,  commissionRate: 15, isPopular: true, features: ['300 rides/month', 'Priority support', 'Reduced commission'] },
    { name: 'Premium',  price: 1999,  durationDays: 30, ridesLimit: null, commissionRate: 10, features: ['Unlimited rides', '24/7 support', 'Lowest commission', 'Featured driver'] },
  ]);

  // Coupons
  await Coupon.insertMany([
    { code: 'RIDE20',   title: '20% Off Cab',         discountType: 'percentage', discountValue: 20, maxDiscount: 100, serviceType: 'cab',       validUntil: new Date('2026-04-30'), usedCount: 842, createdBy: superAdmin._id },
    { code: 'FIRST50',  title: '₹50 Off First Ride',  discountType: 'flat',       discountValue: 50, serviceType: 'all',       validUntil: new Date('2026-03-31'), usedCount: 1204, createdBy: superAdmin._id },
    { code: 'INTER100', title: '₹100 Off Intercity',  discountType: 'flat',       discountValue: 100,serviceType: 'intercity', validUntil: new Date('2026-05-15'), usedCount: 312, createdBy: superAdmin._id },
    { code: 'RENTAL15', title: '15% Off Rental',      discountType: 'percentage', discountValue: 15, maxDiscount: 150,serviceType: 'rental',    validUntil: new Date('2026-06-30'), usedCount: 156, createdBy: superAdmin._id },
  ]);

  // Support Tickets
  await SupportTicket.insertMany([
    { raisedBy: 'customer', customer: customers[0]._id, category: 'payment',   subject: 'Fare charged incorrectly', priority: 'high',   status: 'open' },
    { raisedBy: 'driver',   driver:   drivers[0]._id,  category: 'technical', subject: 'App crashing during ride', priority: 'medium', status: 'in_progress' },
    { raisedBy: 'customer', customer: customers[1]._id, category: 'driver',    subject: 'Driver was rude',          priority: 'urgent', status: 'open' },
    { raisedBy: 'customer', customer: customers[2]._id, category: 'refund',    subject: 'Cancelled ride not refunded',priority: 'low',  status: 'resolved', resolvedAt: new Date() },
  ]);

  // SOS
  await SOSAlert.insertMany([
    { raisedBy: 'customer', customer: customers[0]._id, location: { address: 'Andheri West, Mumbai' }, status: 'active' },
    { raisedBy: 'driver',   driver:   drivers[0]._id,  location: { address: 'Bandra, Mumbai' },        status: 'active' },
    { raisedBy: 'customer', customer: customers[2]._id, location: { address: 'Juhu Beach, Mumbai' },    status: 'resolved', resolvedAt: new Date() },
  ]);

  // Notifications
  await Notification.insertMany([
    { title: '🚗 Book Your Ride Now!', message: 'Get 20% off on your next cab ride. Use code RIDE20', targetType: 'all_users',    sentCount: 12847, status: 'sent', sentBy: superAdmin._id, sentAt: new Date('2026-03-18') },
    { title: 'New Feature: Intercity', message: 'Now available in 50+ cities',                        targetType: 'all_users',    sentCount: 12847, status: 'sent', sentBy: superAdmin._id, sentAt: new Date('2026-03-15') },
    { title: 'Complete your KYC',      message: 'Upload your documents to start accepting rides',      targetType: 'all_drivers',  sentCount: 3421,  status: 'sent', sentBy: superAdmin._id, sentAt: new Date('2026-03-12') },
    { title: 'Special Weekend Offer!', message: 'Free rides for premium members this weekend',         targetType: 'all_users',    sentCount: 5200,  status: 'sent', sentBy: superAdmin._id, sentAt: new Date('2026-03-10') },
  ]);

  // App Settings
  await AppSettings.insertMany([
    { key: 'appName',            value: 'MyTaxi',  category: 'general' },
    { key: 'currency',           value: 'INR',     category: 'general' },
    { key: 'currencySymbol',     value: '₹',       category: 'general' },
    { key: 'countryCode',        value: '+91',     category: 'general' },
    { key: 'androidVersion',     value: '1.2.0',   category: 'general' },
    { key: 'iosVersion',         value: '1.2.0',   category: 'general' },
    { key: 'driverSearchRadius', value: 5,         category: 'ride' },
    { key: 'cancellationFee',    value: 30,        category: 'ride' },
    { key: 'otpExpiry',          value: 5,         category: 'ride' },
    { key: 'maxStops',           value: 3,         category: 'ride' },
    { key: 'commissionRate',     value: 20,        category: 'ride' },
    { key: 'referralBonus',      value: 50,        category: 'referral' },
  ]);

  console.log('✅ Seed complete! Login: admin@mytaxi.com / 123456');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
