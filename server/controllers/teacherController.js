const { User, Progress, Content, Class, Assignment, Submission } = require('../models');
const { Op } = require('sequelize');

const getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const classes = await Class.findAll({
      where: { teacherId },
      include: [{
        model: User,
        as: 'students',
        attributes: ['id', 'name', 'avatar', 'grade']
      }]
    });

    res.json(classes);
  } catch (error) {
    console.error('Get my classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const classes = await Class.findAll({
      where: { teacherId },
      include: [{
        model: User,
        as: 'students',
        attributes: ['id', 'name', 'avatar', 'grade', 'email', 'points']
      }]
    });

    const students = classes.reduce((acc, c) => [...acc, ...c.students], []);

    res.json(students);
  } catch (error) {
    console.error('Get my students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findByPk(studentId, {
      attributes: ['id', 'name', 'email', 'avatar', 'grade', 'points', 'streak'],
      include: [{
        model: Progress,
        include: [Content]
      }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate stats
    const stats = {
      totalWatchTime: student.Progress.reduce((sum, p) => sum + p.watchTime, 0),
      completedLessons: student.Progress.filter(p => p.completed).length,
      averageQuizScore: student.Progress.filter(p => p.quizScore).reduce((sum, p) => sum + p.quizScore, 0) / 
                       student.Progress.filter(p => p.quizScore).length || 0
    };

    res.json({
      student,
      stats
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classId, contentId } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      ClassId: classId,
      ContentId: contentId,
      createdBy: req.user.id
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
    submission.gradedAt = new Date();
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

    // Create feedback record
    const feedbackRecord = await Feedback.create({
      studentId,
      teacherId: req.user.id,
      feedback,
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: 'Feedback provided successfully',
      feedback: feedbackRecord
    });
  } catch (error) {
    console.error('Provide feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getClassProgress = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findByPk(classId, {
      include: [{
        model: User,
        as: 'students',
        include: [Progress]
      }]
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const progress = classData.students.map(student => ({
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
          where: { '$Content.Topic.SubjectId$': subjectId }
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
    const { title, content, classId } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      ClassId: classId,
      createdBy: req.user.id
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
      where: {
        grade: null,
        submittedAt: { [Op.ne]: null }
      },
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }, {
        model: Assignment
      }],
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