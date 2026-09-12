import express from 'express';
import { getDepartments, getCategories } from '../controllers/metaController.js';

export const departmentRouter = express.Router();
departmentRouter.get('/', getDepartments);

export const categoryRouter = express.Router();
categoryRouter.get('/', getCategories);

const metaRouter = express.Router();
metaRouter.get('/departments', getDepartments);
metaRouter.get('/categories', getCategories);

export default metaRouter;
