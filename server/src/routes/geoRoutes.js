import express from 'express';
import { getIssuesGeoJSON, getWardHotspots } from '../controllers/geoController.js';

const router = express.Router();

router.get('/geojson', getIssuesGeoJSON);
router.get('/hotspots', getWardHotspots);

export default router;
