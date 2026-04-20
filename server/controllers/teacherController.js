const { User, Progress, Content, Assignment, Submission, Grade, Announcement, Notification, ClassCommunication, Attendance } = require('../models');
const { Op } = require('sequelize');
const { sendSmsAndWhatsappToRecipients, normalizePhone } = require('../utils/parentMessaging');

const getMyClasses = async (req, res) => {
  try {
    const classes = await Grade.findAll({
      attributes: ['id', 'name', 'level'],
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
      attributes: ['id', 'name', 'avatar', 'grade', 'email', 'points', 'parentPhone'],
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
    const studentId = req.params.id;
    const student = await User.findByPk(studentId, {
      attributes: ['id', 'name', 'email', 'avatar', 'grade', 'points', 'streak', 'GradeId'],
      include: [
        { model: Progress, include: [Content] },
        { model: Grade, attributes: ['id', 'name', 'level'] }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch Attendance
    const attendance = await Attendance.findAll({ where: { studentId } });
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const totalAttendance = attendance.length;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Fetch Assignments and Submissions
    const gradeId = student.GradeId || student.Grade?.id;
    const gradeLevel = student.grade;
    
    const assignments = await Assignment.findAll({
      where: {
        [Op.or]: [
          { gradeId: gradeId || -1 },
          { LessonId: { [Op.in]: student.Progress.map(p => p.Content?.LessonId).filter(Boolean) } }
        ]
      }
    });

    const submissions = await Submission.findAll({
      where: { studentId, assignmentId: { [Op.in]: assignments.map(a => a.id) } }
    });

    const completedAssignments = submissions.length;
    const totalAssignments = assignments.length;
    const assignmentCompletion = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    const progressList = student.Progress || [];
    const quizScores = progressList.filter((p) => p.quizScore !== null && p.quizScore !== undefined).map((p) => p.quizScore);
    const averageQuizScore = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
    const lessonCompletion = progressList.length > 0 ? Math.round((progressList.filter(p => p.completed).length / progressList.length) * 100) : 0;

    // Overall Performance (Weighted)
    const overallPerformance = Math.round(
      (averageQuizScore * 0.3) +
      (lessonCompletion * 0.3) +
      (assignmentCompletion * 0.2) +
      (attendancePercentage * 0.2)
    );

    const stats = {
      totalWatchTime: progressList.reduce((sum, p) => sum + (p.watchTime || 0), 0),
      completedLessons: progressList.filter((p) => p.completed).length,
      averageQuizScore,
      lessonCompletion,
      attendancePercentage,
      assignmentCompletion,
      overallPerformance,
      totalAssignments,
      completedAssignments,
      totalAttendance,
      presentCount
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

    // Notify students
    try {
      const studentQuery = { role: 'student', isDeleted: false };
      
      if (gradeId) {
        const targetGrade = await Grade.findByPk(gradeId);
        if (targetGrade) {
          studentQuery[Op.or] = [
            { GradeId: gradeId },
            { grade: targetGrade.level }
          ];
        } else {
          studentQuery.GradeId = gradeId;
        }
      }

      const students = await User.findAll({ where: studentQuery, attributes: ['id'] });

      if (students.length > 0) {
        const notifications = students.map(student => ({
          userId: student.id,
          type: 'new_assignment',
          title: 'New Assignment Assigned 📝',
          message: `${req.user.name} posted a new assignment: ${title}`,
          data: JSON.stringify({ assignmentId: assignment.id })
        }));
        await Notification.bulkCreate(notifications);
      }
    } catch (notifErr) {
      console.error('Assignment notification error:', notifErr);
    }

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

const getClassCommunications = async (req, res) => {
  try {
    const where = { teacherId: req.user.id };
    if (req.query.gradeId) {
      where.gradeId = Number(req.query.gradeId);
    }
    if (req.query.audience && ['students', 'parents', 'both'].includes(req.query.audience)) {
      where.audience = req.query.audience;
    }

    const communications = await ClassCommunication.findAll({
      where,
      include: [
        { model: Grade, attributes: ['id', 'name', 'level'], required: false }
      ],
      order: [['createdAt', 'DESC']],
      limit: req.query.limit ? Math.min(Number(req.query.limit) || 50, 200) : 50
    });

    res.json(communications);
  } catch (error) {
    console.error('Get class communications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentCommunications = async (req, res) => {
  try {
    let userGradeId = req.user.GradeId || null;
    if (!userGradeId && req.user.grade) {
      const grade = await Grade.findOne({ where: { level: req.user.grade }, attributes: ['id'] });
      userGradeId = grade?.id || null;
    }

    const communications = await ClassCommunication.findAll({
      where: {
        audience: { [Op.in]: ['students', 'both'] },
        ...(userGradeId ? { [Op.or]: [{ gradeId: userGradeId }, { gradeId: null }] } : {})
      },
      include: [
        { model: Grade, attributes: ['id', 'name', 'level'], required: false },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'], required: false }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(communications);
  } catch (error) {
    console.error('Get student communications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCommunicationById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: 'Valid communication id is required' });
    }

    const communication = await ClassCommunication.findByPk(id, {
      include: [
        { model: Grade, attributes: ['id', 'name', 'level'], required: false },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email', 'avatar', 'role'], required: false }
      ]
    });

    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: 'Not authorized' });

    // Staff can view any communication
    if (role === 'teacher' || role === 'admin') {
      return res.json(communication);
    }

    // Audience checks
    if (role === 'student') {
      if (!['students', 'both'].includes(communication.audience)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (communication.gradeId) {
        let userGradeId = req.user.GradeId || null;
        if (!userGradeId && req.user.grade) {
          const grade = await Grade.findOne({ where: { level: req.user.grade }, attributes: ['id'] });
          userGradeId = grade?.id || null;
        }
        if (!userGradeId || Number(userGradeId) !== Number(communication.gradeId)) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      return res.json(communication);
    }

    if (role === 'parent') {
      if (!['parents', 'both'].includes(communication.audience)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (communication.gradeId) {
        const hasChildInClass = await User.findOne({
          where: {
            role: 'student',
            isActive: true,
            ParentId: req.user.id,
            [Op.or]: [
              { GradeId: communication.gradeId },
              // backward compat: students may have grade level stored in `grade`
              { grade: communication.Grade?.level || -1 }
            ]
          },
          attributes: ['id']
        });
        if (!hasChildInClass) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      return res.json(communication);
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Get communication by id error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const sendClassCommunication = async (req, res) => {
  try {
    const { title, message, audience = 'both', gradeId } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    if (!['students', 'parents', 'both'].includes(audience)) {
      return res.status(400).json({ message: 'Invalid audience value' });
    }

    let grade = null;
    if (gradeId) {
      grade = await Grade.findByPk(Number(gradeId));
      if (!grade) {
        return res.status(404).json({ message: 'Class not found' });
      }
    }

    const studentWhere = { role: 'student', isActive: true, isDeleted: false };
    if (grade) {
      studentWhere[Op.or] = [
        { GradeId: grade.id },
        { grade: grade.level }
      ];
    }

    const students = await User.findAll({
      where: studentWhere,
      attributes: ['id', 'name', 'email', 'ParentId', 'parentPhone']
    });

    const recipientIds = new Set();
    const isForStudents = audience === 'students' || audience === 'both';
    const isForParents = audience === 'parents' || audience === 'both';

    if (isForStudents) {
      students.forEach((student) => recipientIds.add(student.id));
    }

    let parentRecipients = [];
    if (isForParents) {
      const parentIds = [...new Set(students.map((student) => student.ParentId).filter(Boolean))];
      if (parentIds.length) {
        const parents = await User.findAll({
          where: {
            id: { [Op.in]: parentIds },
            role: 'parent',
            isActive: true
          },
          attributes: ['id', 'name', 'parentPhone']
        });
        parents.forEach((parent) => recipientIds.add(parent.id));
        parentRecipients = parents;
      }
    }

    const communication = await ClassCommunication.create({
      title: String(title).trim(),
      message: String(message).trim(),
      audience,
      teacherId: req.user.id,
      gradeId: grade ? grade.id : null,
      recipientCount: recipientIds.size
    });

    const notifications = [...recipientIds].map((recipientId) => ({
      userId: recipientId,
      type: 'announcement',
      title: communication.title,
      message: communication.message,
      data: {
        source: 'class_communication',
        communicationId: communication.id,
        audience: communication.audience,
        class: grade ? grade.name : 'All Classes'
      }
    }));

    if (notifications.length) {
      await Notification.bulkCreate(notifications);
    }

    // Deliver parent communications via SMS + WhatsApp (Twilio)
    if (isForParents) {
      const className = grade ? grade.name : 'All Classes';
      const senderName = req.user?.name || 'Teacher';
      const defaultCountryCode = process.env.PHONE_DEFAULT_COUNTRY_CODE || '+91';

      const recipientByPhone = new Map();
      const addRecipient = (id, phone) => {
        const normalized = normalizePhone(phone, defaultCountryCode);
        if (normalized && !recipientByPhone.has(normalized)) {
          recipientByPhone.set(normalized, { id, parentPhone: phone });
        }
      };

      // First add from dedicted parent users
      parentRecipients.forEach((p) => addRecipient(p.id, p.parentPhone));
      // Then add from student record parent phone fields (if different or missing parent record)
      students.forEach((s) => addRecipient(`student-${s.id}`, s.parentPhone));

      const recipientsToMessage = Array.from(recipientByPhone.values());
      console.log(`Class Communication SMS: Found ${students.length} students, ${parentRecipients.length} linked parents -> ${recipientsToMessage.length} unique phone recipients`);

      if (recipientsToMessage.length > 0) {
        setImmediate(() => {
          sendSmsAndWhatsappToRecipients({
            recipients: recipientsToMessage,
            title: communication.title,
            message: communication.message,
            senderName,
            className
          }).catch((err) => {
            console.error('Parent SMS/WhatsApp background task error:', err);
          });
        });
      } else {
        console.warn('Class Communication SMS: No valid parent phone numbers found for messaging');
      }
    }

    res.status(201).json({
      success: true,
      message: 'Class communication sent successfully',
      communication,
      recipientCount: recipientIds.size
    });
  } catch (error) {
    console.error('Send class communication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteClassCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const comm = await ClassCommunication.findByPk(id);

    if (!comm) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    if (req.user.role === 'teacher' && comm.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own communications' });
    }

    await comm.destroy();
    res.json({ success: true, message: 'Communication deleted successfully' });
  } catch (error) {
    console.error('Delete class communication error:', error);
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
  getPendingReviews,
  getClassCommunications,
  getStudentCommunications,
  getCommunicationById,
  sendClassCommunication,
  deleteClassCommunication
};

