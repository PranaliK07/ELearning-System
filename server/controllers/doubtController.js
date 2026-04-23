const { Doubt, User, Subject, Grade } = require('../models');
const { createNotification } = require('../utils/notifications');
const { isAdminLikeRole } = require('../utils/roles');

// @desc    Submit a new doubt
// @route   POST /api/doubts
// @access  Private (Student)
const submitDoubt = async (req, res) => {
  try {
    const incomingTeacherId = req.body.teacherId || req.body.TeacherId;
    let teacherId = Number(incomingTeacherId);
    
    const subjectId = req.body.subjectId || req.body.SubjectId;
    const { question } = req.body;
    const studentId = req.user.id;

    if (!teacherId || Number.isNaN(teacherId)) {
      const fallbackTeacher = await User.findOne({
        where: {
          role: 'teacher',
          isDeleted: false
        },
        attributes: ['id'],
        order: [['id', 'ASC']]
      });

      if (!fallbackTeacher) {
        return res.status(400).json({ message: 'No active teacher available to receive the doubt' });
      }

      teacherId = fallbackTeacher.id;
      console.warn('[Doubt Service] Missing teacherId in request body. Falling back to teacher:', teacherId);
    }

    const doubt = await Doubt.create({
      studentId,
      teacherId,
      subjectId,
      question
    });

    // Send notification to the teacher
    await createNotification(
      teacherId,
      'doubt',
      'New Doubt from Student',
      `${req.user.name} has asked a doubt: "${question.substring(0, 100)}${question.length > 100 ? '...' : ''}"`,
      { doubtId: doubt.id, studentId },
      studentId
    );

    res.status(201).json({
      success: true,
      message: 'Doubt submitted successfully',
      doubt
    });
  } catch (error) {
    console.error('Submit doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's doubts
// @route   GET /api/doubts/student
// @access  Private (Student)
const getStudentDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.findAll({
      where: { studentId: req.user.id },
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] },
        { model: Subject, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(doubts);
  } catch (error) {
    console.error('Get student doubts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teacher's doubts
// @route   GET /api/doubts/teacher
// @access  Private (Teacher)
const getTeacherDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.findAll({
      where: { teacherId: req.user.id },
      include: [
        { 
          model: User, 
          as: 'student', 
          attributes: ['id', 'name', 'avatar', 'grade', 'GradeId'],
          include: [{ model: Grade, attributes: ['id', 'name'] }]
        },
        { model: Subject, attributes: ['id', 'name'] }
      ],
      order: [['status', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json(doubts);
  } catch (error) {
    console.error('Get teacher doubts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Respond to a doubt
// @route   PUT /api/doubts/:id/respond
// @access  Private (Teacher/Admin)
const respondToDoubt = async (req, res) => {
  try {
    const { answer } = req.body;
    const doubt = await Doubt.findByPk(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    if (!isAdminLikeRole(req.user.role) && doubt.teacherId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    doubt.answer = answer;
    doubt.status = 'resolved';
    await doubt.save();

    // Send notification to the student
    await createNotification(
      doubt.studentId,
      'doubt_reply',
      'Doubt Resolved',
      `${req.user.name} has replied to your doubt: "${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}"`,
      { doubtId: doubt.id, teacherId: req.user.id },
      req.user.id
    );

    res.json({
      success: true,
      message: 'Response sent successfully',
      doubt
    });
  } catch (error) {
    console.error('Respond to doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all teachers
// @route   GET /api/doubts/teachers
// @access  Private
const getAllDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.findAll({
      include: [
        { model: User, as: 'student', attributes: ['name', 'avatar'] },
        { model: User, as: 'teacher', attributes: ['name', 'avatar'] },
        { model: Subject, attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all doubts' });
  }
};

const getTeachers = async (req, res) => {
  try {
    // Broadening search to find ANY user with role 'teacher' to help debug
    const teachers = await User.findAll({
      where: { 
        role: 'teacher',
        isDeleted: false
      },
      attributes: ['id', 'name', 'avatar', 'email']
    });

    console.log(`[Doubt DEBUG] Found ${teachers.length} registered teachers.`);
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findByPk(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Allow admins to delete any doubt, teachers only their own
    if (!isAdminLikeRole(req.user.role) && doubt.teacherId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await doubt.destroy();
    res.json({ success: true, message: 'Doubt deleted successfully' });
  } catch (error) {
    console.error('Delete doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitDoubt,
  getStudentDoubts,
  getTeacherDoubts,
  respondToDoubt,
  getTeachers,
  getAllDoubts,
  deleteDoubt
};
