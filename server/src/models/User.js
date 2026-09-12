import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide a valid phone number'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      default: 'citizen'
    },
    department: {
      type: String,
      enum: [
        'Solid Waste Management',
        'Roads & Buildings (PWD)',
        'Water Works & Drainage',
        'Electrical & Street Lighting',
        'Health & Sanitation',
        'Encroachment & Animal Control',
        'Horticulture & Parks',
        'General Administration'
      ],
      default: 'General Administration'
    },
    ward: {
      type: String,
      default: 'Ward 1 - Kaliyabid'
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
