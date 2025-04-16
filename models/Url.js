const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

urlSchema.index({ shortId: 1 });
urlSchema.index({ originalUrl: 1 });

module.exports = mongoose.model('Url', urlSchema);