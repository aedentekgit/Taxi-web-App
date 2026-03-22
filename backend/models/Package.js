const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['transfer', 'sightseeing', 'meal', 'stay', 'flight'], 
    default: 'sightseeing' 
  },
  title: String,
  subtitle: String,
  description: String,
  image: String // URL or Base64 Image
});

const DaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: String,
  activities: [ActivitySchema]
});

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  location: String,
  duration: String,
  people: { type: String, default: '2 Adults' },
  price: Number,
  discount_price: Number,
  image: String,
  description: String,
  inclusions: { type: [String], default: [] },
  itinerary: { type: [DaySchema], default: [] },
  is_featured: { type: Boolean, default: false },
  transport: { type: String, default: 'Private Cab' },
  best_time: { type: String, default: 'All Year' },
  quality: { type: String, default: 'Premium' },
  rating: { type: Number, default: 5.0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
