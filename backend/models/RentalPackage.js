const mongoose = require('mongoose');

const rentalPackageSchema = new mongoose.Schema({
    package_name: { type: String, required: true },
    amount: { type: Number, default: 0.00 },
    features: { type: [String], default: [] },
    status: { type: Number, default: 1 } // 1 active, 0 inactive
}, { timestamps: true });

// Ensure virtuals are included when converting to JSON
rentalPackageSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('RentalPackage', rentalPackageSchema);
