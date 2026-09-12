import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: '7d' });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, department, ward } = req.body;

    if (!name || (!phone && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, password, and at least an email or phone number are required.'
      });
    }

    // Check existing phone
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'A user with this phone number already exists.'
        });
      }
    }

    // Check existing email
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists.'
        });
      }
    }

    const user = await User.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone: phone || undefined,
      password,
      role: role || 'citizen',
      department: department || 'General Administration',
      ward: ward || 'Ward 1 - Kaliyabid'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          department: user.department,
          ward: user.ward
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { phone, email, identifier, password } = req.body;
    const loginTarget = email || phone || identifier;

    if (!loginTarget || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone/email and password.'
      });
    }

    let user;
    if (loginTarget.includes('@')) {
      user = await User.findOne({ email: loginTarget.toLowerCase() }).select('+password');
    } else {
      user = await User.findOne({
        $or: [{ phone: loginTarget }, { email: loginTarget.toLowerCase() }]
      }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          department: user.department,
          ward: user.ward
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, department } = req.query;
    const query = {};
    if (role && role !== 'all') {
      query.role = role.toLowerCase();
    }
    if (department && department !== 'all') {
      query.department = department;
    }

    const users = await User.find(query).select('name email phone role department ward createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getOfficers = async (req, res, next) => {
  try {
    const officers = await User.find({ role: { $in: ['officer', 'admin'] } }).select(
      'name department role phone email ward'
    );
    res.status(200).json({
      success: true,
      count: officers.length,
      data: officers
    });
  } catch (error) {
    next(error);
  }
};
