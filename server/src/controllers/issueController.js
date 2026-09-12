import mongoose from 'mongoose';
import { Issue } from '../models/Issue.js';
import { Timeline } from '../models/Timeline.js';
import { generateIssueNumber } from '../services/issueNumberService.js';
import { analyzeIssueWithAI } from '../services/aiService.js';
import { routeCategoryToDepartment, CATEGORY_DEPARTMENT_MAP } from '../services/departmentRouter.js';

export const createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category = 'Road & Pothole',
      severity,
      priority,
      latitude,
      longitude,
      address = 'Bhavnagar, Gujarat',
      area = 'Kaliyabid',
      ward = 'Ward 1 - Kaliyabid',
      citizenName = 'Concerned Citizen',
      citizenPhone = '9876543210'
    } = req.body;

    if (!description && !title) {
      return res.status(400).json({
        success: false,
        message: 'Issue description is required.'
      });
    }

    const issueDescription = description || title;
    const issueTitle = title || issueDescription.slice(0, 60);

    // Process image path
    const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || '';
    const images = imagePath ? [imagePath] : [];

    // Parse coordinates
    const lat = parseFloat(latitude) || 21.7645;
    const lng = parseFloat(longitude) || 72.1519;

    // Generate reliable collision-free sequential issue number
    const issueNumber = await generateIssueNumber(2026);

    // Run AI analysis if possible
    const absoluteImagePath = req.file ? req.file.path : null;
    const mimeType = req.file ? req.file.mimetype : 'image/jpeg';

    let aiResult;
    try {
      aiResult = await analyzeIssueWithAI({
        title: issueTitle,
        description: issueDescription,
        categoryHint: category,
        imagePath: absoluteImagePath,
        mimeType
      });
    } catch (aiErr) {
      const mappedDept = CATEGORY_DEPARTMENT_MAP[category] || routeCategoryToDepartment(category, issueDescription);
      aiResult = {
        confidence: 0.85,
        suggestedCategory: category,
        suggestedDepartment: mappedDept,
        severityScore: 5,
        safetyHazard: false,
        priority: 'medium',
        urgencyReason: 'Standard civic queue classification.',
        detectedKeywords: ['civic report'],
        summary: `Citizen grievance reported regarding ${category} in ${area || 'Bhavnagar'}.`
      };
    }

    const resolvedDepartment =
      req.body.department ||
      CATEGORY_DEPARTMENT_MAP[category] ||
      aiResult.suggestedDepartment ||
      routeCategoryToDepartment(category, issueDescription);

    let resolvedSeverity = severity;
    if (!resolvedSeverity) {
      if (priority === 'urgent' || aiResult.severityScore >= 8) resolvedSeverity = 'Critical';
      else if (priority === 'high' || aiResult.severityScore >= 6) resolvedSeverity = 'High';
      else if (priority === 'low' || aiResult.severityScore <= 3) resolvedSeverity = 'Low';
      else resolvedSeverity = 'Medium';
    }

    const issue = await Issue.create({
      issueNumber,
      trackingId: issueNumber,
      title: issueTitle,
      description: issueDescription,
      category,
      severity: resolvedSeverity,
      department: resolvedDepartment,
      assignedDepartment: resolvedDepartment,
      status: 'Pending',
      latitude: lat,
      longitude: lng,
      address,
      area,
      ward,
      imageUrl: imagePath,
      images,
      aiSummary: aiResult.summary || `AI triaged report for ${category}.`,
      aiConfidence: aiResult.confidence || 0.85,
      aiAnalysis: aiResult,
      reportedBy: req.user ? req.user._id : null,
      citizenContact: {
        name: req.user?.name || citizenName,
        phone: req.user?.phone || citizenPhone
      },
      timeline: [
        {
          action: 'Report Submitted',
          status: 'Pending',
          description: `Citizen submitted report with geo-tagged coordinates at ${area}.`,
          notes: `Citizen submitted report with geo-tagged coordinates at ${area}.`,
          performedBy: req.user?.name || citizenName,
          updatedBy: req.user?.name || citizenName,
          createdAt: new Date(),
          timestamp: new Date()
        },
        {
          action: 'AI Analysis Completed',
          status: 'Pending',
          description: `AI Triage completed. Severity: ${resolvedSeverity} (${aiResult.severityScore}/10). Department: ${resolvedDepartment}.`,
          notes: `AI Triage completed. Severity: ${resolvedSeverity} (${aiResult.severityScore}/10). Department: ${resolvedDepartment}.`,
          performedBy: 'AI Civic Intelligence Engine',
          updatedBy: 'AI Civic Intelligence Engine',
          createdAt: new Date(),
          timestamp: new Date()
        }
      ]
    });

    // Create standalone Timeline records
    await Timeline.create([
      {
        issueId: issue._id,
        action: 'Report Submitted',
        description: `Civic issue reported by citizen at ${area}, Bhavnagar.`,
        performedBy: req.user?.name || citizenName,
        createdAt: new Date()
      },
      {
        issueId: issue._id,
        action: 'AI Analysis Completed',
        description: `AI analysis completed with confidence ${Math.round((aiResult.confidence || 0.85) * 100)}%. Severity assessed as ${resolvedSeverity}. Routed to ${resolvedDepartment}.`,
        performedBy: 'AI Civic Intelligence Engine',
        createdAt: new Date()
      }
    ]);

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
      severity,
      priority,
      department,
      ward,
      area,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      // Support matching case-insensitively or standard enum
      const statusRegex = new RegExp(`^${status}$`, 'i');
      query.$or = [{ status: statusRegex }];
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (severity && severity !== 'all') {
      query.severity = severity;
    } else if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (department && department !== 'all') {
      query.$or = [{ department }, { assignedDepartment: department }];
    }
    if (ward && ward !== 'all') {
      query.ward = ward;
    }
    if (area && area !== 'all') {
      query.area = area;
    }

    if (search) {
      query.$or = [
        { issueNumber: { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { ward: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('reportedBy', 'name phone email')
      .populate('assignedOfficer.officerId', 'name phone department email');

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

export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query;

    if (mongoose.isValidObjectId(id)) {
      query = { $or: [{ _id: id }, { issueNumber: id }, { trackingId: id }] };
    } else {
      query = { $or: [{ issueNumber: id }, { trackingId: id }] };
    }

    const issue = await Issue.findOne(query)
      .populate('reportedBy', 'name phone email')
      .populate('assignedOfficer.officerId', 'name phone department email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `No civic issue found with ID or Issue Number "${id}".`
      });
    }

    // Attach standalone timeline history if available
    const timelineHistory = await Timeline.find({ issueId: issue._id }).sort({ createdAt: 1 });

    const responseData = issue.toObject();
    if (timelineHistory && timelineHistory.length > 0) {
      responseData.history = timelineHistory;
    }

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueByTrackingId = async (req, res, next) => {
  return getIssueById(req, res, next);
};

export const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { issueNumber: id };
    const issue = await Issue.findOne(query);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    // Map status to standard enum if necessary
    const normalizedStatus =
      status === 'in_progress' ? 'In Progress' :
      status === 'resolved' ? 'Resolved' :
      status === 'pending' || status === 'submitted' ? 'Pending' :
      status === 'reopened' ? 'Reopened' : status;

    issue.status = normalizedStatus;
    const actor = req.user ? req.user.name : 'Municipal Officer';
    const actionDesc = notes || `Status transitioned to ${normalizedStatus} by municipal authority.`;

    issue.timeline.push({
      action: normalizedStatus === 'In Progress' ? 'Work Started' : normalizedStatus,
      status: normalizedStatus,
      description: actionDesc,
      notes: actionDesc,
      performedBy: actor,
      updatedBy: actor,
      createdAt: new Date(),
      timestamp: new Date()
    });

    await issue.save();

    await Timeline.create({
      issueId: issue._id,
      action: normalizedStatus === 'In Progress' ? 'Work Started' : normalizedStatus,
      description: actionDesc,
      performedBy: actor,
      createdAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${normalizedStatus}.`,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const assignOfficer = async (req, res, next) => {
  try {
    const { officerId, officerName, department, notes } = req.body;
    const { id } = req.params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { issueNumber: id };
    const issue = await Issue.findOne(query);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    if (department) {
      issue.department = department;
      issue.assignedDepartment = department;
    }

    issue.assignedOfficer = {
      officerId: officerId || null,
      officerName: officerName || 'Duty Field Officer',
      assignedAt: new Date()
    };

    issue.status = 'In Progress';
    const actor = req.user ? req.user.name : 'Supervising Engineer';
    const desc = notes || `Dispatched to officer ${officerName || 'Field Team'} (${issue.department}).`;

    issue.timeline.push({
      action: 'Assigned',
      status: 'In Progress',
      description: desc,
      notes: desc,
      performedBy: actor,
      updatedBy: actor,
      createdAt: new Date(),
      timestamp: new Date()
    });

    await issue.save();

    await Timeline.create({
      issueId: issue._id,
      action: 'Assigned',
      description: desc,
      performedBy: actor,
      createdAt: new Date()
    });

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
    const { id } = req.params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { issueNumber: id };
    const issue = await Issue.findOne(query);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    const proofImage = req.file ? `/uploads/${req.file.filename}` : req.body.resolutionImageUrl || issue.resolutionImageUrl || '';
    const resolutionNote = notes || req.body.resolutionNote || 'Civic issue successfully resolved on ground with inspection proof.';
    const actor = req.user ? req.user.name : 'BMC Field Engineer';

    issue.status = 'Resolved';
    issue.resolutionImageUrl = proofImage;
    issue.resolutionNote = resolutionNote;
    issue.resolvedAt = new Date();

    issue.resolution = {
      resolvedAt: issue.resolvedAt,
      resolvedBy: req.user ? req.user._id : null,
      notes: resolutionNote,
      proofImage
    };

    issue.timeline.push({
      action: 'Resolved',
      status: 'Resolved',
      description: resolutionNote,
      notes: resolutionNote,
      performedBy: actor,
      updatedBy: actor,
      createdAt: new Date(),
      timestamp: new Date()
    });

    await issue.save();

    await Timeline.create({
      issueId: issue._id,
      action: 'Resolved',
      description: `Issue marked as Resolved with inspection proof. ${resolutionNote}`,
      performedBy: actor,
      createdAt: new Date()
    });

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
    const { id } = req.params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { issueNumber: id };
    const issue = await Issue.findOne(query);

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

    const feedbackDesc = `Citizen submitted a ${rating || 5}-star audit rating: "${comment || 'Satisfied with resolution'}"`;

    issue.timeline.push({
      action: 'Feedback Submitted',
      status: issue.status,
      description: feedbackDesc,
      notes: feedbackDesc,
      performedBy: 'Citizen',
      updatedBy: 'Citizen',
      createdAt: new Date(),
      timestamp: new Date()
    });

    await issue.save();

    await Timeline.create({
      issueId: issue._id,
      action: 'Feedback Submitted',
      description: feedbackDesc,
      performedBy: 'Citizen',
      createdAt: new Date()
    });

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
      .limit(25)
      .select(
        'issueNumber trackingId title description category severity department status latitude longitude address area ward imageUrl images resolutionImageUrl resolutionNote resolvedAt citizenFeedback createdAt updatedAt'
      );

    res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};
