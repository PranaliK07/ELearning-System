const { Grade, Subject, User } = require('../models');

const getGrades = async (req, res) => {
  try {
    const grades = await Grade.findAll({
      order: [['level', 'ASC']],
      include: [{
        model: Subject,
        attributes: ['id', 'name', 'icon']
      }]
    });

    res.json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id, {
      include: [Subject]
    });

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createGrade = async (req, res) => {
  try {
    const { level, name, description, thumbnail, icon, color, order } = req.body;

    const existingGrade = await Grade.findOne({ where: { level } });
    if (existingGrade) {
      return res.status(400).json({ message: 'Grade level already exists' });
    }

    const grade = await Grade.create({
      level,
      name,
      description,
      thumbnail,
      icon,
      color,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      grade
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    const { name, description, thumbnail, icon, color, order } = req.body;

    if (name) grade.name = name;
    if (description) grade.description = description;
    if (thumbnail) grade.thumbnail = thumbnail;
    if (icon) grade.icon = icon;
    if (color) grade.color = color;
    if (order) grade.order = order;

    await grade.save();

    res.json({
      success: true,
      message: 'Grade updated successfully',
      grade
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    await grade.destroy();

    res.json({ success: true, message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGradeSubjects = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id, {
      include: [Subject]
    });

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(grade.Subjects);
  } catch (error) {
    console.error('Get grade subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGradeStats = async (req, res) => {
  try {
    const gradeId = req.params.id;

    const studentCount = await User.count({
      where: { grade: gradeId, role: 'student' }
    });

    const subjectCount = await Subject.count({
      where: { GradeId: gradeId }
    });

    res.json({
      gradeId,
      studentCount,
      subjectCount,
      totalContent: 0 // You can calculate this
    });
  } catch (error) {
    console.error('Get grade stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradeSubjects,
  getGradeStats
};