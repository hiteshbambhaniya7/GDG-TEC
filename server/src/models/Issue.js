import mongoose from 'mongoose';

export const ISSUE_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Reopened'];
export const ISSUE_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
export const ISSUE_DEPARTMENTS = [
  'Roads & Infrastructure',
  'Sanitation',
  'Electrical',
  'Water Supply',
  'Drainage',
  'Traffic',
  'Garden & Environment',
  'Public Property'
];
export const ISSUE_CATEGORIES = [
  'Road & Pothole',
  'Garbage & Sanitation',
  'Streetlight',
  'Water Leakage',
  'Drainage',
  'Traffic Signal',
  'Public Property',
  'Tree & Environment',
  'Other'
];

const issueSchema = new mongoose.Schema(
  {
    issueNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    trackingId: {
      type: String,
      index: true
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Please provide issue details'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please provide issue category'],
      trim: true
    },
    severity: {
      type: String,
      enum: ISSUE_SEVERITIES,
      default: 'Medium',
      index: true
    },
    department: {
      type: String,
      enum: ISSUE_DEPARTMENTS,
      default: 'Roads & Infrastructure',
      index: true
    },
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: 'Pending',
      index: true
    },
    latitude: {
      type: Number,
      required: true,
      default: 21.7645
    },
    longitude: {
      type: Number,
      required: true,
      default: 72.1519
    },
    address: {
      type: String,
      default: 'Bhavnagar, Gujarat'
    },
    area: {
      type: String,
      default: 'Kaliyabid'
    },
    ward: {
      type: String,
      default: 'Ward 1 - Kaliyabid'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    images: [
      {
        type: String
      }
    ],
    resolutionImageUrl: {
      type: String,
      default: ''
    },
    resolutionNote: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date
    },
    aiSummary: {
      type: String,
      default: ''
    },
    aiConfidence: {
      type: Number,
      default: 0.85
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
    assignedOfficer: {
      officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      officerName: { type: String, default: 'Unassigned' },
      assignedAt: { type: Date }
    },
    // GeoJSON point for geospatial 2dsphere queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [72.1519, 21.7645]
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
    // Legacy support fields for existing controllers/UI
    priority: {
      type: String,
      default: 'medium'
    },
    assignedDepartment: {
      type: String,
      default: 'Roads & Infrastructure'
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
    aiAnalysis: {
      analyzedAt: { type: Date },
      confidence: { type: Number, default: 0.85 },
      suggestedCategory: { type: String },
      suggestedDepartment: { type: String },
      severityScore: { type: Number, default: 5 },
      safetyHazard: { type: Boolean, default: false },
      urgencyReason: { type: String },
      detectedKeywords: [{ type: String }],
      summary: { type: String }
    },
    timeline: [
      {
        action: { type: String },
        status: { type: String },
        description: { type: String },
        notes: { type: String },
        performedBy: { type: String, default: 'System' },
        updatedBy: { type: String, default: 'System' },
        createdAt: { type: Date, default: Date.now },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save synchronization hook
issueSchema.pre('save', function (next) {
  // Sync issueNumber & trackingId
  if (!this.trackingId && this.issueNumber) {
    this.trackingId = this.issueNumber;
  }
  if (!this.issueNumber && this.trackingId) {
    this.issueNumber = this.trackingId;
  }

  // Sync title from description if not set
  if (!this.title && this.description) {
    this.title = this.description.slice(0, 60);
  }

  // Sync coordinates & lat/lng
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
      address: this.address || this.location?.address || 'Bhavnagar, Gujarat',
      ward: this.ward || this.location?.ward || 'Ward 1 - Kaliyabid',
      landmark: this.area || this.location?.landmark || ''
    };
  } else if (this.location?.coordinates && this.location.coordinates.length === 2) {
    this.longitude = this.location.coordinates[0];
    this.latitude = this.location.coordinates[1];
  }

  // Sync images and imageUrl
  if (this.imageUrl && (!this.images || this.images.length === 0)) {
    this.images = [this.imageUrl];
  } else if (!this.imageUrl && this.images && this.images.length > 0) {
    this.imageUrl = this.images[0];
  }

  // Sync resolution fields
  if (this.resolutionNote || this.resolutionImageUrl || this.resolvedAt) {
    this.resolution = {
      notes: this.resolutionNote || this.resolution?.notes || '',
      proofImage: this.resolutionImageUrl || this.resolution?.proofImage || '',
      resolvedAt: this.resolvedAt || this.resolution?.resolvedAt || new Date()
    };
  } else if (this.resolution?.notes || this.resolution?.proofImage) {
    this.resolutionNote = this.resolution.notes || '';
    this.resolutionImageUrl = this.resolution.proofImage || '';
    this.resolvedAt = this.resolution.resolvedAt;
  }

  // Sync department
  if (this.department) {
    this.assignedDepartment = this.department;
  } else if (this.assignedDepartment) {
    this.department = this.assignedDepartment;
  }

  // Sync AI fields
  if (this.aiSummary) {
    if (!this.aiAnalysis) this.aiAnalysis = {};
    this.aiAnalysis.summary = this.aiSummary;
    this.aiAnalysis.confidence = this.aiConfidence;
  } else if (this.aiAnalysis?.summary) {
    this.aiSummary = this.aiAnalysis.summary;
    this.aiConfidence = this.aiAnalysis.confidence || 0.85;
  }

  // Sync severity & priority
  const severityMap = {
    Critical: 'urgent',
    High: 'high',
    Medium: 'medium',
    Low: 'low'
  };
  const priorityMap = {
    urgent: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };
  if (this.severity && severityMap[this.severity]) {
    this.priority = severityMap[this.severity];
  } else if (this.priority && priorityMap[this.priority]) {
    this.severity = priorityMap[this.priority];
  }

  // Normalize status
  const statusMap = {
    submitted: 'Pending',
    ai_analyzed: 'Pending',
    assigned: 'In Progress',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Pending',
    reopened: 'Reopened'
  };
  if (statusMap[this.status]) {
    this.status = statusMap[this.status];
  }

  next();
});

issueSchema.index({ 'location.coordinates': '2dsphere' });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ area: 1 });
issueSchema.index({ category: 1 });

export const Issue = mongoose.model('Issue', issueSchema);
