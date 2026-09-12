import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide issue details'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'roads_potholes',
        'garbage_waste',
        'water_drainage',
        'street_light',
        'stray_animals',
        'health_vector',
        'encroachment',
        'other'
      ],
      default: 'roads_potholes'
    },
    images: [
      {
        type: String
      }
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [72.1519, 21.7645] // Center of Bhavnagar
      },
      address: {
        type: String,
        default: 'Bhavnagar, Gujarat'
      },
      ward: {
        type: String,
        default: 'Ward 1 - Kaliyabid'
      },
      landmark: {
        type: String,
        default: ''
      }
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    citizenContact: {
      name: { type: String, default: 'Concerned Citizen' },
      phone: { type: String, default: '9876543210' }
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'ai_analyzed',
        'assigned',
        'in_progress',
        'resolved',
        'rejected'
      ],
      default: 'submitted',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    aiAnalysis: {
      analyzedAt: { type: Date },
      confidence: { type: Number, default: 0.85 },
      suggestedCategory: { type: String },
      suggestedDepartment: { type: String },
      severityScore: { type: Number, default: 5 }, // 1 - 10
      safetyHazard: { type: Boolean, default: false },
      urgencyReason: { type: String },
      detectedKeywords: [{ type: String }],
      summary: { type: String }
    },
    assignedDepartment: {
      type: String,
      default: 'Roads & Buildings (PWD)',
      index: true
    },
    assignedOfficer: {
      officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      officerName: { type: String },
      assignedAt: { type: Date }
    },
    resolution: {
      resolvedAt: { type: Date },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String },
      proofImage: { type: String }
    },
    citizenFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      submittedAt: { type: Date }
    },
    timeline: [
      {
        status: { type: String, required: true },
        notes: { type: String },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: String, default: 'System' }
      }
    ]
  },
  {
    timestamps: true
  }
);

issueSchema.index({ 'location.coordinates': '2dsphere' });
issueSchema.index({ createdAt: -1 });

export const Issue = mongoose.model('Issue', issueSchema);
