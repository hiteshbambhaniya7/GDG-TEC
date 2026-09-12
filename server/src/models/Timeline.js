import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Report Submitted',
        'AI Analysis Completed',
        'Assigned',
        'Work Started',
        'Resolution Submitted',
        'Resolved',
        'Reopened',
        'Feedback Submitted'
      ],
      default: 'Report Submitted'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    performedBy: {
      type: String,
      required: true,
      default: 'System'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Timeline = mongoose.model('Timeline', timelineSchema);
