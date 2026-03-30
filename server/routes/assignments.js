const express = require('express');
const router = express.Router();
const { Assignment, Submission, User, Subject, Grade, Lesson, Notification } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const { sendParentNotification } = require('../utils/parentNotifier');

const notifyParentForOverdue = async (assignments, user) => {
  if (!user?.parentEmail || !Array.isArray(assignments)) return;

  const now = new Date();
  const overdueAssignments = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const submission = assignment.Submissions?.[0];
    return !submission && now - dueDate >= 24 * 60 * 60 * 1000;
  });

  for (const assignment of overdueAssignments) {
    const existing = await Notification.findOne({
      where: {
        userId: user.id,
        type: 'reminder',
        isDeleted: false,
        data: {
          [Op.like]: `%\"assignmentId\":${assignment.id}%`
        }
      }
    });

    if (existing) continue;

    const message = `${user.name} has not completed "${assignment.title}" within 24 hours of the due time.`;
    await Notification.create({
      userId: user.id,
      type: 'reminder',
      title: 'Assignment overdue (24h)',
      message,
      data: {
        assignmentId: assignment.id,
        kind: 'overdue_24h'
      }
    });

    await sendParentNotification({
      email: user.parentEmail,
      message,
      subject: 'Assignment overdue reminder'
    });
  }
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
      include: req.user.role === 'student' ? [
        { model: Subject, attributes: ['name'] },
        { model: Grade, attributes: ['name'] },
        { model: Lesson, attributes: ['id', 'title'] },
        { model: User, as: 'teacher', attributes: ['name'] },
        { model: Submission, where: { studentId: req.user.id }, required: false }
      ] : [
        { model: Subject, attributes: ['name'] },
        { model: Grade, attributes: ['name'] },
        { model: Lesson, attributes: ['id', 'title'] },
        { model: User, as: 'teacher', attributes: ['name'] },
        { model: Submission, attributes: ['id', 'studentId'], required: false }
      ],
      order: [['dueDate', 'ASC']]
    });
    if (req.user.role === 'student') {
      notifyParentForOverdue(assignments, req.user).catch((error) => {
        console.error('Parent notification error:', error);
      });
    }

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
        { model: Lesson, attributes: ['id', 'title'] },
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
    const assignment = await Assignment.create({
      ...req.body,
      lessonId: req.body.lessonId || null,
      teacherId: req.user.id
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    const submission = await Submission.findByPk(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
