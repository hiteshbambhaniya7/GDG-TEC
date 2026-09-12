import { Department, STANDARD_DEPARTMENTS } from '../models/Department.js';
import { Category, STANDARD_CATEGORIES } from '../models/Category.js';

export const getDepartments = async (req, res, next) => {
  try {
    let departments = await Department.find({ active: true }).sort({ name: 1 });
    if (!departments || departments.length === 0) {
      departments = STANDARD_DEPARTMENTS;
    }

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ active: true }).sort({ name: 1 });
    if (!categories || categories.length === 0) {
      categories = STANDARD_CATEGORIES;
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
