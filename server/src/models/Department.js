import mongoose from 'mongoose';

export const STANDARD_DEPARTMENTS = [
  {
    code: 'ROADS',
    name: 'Roads & Infrastructure',
    description: 'Maintenance of city roads, asphalt paving, pothole repairs, footpaths, bridges, and municipal civil structures.'
  },
  {
    code: 'SANITATION',
    name: 'Sanitation',
    description: 'Solid waste management, garbage dump clearance, daily street sweeping, and public cleanliness operations.'
  },
  {
    code: 'ELECTRICAL',
    name: 'Electrical',
    description: 'Streetlights, high-mast towers, public lighting fixtures, electrical poles, and power safety.'
  },
  {
    code: 'WATER_SUPPLY',
    name: 'Water Supply',
    description: 'Municipal drinking water pipeline distribution, leak repairs, booster stations, and water pressure management.'
  },
  {
    code: 'DRAINAGE',
    name: 'Drainage',
    description: 'Underground sewage networks, stormwater drainage canals, gutter chambers, and blockage clearance.'
  },
  {
    code: 'TRAFFIC',
    name: 'Traffic',
    description: 'Traffic signals, road signage, pedestrian crossings, speed humps, and junction mobility management.'
  },
  {
    code: 'GARDEN_ENV',
    name: 'Garden & Environment',
    description: 'Municipal public gardens, tree plantation, fallen branch clearance, and green cover preservation.'
  },
  {
    code: 'PUBLIC_PROPERTY',
    name: 'Public Property',
    description: 'Protection of municipal land, encroachment removal, public asset repairs, and municipal facility care.'
  }
];

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
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

export const Department = mongoose.model('Department', departmentSchema);
