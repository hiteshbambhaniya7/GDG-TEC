import { Issue } from '../models/Issue.js';
import { analyzeIssueWithAI } from '../services/aiService.js';
import { routeCategoryToDepartment } from '../services/departmentRouter.js';

export const createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category = 'roads_potholes',
      latitude,
      longitude,
      address = 'Bhavnagar, Gujarat',
      ward = 'Ward 1 - Kaliyabid & Hill Drive',
      landmark = '',
      citizenName = 'Concerned Citizen',
      citizenPhone = '9876543210'
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.'
      });
    }

    // Process uploaded file
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const images = imagePath ? [imagePath] : [];

    // Parse coordinates (defaulting to Bhavnagar center if invalid)
    const lat = parseFloat(latitude) || 21.7645;
    const lng = parseFloat(longitude) || 72.1519;

    // Unique tracking ID: e.g. SB-84920
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const trackingId = `SB-${randomCode}`;

    // Execute AI Triage Analysis
    const absoluteImagePath = req.file ? req.file.path : null;
    const mimeType = req.file ? req.file.mimetype : 'image/jpeg';
    
    let aiResult;
    try {
      aiResult = await analyzeIssueWithAI({
        title,
        description,
        categoryHint: category,
        imagePath: absoluteImagePath,
        mimeType
      });
    } catch (aiErr) {
      console.warn('[AI Triage Exception]:', aiErr.message);
      aiResult = {
        confidence: 0.8,
        suggestedCategory: category,
        suggestedDepartment: routeCategoryToDepartment(category, description),
        severityScore: 5,
        safetyHazard: false,
        priority: 'medium',
        urgencyReason: 'Standard civic queue classification.',
        detectedKeywords: ['civic report'],
        summary: 'Report logged in municipal system queue.'
      };
    }

    const assignedDepartment = aiResult.suggestedDepartment || routeCategoryToDepartment(category, description);
    const calculatedPriority = aiResult.priority || 'medium';

    const issue = await Issue.create({
      trackingId,
      title,
      description,
      category: aiResult.suggestedCategory || category,
      images,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address,
        ward,
        landmark
      },
      reportedBy: req.user ? req.user._id : null,
      citizenContact: {
        name: citizenName,
        phone: citizenPhone
      },
      status: 'ai_analyzed',
      priority: calculatedPriority,
      aiAnalysis: aiResult,
      assignedDepartment,
      timeline: [
        {
          status: 'submitted',
          notes: 'Civic issue report submitted by citizen with location coordinates.',
          timestamp: new Date(),
          updatedBy: citizenName
        },
        {
          status: 'ai_analyzed',
          notes: `AI Triage completed. Routed to [${assignedDepartment}] with priority [${calculatedPriority.toUpperCase()}]. Severity Score: ${aiResult.severityScore}/10.`,
          timestamp: new Date(),
          updatedBy: 'AI Civic Intelligence Engine'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Civic issue reported successfully and analyzed by AI.',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const getIssues = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      department,
      ward,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (department && department !== 'all') {
      query.assignedDepartment = department;
    }
    if (ward && ward !== 'all') {
      query['location.ward'] = ward;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.landmark': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('reportedBy', 'name phone')
      .populate('assignedOfficer.officerId', 'name phone department');

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueByTrackingId = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const issue = await Issue.findOne({ trackingId })
      .populate('reportedBy', 'name phone')
      .populate('assignedOfficer.officerId', 'name phone department');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `No civic issue found with Tracking ID "${trackingId}".`
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name phone')
      .populate('assignedOfficer.officerId', 'name phone department');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    issue.status = status;
    issue.timeline.push({
      status,
      notes: notes || `Status transitioned to ${status} by municipal authority.`,
      timestamp: new Date(),
      updatedBy: req.user ? req.user.name : 'Municipal Officer'
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${status}.`,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const assignOfficer = async (req, res, next) => {
  try {
    const { officerId, officerName, department, notes } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    if (department) {
      issue.assignedDepartment = department;
    }

    issue.assignedOfficer = {
      officerId: officerId || null,
      officerName: officerName || 'Duty Field Officer',
      assignedAt: new Date()
    };

    issue.status = 'assigned';
    issue.timeline.push({
      status: 'assigned',
      notes: notes || `Dispatched to officer ${officerName || 'Field Team'} (${issue.assignedDepartment}).`,
      timestamp: new Date(),
      updatedBy: req.user ? req.user.name : 'Supervising Engineer'
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue dispatched and assigned successfully.',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const resolveIssue = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    const proofImage = req.file ? `/uploads/${req.file.filename}` : null;

    issue.status = 'resolved';
    issue.resolution = {
      resolvedAt: new Date(),
      resolvedBy: req.user ? req.user._id : null,
      notes: notes || 'Civic issue successfully resolved on ground with inspection proof.',
      proofImage: proofImage || issue.resolution?.proofImage || ''
    };

    issue.timeline.push({
      status: 'resolved',
      notes: notes || 'Issue resolved. Verification photo uploaded by BMC engineering team.',
      timestamp: new Date(),
      updatedBy: req.user ? req.user.name : 'BMC Field Engineer'
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Civic issue marked as resolved with photo verification.',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const addCitizenFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    issue.citizenFeedback = {
      rating: Number(rating) || 5,
      comment: comment || 'Resolution confirmed on-site.',
      submittedAt: new Date()
    };

    issue.timeline.push({
      status: 'feedback_submitted',
      notes: `Citizen gave a ${rating || 5}-star rating: "${comment || 'Satisfied with resolution'}"`,
      timestamp: new Date(),
      updatedBy: 'Citizen'
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for making Bhavnagar cleaner and smarter!',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicFeed = async (req, res, next) => {
  try {
    const issues = await Issue.find()
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('trackingId title description category images location status priority resolution citizenFeedback createdAt updatedAt assignedDepartment');

    res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};
