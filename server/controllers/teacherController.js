const { User, Progress, Content, Assignment, Submission, Grade, Announcement } = require('../models');
const { Op } = require('sequelize');

const getMyClasses = async (req, res) => {
  try {
    const classes = await Grade.findAll({
      include: [{ model: User, where: { role: 'student' }, required: false, attributes: ['id', 'name', 'avatar', 'grade'] }],
      order: [['level', 'ASC']]
    });
    res.json(classes);
  } catch (error) {
    console.error('Get my classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'avatar', 'grade', 'email', 'points'],
      include: [{ model: Grade, attributes: ['id', 'name', 'level'] }],
      order: [['updatedAt', 'DESC']]
    });
    res.json(students);
  } catch (error) {
    console.error('Get my students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'avatar', 'grade', 'points', 'streak'],
      include: [{ model: Progress, include: [Content] }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const progressList = student.Progress || [];
    const quizScores = progressList.filter((p) => p.quizScore !== null && p.quizScore !== undefined).map((p) => p.quizScore);
    const stats = {
      totalWatchTime: progressList.reduce((sum, p) => sum + (p.watchTime || 0), 0),
      completedLessons: progressList.filter((p) => p.completed).length,
      averageQuizScore: quizScores.length ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0
    };

    res.json({ student, stats });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, subjectId, gradeId, lessonId } = req.body;
    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      subjectId,
      gradeId,
      lessonId: lessonId || null,
      teacherId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const gradeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findByPk(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    await submission.save();

    res.json({
      success: true,
      message: 'Assignment graded successfully',
      submission
    });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const provideFeedback = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { feedback } = req.body;
    res.json({
      success: true,
      message: 'Feedback recorded',
      studentId,
      feedback
    });
  } catch (error) {
    console.error('Provide feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getClassProgress = async (req, res) => {
  try {
    const classLevel = Number(req.params.classId);
    const students = await User.findAll({
      where: { role: 'student', grade: classLevel },
      include: [{ model: Progress }]
    });

    const progress = students.map((student) => ({
      student: {
        id: student.id,
        name: student.name,
        avatar: student.avatar
      },
      progress: student.Progress
    }));

    res.json(progress);
  } catch (error) {
    console.error('Get class progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSubjectProgress = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const students = await User.findAll({
      where: { role: 'student' },
      include: [{
        model: Progress,
        include: [{
          model: Content,
          where: { SubjectId: subjectId },
          required: true
        }]
      }]
    });

    res.json(students);
  } catch (error) {
    console.error('Get subject progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetRole, expiresAt } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      targetRole: targetRole || 'all',
      expiresAt: expiresAt || null,
      authorId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingReviews = async (req, res) => {
  try {
    const pending = await Submission.findAll({
      where: { grade: null, submittedAt: { [Op.ne]: null } },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'avatar'] },
        { model: Assignment, where: { teacherId: req.user.id } }
      ],
      order: [['submittedAt', 'ASC']]
    });

    res.json(pending);
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyClasses,
  getMyStudents,
  getStudentDetails,
  createAssignment,
  gradeAssignment,
  provideFeedback,
  getClassProgress,
  getSubjectProgress,
  createAnnouncement,
  getPendingReviews
};
