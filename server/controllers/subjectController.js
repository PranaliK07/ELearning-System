const { Subject, Grade, Topic, Content, Quiz } = require('../models');

const getSubjects = async (req, res) => {
  try {
    const { gradeId } = req.query;
    const where = {};
    
    if (gradeId) where.GradeId = gradeId;

    const subjects = await Subject.findAll({
      where,
      include: [Grade, Topic],
      order: [['order', 'ASC']]
    });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [Grade, Topic]
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, description, icon, color, gradeId, order } = req.body;

    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    const subject = await Subject.create({
      name,
      description,
      icon,
      color,
      order,
      GradeId: gradeId
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { name, description, icon, color, order, isActive } = req.body;

    if (name !== undefined) subject.name = name;
    if (description !== undefined) subject.description = description;
    if (icon !== undefined) subject.icon = icon;
    if (color !== undefined) subject.color = color;
    if (order !== undefined) subject.order = order;
    if (isActive !== undefined) subject.isActive = isActive;

    await subject.save();

    res.json({
      success: true,
      message: 'Subject updated successfully',
      subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.destroy();

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSubjectTopics = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [{
        model: Topic,
        include: [Content, Quiz]
      }]
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject.Topics);
  } catch (error) {
    console.error('Get subject topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSubjectStats = async (req, res) => {
  try {
    const subjectId = req.params.id;

    const topicCount = await Topic.count({
      where: { SubjectId: subjectId }
    });

    const contentCount = await Content.count({
      include: [{
        model: Topic,
        where: { SubjectId: subjectId }
      }]
    });

    res.json({
      subjectId,
      topicCount,
      contentCount,
      quizCount: 0 // You can calculate this
    });
  } catch (error) {
    console.error('Get subject stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectTopics,
  getSubjectStats
};
