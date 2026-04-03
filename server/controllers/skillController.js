const Skill = require('../models/Skill');

exports.getAllSkills = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;
    if (search) query.$text = { $search: search };

    const skills = await Skill.find(query)
      .populate('owner', 'firstName lastName rating location profilePic')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Skill.countDocuments(query);
    res.json({ skills, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('owner', 'firstName lastName rating location profilePic bio totalSessions');
    if (!skill || !skill.isActive)
      return res.status(404).json({ message: 'Skill not found' });
    skill.viewCount++;
    await skill.save();
    res.json({ skill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSkill = async (req, res) => {
  try {
    const skill = await Skill.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ skill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!skill)
      return res.status(404).json({ message: 'Skill not found or not authorized' });
    res.json({ skill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    await Skill.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isActive: false }
    );
    res.json({ message: 'Skill removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
