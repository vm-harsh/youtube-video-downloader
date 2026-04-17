import mongoose from 'mongoose';

const downloadHistorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  format: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  size: {
    type: Number,
    default: 0
  },
  sourceUrl: {
    type: String,
    required: true
  }
});

export default mongoose.model('DownloadHistory', downloadHistorySchema);
