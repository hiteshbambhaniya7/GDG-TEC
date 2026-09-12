import { Issue } from '../models/Issue.js';

export const getIssuesGeoJSON = async (req, res, next) => {
  try {
    const { department, status, category, priority } = req.query;
    const query = {};

    if (department && department !== 'all') query.assignedDepartment = department;
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;

    const issues = await Issue.find(query).select(
      'trackingId title category status priority location images assignedDepartment createdAt'
    );

    const geoJSON = {
      type: 'FeatureCollection',
      features: issues.map(issue => {
        const coords = issue.location?.coordinates || [72.1519, 21.7645];
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords
          },
          properties: {
            id: issue._id,
            trackingId: issue.trackingId,
            title: issue.title,
            category: issue.category,
            status: issue.status,
            priority: issue.priority,
            ward: issue.location?.ward || 'Bhavnagar',
            address: issue.location?.address || 'Bhavnagar',
            landmark: issue.location?.landmark || '',
            image: issue.images?.[0] || null,
            department: issue.assignedDepartment,
            createdAt: issue.createdAt
          }
        };
      })
    };

    res.status(200).json({
      success: true,
      data: geoJSON
    });
  } catch (error) {
    next(error);
  }
};

export const getWardHotspots = async (req, res, next) => {
  try {
    const wardStats = await Issue.aggregate([
      {
        $group: {
          _id: '$location.ward',
          count: { $sum: 1 },
          urgentCount: {
            $sum: {
              $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0]
            }
          },
          resolvedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: wardStats
    });
  } catch (error) {
    next(error);
  }
};
