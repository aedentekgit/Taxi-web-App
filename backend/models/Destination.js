const mongoose = require('mongoose');

const spotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String
});

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  spots: [spotSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Optional: Virtual logic to map id for frontend usage if needed
destinationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Destination', destinationSchema);
