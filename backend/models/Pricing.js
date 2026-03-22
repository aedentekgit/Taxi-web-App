const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  vehicle_type:    { type: String, required: true },
  icon:            { type: String, default: null },
  rental_price:    { type: Number, required: true },
  roundtrip_price: { type: Number, required: true },
  base_fare:       { type: Number, default: 0 },
  driver_bata:     { type: Number, default: 0 },
  min_km:          { type: Number, default: 0 },
  night_charges:   { type: Number, default: 0 },
  hill_charges:    { type: Number, default: 0 },
  day_rent:        { type: Number, default: 0 },
  day_rent_single: { type: Boolean, default: false },
  day_rent_round:  { type: Boolean, default: true },
  offer:           { type: String, default: 'Best Price' },
  feature1:        { type: String, default: '' },
  feature2:        { type: String, default: '' },
  feature3:        { type: String, default: '' },
  feature4:        { type: String, default: '' },
  feature5:        { type: String, default: '' },
  status:          { type: Number, default: 1 } // 1 for active, 0 for inactive
}, { timestamps: true });

module.exports = mongoose.model('Pricing', pricingSchema);
