const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId:    { type: String, unique: true },
  raisedBy:    { type: String, enum: ['customer','driver'], required: true },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  driver:      { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  booking:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  category:    { type: String, enum: ['payment','driver','app','refund','technical','other'], required: true },
  subject:     { type: String, required: true },
  description: { type: String },
  priority:    { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  status:      { type: String, enum: ['open','in_progress','resolved','closed'], default: 'open' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  replies: [{
    from:      { type: String, enum: ['admin','customer','driver'] },
    message:   { type: String },
    sentAt:    { type: Date, default: Date.now },
    sentBy:    { type: mongoose.Schema.Types.ObjectId, refPath: 'replies.fromModel' },
  }],
  resolvedAt:  { type: Date },
}, { timestamps: true });

ticketSchema.pre('save', function(next) {
  if (!this.ticketId) this.ticketId = 'TK' + Date.now().toString().slice(-8) + Math.floor(Math.random()*100);
  next();
});

module.exports = mongoose.model('SupportTicket', ticketSchema);
