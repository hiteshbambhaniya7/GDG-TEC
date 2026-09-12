import mongoose from 'mongoose';

export const STANDARD_CATEGORIES = [
  {
    name: 'Road & Pothole',
    slug: 'road_pothole',
    department: 'Roads & Infrastructure',
    description: 'Cratered roads, broken asphalt, pavement depression, potholes, damaged footpaths.'
  },
  {
    name: 'Garbage & Sanitation',
    slug: 'garbage_sanitation',
    department: 'Sanitation',
    description: 'Overflowing community bins, uncollected waste, illegal garbage dumps, dead animals, foul odors.'
  },
  {
    name: 'Streetlight',
    slug: 'streetlight',
    department: 'Electrical',
    description: 'Non-functional streetlights, sparking electric poles, dangling live wires, dark roads.'
  },
  {
    name: 'Water Leakage',
    slug: 'water_leakage',
    department: 'Water Supply',
    description: 'Main pipeline ruptures, leaking valves, contaminated drinking water, low pressure supply.'
  },
  {
    name: 'Drainage',
    slug: 'drainage',
    department: 'Drainage',
    description: 'Overflowing gutter chambers, open manholes, choked sewage pipes, stagnant dirty water.'
  },
  {
    name: 'Traffic Signal',
    slug: 'traffic_signal',
    department: 'Traffic',
    description: 'Defective traffic lights, damaged blinkers, missing road signs, zebra crossing issues.'
  },
  {
    name: 'Public Property',
    slug: 'public_property',
    department: 'Public Property',
    description: 'Illegal encroachment on municipal land, broken divider railings, bus stop shelter damage.'
  },
  {
    name: 'Tree & Environment',
    slug: 'tree_environment',
    department: 'Garden & Environment',
    description: 'Fallen trees blocking roads, dangerous overgrown branches, withered public garden plants.'
  },
  {
    name: 'Other',
    slug: 'other',
    department: 'Sanitation',
    description: 'General civic complaints and miscellaneous municipal assistance requests.'
  }
];

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Category = mongoose.model('Category', categorySchema);
