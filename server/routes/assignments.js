const express = require('express');
const router = express.Router();
const { Assignment, Submission, User, Subject, Grade } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const ALLOWED_STATUSES = new Set(['active', 'draft', 'closed']);

const normalizeAssignmentPayload = (body = {}, { isUpdate = false } = {}) => {
  const payload = {};

  if (!isUpdate || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return { error: 'Assignment title is required' };
    }
    payload.title = title;
  }

  if (!isUpdate || body.description !== undefined) {
    payload.description = body.description ? String(body.description).trim() : null;
  }

  if (!isUpdate || body.dueDate !== undefined) {
    if (!body.dueDate) {
      return { error: 'Due date is required' };
    }
    const dueDate = new Date(body.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      return { error: 'Invalid due date' };
    }
    payload.dueDate = dueDate;
  }

  if (body.subjectId !== undefined) {
    payload.subjectId = body.subjectId ? Number(body.subjectId) : null;
    if (body.subjectId && Number.isNaN(payload.subjectId)) {
      return { error: 'Invalid subject' };
    }
  }

  if (body.gradeId !== undefined) {
    payload.gradeId = body.gradeId ? Number(body.gradeId) : null;
    if (body.gradeId && Number.isNaN(payload.gradeId)) {
      return { error: 'Invalid grade' };
    }
  }

  if (body.status !== undefined) {
    const status = String(body.status).trim().toLowerCase();
    if (!ALLOWED_STATUSES.has(status)) {
      return { error: 'Invalid assignment status' };
    }
    payload.status = status;
  }

  return { payload };
};

// Get all assignments (filtered by teacher if applicable)
router.get('/', protect, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'teacher') {
      where.teacherId = req.user.id;
    } else if (req.user.role === 'student') {
      let userGradeId = req.user.GradeId || null;
      if (!userGradeId && req.user.grade) {
        const grade = await Grade.findOne({ where: { level: req.user.grade }, attributes: ['id'] });
        userGradeId = grade?.id || null;
      }
      if (userGradeId) {
        where.gradeId = userGradeId;
      }
    }

    const assignments = await Assignment.findAll({
      where,
      include: [
        { model: Subject, attributes: ['name'] },
        { model: Grade, attributes: ['name'] },
        { model: User, as: 'teacher', attributes: ['name'] }
      ],
      order: [['dueDate', 'ASC']]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assignment detail
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id, {
      include: [
        { model: Subject, attributes: ['id', 'name'] },
        { model: Grade, attributes: ['id', 'name', 'level'] },
        { model: User, as: 'teacher', attributes: ['id', 'name'] }
      ]
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Students can only see their class assignments
    if (req.user.role === 'student') {
      let userGradeId = req.user.GradeId || null;
      if (!userGradeId && req.user.grade) {
        const grade = await Grade.findOne({ where: { level: req.user.grade }, attributes: ['id'] });
        userGradeId = grade?.id || null;
      }
      if (userGradeId && assignment.gradeId && assignment.gradeId !== userGradeId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create assignment
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { payload, error } = normalizeAssignmentPayload(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const assignment = await Assignment.create({
      ...payload,
      teacherId: req.user.id
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update assignment
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role === 'teacher' && assignment.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { payload, error } = normalizeAssignmentPayload(req.body, { isUpdate: true });
    if (error) {
      return res.status(400).json({ message: error });
    }

    await assignment.update(payload);
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete assignment
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role === 'teacher' && assignment.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await assignment.destroy();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submissions for an assignment
router.get('/:id/submissions', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role === 'teacher' && assignment.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.findAll({
      where: { assignmentId: req.params.id },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Assignment, attributes: ['id', 'title', 'dueDate', 'teacherId'] }
      ],
      order: [['submittedAt', 'DESC']]
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student submits assignment
router.post('/:id/submissions', protect, authorize('student'), async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const existing = await Submission.findOne({
      where: { assignmentId: req.params.id, studentId: req.user.id }
    });
    if (existing) {
      return res.status(400).json({ message: 'Submission already exists' });
    }

    const submission = await Submission.create({
      assignmentId: req.params.id,
      studentId: req.user.id,
      content: req.body.content || null,
      fileUrl: req.body.fileUrl || null,
      submittedAt: new Date(),
      status: 'submitted'
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Student reads own submission
router.get('/:id/my-submission', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      where: { assignmentId: req.params.id, studentId: req.user.id }
    });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade a submission
router.put('/submissions/:submissionId/grade', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByPk(req.params.submissionId, {
      include: [{ model: Assignment, attributes: ['id', 'teacherId'] }]
    });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    if (
      req.user.role === 'teacher' &&
      submission.Assignment &&
      submission.Assignment.teacherId !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const numericGrade = Number(grade);
    if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      return res.status(400).json({ message: 'Grade must be between 0 and 100' });
    }

    submission.grade = numericGrade;
    submission.feedback = feedback ? String(feedback).trim() : null;
    submission.status = 'graded';
    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
