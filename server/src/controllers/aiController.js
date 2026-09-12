import { analyzeIssueWithAI } from '../services/aiService.js';
import { Issue } from '../models/Issue.js';

export const testAnalyze = async (req, res, next) => {
  try {
    const { title, description, categoryHint } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const mimeType = req.file ? req.file.mimetype : 'image/jpeg';

    const result = await analyzeIssueWithAI({
      title: title || 'Reported civic issue',
      description: description || 'Issue requiring inspection',
      categoryHint,
      imagePath,
      mimeType
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const reanalyzeIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const result = await analyzeIssueWithAI({
      title: issue.title,
      description: issue.description,
      categoryHint: issue.category
    });

    issue.aiAnalysis = result;
    issue.assignedDepartment = result.suggestedDepartment;
    issue.priority = result.priority;
    issue.timeline.push({
      status: 'ai_reanalyzed',
      notes: `AI Re-analysis completed: department confirmed as ${result.suggestedDepartment}, priority: ${result.priority.toUpperCase()}`,
      timestamp: new Date(),
      updatedBy: 'AI Triage Engine'
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue re-analyzed by AI successfully',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};
